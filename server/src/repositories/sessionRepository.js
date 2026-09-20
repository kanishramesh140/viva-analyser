import fs from "node:fs/promises";
import path from "node:path";
import { createId } from "../utils/ids.js";

const SESSIONS_DIR =
  path.join(
    process.cwd(),
    "data",
    "sessions"
  );

function sessionFile(id) {
  return path.join(
    SESSIONS_DIR,
    `${id}.json`
  );
}

export async function createPersistentSession(
  data
) {
  const id =
    createId("viva");

  const record = {
    id,
    ...data,
    createdAt:
      new Date().toISOString(),
    status: "active",
  };

  await fs.mkdir(
    SESSIONS_DIR,
    {
      recursive: true,
    }
  );

  await fs.writeFile(
    sessionFile(id),
    JSON.stringify(
      record,
      null,
      2
    ),
    "utf8"
  );

  return record;
}

export async function getPersistentSession(
  id
) {
  try {
    return JSON.parse(
      await fs.readFile(
        sessionFile(id),
        "utf8"
      )
    );
  } catch (error) {
    if (
      error.code === "ENOENT"
    ) {
      return null;
    }

    throw error;
  }
}

export async function updatePersistentSession(
  id,
  updates
) {
  const current =
    await getPersistentSession(
      id
    );

  if (!current) {
    throw Object.assign(
      new Error(
        "Viva session not found."
      ),
      { status: 404 }
    );
  }

  const updated = {
    ...current,
    ...updates,

    updatedAt:
      new Date().toISOString(),
  };

  await fs.writeFile(
    sessionFile(id),
    JSON.stringify(
      updated,
      null,
      2
    ),
    "utf8"
  );

  return updated;
}

export async function listPersistentSessionsForStudent(
  studentId
) {
  await fs.mkdir(
    SESSIONS_DIR,
    {
      recursive: true,
    }
  );

  const files =
    await fs.readdir(
      SESSIONS_DIR
    );

  const results = [];

  for (
    const file of files
  ) {
    if (!file.endsWith(".json")) {
      continue;
    }

    try {
      const record =
        JSON.parse(
          await fs.readFile(
            path.join(
              SESSIONS_DIR,
              file
            ),
            "utf8"
          )
        );

      if (
        record.studentId ===
        studentId
      ) {
        results.push(record);
      }
    } catch {
      // Skip malformed session file.
    }
  }

  results.sort(
    (a, b) =>
      new Date(
        b.createdAt
      ) -
      new Date(
        a.createdAt
      )
  );

  return results;
}
