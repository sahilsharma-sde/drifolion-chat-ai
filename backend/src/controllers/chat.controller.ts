import { Response } from "express";

import { streamChatGraph } from "../services/chat.service";
import { saveMessage, assertConversationOwnership } from "../services/conversation.service";
import { consumeGuestMessage } from "../services/guest.service";
import { AuthenticatedRequest, ownerOf } from "../middleware/auth.middleware";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

const MAX_MESSAGE_CHARS = 8000;

export const streamChat = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { conversationId, message } = req.body;

    if (!conversationId || typeof message !== "string" || !message.trim()) {
      throw new ApiError(400, "conversationId and message are required");
    }

    if (message.length > MAX_MESSAGE_CHARS) {
      throw new ApiError(
        400,
        `Messages are limited to ${MAX_MESSAGE_CHARS} characters.`,
      );
    }

    const owner = ownerOf(req);

    // Make sure this conversation actually belongs to the caller before
    // we touch the DB or spend tokens on a model call.
    await assertConversationOwnership(conversationId, owner);

    // Guests get a small free allowance. Checked before the stream opens
    // so an over-limit request gets a proper JSON error, not a broken SSE.
    if (owner.guestId) {
      await consumeGuestMessage(owner.guestId);
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    let fullResponse = "";
    let route: "coding" | "rag" | "general" | undefined;

    try {
      const stream = await streamChatGraph(conversationId, message, owner.userId);

      // Only these graph nodes produce the actual answer shown to the user.
      // The supervisor node also runs an LLM call internally (to classify
      // the route), and streamMode "messages" surfaces tokens from every
      // LLM call in the graph — without this filter, the raw routing
      // decision (e.g. {"route":"coding"}) leaks into the chat as if it
      // were part of the reply.
      const ANSWER_NODES = new Set(["coding", "rag", "general"]);

      // A node that returns a ready-made message without calling the LLM
      // emits only a complete AIMessage (no token chunks). Keep it so such
      // replies still reach the client instead of being dropped.
      let completeMessage = "";

      for await (const chunk of stream) {
        const [messageChunk, metadata] = chunk;
        const node = metadata?.langgraph_node;

        if (!ANSWER_NODES.has(node)) {
          continue;
        }

        if (!route) {
          // The first accepted chunk tells us which agent is answering.
          // Send it to the client as its own SSE event so the UI can show
          // a route badge instead of us ever inlining it into the reply.
          route = node;
          res.write(`event: route\ndata: ${route}\n\n`);
        }

        const text =
          typeof messageChunk?.content === "string"
            ? messageChunk.content
            : "";

        if (messageChunk?.constructor?.name === "AIMessage") {
          completeMessage = text;
          continue;
        }

        if (!text) continue;

        fullResponse += text;

        res.write(`event: token\ndata: ${text}\n\n`);
      }

      if (!fullResponse && completeMessage) {
        fullResponse = completeMessage;
        res.write(`event: token\ndata: ${completeMessage}\n\n`);
      }
    } catch (streamErr) {
      console.error("Stream error:", streamErr);

      const notice = "\n\n⚠️ Error generating response.";
      fullResponse += notice;
      res.write(`event: token\ndata: ${notice}\n\n`);
    }

    // Message.content is required, so never try to persist an empty reply.
    if (!fullResponse.trim()) {
      fullResponse = "⚠️ No response was generated. Please try again.";
      res.write(`event: token\ndata: ${fullResponse}\n\n`);
    }

    try {
      await saveMessage(conversationId, "assistant", fullResponse, route);
    } catch (saveErr) {
      console.error("Failed to save assistant message:", saveErr);
    }

    res.write(`event: done\ndata: [DONE]\n\n`);
    res.end();
  },
);
