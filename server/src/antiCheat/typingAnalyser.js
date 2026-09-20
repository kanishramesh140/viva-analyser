export function analyseTyping({
  keypresses = 0,
  backspaces = 0,
  durationMs = 0,
  answerLength = 0,
}) {
  const durationMinutes = durationMs / 60000;

  const wordsEstimated = answerLength > 0
    ? answerLength / 5
    : 0;

  const wordsPerMinute =
    durationMinutes > 0
      ? Number((wordsEstimated / durationMinutes).toFixed(2))
      : 0;

  const backspaceRatio =
    keypresses > 0
      ? Number((backspaces / keypresses).toFixed(3))
      : 0;

  return {
    keypresses,
    backspaces,
    durationMs,
    answerLength,
    wordsPerMinute,
    backspaceRatio,
  };
}
