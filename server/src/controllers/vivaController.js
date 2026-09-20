import { createPersistentSession, getPersistentSession, updatePersistentSession } from "../repositories/sessionRepository.js";
import { generateQuestion, analyseWithAI } from "../ai/aiEngine.js";
import { chooseAdaptiveTier, nextTier } from "../ai/difficultyEngine.js";
import { updateMastery } from "../ai/masteryEngine.js";
import { validateAnswer, validateStartViva } from "../validators/vivaValidator.js";
import { logEvent } from "../antiCheat/eventLogger.js";

function identityFromRequest(req) {
  return (
    req.auth?.studentId ||
    req.user?.studentId ||
    req.auth?.username ||
    req.user?.username ||
    null
  );
}

export async function start(req, res, next) {
  try {
    const identity = identityFromRequest(req);

    if (!identity) {
      throw Object.assign(new Error("Authentication required."), {
        status: 401,
      });
    }

    const input = validateStartViva(req.body);

    const question = await generateQuestion({
      subject: input.subject,
      topic: input.topic,
      notes: input.notes || "",
      tier: input.tier,
    });

    const session = await createPersistentSession({
      studentId: identity,
      subject: input.subject,
      topic: input.topic,
      mode: input.mode,
      currentTier: question.tier,
      currentQuestion: question,
      questionNumber: 1,
      answers: [],
      mastery: "NOT_STARTED",
      hintsUsed: 0,
      startedAt: new Date().toISOString(),
    });

    await logEvent({
      sessionId: session.id,
      studentId: identity,
      type: "VIVA_STARTED",
      details: {
        subject: input.subject,
        topic: input.topic,
        mode: input.mode,
      },
    });

    res.status(201).json({
      ok: true,
      sessionId: session.id,
      question: question.question,
      tier: question.tier,
      mode: input.mode,
    });
  } catch (error) {
    next(error);
  }
}

export async function answer(req, res, next) {
  try {
    const identity = identityFromRequest(req);

    if (!identity) {
      throw Object.assign(new Error("Authentication required."), {
        status: 401,
      });
    }

    const answerText = validateAnswer(req.body);
    const session = await getPersistentSession(req.body.sessionId);

    if (!session) {
      throw Object.assign(new Error("Viva session not found."), {
        status: 404,
      });
    }

    if (session.studentId !== identity) {
      throw Object.assign(new Error("Session does not belong to this student."), {
        status: 403,
      });
    }

    const attemptNumber =
      (session.answers.filter(
        (item) => item.questionId === session.currentQuestion.id
      ).length || 0) + 1;

    const evaluation = await analyseWithAI({
      subject: session.subject,
      topic: session.topic,
      notes: session.notes || "",
      answer: answerText,
      expectedKeywords: session.currentQuestion.kw || [],
      tier: session.currentTier,
      state: {
        answer: answerText,
        tier: session.currentTier,
        question: session.currentQuestion.question,
        hintsUsed: session.currentQuestion.hintsUsed || [],
        attemptNumber,
      },
    });

    const correct = Boolean(evaluation.correct);

    const nextMastery = updateMastery(session.mastery, {
      correct,
      hintsUsed: session.hintsUsed || 0,
      attempts: attemptNumber,
    });

    const nextTierValue = chooseAdaptiveTier({
      currentTier: session.currentTier,
      correct,
      attempts: attemptNumber,
      hintsUsed: session.hintsUsed || 0,
    });

    const answerRecord = {
      questionId: session.currentQuestion.id,
      question: session.currentQuestion.question,
      answer: answerText,
      correct,
      attempts: attemptNumber,
      hintsUsed: session.hintsUsed || 0,
      tier: session.currentTier,
      submittedAt: new Date().toISOString(),
    };

    const answers = [...session.answers, answerRecord];

    let nextQuestion = null;

    if (evaluation.next_question) {
      nextQuestion = {
        id: `adaptive_${Date.now()}`,
        question: evaluation.next_question,
        tier: evaluation.next_tier || nextTierValue,
        kw: [],
        hintsUsed: [],
        source: "adaptive-ai",
      };
    }

    const updated = await updatePersistentSession(session.id, {
      answers,
      mastery: nextMastery,
      currentTier: nextQuestion?.tier || nextTierValue,
      currentQuestion: nextQuestion || session.currentQuestion,
      hintsUsed: correct ? 0 : session.hintsUsed || 0,
      questionNumber: session.questionNumber + (nextQuestion ? 1 : 0),
    });

    await logEvent({
      sessionId: session.id,
      studentId: identity,
      type: "ANSWER_SUBMITTED",
      details: {
        correct,
        attemptNumber,
        tier: session.currentTier,
      },
    });

    res.json({
      ok: true,
      correct,
      hint: evaluation.hint || null,
      nextQuestion: nextQuestion?.question || null,
      nextTier: nextQuestion?.tier || null,
      mastery: nextMastery,
      session: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function finish(req, res, next) {
  try {
    const identity = identityFromRequest(req);

    if (!identity) {
      throw Object.assign(new Error("Authentication required."), {
        status: 401,
      });
    }

    const session = await getPersistentSession(req.body.sessionId);

    if (!session) {
      throw Object.assign(new Error("Viva session not found."), {
        status: 404,
      });
    }

    if (session.studentId !== identity) {
      throw Object.assign(new Error("Session does not belong to this student."), {
        status: 403,
      });
    }

    const updated = await updatePersistentSession(session.id, {
      status: "finished",
      finishedAt: new Date().toISOString(),
    });

    await logEvent({
      sessionId: session.id,
      studentId: identity,
      type: "VIVA_FINISHED",
    });

    res.json({
      ok: true,
      session: updated,
    });
  } catch (error) {
    next(error);
  }
}
