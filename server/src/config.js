export const PORT = Number(process.env.PORT) || 4000;
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://10.199.8.218:5173";
export const AI_MODE = process.env.AI_MODE || "fallback"; // auto | ollama | fallback
export const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:1b";
export const QUESTIONS_PER_VIVA = 5;
export const MAX_HINTS_PER_QUESTION = 2;
