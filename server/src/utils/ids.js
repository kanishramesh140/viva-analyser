import crypto from "node:crypto";

export function createId(prefix = "id") {
  return `${prefix}_${crypto.randomBytes(12).toString("hex")}`;
}

export function createSessionId() {
  return crypto.randomBytes(32).toString("hex");
}

export function sanitizeId(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_.-]/g, "_");
}
