import fs from "node:fs/promises";
import path from "node:path";
import { sanitizeId } from "../utils/ids.js";

const AUDIT_DIR = path.join(process.cwd(), "data", "audit");

export async function logEvent({
  sessionId,
  studentId = null,
  facultyUsername = null,
  type,
  details = {},
}) {
  const safeSession = sanitizeId(sessionId);

  if (!safeSession) {
    throw new Error("Session ID is required.");
  }

  await fs.mkdir(AUDIT_DIR, { recursive: true });

  const file = path.join(AUDIT_DIR, `${safeSession}.jsonl`);

  const record = {
    timestamp: new Date().toISOString(),
    sessionId,
    studentId,
    facultyUsername,
    type,
    details,
  };

  await fs.appendFile(
    file,
    `${JSON.stringify(record)}\n`,
    "utf8"
  );

  return record;
}

export async function readEvents(sessionId) {
  const file = path.join(
    AUDIT_DIR,
    `${sanitizeId(sessionId)}.jsonl`
  );

  try {
    const content = await fs.readFile(file, "utf8");

    return content
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}
