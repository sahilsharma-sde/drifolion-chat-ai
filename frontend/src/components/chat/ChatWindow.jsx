import MessageBubble from "./MessageBubble";
import { useEffect, useRef } from "react";
import { LogoMark } from "../branding/Logo";

const PROMPT_CHIPS = [
  "Explain how this app's multi-agent routing works",
  "Write a Python script to generate an OTP",
  "Summarize a document I've uploaded",
  "Help me debug a React useEffect loop",
];

export default function ChatWindow({ messages, streamingMessageIndex, onPromptSelect }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="chat-window">
        <div className="chat-empty-state">
          <div className="empty-glyph">
            <LogoMark size={44} />
          </div>
          <h2>What are you working on?</h2>
          <p>
            Ask a question, paste some code, or upload a document — Nexus
            routes it to whichever specialist agent fits best.
          </p>
          <div className="empty-prompt-chips">
            {PROMPT_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className="empty-prompt-chip"
                onClick={() => onPromptSelect?.(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          message={msg}
          isStreaming={index === streamingMessageIndex}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
