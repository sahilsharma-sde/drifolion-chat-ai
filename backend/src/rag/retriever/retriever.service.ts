import { searchUserDocuments } from "../vectorstore";

export async function testRetrieval(query: string, userId: string) {
  return searchUserDocuments(query, userId, 3);
}
