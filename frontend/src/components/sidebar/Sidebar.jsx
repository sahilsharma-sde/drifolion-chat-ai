import { Link } from "react-router-dom";
import "./sidebar.css";
import Logo from "../branding/Logo";
import UserMenu from "./UserMenu";

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  isGuest = false,
  documents = [],
  onRemoveDocument,
}) {
  // Guest mode is a single chat; more chats need an account.
  const newChatLocked = isGuest && conversations.length >= 1;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Logo size={26} wordmarkClassName="text-[15px]" />
      </div>

      <button
        className="new-chat-btn"
        onClick={onNewChat}
        disabled={newChatLocked}
        title={
          newChatLocked
            ? "Guest mode includes one chat. Create a free account to start more."
            : undefined
        }
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
        New chat
      </button>

      <div className="conversations">
        {conversations.length === 0 ? (
          <div className="empty-state">No conversations yet</div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation._id}
              onClick={() => onSelectConversation(conversation._id)}
              className={`conversation-item ${
                activeConversationId === conversation._id ? "active" : ""
              }`}
            >
              <span className="conversation-title">{conversation.title}</span>
            </div>
          ))
        )}
      </div>

      {!isGuest && (
        <div className="documents-section">
          <p className="documents-heading">Your documents</p>

          {documents.length === 0 ? (
            <p className="documents-empty">
              Attach a PDF with the paperclip to ask questions about it.
            </p>
          ) : (
            <ul className="documents-list">
              {documents.map((doc) => (
                <li key={doc.hash} className="document-item">
                  <span className="document-name" title={doc.name}>
                    {doc.name}
                  </span>
                  <button
                    type="button"
                    className="document-remove"
                    onClick={() => onRemoveDocument?.(doc.hash)}
                    aria-label={`Remove ${doc.name}`}
                    title="Remove from your library"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="sidebar-footer">
        {isGuest ? (
          <div className="guest-footer">
            <Link to="/login" className="guest-footer-login">
              Log in
            </Link>
            <Link to="/register" className="guest-footer-signup">
              Create free account
            </Link>
          </div>
        ) : (
          <UserMenu />
        )}
        <p className="sidebar-credit">
          Created by Sahil Sharma · Powered by ADMEC Multimedia
        </p>
      </div>
    </div>
  );
}
