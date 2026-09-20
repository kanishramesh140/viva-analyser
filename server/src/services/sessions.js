import crypto from "node:crypto";

const SESSION_TTL_MS =
  12 * 60 * 60 * 1000;

const sessions = new Map();

export function createSession(
  username,
  role,
  userId = null
) {
  const id =
    crypto.randomBytes(32).toString("hex");

  sessions.set(id, {
    username,
    role,
    userId,
    studentId:
      role === "student"
        ? userId
        : null,
    expiresAt:
      Date.now() +
      SESSION_TTL_MS,
  });

  return id;
}

export function getSession(id) {
  const session =
    sessions.get(id);

  if (!session) {
    return null;
  }

  if (
    Date.now() >
    session.expiresAt
  ) {
    sessions.delete(id);
    return null;
  }

  return session;
}

export function destroySession(id) {
  sessions.delete(id);
}
