import crypto from "node:crypto";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const sessions = new Map();

export function createSession(username) {
  const id = crypto.randomBytes(32).toString("hex");
  sessions.set(id, { username, expiresAt: Date.now() + SESSION_TTL_MS });
  return id;
}

export function getSession(id) {
  const s = sessions.get(id);
  if (!s) return null;
  if (Date.now() > s.expiresAt) {
    sessions.delete(id);
    return null;
  }
  return s;
}

export function destroySession(id) {
  sessions.delete(id);
}