import { API_BASE_URL, authFetch } from "./authApi";

export const streamChat = async (
  conversationId,
  query,
  onChunk,
  onComplete,
  onRoute,
) => {
  if (!conversationId) {
    onChunk?.("\n\n⚠️ No active conversation. Please start a new chat.");
    return; // deliberately skip onComplete — nothing to reload
  }

  try {
    const response = await authFetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        conversationId,
        message: query,
      }),
    });

    if (!response.ok) {
      // Surface the server's own explanation (e.g. guest limit reached)
      const body = await response.json().catch(() => ({}));
      const error = new Error(body.message || `Request failed: ${response.status}`);
      error.code = body.code;
      throw error;
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line; each frame is an
      // "event: <name>" line followed by a "data: <payload>" line.
      const frames = buffer.split("\n\n");

      buffer = frames.pop() || "";

      for (const frame of frames) {
        const lines = frame.split("\n");
        const eventLine = lines.find((l) => l.startsWith("event:"));
        const dataLine = lines.find((l) => l.startsWith("data:"));

        if (!dataLine) continue;

        const eventName = eventLine
          ? eventLine.replace(/^event:\s?/, "")
          : "token";
        const payload = dataLine.replace(/^data:\s?/, "");

        if (eventName === "route") {
          onRoute?.(payload.trim());
        } else if (eventName === "done" || payload.trim() === "[DONE]") {
          onComplete();
          return;
        } else {
          onChunk(payload);
        }
      }
    }

    onComplete?.();
  } catch (error) {
    console.error("Streaming error:", error);

    // Errors with a code are explained by the UI notice instead.
    if (!error.code) onChunk?.("\n\n⚠️ Error communicating with Nexus AI.");

    onComplete?.();

    throw error;
  }
};
