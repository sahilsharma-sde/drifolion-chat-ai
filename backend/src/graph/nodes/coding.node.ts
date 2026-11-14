import { AIMessage } from "@langchain/core/messages";

import { graphState } from "../state";

import { codingAgent } from "../../agents/coding.agent";

export async function codingNode(state: typeof graphState.State) {
  console.log("\n========== CODING NODE ==========");

  // const userMessage =
  //   state.messages[
  //     state.messages.length - 1
  //   ].content as string;

  // const result =
  //   await codingAgent(userMessage);

  const result = await codingAgent(state.messages);

  return {
    messages: [new AIMessage(result)],
  };
}
