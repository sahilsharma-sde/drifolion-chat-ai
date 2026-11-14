import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  refreshAccessToken,
  getUserById,
} from "../services/auth.service";
import { claimGuestSession, guestUsage } from "../services/guest.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = asyncHandler(async (req, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const result = await registerUser(name.trim(), email.trim(), password);

  res.status(201).json({ success: true, ...result });
});

export const login = asyncHandler(async (req, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const result = await loginUser(email.trim(), password);

  res.status(200).json({ success: true, ...result });
});

export const googleLogin = asyncHandler(async (req, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ApiError(400, "Google idToken is required");
  }

  const result = await loginWithGoogle(idToken);

  res.status(200).json({ success: true, ...result });
});

export const refresh = asyncHandler(async (req, res: Response) => {
  const { refreshToken } = req.body;

  const result = await refreshAccessToken(refreshToken);

  res.status(200).json({ success: true, ...result });
});

export const getMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const user = await getUserById(req.user.id);

    res.status(200).json({ success: true, user });
  },
);

/**
 * Starts (or resumes) the anonymous guest session for the caller's IP.
 * Send the previously issued guest token as a Bearer token to resume;
 * without it, an IP that already has a guest session gets 403.
 */
export const guestSession = asyncHandler(async (req, res: Response) => {
  const header = req.headers.authorization;
  const existingToken = header?.startsWith("Bearer ")
    ? header.split(" ")[1]
    : undefined;

  const { session, token } = await claimGuestSession(
    req.ip ?? "unknown",
    existingToken,
  );

  res.status(200).json({
    success: true,
    guestToken: token,
    guest: guestUsage(session),
  });
});
