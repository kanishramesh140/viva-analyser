import { Router } from "express";
import { PRESET_SUBJECTS } from "../services/questionBank.js";
import { listAllSubjectEntries } from "../services/subjects.js";
import { findAccount, publicAccount } from "../services/accounts.js";

const router = Router();

// Students never create subjects and never see a faculty username directly
// — this returns display names only, and only for subjects that at least
// one real, authenticated faculty account has opted into. A subject with
// zero faculty simply doesn't appear yet.
router.get("/", async (req, res, next) => {
  try {
    const assoc = await listAllSubjectEntries();
    const subjectNames = new Set([...Object.keys(PRESET_SUBJECTS), ...Object.keys(assoc)]);

    const subjects = [];
    for (const subject of subjectNames) {
      const entry = assoc[subject] || { topic: "", faculty: [] };
      if (!entry.faculty.length) continue; // hide until a faculty has opted in

      const facultyAccounts = await Promise.all(entry.faculty.map((u) => findAccount(u)));
      const facultyList = facultyAccounts.filter(Boolean).map(publicAccount);
      if (!facultyList.length) continue;

      subjects.push({
        subject,
        domainLabel: PRESET_SUBJECTS[subject]?.domainLabel || null,
        topic: entry.topic || "",
        preset: !!PRESET_SUBJECTS[subject],
        faculty: facultyList, // [{username, name}]
      });
    }

    res.json({ subjects });
  } catch (err) {
    next(err);
  }
});

export default router;