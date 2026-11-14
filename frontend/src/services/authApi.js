export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const ACCESS_TOKEN_KEY = "nexus_access_token";
const REFRESH_TOKEN_KEY = "nexus_refresh_token";
const GUEST_TOKEN_KEY = "nexus_guest_token";

export const SESSION_EXPIRED_EVENT = "nexus:session-expired";

export function getGuestToken() {
  return localStorage.getItem(GUEST_TOKEN_KEY);
}

export function storeGuestToken(token) {
  localStorage.setItem(GUEST_TOKEN_KEY, token);
}

export function clearGuestToken() {
  localStorage.removeItem(GUEST_TOKEN_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function storeTokens(accessToken, refreshToken) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function parseJsonOrThrow(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong");
    error.code = data.code; // e.g. GUEST_SLOT_TAKEN, GUEST_LIMIT_REACHED
    throw error;
  }

  return data;
}

export async function registerRequest(name, email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  return parseJsonOrThrow(response);
}

export async function loginRequest(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return parseJsonOrThrow(response);
}

export async function googleLoginRequest(idToken) {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  return parseJsonOrThrow(response);
}

export async function refreshTokenRequest() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) throw new Error("No refresh token");

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await parseJsonOrThrow(response);

  storeTokens(data.accessToken, data.refreshToken);

  return data;
}

/**
 * Starts (or resumes) the anonymous guest session for this network.
 * Re-sends the stored guest token so the same browser keeps its session.
 */
export async function guestSessionRequest() {
  const existing = getGuestToken();

  const response = await fetch(`${API_BASE_URL}/api/auth/guest`, {
    method: "POST",
    headers: existing ? { Authorization: `Bearer ${existing}` } : {},
  });

  const data = await parseJsonOrThrow(response);

  storeGuestToken(data.guestToken);

  return data.guest; // { messagesUsed, messageLimit, expiresAt }
}

export async function fetchMe() {
  const response = await authFetch(`${API_BASE_URL}/api/auth/me`);

  const data = await parseJsonOrThrow(response);

  return data.user;
}

/**
 * fetch() wrapper that attaches the access token and transparently
 * retries once with a refreshed token if the server says it's expired.
 */
export async function authFetch(url, options = {}) {
  // A logged-in user's token wins; otherwise fall back to the guest token.
  const token = getAccessToken() || getGuestToken();

  const doFetch = (accessToken) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

  let response = await doFetch(token);

  if (response.status === 401) {
    if (getRefreshToken()) {
      try {
        const { accessToken } = await refreshTokenRequest();
        response = await doFetch(accessToken);
      } catch {
        clearTokens();
      }
    } else if (!getAccessToken() && getGuestToken()) {
      // The guest session ended (expired). Let the app start a fresh one.
      clearGuestToken();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
  }

  return response;
}
