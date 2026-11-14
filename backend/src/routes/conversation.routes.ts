import { Router } from "express";
import {
  createConversationController,
  getConversationsController,
  getMessagesController,
} from "../controllers/conversation.controller";
import { protectOrGuest } from "../middleware/auth.middleware";

const router = Router();

router.use(protectOrGuest);

router.post("/", createConversationController);
router.get("/", getConversationsController);
router.get("/:id/messages", getMessagesController);

export default router;
