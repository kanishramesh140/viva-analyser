import {
  getSession,
} from "../services/sessions.js";

export function requireAuth(
  requiredRole = null
) {
  return (req, res, next) => {
    const sessionId =
      req.cookies?.viva_session;

    const session =
      getSession(sessionId);

    if (!session) {
      return res.status(401).json({
        ok: false,
        message:
          "Authentication required.",
      });
    }

    if (
      requiredRole &&
      session.role !== requiredRole
    ) {
      return res.status(403).json({
        ok: false,
        message:
          "You are not authorized for this operation.",
      });
    }

    req.auth = {
      username:
        session.username,

      role:
        session.role,

      userId:
        session.userId,

      studentId:
        session.studentId,
    };

    req.sessionId =
      sessionId;

    next();
  };
}

export const requireFacultyAuth =
  requireAuth("faculty");

export const requireStudentAuth =
  requireAuth("student");
