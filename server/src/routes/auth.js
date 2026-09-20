import express from "express";

import {
  createAccount,
  findAccount,
  checkPassword,
  isLocked,
  recordFailedAttempt,
  resetFailedAttempts,
  publicAccount,
  resetPasswordWithRecovery,
  generateRecoveryCodeForFaculty,
} from "../services/accounts.js";

import {
  createStudentAccount,
  findStudentAccount,
  checkStudentPassword,
  isStudentLocked,
  recordStudentFailedAttempt,
  resetStudentFailedAttempts,
  publicStudentAccount,
  resetStudentPasswordWithRecovery,
  generateRecoveryCodeForStudent,
} from "../services/studentAccounts.js";

import {
  createSession,
  destroySession,
} from "../services/sessions.js";

import {
  requireAuth,
} from "../middleware/requireAuth.js";

const router =
  express.Router();

const COOKIE_NAME =
  "viva_session";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure:
      process.env.NODE_ENV ===
      "production",
    maxAge:
      12 * 60 * 60 * 1000,
    path: "/",
  };
}

function setSession(
  res,
  username,
  role,
  userId
) {
  const sessionId =
    createSession(
      username,
      role,
      userId
    );

  res.cookie(
    COOKIE_NAME,
    sessionId,
    cookieOptions()
  );

  return sessionId;
}

function normalizeRole(role) {
  const value =
    String(role || "")
      .trim()
      .toLowerCase();

  if (
    !["faculty", "student"]
      .includes(value)
  ) {
    throw Object.assign(
      new Error(
        "Role must be faculty or student."
      ),
      { status: 400 }
    );
  }

  return value;
}

// -------------------------
// FACULTY REGISTER
// -------------------------

