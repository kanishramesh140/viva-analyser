import { getSession } from "../services/sessions.js";
import { findAccount, publicAccount } from "../services/accounts.js";

export const SESSION_COOKIE = "viva_session";

export async function requireAuth(req, res, next) {
  const sid = req.cookies && req.cookies[SESSION_COOKIE];
  if (!sid) return res.status(401).json({ error: "Sign in required." });

  const session = getSession(sid);
  if (!session) return res.status(401).json({ error: "Session expired. Please sign in again." });

  const account = await findAccount(session.username);
  if (!account) return res.status(401).json({ error: "This account no longer exists." });

  req.faculty = publicAccount(account);
  next();
}
