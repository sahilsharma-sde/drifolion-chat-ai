/**
 * Who a conversation belongs to: a registered user OR an anonymous guest
 * session. Exactly one of the two is ever set.
 */
export type Owner =
  | { userId: string; guestId?: undefined }
  | { guestId: string; userId?: undefined };

/** Mongo filter / create-payload fragment for an owner. */
export const ownerFilter = (owner: Owner) =>
  owner.userId ? { userId: owner.userId } : { guestId: owner.guestId };
