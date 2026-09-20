import { apiRequest } from "./client.js";

export function loginFaculty(payload) {
  return apiRequest("/auth/faculty/login", {
    method: "POST",
    body: payload,
  });
}

export function loginStudent(payload) {
  return apiRequest("/auth/student/login", {
    method: "POST",
    body: payload,
  });
}

export function login(role, payload) {
  return role === "student"
    ? loginStudent(payload)
    : loginFaculty(payload);
}

export function registerFaculty(payload) {
  return apiRequest("/auth/faculty/register", {
    method: "POST",
    body: payload,
  });
}

export function registerStudent(payload) {
  return apiRequest("/auth/student/register", {
    method: "POST",
    body: payload,
  });
}

export function register(role, payload) {
  return role === "student"
    ? registerStudent(payload)
    : registerFaculty(payload);
}

export function forgotPassword(payload) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

export function getCurrentUser() {
  return apiRequest("/auth/me");
}

export function logout() {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}

export function generateRecoveryCode(currentPassword) {
  return apiRequest("/auth/generate-recovery-code", {
    method: "POST",
    body: {
      currentPassword,
    },
  });
}
