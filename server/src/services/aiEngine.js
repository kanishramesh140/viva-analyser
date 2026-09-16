import { AI_MODE, OLLAMA_HOST, OLLAMA_MODEL } from "../config.js";

const SYSTEM_PROMPT = (subject, topic) =>
  `You are the question engine for a local, offline viva-exam app, examining a student on "${subject}"${
    topic ? `, focused on "${topic}"` : ""
  }. Only ever output a single raw JSON object as your entire reply — no markdown, no code fences, no commentary before or after. Keep questions under 35 words and self-contained. Never reveal a correct answer inside a hint — a hint must nudge the student toward the missing idea indirectly, never state it.`;

let ollamaAvailableCache = null;
let ollamaAvailableCheckedAt = 0;

async function isOllamaAvailable() {
  if (AI_MODE === "fallback") return false;
  const now = Date.now();
  if (ollamaAvailableCache !== null && now - ollamaAvailableCheckedAt < 15000) {
    return ollamaAvailableCache;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);
    ollamaAvailableCache = res.ok;
  } catch {
    ollamaAvailableCache = false;
  }
  ollamaAvailableCheckedAt = now;
  if (AI_MODE === "ollama" && !ollamaAvailableCache) {
    throw new Error("AI_MODE is set to 'ollama' but no local Ollama server was reachable.");
  }
  return ollamaAvailableCache;
}

async function ollamaJSON(system, prompt) {
  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      system,
      prompt,
      stream: false,
      format: "json",
    }),
  });
  if (!res.ok) throw new Error(`Ollama request failed with status ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.response);
}

// --- Offline fallback: no external dependency, works with zero network. ---
// It cannot reason about arbitrary subjects the way a real model can, so it
// leans heavily on whatever topic/notes the faculty member supplied.

function firstSentences(notes, count) {
  if (!notes) return [];
  return notes
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, count);
}

function fallbackFirstQuestion(subject, topic, notes) {
  const focus = topic || subject;
  const sentences = firstSentences(notes, 1);
  const question = sentences.length
    ? `In your own words, explain this idea from ${focus}: "${sentences[0]}"`
    : `Explain the core idea behind ${focus}, and why it matters within ${subject}.`;
  return { question, tier: "moderate" };
}

function fallbackEvaluate(subject, topic, notes, state) {
  const focus = topic || subject;
  const bagOfWords = `${notes || ""} ${topic || ""} ${subject}`
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 4);
  const uniqueWords = Array.from(new Set(bagOfWords)).slice(0, 12);
  const answerLower = String(state.answer).toLowerCase();
  const hits = uniqueWords.filter((w) => answerLower.includes(w)).length;
  const correct = state.answer.trim().split(/\s+/).length >= 8 && hits >= 1;

  if (correct) {
    const nextTierName = state.tier === "complex" ? "complex" : nextTierLocal(state.tier, true);
    return {
      correct: true,
      hint: null,
      next_question: `Building on that, go one level deeper into ${focus}: what is a case where the idea you just described could fail or need adjustment?`,
      next_tier: nextTierName,
    };
  }
  if (state.attemptNumber < 3) {
    return {
      correct: false,
      hint: `Focus on the key terms tied to ${focus} — which specific concept from that topic does your answer still need to name?`,
      next_question: null,
      next_tier: null,
    };
  }
  const nextTierName = state.tier === "easy" ? "easy" : nextTierLocal(state.tier, false);
  return {
    correct: false,
    hint: null,
    next_question: `Let's revisit the basics of ${focus}: what is the single most important term or definition someone must know first?`,
    next_tier: nextTierName,
  };
}

function nextTierLocal(tier, correct) {
  const order = ["easy", "moderate", "tough", "complex"];
  const i = order.indexOf(tier);
  if (correct) return order[Math.min(i + 1, order.length - 1)];
  return order[Math.max(i - 1, 0)];
}

// --- Public API ---

export async function generateFirstQuestion(subject, topic, notes) {
  const useOllama = await isOllamaAvailable();
  if (useOllama) {
    const prompt = `Generate the opening viva question.\nSubject: ${subject}\nTopic focus: ${
      topic || "general syllabus"
    }\n${notes ? "Ground questions in this reference material where relevant:\n" + notes : ""}\nRespond with only: {"question": "...", "tier": "moderate"}`;
    return ollamaJSON(SYSTEM_PROMPT(subject, topic), prompt);
  }
  return fallbackFirstQuestion(subject, topic, notes);
}

export async function evaluateAnswer(subject, topic, notes, state) {
  const useOllama = await isOllamaAvailable();
  if (useOllama) {
    const prompt = `Subject: ${subject}\nTopic focus: ${topic || "general syllabus"}\n${
      notes ? "Reference material:\n" + notes : ""
    }\nCurrent question (tier ${state.tier}): "${state.question}"\nHints already given this question: ${JSON.stringify(
      state.hintsUsed
    )}\nThis is answer attempt ${state.attemptNumber} for this question.\nStudent's answer: "${state.answer}"\n\nJudge whether this answer shows correct understanding for this question and tier. Respond with only one JSON object:\n- If correct: {"correct": true, "hint": null, "next_question": "<a new question, one tier harder than ${
      state.tier
    }, or same tier if already complex>", "next_tier": "<easy|moderate|tough|complex>"}\n- If incorrect and attempt number is 1 or 2: {"correct": false, "hint": "<a short indirect guiding hint, never the answer itself>", "next_question": null, "next_tier": null}\n- If incorrect and attempt number is 3: {"correct": false, "hint": null, "next_question": "<a new question, one tier easier than ${
      state.tier
    }, or same tier if already easy>", "next_tier": "<easy|moderate|tough|complex>"}`;
    return ollamaJSON(SYSTEM_PROMPT(subject, topic), prompt);
  }
  return fallbackEvaluate(subject, topic, notes, state);
}

export async function aiStatus() {
  const useOllama = await isOllamaAvailable();
  return { mode: useOllama ? "ollama" : "fallback", model: useOllama ? OLLAMA_MODEL : null };
}