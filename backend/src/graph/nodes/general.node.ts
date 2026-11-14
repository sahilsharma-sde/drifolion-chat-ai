import { AIMessage } from "@langchain/core/messages";

import { graphState } from "../state";

import { generalAgent } from "../../agents/general.agent";

export async function generalNode(state: typeof graphState.State) {
  console.log("\n========== GENERAL NODE ==========");

  // const userMessage =
  //   state.messages[
  //     state.messages.length - 1
  //   ].content as string;

  // const result =
  //   await generalAgent(userMessage);

  const result = await generalAgent(state.messages);

  return {
    messages: [new AIMessage(result)],
  };
}
