import { useState, useRef } from "react";

export default function ChatInput({
  onSend,
  loading,
  canAttach = false,
  onAttach,
  uploading = false,
  attachStatus = null,
  disabledReason = "",
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);
  const fileRef = useRef(null);

  const blocked = loading || !!disabledReason;

  const submit = () => {
    if (!input.trim() || blocked) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleChange = (e) => {
    setInput(e.target.value);

    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (file) onAttach?.(file);
  };

  return (
    <div className="chat-input-bar">
      {(uploading || attachStatus) && (
        <p
          className={`attach-status ${
            uploading ? "info" : attachStatus.type
          }`}
          role="status"
        >
          {uploading ? "Reading and indexing your PDF…" : attachStatus.text}
        </p>
      )}

      <form onSubmit={handleSubmit} className="chat-input-form">
        {canAttach && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden-file-input"
              onChange={handleFile}
            />
            <button
              type="button"
              className="attach-btn"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="Attach a PDF"
              title="Attach a PDF to ask questions about it"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 11.5l-8.6 8.6a5.5 5.5 0 01-7.8-7.8l8.6-8.6a3.7 3.7 0 115.2 5.2l-8.6 8.6a1.8 1.8 0 01-2.6-2.6l7.9-7.9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}

        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={!!disabledReason}
          placeholder={disabledReason || "Ask Drifolion AI anything…"}
          className="chat-input"
        />

        <button
          type="submit"
          className="send-btn"
          disabled={blocked || !input.trim()}
          aria-label="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 20L20 12L4 4V10L14 12L4 14V20Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </form>

      <p className="input-hint">Enter to send · Shift + Enter for a new line</p>
    </div>
  );
}
