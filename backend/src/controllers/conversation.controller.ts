import { Response } from "express";
import {
  createConversation,
  getConversations,
  getMessages,
  countConversations,
  assertConversationOwnership,
} from "../services/conversation.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthenticatedRequest, ownerOf } from "../middleware/auth.middleware";

export const createConversationController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { title } = req.body;

    if (!title) {
      throw new ApiError(400, "Title is required");
    }

    const owner = ownerOf(req);

    // Guest mode is a single chat; more chats need an account.
    if (owner.guestId && (await countConversations(owner)) >= 1) {
      throw new ApiError(
        403,
        "Guest mode includes one chat. Create a free account to start more.",
        "GUEST_ONE_CHAT",
      );
    }

    const conversation = await createConversation(owner, title);

    res.status(201).json({
      success: true,
      conversation,
    });
  },
);

export const getConversationsController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const conversations = await getConversations(ownerOf(req));

    res.json({
      success: true,
      conversations,
    });
  },
);

export const getMessagesController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const conversationId = req.params.id as string;

    await assertConversationOwnership(conversationId, ownerOf(req));

    const messages = await getMessages(conversationId);

    res.json({
      success: true,
      messages,
    });
  },
);
