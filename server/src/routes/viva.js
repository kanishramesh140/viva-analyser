import { Router } from "express";
import crypto from "node:crypto";
import { PRESET_SUBJECTS } from "../services/questionBank.js";
import { nextTier, checkAnswerLocal, pickLocalQuestion } from "../services/vivaLogic.js";
import { generateFirstQuestion, evaluateAnswer } from "../services/aiEngine.js";
import { saveTranscript } from "../services/storage.js";
import { isFacultyForSubject, getSubjectAssoc } from "../services/subjects.js";
import { findAccount } from "../services/accounts.js";
import { QUESTIONS_PER_VIVA, MAX_HINTS_PER_QUESTION } from "../config.js";

const router = Router();

// In-memory session store. Sessions are short-lived (one viva sitting) and
// never written to disk — only the finished transcript is persisted, and
// only into the responsible faculty member's own folder, keyed by their
// authenticated username.
const sessions = new Map();

function minPlausibleSeconds(answerText) {
  return Math.min(answerText.trim().length * 0.05, 6);
}

router.post("/start", async (req, res, next) => {
  try {
    const { subject, facultyUsername, name, studentId } = req.body || {};
    if (!subject || !facultyUsername || !name || !studentId) {
      return res.status(400).json({ error: "subject, facultyUsername, name, and studentId are required." });
    }

    // The faculty member must be a real account that has actually opted
    // into this exact subject — a student cannot redirect a submission to
    // an arbitrary or invented name.
    const teaches = await isFacultyForSubject(subject, facultyUsername);
    if (!teaches) {
      return res.status(403).json({ error: "That faculty member doesn't teach this subject." });
    }
    const facultyAccount = await findAccount(facultyUsername);
    if (!facultyAccount) {
      return res.status(404).json({ error: "Faculty account not found." });
    }

    const preset = PRESET_SUBJECTS[subject];
    // Topic and reference notes come ONLY from what the faculty member
    // saved when they opted into this subject — never from the student's
    // request. This is what stops a student from feeding fabricated
    // "reference notes" to the question generator to make it easy.
    const assoc = preset ? null : await getSubjectAssoc(subject);
    const topic = assoc ? assoc.topic : "";
    const notes = assoc ? assoc.notes : "";

    const sessionId = crypto.randomUUID();
    const base = {
      sessionId,
      subject,
      topic,
      notes,
      facultyUsername: facultyAccount.username,
      facultyName: facultyAccount.name,
      name,
      studentId,
      domainLabel: preset ? preset.domainLabel : null,
      tier: "moderate",
      askedIds: [],
      transcript: [],
      hintsUsed: [],
      attempts: [],
      startedAt: Date.now(),
    };

    if (preset) {
      const q = pickLocalQuestion(preset.bank, "moderate", []);
      base.current = q;
      sessions.set(sessionId, base);
      return res.json({ sessionId, question: q.q, tier: "moderate", domainLabel: preset.domainLabel });
    }

    const r = await generateFirstQuestion(subject, topic, notes);
    base.tier = r.tier || "moderate";
    base.current = { q: r.question, id: "ai-0" };
    sessions.set(sessionId, base);
    res.json({ sessionId, question: r.question, tier: base.tier, domainLabel: null });
  } catch (err) {
    next(err);
  }
});

router.post("/answer", async (req, res, next) => {
  try {
    const { sessionId, answer } = req.body || {};
    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found or already finished." });
    if (!answer || !String(answer).trim()) {
      return res.status(400).json({ error: "Type an answer before submitting." });
    }

    const elapsedSec = Math.round((Date.now() - session.startedAt) / 1000);
    if (answer.trim().length > 25 && elapsedSec < minPlausibleSeconds(answer)) {
      return res.status(400).json({
        error: "That was typed unusually fast for its length — please answer in your own time.",
      });
    }

    const preset = PRESET_SUBJECTS[session.subject];
    const attemptNumber = session.attempts.length + 1;

    const finishEntry = (correct) => {
      session.transcript.push({
        question: session.current.q,
        tier: session.tier,
        hintsUsed: session.hintsUsed,
        attempts: [...session.attempts, answer.trim()],
        correct,
        timeTakenSec: elapsedSec,
      });
      session.hintsUsed = [];
      session.attempts = [];
    };

    const respondFinishedOrNext = (nt, nextQ, wasCorrect) => {
      if (session.transcript.length >= QUESTIONS_PER_VIVA || !nextQ) {
        const transcript = session.transcript;
        sessions.delete(sessionId);
        return res.json({ finished: true, transcript });
      }
      session.tier = nt;
      session.current = nextQ;
      session.startedAt = Date.now();
      return res.json({ finished: false, correct: wasCorrect, question: nextQ.q, tier: nt, hint: null });
    };

    if (preset) {
      const correct = checkAnswerLocal(answer, session.current.kw);
      if (correct) {
        finishEntry(true);
        session.askedIds.push(session.current.id);
        const nt = nextTier(session.tier, true);
        const next = pickLocalQuestion(preset.bank, nt, session.askedIds);
        return respondFinishedOrNext(nt, next, true);
      }
      if (session.hintsUsed.length < Math.min(MAX_HINTS_PER_QUESTION, session.current.hints.length)) {
        session.attempts.push(answer.trim());
        const hint = session.current.hints[session.hintsUsed.length];
        session.hintsUsed.push(hint);
        session.startedAt = Date.now();
        return res.json({ finished: false, correct: false, hint, question: session.current.q, tier: session.tier });
      }
      finishEntry(false);
      session.askedIds.push(session.current.id);
      const nt = nextTier(session.tier, false);
      const next = pickLocalQuestion(preset.bank, nt, session.askedIds);
      return respondFinishedOrNext(nt, next, false);
    }

    // AI-driven (custom subject) path
    const r = await evaluateAnswer(session.subject, session.topic, session.notes, {
      question: session.current.q,
      tier: session.tier,
      hintsUsed: session.hintsUsed,
      attemptNumber,
      answer: answer.trim(),
    });

    if (r.correct) {
      finishEntry(true);
      const nextQ = r.next_question ? { q: r.next_question, id: `ai-${session.transcript.length}` } : null;
      return respondFinishedOrNext(r.next_tier || session.tier, nextQ, true);
    }
    if (r.hint) {
      session.attempts.push(answer.trim());
      session.hintsUsed.push(r.hint);
      session.startedAt = Date.now();
      return res.json({ finished: false, correct: false, hint: r.hint, question: session.current.q, tier: session.tier });
    }
    finishEntry(false);
    const nextQ = r.next_question ? { q: r.next_question, id: `ai-${session.transcript.length}` } : null;
    return respondFinishedOrNext(r.next_tier || session.tier, nextQ, false);
  } catch (err) {
    next(err);
  }
});

router.post("/finish", async (req, res, next) => {
  try {
    const { sessionId, warningCount = 0 } = req.body || {};
    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found (it may already be finished)." });

    const record = {
      name: session.name,
      studentId: session.studentId,
      subject: session.subject,
      topic: session.topic,
      domainLabel: session.domainLabel,
      facultyName: session.facultyName,
      transcript: session.transcript,
      warningCount,
      submittedAt: new Date().toISOString(),
    };
    // The folder this writes into is keyed by facultyUsername, which was
    // resolved server-side from an authenticated account lookup back in
    // /start — the student's request never names a folder directly.
    const filename = await saveTranscript(session.facultyUsername, record);
    sessions.delete(sessionId);
    res.json({ ok: true, filename });
  } catch (err) {
    next(err);
  }
});

router.get("/health", (req, res) => res.json({ ok: true, activeSessions: sessions.size }));

export default router;