import { apiRequest } from "./client.js";

export function getStudentAnalytics() {
  return apiRequest("/analytics/student");
}

export function getFacultyAnalytics() {
  return apiRequest("/analytics/faculty");
}

export function getVivaAnalytics(sessionId) {
  return apiRequest(`/analytics/viva/${encodeURIComponent(sessionId)}`);
}
