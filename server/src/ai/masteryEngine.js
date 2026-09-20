const STATES = [
  "NOT_STARTED",
  "LEARNING",
  "DEVELOPING",
  "MASTERED",
];

export function normalizeMastery(state) {
  return STATES.includes(state) ? state : "NOT_STARTED";
}

export function updateMastery(previousState, {
  correct,
  hintsUsed = 0,
  attempts = 1,
}) {
  const current = normalizeMastery(previousState);

  if (!correct) {
    if (current === "MASTERED") return "DEVELOPING";
    if (current === "DEVELOPING") return "LEARNING";
    return current === "NOT_STARTED" ? "LEARNING" : current;
  }

  if (hintsUsed > 0 || attempts > 1) {
    if (current === "NOT_STARTED") return "LEARNING";
    if (current === "LEARNING") return "DEVELOPING";
    return current;
  }

  if (current === "NOT_STARTED") return "LEARNING";
  if (current === "LEARNING") return "DEVELOPING";
  if (current === "DEVELOPING") return "MASTERED";

  return "MASTERED";
}

export function calculateTopicMastery(history = []) {
  if (!history.length) {
    return {
      state: "NOT_STARTED",
      attempts: 0,
      correct: 0,
      hintsUsed: 0,
    };
  }

  const attempts = history.length;
  const correct = history.filter((item) => item.correct).length;
  const hintsUsed = history.reduce(
    (sum, item) => sum + Number(item.hintsUsed || 0),
    0
  );

  let state = "NOT_STARTED";

  for (const item of history) {
    state = updateMastery(state, {
      correct: Boolean(item.correct),
      hintsUsed: Number(item.hintsUsed || 0),
      attempts: Number(item.attempts || 1),
    });
  }

  return {
    state,
    attempts,
    correct,
    hintsUsed,
  };
}
