import { getMessages } from "./conversation.service";
import { summarizeConversation } from "./memory.service";
import { ConversationRepository } from "../repositories/conversation.repository";

const repository = new ConversationRepository();

export async function manageConversation(conversationId: string) {
  // get all messages
  const messages = await getMessages(conversationId);

  // only summarize if large history
  if (messages.length < 20) return;

  // older messages
  const oldMessages = messages.slice(0, -10);

  // convert into plain text
  const formattedConversation = oldMessages.map(
    (msg) => `${msg.role}: ${msg.content}`,
  ).join('\n');

  // generate summary
  const summary = await summarizeConversation(formattedConversation);

  // save summary
  await repository.updateSummary(
    conversationId,
    summary as string
  );

  console.log('Conversation summarized.');
}
