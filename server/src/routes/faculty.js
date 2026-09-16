import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { listStudents, readStudentRecord } from "../services/storage.js";
import { listAllSubjectEntries, addFacultyToSubject, removeFacultyFromSubject } from "../services/subjects.js";
import { PRESET_SUBJECTS } from "../services/questionBank.js";

const router = Router();

// Every route below requires a valid session, and every one of them reads
// req.faculty.username set by requireAuth — never a value from the URL or
// body. There is deliberately no "GET /api/faculty/:name" anywhere in this
// app: a faculty member can only ever read their own folder.
router.use(requireAuth);

router.get("/me", (req, res) => {
  res.json(req.faculty);
});

router.get("/me/subjects", async (req, res, next) => {
  try {
    const all = await listAllSubjectEntries();
    const mine = Object.entries(all)
      .filter(([, entry]) => entry.faculty.includes(req.faculty.username))
      .map(([subject, entry]) => ({
        subject,
        topic: entry.topic,
        preset: !!PRESET_SUBJECTS[subject],
        domainLabel: PRESET_SUBJECTS[subject]?.domainLabel || null,
      }));
    res.json({ subjects: mine });
  } catch (err) {
    next(err);
  }
});

// Subjects this faculty member could opt into next: every preset, plus
// every custom subject any other faculty member has already created,
// minus ones they already teach.
router.get("/me/available-subjects", async (req, res, next) => {
  try {
    const all = await listAllSubjectEntries();
    const names = new Set([...Object.keys(PRESET_SUBJECTS), ...Object.keys(all)]);
    const available = [];
    for (const subject of names) {
      const entry = all[subject];
      if (entry && entry.faculty.includes(req.faculty.username)) continue;
      available.push({
        subject,
        topic: entry ? entry.topic : "",
        preset: !!PRESET_SUBJECTS[subject],
        domainLabel: PRESET_SUBJECTS[subject]?.domainLabel || null,
      });
    }
    res.json({ subjects: available });
  } catch (err) {
    next(err);
  }
});

router.post("/me/subjects", async (req, res, next) => {
  try {
    const { subject, topic, notes } = req.body || {};
    if (!subject || !String(subject).trim()) {
      return res.status(400).json({ error: "Subject name is required." });
    }
    const entry = await addFacultyToSubject({ subject: subject.trim(), topic, notes, username: req.faculty.username });
    res.status(201).json({ subject: subject.trim(), ...entry });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

router.delete("/me/subjects/:subject", async (req, res, next) => {
  try {
    await removeFacultyFromSubject(req.params.subject, req.faculty.username);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get("/me/students", async (req, res, next) => {
  try {
    const records = await listStudents(req.faculty.username);
    const summaries = records.map((r) => ({
      filename: r.filename,
      name: r.name,
      studentId: r.studentId,
      subject: r.subject,
      submittedAt: r.submittedAt,
      warningCount: r.warningCount || 0,
      correctCount: (r.transcript || []).filter((t) => t.correct).length,
      totalCount: (r.transcript || []).length,
    }));
    res.json({ students: summaries });
  } catch (err) {
    next(err);
  }
});

router.get("/me/students/:filename", async (req, res, next) => {
  try {
    const record = await readStudentRecord(req.faculty.username, req.params.filename);
    res.json({ record });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

export default router;