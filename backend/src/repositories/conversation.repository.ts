/* Repository Layer */

import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import { Owner, ownerFilter } from "../types/owner";

export class ConversationRepository {
  async createConversation(owner: Owner, title: string) {
    return Conversation.create({ ...ownerFilter(owner), title });
  }

  async saveMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    route?: "coding" | "rag" | "general",
  ) {
    return Message.create({
      conversationId,
      role,
      content,
      ...(route ? { route } : {}),
    });
  }

  async getMessages(conversationId: string) {
    return Message.find({ conversationId }).sort({ createdAt: 1 });
  }

  async getRecentMessages(conversationId: string, limit = 10) {
    // Newest `limit` messages, returned oldest-first. A second .sort() on the
    // same Mongoose query REPLACES the first (it doesn't re-sort the result),
    // so the old "sort -1, limit, sort 1" chain returned the OLDEST messages
    // and the model kept answering questions from earlier in the chat.
    const newest = await Message.find({ conversationId })
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit);

    return newest.reverse();
  }

  async updateSummary(conversationId: string, summary: string) {
    return Conversation.findByIdAndUpdate(
      conversationId,
      {
        summary,
      },
      {
        returnDocument: "after",
      },
    );
  }

  async updateTitle(conversationId: string, title: string) {
    return Conversation.findByIdAndUpdate(
      conversationId,
      { title },
      { returnDocument: "after" },
    );
  }

  // When an owner is given the lookup is scoped to them, so nobody can
  // fetch someone else's conversation.
  async getConversation(conversationId: string, owner?: Owner) {
    const query: Record<string, unknown> = { _id: conversationId };
    if (owner) Object.assign(query, ownerFilter(owner));

    return Conversation.findOne(query);
  }

  async getConversations(owner: Owner) {
    return Conversation.find(ownerFilter(owner)).sort({ updatedAt: -1 });
  }

  async countConversations(owner: Owner) {
    return Conversation.countDocuments(ownerFilter(owner));
  }
}
