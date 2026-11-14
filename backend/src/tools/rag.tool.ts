import { searchUserDocuments } from "../rag/vectorstore";

export async function retrieveRelevantDocs(query: string, userId: string) {
  return searchUserDocuments(query, userId, 4);
}
