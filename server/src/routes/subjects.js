import express from "express";

import {
  requireAuth,
  requireFacultyAuth,
} from "../middleware/requireAuth.js";

import {
  listAllSubjectEntries,
  getSubjectAssoc,
  isFacultyForSubject,
  addFacultyToSubject,
  removeFacultyFromSubject,
} from "../services/subjects.js";

import {
  findStudentAccount,
} from "../services/studentAccounts.js";

import {
  listQuestions,
  addQuestion,
  removeQuestion,
} from "../repositories/questionRepository.js";

const router =
  express.Router();

function subjectName(
  req
) {
  return decodeURIComponent(
    req.params.subject || ""
  );
}

// All authenticated users can request subjects,
// but students only receive assigned subjects.
router.get(
  "/",
  requireAuth(),
  async (req, res, next) => {
    try {
      const all =
        await listAllSubjectEntries();

      if (
        req.auth.role ===
        "faculty"
      ) {
        const subjects =
          Object.entries(all)
            .filter(
              ([, item]) =>
                item.faculty?.includes(
                  req.auth.username
                )
            )
            .map(
              ([name, item]) => ({
                name,
                ...item,
              })
            );

        return res.json({
          ok: true,
          subjects,
        });
      }

      const student =
        await findStudentAccount(
          req.auth.username
        );

      const subjects =
        (student?.subjects || [])
          .map(
            (name) => ({
              name,
              ...(all[name] || {
                topic: "",
                notes: "",
                faculty: [],
              }),
            })
          );

      res.json({
        ok: true,
        subjects,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create / join subject for faculty
router.post(
  "/",
  requireFacultyAuth,
  async (req, res, next) => {
    try {
      const subject =
        String(
          req.body.subject || ""
        ).trim();

      if (!subject) {
        throw Object.assign(
          new Error(
            "Subject name is required."
          ),
          { status: 400 }
        );
      }

      const result =
        await addFacultyToSubject({
          subject,
          topic:
            req.body.topic,
          notes:
            req.body.notes,
          username:
            req.auth.username,
        });

      res.status(201).json({
        ok: true,
        subject: {
          name: subject,
          ...result,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get subject
router.get(
  "/:subject",
  requireAuth(),
  async (req, res, next) => {
    try {
      const subject =
        subjectName(req);

      const association =
        await getSubjectAssoc(
          subject
        );

      if (
        req.auth.role ===
        "faculty"
      ) {
        const owns =
          await isFacultyForSubject(
            subject,
            req.auth.username
          );

        if (!owns) {
          throw Object.assign(
            new Error(
              "You do not own this subject."
            ),
            { status: 403 }
          );
        }
      } else {
        const student =
          await findStudentAccount(
            req.auth.username
          );

        if (
          !student?.subjects?.includes(
            subject
          )
        ) {
          throw Object.assign(
            new Error(
              "This subject is not assigned to you."
            ),
            { status: 403 }
          );
        }
      }

      res.json({
        ok: true,
        subject: {
          name: subject,
          ...association,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Questions for an assigned/owned subject
router.get(
  "/:subject/questions",
  requireAuth(),
  async (req, res, next) => {
    try {
      const subject =
        subjectName(req);

      if (
        req.auth.role ===
        "faculty"
      ) {
        const owns =
          await isFacultyForSubject(
            subject,
            req.auth.username
          );

        if (!owns) {
          throw Object.assign(
            new Error(
              "You do not own this subject."
            ),
            { status: 403 }
          );
        }
      } else {
        const student =
          await findStudentAccount(
            req.auth.username
          );

        if (
          !student?.subjects?.includes(
            subject
          )
        ) {
          throw Object.assign(
            new Error(
              "This subject is not assigned to you."
            ),
            { status: 403 }
          );
        }
      }

      const questions =
        await listQuestions(
          subject
        );

      res.json({
        ok: true,
        questions,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Faculty creates a custom question
router.post(
  "/:subject/questions",
  requireFacultyAuth,
  async (req, res, next) => {
    try {
      const subject =
        subjectName(req);

      const owns =
        await isFacultyForSubject(
          subject,
          req.auth.username
        );

      if (!owns) {
        throw Object.assign(
          new Error(
            "You do not own this subject."
          ),
          { status: 403 }
        );
      }

      const question =
        await addQuestion(
          subject,
          req.body
        );

      res.status(201).json({
        ok: true,
        question,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Faculty deletes a custom question
router.delete(
  "/:subject/questions/:questionId",
  requireFacultyAuth,
  async (req, res, next) => {
    try {
      const subject =
        subjectName(req);

      const owns =
        await isFacultyForSubject(
          subject,
          req.auth.username
        );

      if (!owns) {
        throw Object.assign(
          new Error(
            "You do not own this subject."
          ),
          { status: 403 }
        );
      }

      await removeQuestion(
        subject,
        req.params.questionId
      );

      res.json({
        ok: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Faculty removes itself from a subject
router.delete(
  "/:subject",
  requireFacultyAuth,
  async (req, res, next) => {
    try {
      await removeFacultyFromSubject(
        subjectName(req),
        req.auth.username
      );

      res.json({
        ok: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
