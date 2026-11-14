import { Response } from "express";

import {
  saveMessage,
  getMessages,
  assertConversationOwnership,
} from "../services/conversation.service";
import { AuthenticatedRequest, ownerOf } from "../middleware/auth.middleware";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const saveMessageController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Writing arbitrary messages is for registered users only; guests
    // chat through /api/chat so their allowance is enforced.
    if (!req.user) {
      throw new ApiError(403, "Create an account to use this feature.", "GUEST_FORBIDDEN");
    }

    const { conversationId, role, content } = req.body;

    if (!conversationId || !role || !content) {
      throw new ApiError(400, "Missing required fields");
    }

    await assertConversationOwnership(conversationId, ownerOf(req));

    const message = await saveMessage(conversationId, role, content);

    res.status(201).json({
      success: true,
      message,
    });
  },
);

export const getMessagesController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const conversationId = req.params.conversationId as string;

    await assertConversationOwnership(conversationId, ownerOf(req));

    const messages = await getMessages(conversationId);

    res.json({
      success: true,
      messages,
    });
  },
);
