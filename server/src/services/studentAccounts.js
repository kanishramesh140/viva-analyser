import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_FILE = path.join(DATA_DIR, "student_accounts.json");

const USERNAME_RE = /^[a-z0-9_.-]{3,32}$/;
const STUDENT_ID_RE = /^[a-zA-Z0-9_.-]{3,32}$/;

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readAccounts() {
  try {
    const raw = await fs.readFile(ACCOUNTS_FILE, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeAccounts(accounts) {
  await ensureDir(DATA_DIR);
  await fs.writeFile(
    ACCOUNTS_FILE,
    JSON.stringify(accounts, null, 2),
    "utf8"
  );
}

function hashValue(value) {
  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .scryptSync(String(value), salt, 64)
    .toString("hex");

  return { salt, hash };
}

function verifyValue(value, salt, expectedHash) {
  try {
    const actual = crypto.scryptSync(
      String(value),
      String(salt),
      64
    );

    const expected = Buffer.from(
      String(expectedHash),
      "hex"
    );

    if (actual.length !== expected.length) {
      return false;
    }

    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function createRecoveryCode() {
  const raw = crypto
    .randomBytes(9)
    .toString("base64")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 12);

  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

function normalizeRecoveryCode(code) {
  return String(code || "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
}

function recoveryHash(code, salt) {
  return crypto
    .scryptSync(normalizeRecoveryCode(code), salt, 64)
    .toString("hex");
}

export async function findStudentAccount(username) {
  const normalized = String(username || "")
    .trim()
    .toLowerCase();

  if (!normalized) return null;

  const accounts = await readAccounts();

  return (
    accounts.find(
      (account) => account.username === normalized
    ) || null
  );
}

export async function findStudentById(studentId) {
  const normalized = String(studentId || "")
    .trim()
    .toLowerCase();

  if (!normalized) return null;

  const accounts = await readAccounts();

  return (
    accounts.find(
      (account) =>
        String(account.studentId).toLowerCase() === normalized
    ) || null
  );
}

export async function createStudentAccount({
  studentId,
  username,
  name,
  password,
}) {
  const id = String(studentId || "")
    .trim()
    .toLowerCase();

  const uname = String(username || "")
    .trim()
    .toLowerCase();

  const displayName = String(name || "")
    .trim();

  const pass = String(password || "");

  if (!STUDENT_ID_RE.test(id)) {
    throw Object.assign(
      new Error(
        "Student ID must be 3-32 characters using letters, numbers, dots, underscores, or hyphens."
      ),
      { status: 400 }
    );
  }

  if (!USERNAME_RE.test(uname)) {
    throw Object.assign(
      new Error(
        "Username must be 3-32 characters using letters, numbers, dots, underscores, or hyphens."
      ),
      { status: 400 }
    );
  }

  if (!displayName || displayName.length > 100) {
    throw Object.assign(
      new Error("Name is required and must be under 100 characters."),
      { status: 400 }
    );
  }

  if (pass.length < 8) {
    throw Object.assign(
      new Error("Password must contain at least 8 characters."),
      { status: 400 }
    );
  }

  const accounts = await readAccounts();

  if (
    accounts.some(
      (account) => account.username === uname
    )
  ) {
    throw Object.assign(
      new Error("Username is already registered."),
      { status: 409 }
    );
  }

  if (
    accounts.some(
      (account) =>
        String(account.studentId).toLowerCase() === id
    )
  ) {
    throw Object.assign(
      new Error("Student ID is already registered."),
      { status: 409 }
    );
  }

  const passwordData = hashValue(pass);

  const account = {
    studentId: id,
    username: uname,
    name: displayName,

    passwordHash: passwordData.hash,
    passwordSalt: passwordData.salt,

    recoverySalt: null,
    recoveryHash: null,

    createdAt: new Date().toISOString(),

    failedAttempts: 0,
    lockedUntil: null,

    facultyUsername: null,

    subjects: [],

    progress: {},
  };

  accounts.push(account);

  await writeAccounts(accounts);

  const recoveryCode =
    await generateRecoveryCodeForStudent(uname);

  return {
    account,
    recoveryCode,
  };
}

export function checkStudentPassword(
  account,
  password
) {
  return verifyValue(
    password,
    account.passwordSalt,
    account.passwordHash
  );
}

export function isStudentLocked(account) {
  return Boolean(
    account.lockedUntil &&
    Date.now() < account.lockedUntil
  );
}

export async function recordStudentFailedAttempt(
  username
) {
  const accounts = await readAccounts();

  const account = accounts.find(
    (item) => item.username === username
  );

  if (!account) return;

  account.failedAttempts =
    (account.failedAttempts || 0) + 1;

  if (
    account.failedAttempts >= MAX_FAILED_ATTEMPTS
  ) {
    account.lockedUntil =
      Date.now() + LOCKOUT_MS;

    account.failedAttempts = 0;
  }

  await writeAccounts(accounts);
}

export async function resetStudentFailedAttempts(
  username
) {
  const accounts = await readAccounts();

  const account = accounts.find(
    (item) => item.username === username
  );

  if (!account) return;

  account.failedAttempts = 0;
  account.lockedUntil = null;

  await writeAccounts(accounts);
}

export async function generateRecoveryCodeForStudent(
  username
) {
  const accounts = await readAccounts();

  const account = accounts.find(
    (item) => item.username === username
  );

  if (!account) {
    throw Object.assign(
      new Error("Student account not found."),
      { status: 404 }
    );
  }

  const code = createRecoveryCode();

  const salt = crypto.randomBytes(16).toString("hex");

  account.recoverySalt = salt;
  account.recoveryHash = recoveryHash(code, salt);

  await writeAccounts(accounts);

  return code;
}

export async function resetStudentPasswordWithRecovery(
  username,
  recoveryCode,
  newPassword
) {
  const accounts = await readAccounts();

  const account = accounts.find(
    (item) =>
      item.username ===
      String(username || "")
        .trim()
        .toLowerCase()
  );

  if (!account) {
    throw Object.assign(
      new Error("Invalid recovery details."),
      { status: 400 }
    );
  }

  if (
    !account.recoverySalt ||
    !account.recoveryHash
  ) {
    throw Object.assign(
      new Error(
        "No recovery code is configured for this account."
      ),
      { status: 400 }
    );
  }

  if (
    !verifyValue(
      normalizeRecoveryCode(recoveryCode),
      account.recoverySalt,
      account.recoveryHash
    )
  ) {
    throw Object.assign(
      new Error("Invalid recovery details."),
      { status: 400 }
    );
  }

  if (String(newPassword || "").length < 8) {
    throw Object.assign(
      new Error(
        "New password must contain at least 8 characters."
      ),
      { status: 400 }
    );
  }

  const passwordData = hashValue(newPassword);

  account.passwordHash = passwordData.hash;
  account.passwordSalt = passwordData.salt;

  account.failedAttempts = 0;
  account.lockedUntil = null;

  // Recovery code is one-time.
  account.recoverySalt = null;
  account.recoveryHash = null;

  await writeAccounts(accounts);

  return true;
}

export async function assignSubjectToStudent(
  studentId,
  subject,
  facultyUsername
) {
  const accounts = await readAccounts();

  const id = String(studentId || "")
    .trim()
    .toLowerCase();

  const subjectName = String(subject || "")
    .trim();

  const student = accounts.find(
    (account) =>
      String(account.studentId).toLowerCase() === id
  );

  if (!student) {
    throw Object.assign(
      new Error("Student not found."),
      { status: 404 }
    );
  }

  const teacher =
    String(facultyUsername || "")
      .trim()
      .toLowerCase();

  if (
    student.facultyUsername &&
    student.facultyUsername !== teacher
  ) {
    throw Object.assign(
      new Error(
        "This student is already associated with another faculty account."
      ),
      { status: 403 }
    );
  }

  student.facultyUsername = teacher;

  if (!student.subjects.includes(subjectName)) {
    student.subjects.push(subjectName);
  }

  if (!student.progress[subjectName]) {
    student.progress[subjectName] = {
      currentTier: "easy",
      mastery: "NOT_STARTED",
      askedQuestionIds: [],
      attempts: 0,
      correct: 0,
      hintsUsed: 0,
      topics: {},
      lastActivityAt: null,
    };
  }

  await writeAccounts(accounts);

  return student;
}

export async function updateStudentProgress(
  username,
  subject,
  update
) {
  const accounts = await readAccounts();

  const account = accounts.find(
    (item) => item.username === username
  );

  if (!account) {
    throw Object.assign(
      new Error("Student account not found."),
      { status: 404 }
    );
  }

  if (!account.progress[subject]) {
    account.progress[subject] = {
      currentTier: "easy",
      mastery: "NOT_STARTED",
      askedQuestionIds: [],
      attempts: 0,
      correct: 0,
      hintsUsed: 0,
      topics: {},
      lastActivityAt: null,
    };
  }

  account.progress[subject] = {
    ...account.progress[subject],
    ...update,
    lastActivityAt: new Date().toISOString(),
  };

  await writeAccounts(accounts);

  return account.progress[subject];
}

export async function getStudentProgress(
  username
) {
  const account =
    await findStudentAccount(username);

  return account?.progress || {};
}

export function publicStudentAccount(account) {
  return {
    role: "student",
    studentId: account.studentId,
    username: account.username,
    name: account.name,
    facultyUsername:
      account.facultyUsername || null,
    subjects: account.subjects || [],
  };
}

export async function listStudentAccounts() {
  const accounts = await readAccounts();

  return accounts.map(
    publicStudentAccount
  );
}

export async function listStudentsForFaculty(
  facultyUsername
) {
  const teacher =
    String(facultyUsername || "")
      .trim()
      .toLowerCase();

  const accounts = await readAccounts();

  return accounts
    .filter(
      (account) =>
        account.facultyUsername === teacher
    )
    .map(publicStudentAccount);
}
