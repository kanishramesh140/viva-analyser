export const TIER_ORDER = ["easy", "moderate", "tough", "complex"];

export function nextTier(tier, correct) {
  const i = TIER_ORDER.indexOf(tier);
  if (correct) return TIER_ORDER[Math.min(i + 1, TIER_ORDER.length - 1)];
  return TIER_ORDER[Math.max(i - 1, 0)];
}

// Simple, fully-offline keyword-overlap check used for preset subjects.
export function checkAnswerLocal(text, kw) {
  const t = String(text).toLowerCase();
  let hits = 0;
  kw.forEach((k) => {
    if (t.includes(String(k).toLowerCase())) hits += 1;
  });
  return hits >= Math.min(2, kw.length);
}

export function pickLocalQuestion(bank, tier, askedIds) {
  const pool = bank[tier].filter((q) => !askedIds.includes(q.id));
  if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
  for (const t of TIER_ORDER) {
    const p = bank[t].filter((q) => !askedIds.includes(q.id));
    if (p.length) return p[Math.floor(Math.random() * p.length)];
  }
  return null;
}