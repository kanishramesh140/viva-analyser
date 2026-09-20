import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_FILE = path.join(
  DATA_DIR,
  "faculty_accounts.json"
);

const USERNAME_RE = /^[a-z0-9_.\-]{3,32}$/;

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readAccounts() {
  try {
    const raw = await fs.readFile(
      ACCOUNTS_FILE,
      "utf8"
    );

    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeAccounts(list) {
  await ensureDir(DATA_DIR);

  await fs.writeFile(
    ACCOUNTS_FILE,
    JSON.stringify(list, null, 2),
    "utf8"
  );
}

function hashValue(value) {
  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .scryptSync(String(value), salt, 64)
    .toString("hex");

  return {
    salt,
    hash,
  };
}

function verifyValue(
  value,
  salt,
  expectedHash
) {
  try {
    const attempt = crypto.scryptSync(
      String(value),
      String(salt),
      64
    );

    const actual = Buffer.from(
      String(expectedHash),
      "hex"
    );

    return (
      attempt.length === actual.length &&
      crypto.timingSafeEqual(
        attempt,
        actual
      )
    );
  } catch {
    return false;
  }
}

function createRecoveryCode() {
  const value = crypto
    .randomBytes(9)
    .toString("base64")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 12);

  return `${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`;
}

function normalizeRecoveryCode(code) {
  return String(code || "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
}

export async function findAccount(username) {
  if (!username) return null;

  const list = await readAccounts();

  return (
    list.find(
      (account) =>
        account.username ===
        String(username)
          .trim()
          .toLowerCase()
    ) || null
  );
}

export async function createAccount({
  username,
  name,
  password,
}) {
  const uname =
    String(username || "")
      .trim()
      .toLowerCase();

  if (!USERNAME_RE.test(uname)) {
    throw Object.assign(
      new Error(
        "Username must be 3-32 characters: letters, numbers, dots, underscores, or hyphens only."
      ),
      { status: 400 }
    );
  }

  if (!password || password.length < 8) {
    throw Object.assign(
      new Error(
        "Password must be at least 8 characters."
      ),
      { status: 400 }
    );
  }

  const list = await readAccounts();

  if (
    list.some(
      (account) =>
        account.username === uname
    )
  ) {
    throw Object.assign(
      new Error(
        "That username is already taken."
      ),
      { status: 409 }
    );
  }

  const passwordData =
    hashValue(password);

  const account = {
    role: "faculty",

    username: uname,

    name:
      String(name || uname)
        .trim(),

    passwordHash:
      passwordData.hash,

    passwordSalt:
      passwordData.salt,

    recoverySalt: null,
    recoveryHash: null,

    createdAt:
      new Date().toISOString(),

    failedAttempts: 0,
    lockedUntil: null,
  };

  list.push(account);

  await writeAccounts(list);

  const recoveryCode =
    await generateRecoveryCodeForFaculty(
      uname
    );

  return {
    ...account,
    recoveryCode,
  };
}

export function checkPassword(
  account,
  password
) {
  return verifyValue(
    password,
    account.passwordSalt,
    account.passwordHash
  );
}

export function isLocked(account) {
  return Boolean(
    account.lockedUntil &&
    Date.now() <
      account.lockedUntil
  );
}

export async function recordFailedAttempt(
  username
) {
  const list = await readAccounts();

  const account = list.find(
    (item) =>
      item.username === username
  );

  if (!account) return;

  account.failedAttempts =
    (account.failedAttempts || 0) + 1;

  if (
    account.failedAttempts >=
    MAX_FAILED_ATTEMPTS
  ) {
    account.lockedUntil =
      Date.now() +
      LOCKOUT_MS;

    account.failedAttempts = 0;
  }

  await writeAccounts(list);
}

export async function resetFailedAttempts(
  username
) {
  const list = await readAccounts();

  const account = list.find(
    (item) =>
      item.username === username
  );

  if (!account) return;

  account.failedAttempts = 0;
  account.lockedUntil = null;

  await writeAccounts(list);
}

export async function generateRecoveryCodeForFaculty(
  username
) {
  const list = await readAccounts();

  const account = list.find(
    (item) =>
      item.username === username
  );

  if (!account) {
    throw Object.assign(
      new Error(
        "Faculty account not found."
      ),
      { status: 404 }
    );
  }

  const code =
    createRecoveryCode();

  const salt =
    crypto.randomBytes(16)
      .toString("hex");

  const hash =
    crypto
      .scryptSync(
        normalizeRecoveryCode(code),
        salt,
        64
      )
      .toString("hex");

  account.recoverySalt = salt;
  account.recoveryHash = hash;

  await writeAccounts(list);

  return code;
}

export async function resetPasswordWithRecovery(
  username,
  recoveryCode,
  newPassword
) {
  const list =
    await readAccounts();

  const account =
    list.find(
      (item) =>
        item.username ===
        String(username || "")
          .trim()
          .toLowerCase()
    );

  if (!account) {
    throw Object.assign(
      new Error(
        "Invalid recovery details."
      ),
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

  const recoveryAttempt =
    crypto
      .scryptSync(
        normalizeRecoveryCode(
          recoveryCode
        ),
        account.recoverySalt,
        64
      )
      .toString("hex");

  if (
    !crypto.timingSafeEqual(
      Buffer.from(
        recoveryAttempt,
        "hex"
      ),
      Buffer.from(
        account.recoveryHash,
        "hex"
      )
    )
  ) {
    throw Object.assign(
      new Error(
        "Invalid recovery details."
      ),
      { status: 400 }
    );
  }

  if (
    String(newPassword || "")
      .length < 8
  ) {
    throw Object.assign(
      new Error(
        "New password must contain at least 8 characters."
      ),
      { status: 400 }
    );
  }

  const passwordData =
    hashValue(newPassword);

  account.passwordHash =
    passwordData.hash;

  account.passwordSalt =
    passwordData.salt;

  account.failedAttempts = 0;
  account.lockedUntil = null;

  // Recovery code is one-time.
  account.recoverySalt = null;
  account.recoveryHash = null;

  await writeAccounts(list);
}

export function publicAccount(
  account
) {
  return {
    role: "faculty",
    username: account.username,
    name: account.name,
  };
}
