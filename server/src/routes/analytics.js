import express from "express";

import {
  requireAuth,
} from "../middleware/requireAuth.js";

import {
  findStudentAccount,
} from "../services/studentAccounts.js";

import {
  listStudentsForFaculty,
} from "../services/studentAccounts.js";

import {
  listStudents,
} from "../services/storage.js";

const router =
  express.Router();

router.get(
  "/student",
  requireAuth("student"),
  async (req, res, next) => {
    try {
      const student =
        await findStudentAccount(
          req.auth.username
        );

      const progress =
        student?.progress ||
        {};

      const subjectCount =
        student?.subjects?.length ||
        0;

      const totalAttempts =
        Object.values(progress)
          .reduce(
            (sum, item) =>
              sum +
              Number(
                item.attempts || 0
              ),
            0
          );

      const totalCorrect =
        Object.values(progress)
          .reduce(
            (sum, item) =>
              sum +
              Number(
                item.correct || 0
              ),
            0
          );

      res.json({
        ok: true,
        analytics: {
          subjectCount,
          totalAttempts,
          totalCorrect,
          progress,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/faculty",
  requireAuth("faculty"),
  async (req, res, next) => {
    try {
      const students =
        await listStudentsForFaculty(
          req.auth.username
        );

      const records =
        await listStudents(
          req.auth.username
        );

      res.json({
        ok: true,
        analytics: {
          students:
            students.length,

          completedVivas:
            records.length,

          records,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
