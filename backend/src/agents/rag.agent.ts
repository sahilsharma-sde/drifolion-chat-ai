import { SystemMessage } from "@langchain/core/messages";
import type { Document } from "@langchain/core/documents";

import { llm } from "../config/groq";
import { retrieveRelevantDocs } from "../tools/rag.tool";

type FallbackReason = "guest" | "no-match" | "unavailable";

// Shown at the start of a general-knowledge answer so users always know
// the reply did NOT come from their documents.
const FALLBACK_NOTES: Record<FallbackReason, string> = {
  guest:
    "Guest mode can't search documents, so this answer comes from general knowledge. Sign in to upload PDFs.",
  "no-match":
    "I couldn't find anything relevant in your uploaded documents, so this answer comes from general knowledge. Use the paperclip button to upload a PDF.",
  unavailable:
    "Document search is temporarily unavailable, so this answer comes from general knowledge.",
};

const asText = (content: unknown) =>
  typeof content === "string" ? content : JSON.stringify(content);

/**
 * The supervisor sends every "explain / define / theory" question to the
 * RAG route, whether or not the user has any documents. When retrieval
 * comes back empty we still answer (through the LLM, so the reply streams
 * like any other) instead of dead-ending with a canned message.
 */
async function answerWithoutDocuments(
  history: any[],
  reason: FallbackReason,
): Promise<string> {
  const response = await llm.invoke([
    new SystemMessage(`
You are Nexus AI. The user's question was sent to the document-search agent,
but no document context is available.
Begin your reply with exactly this sentence in italics, then a blank line:
*${FALLBACK_NOTES[reason]}*
Then answer the question helpfully from general knowledge.
Never claim to have read, quoted or summarised any uploaded document.
`),
    ...history,
  ]);

  return asText(response.content);
}

export async function ragAgent(
  query: string,
  userId: string | undefined,
  history: any[] = [],
): Promise<string> {
  const fallbackHistory = history.length ? history : [{ role: "user", content: query }];

  // Guests have no document library.
  if (!userId) {
    return answerWithoutDocuments(fallbackHistory, "guest");
  }

  let docs: Document[];

  try {
    docs = await retrieveRelevantDocs(query, userId);
  } catch (error) {
    // e.g. ChromaDB isn't running / unreachable
    console.error("RAG retrieval failed:", error);
    return answerWithoutDocuments(fallbackHistory, "unavailable");
  }

  console.log(
    `RAG retrieved ${docs.length} chunk(s)`,
    docs.map((doc) => ({
      source: doc.metadata?.source,
      chunk: doc.metadata?.chunkIndex,
    })),
  );

  if (docs.length === 0) {
    return answerWithoutDocuments(fallbackHistory, "no-match");
  }

  const context = docs
    .map(
      (doc) => `Source: ${doc.metadata?.source}

${doc.pageContent}`,
    )
    .join("\n\n");

  const response = await llm.invoke([
    {
      role: "system",
      content: `
You are Nexus RAG Agent.
Use the provided context to answer the user's question.
Only use information from the context and the query.
If the answer is not present in the documents, say you do not know.
Do not hallucinate or invent facts.
`,
    },
    {
      role: "user",
      content: `Question: ${query}\n\nContext:\n${context}`,
    },
  ]);

  return asText(response.content);
}
