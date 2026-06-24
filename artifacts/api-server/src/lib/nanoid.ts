import crypto from "crypto";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function nanoid(size = 8): string {
  let result = "";
  const bytes = crypto.randomBytes(size);
  for (let i = 0; i < size; i++) {
    result += CHARS[bytes[i] % CHARS.length];
  }
  return result;
}
