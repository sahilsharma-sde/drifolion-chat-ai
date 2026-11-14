import { randomUUID } from "crypto";
import { QdrantClient } from "@qdrant/js-client-rest";
import { Document } from "@langchain/core/documents";

import { embeddings } from "../embeddings/embedding.service";
import type { UserDocumentSummary } from "./types";

/**
 * Vector store backed by Qdrant (free 1 GB cluster on Qdrant Cloud, or a local
 * `docker run -p 6333:6333 qdrant/qdrant`). One collection holds every user's
 * chunks; each point carries { userId, documentHash, source, uploadedAt,
 * chunkIndex, text } and every query filters on `userId`, so users only ever
 * search their own documents.
 */
const COLLECTION = process.env.QDRANT_COLLECTION || "nexus_rag";
const EMBEDDING_DIMENSIONS = 384; // BAAI/bge-small-en-v1.5
const UPSERT_BATCH_SIZE = 64;

let client: QdrantClient | null = null;

function getClient() {
  if (!client) {
    if (!process.env.QDRANT_URL) {
      throw new Error("QDRANT_URL is not set");
    }

    client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY || undefined,
      // Don't do a version handshake call on startup; it only prints warnings.
      checkCompatibility: false,
    });
  }

  return client;
}

const userFilter = (userId: string, documentHash?: string) => ({
  must: [
    { key: "userId", match: { value: userId } },
    ...(documentHash
      ? [{ key: "documentHash", match: { value: documentHash } }]
      : []),
  ],
});

/**
 * Creates the collection (and the payload indexes used for filtering) if it
 * doesn't exist yet, so there's no manual setup. Safe to call on every boot.
 * Never throws: if Qdrant is unreachable it logs a warning and document
 * search stays unavailable until it is.
 */
export async function ensureQdrantCollection() {
  try {
    const qdrant = getClient();
    const { exists } = await qdrant.collectionExists(COLLECTION);

    if (!exists) {
      await qdrant.createCollection(COLLECTION, {
        vectors: { size: EMBEDDING_DIMENSIONS, distance: "Cosine" },
      });
      console.log(`Created Qdrant collection "${COLLECTION}"`);
    }

    // Idempotent: keyword indexes make the per-user filters fast.
    await qdrant.createPayloadIndex(COLLECTION, {
      field_name: "userId",
      field_schema: "keyword",
      wait: true,
    });
    await qdrant.createPayloadIndex(COLLECTION, {
      field_name: "documentHash",
      field_schema: "keyword",
      wait: true,
    });
  } catch (error: any) {
    console.warn(
      "Could not set up Qdrant - document search will be unavailable until it is reachable.",
      error?.message ?? error,
    );
  }
}

export async function addDocuments(documents: Document[]) {
  if (documents.length === 0) return;

  const vectors = await embeddings.embedDocuments(
    documents.map((doc) => doc.pageContent),
  );

  const points = documents.map((doc, index) => ({
    id: randomUUID(),
    vector: vectors[index],
    payload: {
      text: doc.pageContent,
      userId: String(doc.metadata.userId),
      documentHash: String(doc.metadata.documentHash),
      source: String(doc.metadata.source ?? "Untitled"),
      uploadedAt: String(doc.metadata.uploadedAt ?? ""),
      chunkIndex: Number(doc.metadata.chunkIndex ?? index),
    },
  }));

  const qdrant = getClient();

  for (let i = 0; i < points.length; i += UPSERT_BATCH_SIZE) {
    await qdrant.upsert(COLLECTION, {
      wait: true,
      points: points.slice(i, i + UPSERT_BATCH_SIZE),
    });
  }
}

/** Similarity search restricted to a single user's documents. */
export async function searchUserDocuments(query: string, userId: string, k = 4) {
  const embedStart = Date.now();
  const vector = await embeddings.embedQuery(query);
  const searchStart = Date.now();

  const { points } = await getClient().query(COLLECTION, {
    query: vector,
    limit: k,
    filter: userFilter(userId),
    with_payload: true,
  });

  // Where the time goes on a RAG question: embedding runs on this server's
  // CPU, the vector search runs on Qdrant.
  console.log(
    `Vector search: embed ${searchStart - embedStart}ms, qdrant ${Date.now() - searchStart}ms, ${points.length} chunk(s)`,
  );

  return points.map(
    (point) =>
      new Document({
        pageContent: String(point.payload?.text ?? ""),
        metadata: {
          source: point.payload?.source,
          chunkIndex: point.payload?.chunkIndex,
          documentHash: point.payload?.documentHash,
          score: point.score,
        },
      }),
  );
}

export async function userDocumentExists(
  userId: string,
  documentHash: string,
): Promise<boolean> {
  const { count } = await getClient().count(COLLECTION, {
    filter: userFilter(userId, documentHash),
    exact: true,
  });

  return count > 0;
}

/** One entry per uploaded file (chunks are grouped by documentHash). */
export async function listUserDocuments(
  userId: string,
): Promise<UserDocumentSummary[]> {
  const qdrant = getClient();
  const byHash = new Map<string, UserDocumentSummary>();

  let offset: string | number | Record<string, unknown> | null | undefined;

  do {
    const page = await qdrant.scroll(COLLECTION, {
      filter: userFilter(userId),
      limit: 256,
      offset: offset as any,
      with_payload: ["documentHash", "source", "uploadedAt"],
      with_vector: false,
    });

    for (const point of page.points) {
      const hash = String(point.payload?.documentHash);
      const uploadedAt = String(point.payload?.uploadedAt ?? "");
      const entry = byHash.get(hash);

      if (entry) {
        entry.chunks += 1;
        if (uploadedAt > entry.uploadedAt) entry.uploadedAt = uploadedAt;
      } else {
        byHash.set(hash, {
          hash,
          name: String(point.payload?.source ?? "Untitled"),
          chunks: 1,
          uploadedAt,
        });
      }
    }

    offset = page.next_page_offset;
  } while (offset !== null && offset !== undefined);

  return [...byHash.values()].sort((a, b) =>
    b.uploadedAt.localeCompare(a.uploadedAt),
  );
}

export async function deleteUserDocument(userId: string, documentHash: string) {
  await getClient().delete(COLLECTION, {
    wait: true,
    filter: userFilter(userId, documentHash),
  });
}
