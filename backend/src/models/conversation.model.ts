import { Schema, model, Types } from "mongoose";
/* Conversation Model */
const conversationSchema = new Schema(
  {
    // Exactly one of userId / guestId is set (enforced below).
    userId: {
      type: Types.ObjectId,
      ref: "User",
      index: true,
    },
    guestId: {
      type: Types.ObjectId,
      ref: "GuestSession",
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.pre("validate", function () {
  if (!this.userId && !this.guestId) {
    throw new Error("A conversation must belong to a user or a guest session");
  }
});

export const Conversation = model("Conversation", conversationSchema);
