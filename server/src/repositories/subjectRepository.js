import {
  addFacultyToSubject,
  getSubjectAssoc,
  listAllSubjectEntries,
  isFacultyForSubject,
  removeFacultyFromSubject,
} from "../services/subjects.js";

export async function listSubjects() {
  return listAllSubjectEntries();
}

export async function getSubject(subject) {
  return getSubjectAssoc(subject);
}

export async function facultyOwnsSubject(subject, username) {
  return isFacultyForSubject(subject, username);
}

export async function addSubjectFaculty(payload) {
  return addFacultyToSubject(payload);
}

export async function removeSubjectFaculty(subject, username) {
  return removeFacultyFromSubject(subject, username);
}
