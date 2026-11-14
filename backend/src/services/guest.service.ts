import crypto from "crypto";
import { ipKeyGenerator } from "express-rate-limit";

import { GuestSession } from "../models/guestSession.model";
import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import { ApiError } from "../utils/ApiError";
import { signGuestToken, verifyGuestToken } from "../utils/jwt";

// Read lazily so values come from .env regardless of import order.
const messageLimit = () => Number(process.env.GUEST_MESSAGE_LIMIT || 10);
const ttlHours = () => Number(process.env.GUEST_TTL_HOURS || 24);

/**
 * Keyed hash of the caller's network address. IPv6 addresses are grouped
 * by subnet (so rotating addresses inside one network doesn't earn a new
 * guest slot) and IPv4-mapped IPv6 is normalised to plain IPv4.
 */
function hashIp(ip: string): string {
  return crypto
    .createHmac("sha256", process.env.JWT_ACCESS_SECRET as string)
    .update(ipKeyGenerator(ip || "unknown"))
    .digest("hex");
}

export function guestUsage(session: { messageCount: number; expiresAt: Date }) {
  return {
    messagesUsed: session.messageCount,
    messageLimit: messageLimit(),
    expiresAt: session.expiresAt,
  };
}

const slotTaken = () =>
  new ApiError(
    403,
    "A guest chat is already in use on this network. Log in or create a free account to continue.",
    "GUEST_SLOT_TAKEN",
  );

/**
 * Hands out the single guest session for this IP.
 *  - no session yet            -> create one and return a token
 *  - session exists, and the caller presents its token -> same session
 *  - session exists, no/other token                    -> 403 slot taken
 */
export async function claimGuestSession(ip: string, existingToken?: string) {
  const ipHash = hashIp(ip);

  // An expired record shouldn't keep blocking this network.
  await purgeExpiredGuests({ ipHash });

  const existing = await GuestSession.findOne({ ipHash });

  if (existing) {
    let claimedId: string | undefined;

    try {
      claimedId = existingToken ? verifyGuestToken(existingToken).guestId : undefined;
    } catch {
      claimedId = undefined;
    }

    if (!existingToken || claimedId !== existing.id) {
      throw slotTaken();
    }

    return { session: existing, token: existingToken };
  }

  try {
    const session = await GuestSession.create({
      ipHash,
      expiresAt: new Date(Date.now() + ttlHours() * 3600 * 1000),
    });

    return {
      session,
      token: signGuestToken(session.id, ttlHours() * 3600),
    };
  } catch (error: any) {
    // Two first-time requests racing: the unique index lets only one win.
    if (error?.code === 11000) throw slotTaken();
    throw error;
  }
}

/** Atomically counts one message against the guest's allowance. */
export async function consumeGuestMessage(guestId: string) {
  const updated = await GuestSession.findOneAndUpdate(
    { _id: guestId, messageCount: { $lt: messageLimit() } },
    { $inc: { messageCount: 1 } },
    { returnDocument: "after" },
  );

  if (!updated) {
    throw new ApiError(
      403,
      `You've used all ${messageLimit()} free guest messages. Create a free account to keep chatting.`,
      "GUEST_LIMIT_REACHED",
    );
  }

  return updated;
}

export async function isGuestSessionActive(guestId: string) {
  return !!(await GuestSession.exists({
    _id: guestId,
    expiresAt: { $gt: new Date() },
  }));
}

/** Deletes expired guest sessions together with their chats. */
export async function purgeExpiredGuests(extraFilter: Record<string, unknown> = {}) {
  const expired = await GuestSession.find({
    expiresAt: { $lte: new Date() },
    ...extraFilter,
  }).select("_id");

  if (expired.length === 0) return 0;

  const ids = expired.map((s) => s._id);
  const conversations = await Conversation.find({ guestId: { $in: ids } }).select("_id");

  await Message.deleteMany({ conversationId: { $in: conversations.map((c) => c._id) } });
  await Conversation.deleteMany({ guestId: { $in: ids } });
  await GuestSession.deleteMany({ _id: { $in: ids } });

  return ids.length;
}
