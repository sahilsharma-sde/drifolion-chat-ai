import { useState } from "react";
import { streamChat } from "../services/api";

import {
  getMessages,
} from "../services/conversationApi";

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [streamingMessageIndex, setStreamingMessageIndex] =
    useState(null);

  const sendMessage = async (
    conversationId,
    query
  ) => {
    if (!conversationId) {
      // Shouldn't happen — Home.jsx creates a conversation before calling
      // this — but guard anyway so the UI never hangs on a stuck spinner.
      console.error("sendMessage called without a conversationId");
      return;
    }

    setLoading(true);

    const userMessage = {
      role: "user",
      content: query,
    };

    const assistantMessage = {
      role: "assistant",
      content: "",
      route: null,
    };

    setMessages((prev) => {
      const updated = [
        ...prev,
        userMessage,
        assistantMessage,
      ];

      setStreamingMessageIndex(
        updated.length - 1
      );

      return updated;
    });

    try {
    await streamChat(
      conversationId,
      query,

      (chunk) => {
        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1
              ? {
                  ...msg,
                  content:
                    msg.content + chunk,
                }
              : msg
          )
        );
      },

      async () => {
        // Defensive guard: never fetch messages for a missing conversation
        // id (this is what previously produced the literal string "null"
        // in the request URL and crashed the backend's ObjectId cast).
        if (!conversationId) {
          setLoading(false);
          setStreamingMessageIndex(null);
          return;
        }

        try {
          // Reload clean saved messages (includes the persisted `route`)
          const freshMessages =
            await getMessages(
              conversationId
            );

          setMessages(
            freshMessages
          );
        } catch (error) {
          console.error(error);
        }

        setLoading(false);

        setStreamingMessageIndex(
          null
        );
      },

      (route) => {
        // Fired as soon as the router picks an agent — lets the UI show a
        // "Coding Agent" / "RAG Agent" / "General Agent" badge live,
        // before the reply has finished streaming.
        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1 ? { ...msg, route } : msg
          )
        );
      }
    );
    return null;
    } catch (error) {
      // streamChat already reset the loading state; hand the reason back
      // so the page can explain it (e.g. guest limit reached).
      return error;
    }
  };

  const loadMessages = async (
    conversationId
  ) => {
    try {
      const messages =
        await getMessages(
          conversationId
        );

      setMessages(messages);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    messages,
    loading,

    sendMessage,
    loadMessages,

    streamingMessageIndex,
  };
}
