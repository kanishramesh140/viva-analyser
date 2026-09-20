import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const ASSOC_FILE = path.join(DATA_DIR, "subject_faculty.json");

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readAssoc() {
  try {
    const raw = await fs.readFile(ASSOC_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return {};
    throw err;
  }
}

async function writeAssoc(obj) {
  await ensureDir(DATA_DIR);
  await fs.writeFile(ASSOC_FILE, JSON.stringify(obj, null, 2), "utf-8");
}

export async function listAllSubjectEntries() {
  return readAssoc();
}

export async function getSubjectAssoc(subject) {
  const all = await readAssoc();
  return all[subject] || { topic: "", notes: "", faculty: [] };
}

export async function isFacultyForSubject(subject, username) {
  const entry = await getSubjectAssoc(subject);
  return entry.faculty.includes(username);
}

// A faculty member "opting in" to teach a subject — this is the ONLY way a
// subject gets created or gains a teacher. The faculty identity here must
// always come from an authenticated session (never from client input) —
// enforced by the caller (see routes/faculty.js).
export async function addFacultyToSubject({ subject, topic, notes, username }) {
  const name = String(subject || "").trim();
  if (!name) throw Object.assign(new Error("Subject name is required."), { status: 400 });
  const all = await readAssoc();
  if (!all[name]) all[name] = { topic: "", notes: "", faculty: [] };
  if (topic !== undefined && topic !== null) all[name].topic = String(topic).trim();
  if (notes !== undefined && notes !== null) all[name].notes = String(notes).trim();
  if (!all[name].faculty.includes(username)) all[name].faculty.push(username);
  await writeAssoc(all);
  return all[name];
}

export async function removeFacultyFromSubject(subject, username) {
  const all = await readAssoc();
  if (!all[subject]) return;
  all[subject].faculty = all[subject].faculty.filter((u) => u !== username);
  await writeAssoc(all);
}
