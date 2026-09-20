import { useEffect, useState } from "react";

import {
  getStudentDashboard,
  getStudentProgress,
} from "../api/student.js";

import {
  getStudentSubjects,
} from "../api/subjects.js";

import VivaSession from "./VivaSession.jsx";

export default function StudentDashboard({
  user,
  onLogout,
}) {
  const [dashboard, setDashboard] =
    useState(null);

  const [subjects, setSubjects] =
    useState([]);

  const [progress, setProgress] =
    useState({});

  const [selectedSubject, setSelectedSubject] =
    useState("");

  const [topic, setTopic] =
    useState("");

  const [mode, setMode] =
    useState("practice");

  const [running, setRunning] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadData =
    async () => {
      try {
        const [
          dashboardResult,
          subjectResult,
          progressResult,
        ] =
          await Promise.all([
            getStudentDashboard(),
            getStudentSubjects(),
            getStudentProgress(),
          ]);

        setDashboard(
          dashboardResult.student
        );

        setSubjects(
          subjectResult.subjects ||
            []
        );

        setProgress(
          progressResult.progress ||
            {}
        );
      } catch (err) {
        setError(
          err.message
        );
      }
    };

  useEffect(() => {
    loadData();
  }, []);

  if (running) {
    return (
      <VivaSession
        session={{
          subject: selectedSubject,
          topic,
          mode,
          facultyUsername:
            dashboard?.facultyUsername ||
            user.facultyUsername ||
            null,
          name:
            dashboard?.name ||
            user.name,
          studentId:
            dashboard?.studentId ||
            user.studentId,
        }}
        warningCount={0}
        onFinish={() => {
          setRunning(false);
          loadData();
        }}
        onCancel={() =>
          setRunning(false)
        }
      />
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <strong>
            Viva Analyser
          </strong>

          <span className="role-label">
            Student
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
          <div>
            <p className="eyebrow">
              Student Dashboard
            </p>

            <h1>
              Welcome,{" "}
              {dashboard?.name ||
                user.name}
            </h1>

            <p>
              Student ID:{" "}
              {dashboard?.studentId ||
                user.studentId}
            </p>
          </div>
        </div>

        <section className="panel">
          <div className="panel-heading">
            <h2>
              Start Personalized Viva
            </h2>

            <p>
              Your previous answers
              influence future questions.
            </p>
          </div>

          <div className="form-grid">
            <label>
              Subject

              <select
                value={
                  selectedSubject
                }
                onChange={(event) =>
                  setSelectedSubject(
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  Select subject
                </option>

                {subjects.map(
                  (subject) => (
                    <option
                      key={
                        subject.name ||
                        subject
                      }
                      value={
                        subject.name ||
                        subject
                      }
                    >
                      {subject.name ||
                        subject}
                    </option>
                  )
                )}
              </select>
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
                placeholder="Optional topic"
              />
            </label>

            <label>
              Mode

              <select
                value={mode}
                onChange={(event) =>
                  setMode(
                    event.target
                      .value
                  )
                }
              >
                <option value="learning">
                  Learning
                </option>

                <option value="practice">
                  Practice
                </option>

                <option value="assessment">
                  Assessment
                </option>
              </select>
            </label>
          </div>

          <button
            className="primary-button"
            disabled={
              !selectedSubject
            }
            onClick={() =>
              setRunning(true)
            }
          >
            Start Viva
          </button>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>
              My Progress
            </h2>

            <p>
              Progress is stored per
              subject for this student.
            </p>
          </div>

          <div className="stats-grid">
            {Object.entries(
              progress
            ).map(
              ([
                subject,
                item,
              ]) => (
                <div
                  className="stat-card"
                  key={subject}
                >
                  <h3>
                    {subject}
                  </h3>

                  <p>
                    Mastery:{" "}
                    <strong>
                      {item.mastery ||
                        "NOT_STARTED"}
                    </strong>
                  </p>

                  <p>
                    Difficulty:{" "}
                    <strong>
                      {item.currentTier ||
                        "easy"}
                    </strong>
                  </p>

                  <p>
                    Attempts:{" "}
                    {item.attempts ||
                      0}
                  </p>

                  <p>
                    Correct:{" "}
                    {item.correct ||
                      0}
                  </p>
                </div>
              )
            )}

            {!Object.keys(
              progress
            ).length && (
              <div className="empty-state">
                No viva progress yet.
                Start your first session.
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </section>
    </main>
  );
}

