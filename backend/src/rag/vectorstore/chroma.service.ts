import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChromaClient } from "chromadb";
import { Document } from "@langchain/core/documents";

import { embeddings } from "../embeddings/embedding.service";

const COLLECTION_NAME = "nexus-documents";

/**
 * Build the Chroma client from CHROMA_URL (e.g. http://localhost:8000 or
 * https://my-chroma.onrender.com). Passing host/port/ssl instead of a raw
 * `url` avoids the "'path' argument is deprecated" warning and makes the
 * deployed Chroma address configurable instead of hardcoded to localhost.
 */
function buildChromaClient() {
  const url = new URL(process.env.CHROMA_URL || "http://localhost:8000");
  const ssl = url.protocol === "https:";

  return new ChromaClient({
    host: url.hostname,
    port: url.port ? Number(url.port) : ssl ? 443 : 8000,
    ssl,
  });
}

export const vectorStore = new Chroma(embeddings, {
  collectionName: COLLECTION_NAME,
  index: buildChromaClient(),
});

import type { UserDocumentSummary } from "./types";

// Chroma needs an explicit $and when filtering on more than one field.
const ownedBy = (userId: string, documentHash?: string) =>
  documentHash
    ? { $and: [{ userId }, { documentHash }] }
    : { userId };

export async function addDocuments(documents: Document[]) {
  await vectorStore.addDocuments(documents);
}

/** Similarity search restricted to a single user's documents. */
export async function searchUserDocuments(
  query: string,
  userId: string,
  k = 4,
) {
  return vectorStore.similaritySearch(query, k, ownedBy(userId) as any);
}

export async function userDocumentExists(
  userId: string,
  documentHash: string,
): Promise<boolean> {
  const collection = await vectorStore.ensureCollection();

  const result = await collection.get({
    where: ownedBy(userId, documentHash) as any,
    limit: 1,
    include: ["metadatas"] as any,
  });

  return result.ids.length > 0;
}

/** One entry per uploaded file (chunks are grouped by documentHash). */
export async function listUserDocuments(
  userId: string,
): Promise<UserDocumentSummary[]> {
  const collection = await vectorStore.ensureCollection();

  const result = await collection.get({
    where: ownedBy(userId) as any,
    include: ["metadatas"] as any,
  });

  const byHash = new Map<string, UserDocumentSummary>();

  for (const meta of result.metadatas ?? []) {
    if (!meta?.documentHash) continue;

    const hash = String(meta.documentHash);
    const existing = byHash.get(hash);

    if (existing) {
      existing.chunks += 1;
    } else {
      byHash.set(hash, {
        hash,
        name: String(meta.source ?? "Untitled"),
        chunks: 1,
        uploadedAt: String(meta.uploadedAt ?? ""),
      });
    }
  }

  return [...byHash.values()].sort((a, b) =>
    b.uploadedAt.localeCompare(a.uploadedAt),
  );
}

export async function deleteUserDocument(
  userId: string,
  documentHash: string,
) {
  const collection = await vectorStore.ensureCollection();

  await collection.delete({
    where: ownedBy(userId, documentHash) as any,
  });
}
