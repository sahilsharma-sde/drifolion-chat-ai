import crypto from "crypto";

export function generateDocumentHash(
  content: string
): string {
  return crypto
    .createHash("sha256")
    .update(content)
    .digest("hex");
}