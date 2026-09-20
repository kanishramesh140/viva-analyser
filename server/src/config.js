const numberFromEnv = (
  value,
  fallback
) => {
  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
};

export const PORT =
  numberFromEnv(
    process.env.PORT,
    4000
  );

export const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN ||
  "http://localhost:5173";

export const AI_MODE =
  process.env.AI_MODE ||
  "auto";

export const OLLAMA_HOST =
  process.env.OLLAMA_HOST ||
  "http://localhost:11434";

export const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL ||
  "llama3.2:1b";

export const ENVIRONMENT =
  process.env.NODE_ENV ||
  "development";

// Viva settings
export const QUESTIONS_PER_VIVA =
  numberFromEnv(
    process.env.QUESTIONS_PER_VIVA,
    10
  );

export const MAX_HINTS_PER_QUESTION =
  numberFromEnv(
    process.env.MAX_HINTS_PER_QUESTION,
    2
  );