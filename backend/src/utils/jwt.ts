import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET as string;

const ACCESS_TOKEN_EXPIRY = (process.env.JWT_ACCESS_EXPIRY ||
  "15m") as SignOptions["expiresIn"];
const REFRESH_TOKEN_EXPIRY = (process.env.JWT_REFRESH_EXPIRY ||
  "7d") as SignOptions["expiresIn"];

export interface JwtPayload {
  id: string;
  email: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload & {
    type?: string;
  };

  // Guest tokens share the signing secret, so make sure one can never be
  // accepted where a real user's token is required.
  if (decoded.type === "guest" || !decoded.id) {
    throw new Error("Not a user access token");
  }

  return decoded;
}

export interface GuestJwtPayload {
  guestId: string;
  type: "guest";
}

export function signGuestToken(guestId: string, expiresInSeconds: number): string {
  return jwt.sign({ guestId, type: "guest" }, ACCESS_TOKEN_SECRET, {
    expiresIn: expiresInSeconds,
  });
}

export function verifyGuestToken(token: string): GuestJwtPayload {
  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as Partial<GuestJwtPayload>;

  if (decoded.type !== "guest" || !decoded.guestId) {
    throw new Error("Not a guest token");
  }

  return decoded as GuestJwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
}
