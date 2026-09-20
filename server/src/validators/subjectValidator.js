export function validateSubjectName(subject) {
  const value = String(subject || "").trim();

  if (!value || value.length > 150) {
    throw Object.assign(new Error("Subject name is required and must be under 150 characters."), {
      status: 400,
    });
  }

  return value;
}

export function validateSubjectPayload(body = {}) {
  return {
    subject: validateSubjectName(body.subject),
    topic: String(body.topic || "").trim().slice(0, 300),
    notes: String(body.notes || "").trim().slice(0, 50000),
  };
}
