import { createId } from "../utils/ids.js";

const TEMPLATES = {
  easy: [
    "What is the basic purpose of {topic}?",
    "Define {topic} in your own words.",
    "What is the main function of {topic}?",
  ],
  moderate: [
    "How does {topic} work, and why is it important?",
    "Explain the operating principle of {topic}.",
    "What are the important steps involved in {topic}?",
  ],
  tough: [
    "What limitations or failure conditions can occur in {topic}?",
    "Compare two important approaches used in {topic}.",
    "How would you apply {topic} to a practical engineering problem?",
  ],
  complex: [
    "Critically explain the trade-offs involved in designing a system around {topic}.",
    "How would you redesign {topic} for a demanding real-world constraint?",
    "Explain how {topic} interacts with another subsystem and what can go wrong.",
  ],
};

function choose(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function generateLocalQuestion({
  subject,
  topic,
  tier = "easy",
}) {
  const focus = String(topic || subject || "the subject").trim();
  const templates = TEMPLATES[tier] || TEMPLATES.easy;

  return {
    id: createId("generated_question"),
    question: choose(templates).replace("{topic}", focus),
    tier,
    subject,
    topic: topic || null,
    source: "local-template",
  };
}
