import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { getConversation, getRecentMessages, updateConversationTitle } from "./conversation.service";
import { saveMessage } from "./conversation.service";

import { nexusGraph } from "../graph/nexus.graph";
import { mapMessages } from "../utils/messageMapper";


export async function streamChatGraph(
  conversationId: string,
  message: string,
  userId?: string, // undefined for guest sessions
) {
  await saveMessage(conversationId, "user", message);

  const conversation = await getConversation(conversationId);

  if (conversation && conversation.title === "New Chat") {
    const title = message.trim().split(/\s+/).slice(0, 5).join(" ");

    await updateConversationTitle(conversationId, title);
  }

  const recentMessages = await getRecentMessages(conversationId, 10);

  const messages = [];

  if (conversation?.summary) {
    messages.push(
      new SystemMessage(`
Conversation Summary:

${conversation.summary}
`),
    );
  }

  messages.push(...mapMessages(recentMessages));

  return await nexusGraph.stream(
    { messages },
    {
      streamMode: "messages",
      // Read by nodes via config.configurable (RAG uses it to scope retrieval)
      configurable: { userId },
    },
  );
}
