import express from "express";

import {
  requireFacultyAuth,
} from "../middleware/requireAuth.js";

import {
  listStudentsForFaculty,
  findStudentById,
  assignSubjectToStudent,
} from "../services/studentAccounts.js";

import {
  listStudents,
  readStudentRecord,
} from "../services/storage.js";

import {
  listAllSubjectEntries,
  isFacultyForSubject,
  addFacultyToSubject,
} from "../services/subjects.js";

const router =
  express.Router();

router.use(
  requireFacultyAuth
);

// Faculty dashboard
router.get(
  "/dashboard",
  async (req, res, next) => {
    try {
      const username =
        req.auth.username;

      const [
        allSubjects,
        students,
        records,
      ] = await Promise.all([
        listAllSubjectEntries(),
        listStudentsForFaculty(
          username
        ),
        listStudents(username),
      ]);

      const ownedSubjects =
        Object.entries(
          allSubjects
        )
          .filter(
            ([, value]) =>
              value.faculty?.includes(
                username
              )
          )
          .map(
            ([name, value]) => ({
              name,
              ...value,
            })
          );

      res.json({
        ok: true,
        faculty: {
          username,
        },
        subjects:
          ownedSubjects,
        students,
        records,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Students belonging to this faculty
router.get(
  "/students",
  async (req, res, next) => {
    try {
      const students =
        await listStudentsForFaculty(
          req.auth.username
        );

      res.json({
        ok: true,
        students,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Assign a subject to a student
router.post(
  "/students/:studentId/subjects",
  async (req, res, next) => {
    try {
      const subject =
        String(
          req.body.subject || ""
        ).trim();

      if (!subject) {
        throw Object.assign(
          new Error(
            "Subject is required."
          ),
          { status: 400 }
        );
      }

      const owns =
        await isFacultyForSubject(
          subject,
          req.auth.username
        );

      if (!owns) {
        throw Object.assign(
          new Error(
            "You must be assigned to this subject before assigning it to a student."
          ),
          { status: 403 }
        );
      }

      const student =
        await assignSubjectToStudent(
          req.params.studentId,
          subject,
          req.auth.username
        );

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
            student.subjects,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Student progress for faculty
router.get(
  "/students/:studentId/progress",
  async (req, res, next) => {
    try {
      const student =
        await findStudentById(
          req.params.studentId
        );

      if (!student) {
        throw Object.assign(
          new Error(
            "Student not found."
          ),
          { status: 404 }
        );
      }

      if (
        student.facultyUsername !==
        req.auth.username
      ) {
        throw Object.assign(
          new Error(
            "Student does not belong to this faculty account."
          ),
          { status: 403 }
        );
      }

      res.json({
        ok: true,
        studentId:
          student.studentId,
        progress:
          student.progress || {},
      });
    } catch (error) {
      next(error);
    }
  }
);

// Faculty transcript list
router.get(
  "/records",
  async (req, res, next) => {
    try {
      const records =
        await listStudents(
          req.auth.username
        );

      res.json({
        ok: true,
        records,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Individual transcript
router.get(
  "/records/:filename",
  async (req, res, next) => {
    try {
      const record =
        await readStudentRecord(
          req.auth.username,
          req.params.filename
        );

      res.json({
        ok: true,
        record,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
