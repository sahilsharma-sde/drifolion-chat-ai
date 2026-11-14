import { Router } from "express";

import {
  saveMessageController,
  getMessagesController,
} from "../controllers/message.controller";
import { protectOrGuest } from "../middleware/auth.middleware";

const router = Router();

router.use(protectOrGuest);

router.post("/", saveMessageController);
router.get("/:conversationId", getMessagesController);

export default router;
