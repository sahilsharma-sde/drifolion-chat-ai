import * as chroma from "./chroma.service";
import * as qdrant from "./qdrant.service";

/**
 * Picks the vector store from VECTOR_STORE:
 *   "chroma" (default) - a ChromaDB server, e.g. `docker compose up -d` locally
 *   "qdrant"           - Qdrant (free cloud cluster, or a local Qdrant container)
 * The rest of the app only imports from here.
 */
const KINDS = ["chroma", "qdrant"] as const;
type VectorStoreKind = (typeof KINDS)[number];

const requested = process.env.VECTOR_STORE || "chroma";

if (!KINDS.includes(requested as VectorStoreKind)) {
  // Fail loudly instead of quietly using a different store than configured.
  throw new Error(
    `Unknown VECTOR_STORE "${requested}". Use one of: ${KINDS.join(", ")}`,
  );
}

export const vectorStoreKind = requested as VectorStoreKind;

const store = vectorStoreKind === "qdrant" ? qdrant : chroma;

export const addDocuments = store.addDocuments;
export const searchUserDocuments = store.searchUserDocuments;
export const userDocumentExists = store.userDocumentExists;
export const listUserDocuments = store.listUserDocuments;
export const deleteUserDocument = store.deleteUserDocument;

/** One-time startup preparation for the chosen store (no-op for Chroma). */
export async function prepareVectorStore() {
  if (vectorStoreKind === "qdrant") {
    await qdrant.ensureQdrantCollection();
  }
}

export type { UserDocumentSummary } from "./types";
