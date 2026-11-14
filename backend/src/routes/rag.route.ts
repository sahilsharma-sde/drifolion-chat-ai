import { Router } from "express";

import { retrieveDocuments, testRagAgent } from "../controllers/rag.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.get("/", (req, res) => {
  res.json({ success: true, message: "Use /api/rag/test-rag?query=..." });
});

router.get("/test-rag", retrieveDocuments);
router.get('/test-agent', testRagAgent);

export default router;
