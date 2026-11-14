import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, verifyGuestToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { isGuestSessionActive } from "../services/guest.service";
import type { Owner } from "../types/owner";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  guest?: {
    id: string;
  };
}

const bearerToken = (req: Request) => {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.split(" ")[1] : undefined;
};

/**
 * Verifies the Bearer access token on the Authorization header
 * and attaches { id, email } to req.user.
 * Throws 401 if missing/invalid/expired. Guest tokens are rejected.
 */
export function protect(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  const token = bearerToken(req);

  if (!token) {
    return next(new ApiError(401, "Not authenticated. Please log in."));
  }

  try {
    const decoded = verifyAccessToken(token);

    req.user = { id: decoded.id, email: decoded.email };

    next();
  } catch (err) {
    return next(new ApiError(401, "Session expired. Please log in again."));
  }
}

/**
 * Accepts either a logged-in user's access token (sets req.user) or an
 * anonymous guest token (sets req.guest). Use on the routes guests may
 * reach; everything else stays behind `protect`.
 */
export async function protectOrGuest(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  const token = bearerToken(req);

  if (!token) {
    return next(new ApiError(401, "Not authenticated. Please log in."));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id, email: decoded.email };
    return next();
  } catch {
    // not a user token - try it as a guest token below
  }

  let guestId: string;

  try {
    guestId = verifyGuestToken(token).guestId;
  } catch {
    return next(new ApiError(401, "Session expired. Please log in again."));
  }

  try {
    if (!(await isGuestSessionActive(guestId))) {
      return next(new ApiError(401, "Your guest session has ended.", "GUEST_EXPIRED"));
    }
  } catch (error) {
    return next(error);
  }

  req.guest = { id: guestId };
  next();
}

/** The caller as a conversation owner (user or guest). */
export function ownerOf(req: AuthenticatedRequest): Owner {
  if (req.user) return { userId: req.user.id };
  if (req.guest) return { guestId: req.guest.id };

  throw new ApiError(401, "Not authenticated. Please log in.");
}
