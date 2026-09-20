import { apiRequest } from "./client.js";

export function getFacultyDashboard() {
  return apiRequest(
    "/faculty/dashboard"
  );
}

export function getFacultyStudents() {
  return apiRequest(
    "/faculty/students"
  );
}

export function assignStudentSubject(
  studentId,
  subject
) {
  return apiRequest(
    `/faculty/students/${encodeURIComponent(
      studentId
    )}/subjects`,
    {
      method: "POST",
      body: {
        subject,
      },
    }
  );
}

export function getStudentProgressForFaculty(
  studentId
) {
  return apiRequest(
    `/faculty/students/${encodeURIComponent(
      studentId
    )}/progress`
  );
}
