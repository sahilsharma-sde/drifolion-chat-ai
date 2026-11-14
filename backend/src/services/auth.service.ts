import { OAuth2Client } from "google-auth-library";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function sanitizeUser(user: any) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    authProvider: user.authProvider,
  };
}

function issueTokens(user: any) {
  const payload = { id: user._id.toString(), email: user.email };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    authProvider: "local",
  });

  const tokens = issueTokens(user);

  return { user: sanitizeUser(user), ...tokens };
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user || user.authProvider !== "local") {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokens = issueTokens(user);

  return { user: sanitizeUser(user), ...tokens };
}

export async function loginWithGoogle(idToken: string) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(500, "Google sign-in is not configured on the server");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.email) {
    throw new ApiError(401, "Invalid Google token");
  }

  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }],
  });

  if (!user) {
    user = await User.create({
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      googleId: payload.sub,
      avatar: payload.picture || "",
      authProvider: "google",
    });
  } else if (!user.googleId) {
    // Existing local account signing in with Google for the first time
    user.googleId = payload.sub;
    user.avatar = user.avatar || payload.picture || "";
    await user.save();
  }

  const tokens = issueTokens(user);

  return { user: sanitizeUser(user), ...tokens };
}

export async function refreshAccessToken(refreshToken: string) {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  const tokens = issueTokens(user);

  return { user: sanitizeUser(user), ...tokens };
}

export async function getUserById(id: string) {
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return sanitizeUser(user);
}
