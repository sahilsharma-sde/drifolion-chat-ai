import { ConversationRepository } from "../repositories/conversation.repository";
import { Types } from "mongoose";
import { ApiError } from "../utils/ApiError";
import type { Owner } from "../types/owner";

const repository = new ConversationRepository();

export const createConversation = (owner: Owner, title: string) =>
  repository.createConversation(owner, title);

export const saveMessage = (
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  route?: "coding" | "rag" | "general",
) => repository.saveMessage(conversationId, role, content, route);

export const getMessages = (conversationId: string) =>
  repository.getMessages(conversationId);

export const getRecentMessages = (conversationId: string, limit?: number) =>
  repository.getRecentMessages(conversationId, limit);

export const getConversation = (conversationId: string, owner?: Owner) =>
  repository.getConversation(conversationId, owner);

export const getConversations = (owner: Owner) =>
  repository.getConversations(owner);

export const countConversations = (owner: Owner) =>
  repository.countConversations(owner);

export async function updateConversationTitle(
  conversationId: string,
  title: string,
) {
  return repository.updateTitle(conversationId, title);
}

/**
 * Throws 404 if the conversation doesn't exist, and 403 if it exists
 * but belongs to someone else. Use this before letting a request
 * read or write messages in a conversation.
 */
export async function assertConversationOwnership(
  conversationId: string,
  owner: Owner,
) {
  // A malformed id (e.g. the string "null") is simply "not found", not a 500.
  if (!Types.ObjectId.isValid(conversationId)) {
    throw new ApiError(404, "Conversation not found");
  }

  const conversation = await repository.getConversation(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const owns = owner.userId
    ? conversation.userId?.toString() === owner.userId
    : conversation.guestId?.toString() === owner.guestId;

  if (!owns) {
    throw new ApiError(403, "You do not have access to this conversation");
  }

  return conversation;
}
