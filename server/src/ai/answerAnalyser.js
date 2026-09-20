function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function analyseAnswer({
  answer,
  expectedKeywords = [],
  minimumWords = 3,
}) {
  const normalizedAnswer = normalizeText(answer);
  const words = normalizedAnswer
    ? normalizedAnswer.split(" ")
    : [];

  const keywords = expectedKeywords
    .map(normalizeText)
    .filter(Boolean);

  const matchedKeywords = keywords.filter((keyword) =>
    normalizedAnswer.includes(keyword)
  );

  const missingKeywords = keywords.filter(
    (keyword) => !normalizedAnswer.includes(keyword)
  );

  const enoughWords = words.length >= minimumWords;

  const coverage =
    keywords.length === 0
      ? enoughWords
        ? 1
        : 0
      : matchedKeywords.length / keywords.length;

  const correct = enoughWords && coverage >= 0.34;

  return {
    correct,
    wordCount: words.length,
    matchedKeywords,
    missingKeywords,
    keywordCoverage: Number(coverage.toFixed(3)),
    signals: {
      empty: words.length === 0,
      veryShort: words.length > 0 && words.length < minimumWords,
    },
  };
}
