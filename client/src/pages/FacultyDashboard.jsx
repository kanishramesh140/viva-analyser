import {
  useEffect,
  useState,
} from "react";

import {
  getFacultyDashboard,
  assignStudentSubject,
} from "../api/faculty.js";

import {
  createSubject,
} from "../api/subjects.js";

export default function FacultyDashboard({
  user,
  onLogout,
}) {
  const [data, setData] =
    useState(null);

  const [subject, setSubject] =
    useState("");

  const [topic, setTopic] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [selectedStudent, setSelectedStudent] =
    useState("");

  const [assignSubject, setAssignSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function load() {
    try {
      const result =
        await getFacultyDashboard();

      setData(result);
    } catch (err) {
      setError(
        err.message
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreateSubject(
    event
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      await createSubject({
        subject,
        topic,
        notes,
      });

      setSubject("");
      setTopic("");
      setNotes("");

      setMessage(
        "Subject saved."
      );

      await load();
    } catch (err) {
      setError(
        err.message
      );
    }
  }

  async function handleAssign(
    event
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      await assignStudentSubject(
        selectedStudent,
        assignSubject
      );

      setMessage(
        "Subject assigned to student."
      );

      await load();
    } catch (err) {
      setError(
        err.message
      );
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <strong>
            Viva Analyser
          </strong>

          <span className="role-label">
            Faculty
          </span>
        </div>

        <div className="topbar-actions">
          <span>
            {user.name}
          </span>

          <button
            className="secondary-button"
            onClick={
              onLogout
            }
          >
            Logout
          </button>
        </div>
      </header>

      <section className="dashboard-grid">
        <div className="hero-card">
          <p className="eyebrow">
            Faculty Dashboard
          </p>

          <h1>
            Welcome,{" "}
            {user.name}
          </h1>

          <p>
            Manage subjects,
            students and viva results.
          </p>
        </div>

        <section className="panel">
          <h2>
            Create / Configure Subject
          </h2>

          <form
            className="form-grid"
            onSubmit={
              handleCreateSubject
            }
          >
            <label>
              Subject

              <input
                value={subject}
                onChange={(event) =>
                  setSubject(
                    event.target
                      .value
                  )
                }
                required
              />
            </label>

            <label>
              Topic

              <input
                value={topic}
                onChange={(event) =>
                  setTopic(
                    event.target
                      .value
                  )
                }
              />
            </label>

            <label>
              Reference Notes

              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target
                      .value
                  )
                }
                rows={5}
              />
            </label>

            <button
              className="primary-button"
              type="submit"
            >
              Save Subject
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>
            Assign Subject to Student
          </h2>

          <form
            className="form-grid"
            onSubmit={
              handleAssign
            }
          >
            <label>
              Student

              <select
                value={
                  selectedStudent
                }
                onChange={(event) =>
                  setSelectedStudent(
                    event.target
                      .value
                  )
                }
                required
              >
                <option value="">
                  Select student
                </option>

                {(
                  data?.students ||
                  []
                ).map(
                  (student) => (
                    <option
                      key={
                        student.studentId
                      }
                      value={
                        student.studentId
                      }
                    >
                      {
                        student.name
                      }{" "}
                      (
                      {
                        student.studentId
                      }
                      )
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Subject

              <select
                value={
                  assignSubject
                }
                onChange={(event) =>
                  setAssignSubject(
                    event.target
                      .value
                  )
                }
                required
              >
                <option value="">
                  Select subject
                </option>

                {(
                  data?.subjects ||
                  []
                ).map(
                  (item) => (
                    <option
                      key={
                        item.name
                      }
                      value={
                        item.name
                      }
                    >
                      {
                        item.name
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            <button
              className="primary-button"
              type="submit"
            >
              Assign
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>
            Students
          </h2>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    Student
                  </th>

                  <th>
                    ID
                  </th>

                  <th>
                    Subjects
                  </th>
                </tr>
              </thead>

              <tbody>
                {(
                  data?.students ||
                  []
                ).map(
                  (student) => (
                    <tr
                      key={
                        student.studentId
                      }
                    >
                      <td>
                        {student.name}
                      </td>

                      <td>
                        {
                          student.studentId
                        }
                      </td>

                      <td>
                        {(
                          student.subjects ||
                          []
                        ).join(
                          ", "
                        ) || "None"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h2>
            Viva Results
          </h2>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    Student
                  </th>

                  <th>
                    Subject
                  </th>

                  <th>
                    Questions
                  </th>

                  <th>
                    Correct
                  </th>

                  <th>
                    Completed
                  </th>
                </tr>
              </thead>

              <tbody>
                {(
                  data?.records ||
                  []
                ).map(
                  (record) => (
                    <tr
                      key={
                        record.filename ||
                        record.sessionId
                      }
                    >
                      <td>
                        {
                          record.studentId
                        }
                      </td>

                      <td>
                        {
                          record.subject
                        }
                      </td>

                      <td>
                        {
                          record.result
                            ?.totalQuestions ||
                          record.answers
                            ?.length ||
                          0
                        }
                      </td>

                      <td>
                        {
                          record.result
                            ?.correctAnswers ||
                          0
                        }
                      </td>

                      <td>
                        {
                          record.submittedAt ||
                          record.result
                            ?.finishedAt
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </section>
    </main>
  );
}
