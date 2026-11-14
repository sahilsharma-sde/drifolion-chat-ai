import { Router } from "express";

import { streamChat } from "../controllers/chat.controller";
import { protectOrGuest } from "../middleware/auth.middleware";

const router = Router();

router.post("/", protectOrGuest, streamChat);

export default router;
