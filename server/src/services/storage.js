import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const FACULTY_DIR = path.join(DATA_DIR, "faculty");

// Usernames are already constrained to [a-z0-9_.-] at registration (see
// accounts.js), but this is kept as defense in depth: it is what actually
// decides the on-disk folder name, so it must never trust input that
// bypassed that check.
function sanitizeUsername(username) {
  const clean = String(username).toLowerCase().replace(/[^a-z0-9_.\-]/g, "_");
  return clean || "unknown";
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

export async function ensureFacultyDir(username) {
  const dir = path.join(FACULTY_DIR, sanitizeUsername(username));
  await ensureDir(dir);
  return dir;
}

// Writes one transcript as its own JSON file inside that faculty member's
// own folder, named after their authenticated username — never a
// client-supplied display name. This is the entire storage layer: no
// database, no network call, nothing leaves this machine.
export async function saveTranscript(username, record) {
  const dir = await ensureFacultyDir(username);
  const filename = `${sanitizeUsername(record.studentId)}_${Date.now()}.json`;
  await fs.writeFile(path.join(dir, filename), JSON.stringify(record, null, 2), "utf-8");
  return filename;
}

export async function listStudents(username) {
  const dir = path.join(FACULTY_DIR, sanitizeUsername(username));
  try {
    const files = await fs.readdir(dir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    const records = await Promise.all(
      jsonFiles.map(async (f) => {
        const raw = await fs.readFile(path.join(dir, f), "utf-8");
        return { filename: f, ...JSON.parse(raw) };
      })
    );
    records.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    return records;
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

export async function readStudentRecord(username, filename) {
  // Only ever allow filenames this app itself generated — blocks any path
  // traversal attempt via the filename parameter.
  if (!/^[a-zA-Z0-9_.\-]+\.json$/.test(filename)) {
    throw Object.assign(new Error("Invalid filename."), { status: 400 });
  }
  const filePath = path.join(FACULTY_DIR, sanitizeUsername(username), filename);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") throw Object.assign(new Error("Transcript not found."), { status: 404 });
    throw err;
  }
}
