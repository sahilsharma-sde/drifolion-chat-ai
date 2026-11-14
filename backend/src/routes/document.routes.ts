import { Router } from "express";
import { upload } from "../middleware/upload.middleware";
import {
  uploadDocument,
  listDocuments,
  removeDocument,
} from "../controllers/document.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.get("/", listDocuments);
router.post("/upload", upload.single("file"), uploadDocument);
router.delete("/:hash", removeDocument);

export default router;
