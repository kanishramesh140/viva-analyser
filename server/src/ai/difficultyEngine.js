export const DIFFICULTY_ORDER = [
  "easy",
  "moderate",
  "tough",
  "complex",
];

export function normalizeTier(tier) {
  return DIFFICULTY_ORDER.includes(tier) ? tier : "easy";
}

export function nextTier(tier, outcome) {
  const current = normalizeTier(tier);
  const index = DIFFICULTY_ORDER.indexOf(current);

  if (outcome === "correct") {
    return DIFFICULTY_ORDER[Math.min(index + 1, DIFFICULTY_ORDER.length - 1)];
  }

  if (outcome === "incorrect") {
    return DIFFICULTY_ORDER[Math.max(index - 1, 0)];
  }

  return current;
}

export function chooseAdaptiveTier({
  currentTier = "easy",
  correct,
  attempts = 1,
  hintsUsed = 0,
}) {
  let tier = normalizeTier(currentTier);

  if (correct && hintsUsed === 0 && attempts === 1) {
    tier = nextTier(tier, "correct");
  } else if (!correct && attempts >= 3) {
    tier = nextTier(tier, "incorrect");
  }

  return tier;
}