router.post(
  "/faculty/register",
  async (req, res, next) => {
    try {
      const account =
        await createAccount({
          username:
            req.body.username,
          name:
            req.body.name,
          password:
            req.body.password,
        });

      res.status(201).json({
        ok: true,
        user:
          publicAccount(
            account
          ),
        recoveryCode:
          account.recoveryCode,
        message:
          "Faculty account created. Save the recovery code securely.",
      });
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------
// STUDENT REGISTER
// -------------------------

router.post(
  "/student/register",
  async (req, res, next) => {
    try {
      const result =
        await createStudentAccount({
          studentId:
            req.body.studentId ||
            req.body.username,
          username:
            req.body.username,
          name:
            req.body.name,
          password:
            req.body.password,
        });

      res.status(201).json({
        ok: true,
        user:
          publicStudentAccount(
            result.account
          ),
        recoveryCode:
          result.recoveryCode,
        message:
          "Student account created. Save the recovery code securely.",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Compatibility endpoint.
router.post(
  "/register",
  async (req, res, next) => {
    try {
      const role =
        normalizeRole(
          req.body.role
        );

      if (role === "faculty") {
        const account =
          await createAccount({
            username:
              req.body.username,
            name:
              req.body.name,
            password:
              req.body.password,
          });

        return res
          .status(201)
          .json({
            ok: true,
            user:
              publicAccount(
                account
              ),
            recoveryCode:
              account.recoveryCode,
          });
      }

      const result =
        await createStudentAccount({
          studentId:
            req.body.studentId ||
            req.body.username,
          username:
            req.body.username,
          name:
            req.body.name,
          password:
            req.body.password,
        });

      return res
        .status(201)
        .json({
          ok: true,
          user:
            publicStudentAccount(
              result.account
            ),
          recoveryCode:
            result.recoveryCode,
        });
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------
// FACULTY LOGIN
// -------------------------

router.post(
  "/faculty/login",
  async (req, res, next) => {
    try {
      const username =
        String(
          req.body.username || ""
        )
          .trim()
          .toLowerCase();

      const password =
        String(
          req.body.password || ""
        );

      const account =
        await findAccount(
          username
        );

      if (!account) {
        throw Object.assign(
          new Error(
            "Invalid username or password."
          ),
          { status: 401 }
        );
      }

      if (isLocked(account)) {
        throw Object.assign(
          new Error(
            "Account temporarily locked. Try again later."
          ),
          { status: 423 }
        );
      }

      if (
        !checkPassword(
          account,
          password
        )
      ) {
        await recordFailedAttempt(
          username
        );

        throw Object.assign(
          new Error(
            "Invalid username or password."
          ),
          { status: 401 }
        );
      }

      await resetFailedAttempts(
        username
      );

      setSession(
        res,
        account.username,
        "faculty",
        account.username
      );

      res.json({
        ok: true,
        user:
          publicAccount(
            account
          ),
      });
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------
// STUDENT LOGIN
// -------------------------

router.post(
  "/student/login",
  async (req, res, next) => {
    try {
      const username =
        String(
          req.body.username || ""
        )
          .trim()
          .toLowerCase();

      const password =
        String(
          req.body.password || ""
        );

      const account =
        await findStudentAccount(
          username
        );

      if (!account) {
        throw Object.assign(
          new Error(
            "Invalid username or password."
          ),
          { status: 401 }
        );
      }

      if (
        isStudentLocked(
          account
        )
      ) {
        throw Object.assign(
          new Error(
            "Account temporarily locked. Try again later."
          ),
          { status: 423 }
        );
      }

      if (
        !checkStudentPassword(
          account,
          password
        )
      ) {
        await recordStudentFailedAttempt(
          username
        );

        throw Object.assign(
          new Error(
            "Invalid username or password."
          ),
          { status: 401 }
        );
      }

      await resetStudentFailedAttempts(
        username
      );

      setSession(
        res,
        account.username,
        "student",
        account.studentId
      );

      res.json({
        ok: true,
        user:
          publicStudentAccount(
            account
          ),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Compatibility login endpoint.
router.post(
  "/login",
  async (req, res, next) => {
    try {
      const role =
        normalizeRole(
          req.body.role ||
          "faculty"
        );

      const username =
        String(
          req.body.username || ""
        )
          .trim()
          .toLowerCase();

      const password =
        String(
          req.body.password || ""
        );

      if (role === "faculty") {
        const account =
          await findAccount(
            username
          );

        if (
          !account ||
          isLocked(account) ||
          !checkPassword(
            account,
            password
          )
        ) {
          if (account) {
            await recordFailedAttempt(
              username
            );
          }

          throw Object.assign(
            new Error(
              "Invalid username or password."
            ),
            { status: 401 }
          );
        }

        await resetFailedAttempts(
          username
        );

        setSession(
          res,
          account.username,
          "faculty",
          account.username
        );

        return res.json({
          ok: true,
          user:
            publicAccount(
              account
            ),
        });
      }

      const student =
        await findStudentAccount(
          username
        );

      if (
        !student ||
        isStudentLocked(student) ||
        !checkStudentPassword(
          student,
          password
        )
      ) {
        if (student) {
          await recordStudentFailedAttempt(
            username
          );
        }

        throw Object.assign(
          new Error(
            "Invalid username or password."
          ),
          { status: 401 }
        );
      }

      await resetStudentFailedAttempts(
        username
      );

      setSession(
        res,
        student.username,
        "student",
        student.studentId
      );

      return res.json({
        ok: true,
        user:
          publicStudentAccount(
            student
          ),
      });
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------
// FORGOT PASSWORD
// -------------------------

router.post(
  "/forgot-password",
  async (req, res, next) => {
    try {
      const role =
        normalizeRole(
          req.body.role
        );

      const username =
        String(
          req.body.username || ""
        )
          .trim()
          .toLowerCase();

      const recoveryCode =
        String(
          req.body.recoveryCode ||
          ""
        );

      const newPassword =
        String(
          req.body.newPassword ||
          ""
        );

      if (
        role === "faculty"
      ) {
        await resetPasswordWithRecovery(
          username,
          recoveryCode,
          newPassword
        );
      } else {
        await resetStudentPasswordWithRecovery(
          username,
          recoveryCode,
          newPassword
        );
      }

      res.json({
        ok: true,
        message:
          "Password reset successfully. You can now log in with the new password.",
      });
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------
// ME
// -------------------------

router.get(
  "/me",
  requireAuth(),
  async (req, res, next) => {
    try {
      if (
        req.auth.role === "faculty"
      ) {
        const account =
          await findAccount(
            req.auth.username
          );

        if (!account) {
          throw Object.assign(
            new Error(
              "Account not found."
            ),
            { status: 401 }
          );
        }

        return res.json({
          ok: true,
          user:
            publicAccount(
              account
            ),
        });
      }

      const account =
        await findStudentAccount(
          req.auth.username
        );

      if (!account) {
        throw Object.assign(
          new Error(
            "Account not found."
          ),
          { status: 401 }
        );
      }

      return res.json({
        ok: true,
        user:
          publicStudentAccount(
            account
          ),
      });
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------
// LOGOUT
// -------------------------

router.post(
  "/logout",
  requireAuth(),
  async (req, res, next) => {
    try {
      destroySession(
        req.sessionId
      );

      res.clearCookie(
        COOKIE_NAME,
        {
          httpOnly: true,
          sameSite: "lax",
          secure:
            process.env.NODE_ENV ===
            "production",
          path: "/",
        }
      );

      res.json({
        ok: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------
// REGENERATE RECOVERY CODE
// Requires current password.
// -------------------------

router.post(
  "/generate-recovery-code",
  requireAuth(),
  async (req, res, next) => {
    try {
      const currentPassword =
        String(
          req.body.currentPassword ||
          ""
        );

      if (
        currentPassword.length < 8
      ) {
        throw Object.assign(
          new Error(
            "Current password is required."
          ),
          { status: 400 }
        );
      }

      let recoveryCode;

      if (
        req.auth.role ===
        "faculty"
      ) {
        const account =
          await findAccount(
            req.auth.username
          );

        if (
          !account ||
          !checkPassword(
            account,
            currentPassword
          )
        ) {
          throw Object.assign(
            new Error(
              "Current password is incorrect."
            ),
            { status: 401 }
          );
        }

        recoveryCode =
          await generateRecoveryCodeForFaculty(
            req.auth.username
          );
      } else {
        const account =
          await findStudentAccount(
            req.auth.username
          );

        if (
          !account ||
          !checkStudentPassword(
            account,
            currentPassword
          )
        ) {
          throw Object.assign(
            new Error(
              "Current password is incorrect."
            ),
            { status: 401 }
          );
        }

        recoveryCode =
          await generateRecoveryCodeForStudent(
            req.auth.username
          );
      }

      res.json({
        ok: true,
        recoveryCode,
        message:
          "New recovery code generated. Save it securely.",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
