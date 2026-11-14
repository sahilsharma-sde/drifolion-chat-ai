import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  loginRequest,
  registerRequest,
  googleLoginRequest,
  guestSessionRequest,
  fetchMe,
  clearTokens,
  storeTokens,
  getAccessToken,
  SESSION_EXPIRED_EVENT,
} from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for an existing session
  const [error, setError] = useState("");

  // Anonymous guest session: { messagesUsed, messageLimit, expiresAt } | null
  const [guest, setGuest] = useState(null);
  // idle -> claiming -> ok | blocked
  const [guestStatus, setGuestStatus] = useState("idle");
  const [guestError, setGuestError] = useState("");
  const claimingRef = useRef(false);

  const hydrate = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Called by the protected route when nobody is logged in.
  const startGuest = useCallback(async () => {
    if (claimingRef.current) return;
    claimingRef.current = true;
    setGuestStatus("claiming");
    setGuestError("");

    try {
      setGuest(await guestSessionRequest());
      setGuestStatus("ok");
    } catch (err) {
      setGuest(null);
      setGuestStatus("blocked");
      setGuestError(
        err.message || "Guest chat isn't available right now. Please log in.",
      );
    } finally {
      claimingRef.current = false;
    }
  }, []);

  // The server ended our guest session (24h expiry) - go get a new one.
  useEffect(() => {
    const onExpired = () => {
      setGuest(null);
      setGuestStatus("idle");
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const noteGuestMessage = useCallback(() => {
    setGuest((g) =>
      g && { ...g, messagesUsed: Math.min(g.messagesUsed + 1, g.messageLimit) },
    );
  }, []);

  const markGuestLimitReached = useCallback(() => {
    setGuest((g) => g && { ...g, messagesUsed: g.messageLimit });
  }, []);

  // Signing in takes over from the anonymous session. The guest token is
  // kept on purpose: after logout, this browser can resume its own guest
  // chat instead of being told the network's guest slot is taken.
  const adoptUser = (data) => {
    storeTokens(data.accessToken, data.refreshToken);
    setGuest(null);
    setGuestStatus("idle");
    setGuestError("");
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    setError("");
    return adoptUser(await loginRequest(email, password));
  };

  const register = async (name, email, password) => {
    setError("");
    return adoptUser(await registerRequest(name, email, password));
  };

  const loginWithGoogle = async (idToken) => {
    setError("");
    return adoptUser(await googleLoginRequest(idToken));
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setError,
        login,
        register,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
        guest,
        isGuest: !user && !!guest,
        guestStatus,
        guestError,
        startGuest,
        noteGuestMessage,
        markGuestLimitReached,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
