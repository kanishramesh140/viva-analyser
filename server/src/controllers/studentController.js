import {
  findStudent,
  listStudents,
} from "../repositories/studentRepository.js";

function studentIdentity(req) {
  return (
    req.auth?.studentId ||
    req.user?.studentId ||
    req.auth?.username ||
    req.user?.username ||
    null
  );
}

export async function dashboard(req, res, next) {
  try {
    const identity = studentIdentity(req);

    if (!identity) {
      throw Object.assign(new Error("Authentication required."), {
        status: 401,
      });
    }

    const student =
      (await findStudent(identity)) || {
        studentId: identity,
      };

    res.json({
      ok: true,
      student,
    });
  } catch (error) {
    next(error);
  }
}

export async function subjects(req, res, next) {
  try {
    const identity = studentIdentity(req);

    if (!identity) {
      throw Object.assign(new Error("Authentication required."), {
        status: 401,
      });
    }

    const student = await findStudent(identity);

    res.json({
      ok: true,
      subjects: student?.subjects || [],
    });
  } catch (error) {
    next(error);
  }
}

export async function progress(req, res, next) {
  try {
    const identity = studentIdentity(req);

    if (!identity) {
      throw Object.assign(new Error("Authentication required."), {
        status: 401,
      });
    }

    const student = await findStudent(identity);

    res.json({
      ok: true,
      studentId: identity,
      progress: student?.progress || {},
    });
  } catch (error) {
    next(error);
  }
}

export async function listAll(req, res, next) {
  try {
    const students = await listStudents();

    res.json({
      ok: true,
      students,
    });
  } catch (error) {
    next(error);
  }
}
