import { apiRequest } from "./client.js";

export function listSubjects() {
  return apiRequest(
    "/subjects"
  );
}

export function getSubject(
  subject
) {
  return apiRequest(
    `/subjects/${encodeURIComponent(
      subject
    )}`
  );
}

export function getStudentSubjects() {
  return apiRequest(
    "/subjects"
  );
}

export function createSubject(
  payload
) {
  return apiRequest(
    "/subjects",
    {
      method: "POST",
      body: payload,
    }
  );
}

export function createOrJoinSubject(
  payload
) {
  return createSubject(
    payload
  );
}
