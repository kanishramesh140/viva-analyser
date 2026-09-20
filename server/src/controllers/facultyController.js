import {
  listStudents,
  readStudentRecord,
} from "../services/storage.js";
import { listAllSubjectEntries } from "../services/subjects.js";

function usernameFromRequest(req) {
  return (
    req.auth?.username ||
    req.user?.username ||
    req.account?.username ||
    req.session?.username ||
    null
  );
}

export async function dashboard(req, res, next) {
  try {
    const username = usernameFromRequest(req);

    if (!username) {
      throw Object.assign(new Error("Authentication required."), {
        status: 401,
      });
    }

    const [records, subjects] = await Promise.all([
      listStudents(username),
      listAllSubjectEntries(),
    ]);

    res.json({
      ok: true,
      facultyUsername: username,
      subjects,
      records,
    });
  } catch (error) {
    next(error);
  }
}

export async function students(req, res, next) {
  try {
    const username = usernameFromRequest(req);

    if (!username) {
      throw Object.assign(new Error("Authentication required."), {
        status: 401,
      });
    }

    const records = await listStudents(username);

    res.json({
      ok: true,
      students: records,
    });
  } catch (error) {
    next(error);
  }
}

export async function record(req, res, next) {
  try {
    const username = usernameFromRequest(req);

    if (!username) {
      throw Object.assign(new Error("Authentication required."), {
        status: 401,
      });
    }

    const filename = req.params.filename;
    const record = await readStudentRecord(username, filename);

    res.json({
      ok: true,
      record,
    });
  } catch (error) {
    next(error);
  }
}
