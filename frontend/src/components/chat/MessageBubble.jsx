import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../../styles/messageBubble.css";
import CodeBlock from "./CodeBlock";
import "../../styles/chat.css";
import { formatTime } from "../../services/conversationApi";
import { LogoMark } from "../branding/Logo";
import { getRouteMeta } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";

function UserAvatar() {
  const { user } = useAuth();

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="message-avatar user-avatar-mark">
      {user?.avatar ? (
        <img src={user.avatar} alt={user.name} />
      ) : (
        <span>{initials || "U"}</span>
      )}
    </div>
  );
}

export default function MessageBubble({ message, isStreaming }) {
  const isUser = message.role === "user";
  const routeMeta = !isUser ? getRouteMeta(message.route) : null;

  return (
    <div className={`message-row ${isUser ? "user-row" : "assistant-row"}`}>
      {!isUser && (
        <div className="message-avatar assistant-avatar-mark">
          <LogoMark size={20} />
        </div>
      )}

      <div className="message-col">
        {!isUser && routeMeta && (
          <div
            className="route-badge"
            style={{ "--route-color": routeMeta.color }}
          >
            <span className="route-badge-icon">{routeMeta.icon}</span>
            {routeMeta.label}
          </div>
        )}

        <div
          className={`message-bubble ${
            isUser ? "user-bubble" : "assistant-bubble"
          }`}
        >
          {isStreaming ? (
            <>
              <pre className="streaming-content">{message.content}</pre>
              <span className="streaming-cursor">▋</span>
            </>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");

                  if (!inline && match) {
                    return (
                      <CodeBlock
                        language={match[1]}
                        value={String(children).replace(/\n$/, "")}
                      />
                    );
                  }

                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {message.createdAt && (
          <div className={`message-time ${isUser ? "align-right" : ""}`}>
            {formatTime(message.createdAt)}
          </div>
        )}
      </div>

      {isUser && <UserAvatar />}
    </div>
  );
}
