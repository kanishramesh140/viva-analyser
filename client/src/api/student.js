import { apiRequest } from "./client.js";

export function getStudentDashboard() {
  return apiRequest("/student/dashboard");
}

export function getStudentSubjects() {
  return apiRequest("/student/subjects");
}

export function getStudentProgress() {
  return apiRequest("/student/progress");
}
