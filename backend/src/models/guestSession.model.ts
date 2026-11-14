import { Schema, model } from "mongoose";

/**
 * One anonymous "guest" per network address. The raw IP is never stored,
 * only a keyed hash of it, so the collection can't be used to look up
 * where someone connected from.
 */
const guestSessionSchema = new Schema(
  {
    ipHash: {
      type: String,
      required: true,
      unique: true, // the database itself enforces "one guest per IP"
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const GuestSession = model("GuestSession", guestSessionSchema);
