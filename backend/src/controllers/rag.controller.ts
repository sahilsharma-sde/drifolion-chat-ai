import { Response } from "express";
import { testRetrieval } from "../rag/retriever/retriever.service";
import { ragAgent } from "../agents/rag.agent";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

// Debug endpoints: both are scoped to the calling user's own documents.
export const retrieveDocuments = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query.query?.toString();

    if (!query) {
      throw new ApiError(400, "Query required");
    }

    const docs = await testRetrieval(query, req.user!.id);

    res.json({ success: true, count: docs.length, docs });
  },
);

export const testRagAgent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query.query?.toString();

    if (!query) {
      throw new ApiError(400, "Query required");
    }

    const context = await ragAgent(query, req.user!.id);

    res.json({ success: true, context });
  },
);
