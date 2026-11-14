import { Link } from "react-router-dom";

/**
 * Shown above the chat while someone is using the anonymous guest chat.
 * Says how much of the free allowance is left and offers the way out.
 */
export default function GuestBanner({ guest }) {
  if (!guest) return null;

  const used = Math.min(guest.messagesUsed, guest.messageLimit);
  const left = guest.messageLimit - used;

  return (
    <div className="guest-banner" role="status">
      <p className="guest-banner-text">
        <strong>Guest chat</strong>
        <span>
          {left > 0
            ? `${left} of ${guest.messageLimit} free messages left`
            : "You've used all your free messages"}
        </span>
      </p>

      <div className="guest-banner-actions">
        <Link to="/login" className="guest-banner-link">
          Log in
        </Link>
        <Link to="/register" className="guest-banner-cta">
          Create free account
        </Link>
      </div>
    </div>
  );
}
