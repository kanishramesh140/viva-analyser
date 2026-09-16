import { Router } from "express";
import { createAccount, findAccount, checkPassword, isLocked, recordFailedAttempt, resetFailedAttempts, publicAccount } from "../services/accounts.js";
import { createSession, destroySession } from "../services/sessions.js";
import { authRateLimit } from "../middleware/rateLimit.js";
import { requireAuth, SESSION_COOKIE } from "../middleware/requireAuth.js";

const router = Router();

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
  maxAge: 12 * 60 * 60 * 1000,
  path: "/",
});

router.post("/register", authRateLimit, async (req, res, next) => {
  try {
    const { username, name, password } = req.body || {};
    const account = await createAccount({ username, name, password });
    const sid = createSession(account.username);
    res.cookie(SESSION_COOKIE, sid, cookieOptions());
    res.status(201).json(publicAccount(account));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

router.post("/login", authRateLimit, async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }
    const account = await findAccount(username);
    // Deliberately identical error for "no such user" and "wrong password"
    // so a login attempt can't be used to enumerate valid usernames.
    if (!account) return res.status(401).json({ error: "Invalid username or password." });
    if (isLocked(account)) {
      return res.status(423).json({ error: "Too many failed attempts on this account. Try again in a few minutes." });
    }
    const ok = checkPassword(account, password);
    if (!ok) {
      await recordFailedAttempt(account.username);
      return res.status(401).json({ error: "Invalid username or password." });
    }
    await resetFailedAttempts(account.username);
    const sid = createSession(account.username);
    res.cookie(SESSION_COOKIE, sid, cookieOptions());
    res.json(publicAccount(account));
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res) => {
  const sid = req.cookies && req.cookies[SESSION_COOKIE];
  if (sid) destroySession(sid);
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json(req.faculty);
});

export default router;