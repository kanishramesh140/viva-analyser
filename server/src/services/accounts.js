import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_FILE = path.join(DATA_DIR, "faculty_accounts.json");

const USERNAME_RE = /^[a-z0-9_.\-]{3,32}$/;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const attempt = crypto.scryptSync(password, salt, 64);
  const actual = Buffer.from(hash, "hex");
  return attempt.length === actual.length && crypto.timingSafeEqual(attempt, actual);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readAccounts() {
  try {
    const raw = await fs.readFile(ACCOUNTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeAccounts(list) {
  await ensureDir(DATA_DIR);
  await fs.writeFile(ACCOUNTS_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export async function findAccount(username) {
  if (!username) return null;
  const list = await readAccounts();
  return list.find((a) => a.username === String(username).trim().toLowerCase()) || null;
}

export async function createAccount({ username, name, password }) {
  const uname = String(username || "").trim().toLowerCase();
  if (!USERNAME_RE.test(uname)) {
    throw Object.assign(new Error("Username must be 3-32 characters: letters, numbers, dots, underscores, or hyphens only."), { status: 400 });
  }
  if (!password || password.length < 8) {
    throw Object.assign(new Error("Password must be at least 8 characters."), { status: 400 });
  }
  const list = await readAccounts();
  if (list.some((a) => a.username === uname)) {
    throw Object.assign(new Error("That username is already taken."), { status: 409 });
  }
  const { salt, hash } = hashPassword(password);
  const account = {
    username: uname,
    name: String(name || uname).trim(),
    passwordHash: hash,
    passwordSalt: salt,
    createdAt: new Date().toISOString(),
    failedAttempts: 0,
    lockedUntil: null,
  };
  list.push(account);
  await writeAccounts(list);
  return account;
}

export function checkPassword(account, password) {
  return verifyPassword(password, account.passwordSalt, account.passwordHash);
}

export function isLocked(account) {
  return !!(account.lockedUntil && Date.now() < account.lockedUntil);
}

export async function recordFailedAttempt(username) {
  const list = await readAccounts();
  const account = list.find((a) => a.username === username);
  if (!account) return;
  account.failedAttempts = (account.failedAttempts || 0) + 1;
  if (account.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    account.lockedUntil = Date.now() + LOCKOUT_MS;
    account.failedAttempts = 0;
  }
  await writeAccounts(list);
}

export async function resetFailedAttempts(username) {
  const list = await readAccounts();
  const account = list.find((a) => a.username === username);
  if (!account) return;
  account.failedAttempts = 0;
  account.lockedUntil = null;
  await writeAccounts(list);
}

export function publicAccount(account) {
  return { username: account.username, name: account.name };
}