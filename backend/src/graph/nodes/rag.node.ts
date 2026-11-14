import { AIMessage } from "@langchain/core/messages";
import type { RunnableConfig } from "@langchain/core/runnables";

import { graphState } from "../state";

import { ragAgent } from "../../agents/rag.agent";

export async function ragNode(
  state: typeof graphState.State,
  config?: RunnableConfig,
) {
  console.log("\n========== RAG NODE ==========");

  const userMessage = state.messages[state.messages.length - 1]
    .content as string;

  // userId is supplied per-request through the graph's `configurable`
  // options (see chat.service.ts) so retrieval is scoped to the caller.
  // It is undefined for guest sessions, which have no document library.
  const userId = config?.configurable?.userId as string | undefined;

  const result = await ragAgent(userMessage, userId, state.messages);

  return {
    messages: [new AIMessage(result)],
  };
}
