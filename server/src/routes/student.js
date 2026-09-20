import express from "express";

import {
  requireStudentAuth,
} from "../middleware/requireAuth.js";

import {
  findStudentAccount,
  getStudentProgress,
} from "../services/studentAccounts.js";

const router =
  express.Router();

router.use(
  requireStudentAuth
);

router.get(
  "/dashboard",
  async (req, res, next) => {
    try {
      const student =
        await findStudentAccount(
          req.auth.username
        );

      if (!student) {
        throw Object.assign(
          new Error(
            "Student account not found."
          ),
          { status: 401 }
        );
      }

      res.json({
        ok: true,

        student: {
          studentId:
            student.studentId,

          username:
            student.username,

          name:
            student.name,

          facultyUsername:
            student.facultyUsername,

          subjects:
            student.subjects || [],
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/subjects",
  async (req, res, next) => {
    try {
      const student =
        await findStudentAccount(
          req.auth.username
        );

      res.json({
        ok: true,
        subjects:
          student?.subjects ||
          [],
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/progress",
  async (req, res, next) => {
    try {
      const progress =
        await getStudentProgress(
          req.auth.username
        );

      res.json({
        ok: true,
        progress,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/profile",
  async (req, res, next) => {
    try {
      const student =
        await findStudentAccount(
          req.auth.username
        );

      if (!student) {
        throw Object.assign(
          new Error(
            "Student account not found."
          ),
          { status: 404 }
        );
      }

      res.json({
        ok: true,

        student: {
          studentId:
            student.studentId,

          username:
            student.username,

          name:
            student.name,

          facultyUsername:
            student.facultyUsername,

          subjects:
            student.subjects ||
            [],
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
