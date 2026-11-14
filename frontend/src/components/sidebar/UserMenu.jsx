import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="user-menu" ref={menuRef}>
      {open && (
        <div className="user-menu-dropdown">
          <div className="user-menu-info">
            <p className="user-menu-name">{user.name}</p>
            <p className="user-menu-email">{user.email}</p>
          </div>
          <button onClick={logout} className="user-menu-logout">
            Log out
          </button>
        </div>
      )}

      <button className="user-menu-trigger" onClick={() => setOpen((o) => !o)}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="user-menu-avatar" />
        ) : (
          <span className="user-menu-avatar user-menu-avatar-fallback">
            {initials}
          </span>
        )}
        <span className="user-menu-label">{user.name}</span>
      </button>
    </div>
  );
}
