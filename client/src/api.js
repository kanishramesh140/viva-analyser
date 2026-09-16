const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include", // send/receive the session cookie
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request to ${path} failed with status ${res.status}`);
  }
  return data;
}

// --- Auth ---

export function register({ username, name, password }) {
  return request("/api/auth/register", { method: "POST", body: JSON.stringify({ username, name, password }) });
}

export function login({ username, password }) {
  return request("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
}

export function logout() {
  return request("/api/auth/logout", { method: "POST" });
}

export function getMe() {
  return request("/api/auth/me");
}

// --- Public subject listing (for students) ---

export function getSubjects() {
  return request("/api/subjects");
}

// --- Faculty dashboard (all require a signed-in session) ---

export function getMySubjects() {
  return request("/api/faculty/me/subjects");
}

export function getAvailableSubjects() {
  return request("/api/faculty/me/available-subjects");
}

export function addMySubject({ subject, topic, notes }) {
  return request("/api/faculty/me/subjects", { method: "POST", body: JSON.stringify({ subject, topic, notes }) });
}

export function removeMySubject(subject) {
  return request(`/api/faculty/me/subjects/${encodeURIComponent(subject)}`, { method: "DELETE" });
}

export function getMyStudents() {
  return request("/api/faculty/me/students");
}

export function getMyStudentRecord(filename) {
  return request(`/api/faculty/me/students/${encodeURIComponent(filename)}`);
}

// --- Viva session (students) ---

export function startViva(payload) {
  return request("/api/viva/start", { method: "POST", body: JSON.stringify(payload) });
}

export function submitAnswer(sessionId, answer) {
  return request("/api/viva/answer", { method: "POST", body: JSON.stringify({ sessionId, answer }) });
}

export function finishViva(sessionId, warningCount) {
  return request("/api/viva/finish", { method: "POST", body: JSON.stringify({ sessionId, warningCount }) });
}