import {
  addSubjectFaculty,
  getSubject,
  listSubjects,
  removeSubjectFaculty,
} from "../repositories/subjectRepository.js";

function facultyUsername(req) {
  return (
    req.auth?.username ||
    req.user?.username ||
    req.account?.username ||
    null
  );
}

export async function list(req, res, next) {
  try {
    res.json({
      ok: true,
      subjects: await listSubjects(),
    });
  } catch (error) {
    next(error);
  }
}

export async function get(req, res, next) {
  try {
    const subject = await getSubject(req.params.subject);

    res.json({
      ok: true,
      subject,
    });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const username = facultyUsername(req);

    if (!username) {
      throw Object.assign(new Error("Authentication required."), {
        status: 401,
      });
    }

    const result = await addSubjectFaculty({
      subject: req.body.subject,
      topic: req.body.topic,
      notes: req.body.notes,
      username,
    });

    res.status(201).json({
      ok: true,
      subject: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeFaculty(req, res, next) {
  try {
    const username = facultyUsername(req);

    if (!username) {
      throw Object.assign(new Error("Authentication required."), {
        status: 401,
      });
    }

    await removeSubjectFaculty(req.params.subject, username);

    res.json({
      ok: true,
    });
  } catch (error) {
    next(error);
  }
}
