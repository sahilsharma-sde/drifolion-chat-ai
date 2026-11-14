import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Spinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-[var(--nexus-bg)]">
      <div className="h-8 w-8 rounded-full border-2 border-[var(--nexus-violet)] border-t-transparent animate-spin" />
    </div>
  );
}

/**
 * Lets in a logged-in user, or an anonymous guest (one per network).
 * If the guest slot for this network is already taken, send them to log in.
 */
export default function ProtectedRoute({ children }) {
  const { user, guest, loading, guestStatus, guestError, startGuest } = useAuth();
  const location = useLocation();

  const needsGuestSession = !loading && !user && !guest && guestStatus === "idle";

  useEffect(() => {
    if (needsGuestSession) startGuest();
  }, [needsGuestSession, startGuest]);

  if (loading || needsGuestSession || guestStatus === "claiming") {
    return <Spinner />;
  }

  if (user || guest) {
    return children;
  }

  return (
    <Navigate
      to="/login"
      state={{ from: location, reason: guestError }}
      replace
    />
  );
}
