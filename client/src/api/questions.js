import { apiRequest } from "./client.js";

export function listQuestions(subject) {
  return apiRequest(`/subjects/${encodeURIComponent(subject)}/questions`);
}

export function createQuestion(subject, payload) {
  return apiRequest(`/subjects/${encodeURIComponent(subject)}/questions`, {
    method: "POST",
    body: payload,
  });
}

export function deleteQuestion(subject, questionId) {
  return apiRequest(
    `/subjects/${encodeURIComponent(subject)}/questions/${encodeURIComponent(questionId)}`,
    {
      method: "DELETE",
    }
  );
}
