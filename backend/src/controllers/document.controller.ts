import fs from "fs/promises";
import { Response } from "express";

import { loadPdf } from "../rag/loaders/pdf.loader";
import { splitDocument } from "../rag/ingestion/document.ingestion";
import {
  addDocuments,
  userDocumentExists,
  listUserDocuments,
  deleteUserDocument,
} from "../rag/vectorstore";
import { generateDocumentHash } from "../services/document.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const uploadDocument = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const file = req.file;

    if (!file) {
      throw new ApiError(400, "A PDF file is required");
    }

    const userId = req.user!.id;

    try {
      const text = await loadPdf(file.path);

      // Scanned/image-only PDFs have no extractable text layer.
      if (!text || !text.trim()) {
        throw new ApiError(
          422,
          "No readable text found in this PDF. Scanned documents aren't supported yet.",
        );
      }

      const documentHash = generateDocumentHash(text);

      // Same user re-uploading the same file: don't index it twice.
      if (await userDocumentExists(userId, documentHash)) {
        return res.json({
          success: true,
          duplicate: true,
          document: { hash: documentHash, name: file.originalname },
          message: "This document is already in your library.",
        });
      }

      const chunks = await splitDocument(text);

      chunks.forEach((chunk, index) => {
        chunk.metadata = {
          ...chunk.metadata,
          userId, // ownership: retrieval filters on this
          source: file.originalname,
          uploadedAt: new Date().toISOString(),
          chunkIndex: index,
          documentHash,
        };
      });

      await addDocuments(chunks);
      console.log(`Stored ${chunks.length} chunks for user ${userId}`);

      return res.status(201).json({
        success: true,
        duplicate: false,
        characters: text.length,
        chunks: chunks.length,
        document: {
          hash: documentHash,
          name: file.originalname,
          chunks: chunks.length,
        },
      });
    } finally {
      // The PDF is only needed for text extraction; don't accumulate
      // uploads on the server's disk.
      await fs.unlink(file.path).catch(() => undefined);
    }
  },
);

export const listDocuments = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const documents = await listUserDocuments(req.user!.id);

    res.json({ success: true, documents });
  },
);

export const removeDocument = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    await deleteUserDocument(req.user!.id, req.params.hash as string);

    res.json({ success: true });
  },
);
