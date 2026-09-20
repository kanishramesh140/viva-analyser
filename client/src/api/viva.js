import { apiRequest } from "./client.js";

export function startViva(payload) {
  return apiRequest("/viva/start", {
    method: "POST",
    body: payload,
  });
}

export function submitAnswer(payload) {
  return apiRequest("/viva/answer", {
    method: "POST",
    body: payload,
  });
}

export function requestHint(payload) {
  return apiRequest("/viva/hint", {
    method: "POST",
    body: payload,
  });
}

export function finishViva(payload) {
  return apiRequest("/viva/finish", {
    method: "POST",
    body: payload,
  });
}

export function getVivaStatus() {
  return apiRequest("/viva/status");
}
