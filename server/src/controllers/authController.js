import {
  createAccount,
  findAccount,
  checkPassword,
  isLocked,
  recordFailedAttempt,
  resetFailedAttempts,
  publicAccount,
} from "../services/accounts.js";

export async function registerFaculty(req, res, next) {
  try {
    const account = await createAccount(req.body);
    res.status(201).json({
      ok: true,
      user: publicAccount(account),
    });
  } catch (error) {
    next(error);
  }
}

export async function loginFaculty(req, res, next) {
  try {
    const username = String(req.body.username || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const account = await findAccount(username);

    if (!account) {
      throw Object.assign(new Error("Invalid username or password."), {
        status: 401,
      });
    }

    if (isLocked(account)) {
      throw Object.assign(
        new Error("Account temporarily locked. Try again later."),
        { status: 423 }
      );
    }

    if (!checkPassword(account, password)) {
      await recordFailedAttempt(username);

      throw Object.assign(new Error("Invalid username or password."), {
        status: 401,
      });
    }

    await resetFailedAttempts(username);

    res.json({
      ok: true,
      user: publicAccount(account),
    });
  } catch (error) {
    next(error);
  }
}
