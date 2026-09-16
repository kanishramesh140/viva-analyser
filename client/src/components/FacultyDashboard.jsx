import React, { useEffect, useState } from "react";
import { COLORS, FONTS } from "../theme.js";
import Ledger from "./Ledger.jsx";
import { getMySubjects, getAvailableSubjects, addMySubject, getMyStudents, getMyStudentRecord, logout } from "../api.js";

export default function FacultyDashboard({ account, onLoggedOut, onDone }) {
  const [mySubjects, setMySubjects] = useState(null);
  const [students, setStudents] = useState(null);
  const [openStudent, setOpenStudent] = useState(null);
  const [addingSubject, setAddingSubject] = useState(false);
  const [error, setError] = useState("");

  const reload = () => {
    getMySubjects()
      .then((r) => setMySubjects(r.subjects))
      .catch(() => setError("Couldn't load your subjects."));
    getMyStudents()
      .then((r) => setStudents(r.students))
      .catch(() => setError("Couldn't load your students."));
  };

  useEffect(reload, []);

  const openTranscript = (summary) => {
    getMyStudentRecord(summary.filename)
      .then((r) => setOpenStudent(r.record))
      .catch(() => setError("Couldn't open that transcript."));
  };

  return (
    <div style={{ display: "flex", minHeight: "70vh" }}>
      <aside style={{ width: 260, flexShrink: 0, padding: "40px 20px", borderRight: `1px solid ${COLORS.line}` }}>
        <p style={{ fontFamily: FONTS.sans, fontSize: 11, fontWeight: 600, color: COLORS.teal, letterSpacing: 0.4, margin: "0 0 4px" }}>
          SIGNED IN
        </p>
        <p style={{ fontFamily: FONTS.serif, fontSize: 16, color: COLORS.ink, margin: "0 0 20px" }}>{account.name}</p>

        <p style={{ fontFamily: FONTS.sans, fontSize: 11, fontWeight: 600, color: COLORS.inkSoft, margin: "0 0 8px" }}>Your subjects</p>
        {mySubjects === null && <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.inkSoft }}>Loading…</p>}
        {mySubjects && !mySubjects.length && (
          <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.inkSoft, marginBottom: 12 }}>
            You aren't teaching any subject yet — add one below.
          </p>
        )}
        {mySubjects &&
          mySubjects.map((s) => (
            <p key={s.subject} style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.ink, margin: "0 0 6px" }}>
              {s.subject}
              {s.domainLabel ? <span style={{ color: COLORS.inkSoft }}> · {s.domainLabel}</span> : null}
            </p>
          ))}

        <button
          onClick={() => setAddingSubject(true)}
          style={{
            marginTop: 12,
            padding: "8px 14px",
            cursor: "pointer",
            borderRadius: 4,
            fontFamily: FONTS.sans,
            fontSize: 13,
            fontWeight: 600,
            border: `1px dashed ${COLORS.rust}`,
            background: "transparent",
            color: COLORS.rust,
          }}
        >
          + Teach a subject
        </button>

        <button
          onClick={async () => {
            await logout().catch(() => {});
            onLoggedOut();
          }}
          style={{ display: "block", marginTop: 28, padding: "8px 0", cursor: "pointer", background: "transparent", border: "none", fontFamily: FONTS.sans, fontSize: 12, color: COLORS.inkSoft, textDecoration: "underline" }}
        >
          Sign out
        </button>
        <button
          onClick={onDone}
          style={{ display: "block", marginTop: 8, padding: "8px 0", cursor: "pointer", background: "transparent", border: "none", fontFamily: FONTS.sans, fontSize: 12, color: COLORS.inkSoft, textDecoration: "underline" }}
        >
          Back to start
        </button>
      </aside>

      <main style={{ flex: 1, padding: "40px 40px 60px" }}>
        {error && <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.danger, margin: "0 0 16px" }}>{error}</p>}

        {addingSubject && (
          <AddSubjectPanel
            onCancel={() => setAddingSubject(false)}
            onAdded={() => {
              setAddingSubject(false);
              reload();
            }}
          />
        )}

        {!addingSubject && !openStudent && (
          <div>
            <h2 style={{ fontFamily: FONTS.serif, fontSize: 22, color: COLORS.ink, margin: "0 0 4px" }}>Your students</h2>
            <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkSoft, margin: "0 0 28px" }}>
              {students ? students.length : "…"} submission{students && students.length === 1 ? "" : "s"} in your folder — visible only to you
            </p>

            {students && !students.length && (
              <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkSoft }}>No students have submitted a viva to you yet.</p>
            )}

            {students &&
              students.map((r, i) => (
                <button
                  key={i}
                  onClick={() => openTranscript(r)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    background: COLORS.raised,
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 6,
                    padding: "14px 16px",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <p style={{ fontFamily: FONTS.sans, fontSize: 14, fontWeight: 600, color: COLORS.ink, margin: 0 }}>{r.name}</p>
                    <p style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.inkSoft, margin: 0 }}>{r.studentId}</p>
                  </div>
                  <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.inkSoft, margin: "4px 0 0" }}>
                    {r.subject} · {r.correctCount}/{r.totalCount} without hints exhausted
                    {r.warningCount ? ` · ${r.warningCount} tab-exit warning${r.warningCount === 1 ? "" : "s"}` : ""}
                  </p>
                </button>
              ))}
          </div>
        )}

        {openStudent && (
          <div>
            <button
              onClick={() => setOpenStudent(null)}
              style={{ marginBottom: 16, padding: "6px 0", cursor: "pointer", background: "transparent", border: "none", fontFamily: FONTS.sans, fontSize: 12, color: COLORS.inkSoft, textDecoration: "underline" }}
            >
              Back to list
            </button>
            <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.inkSoft, margin: "0 0 20px" }}>
              Read-only transcript. Copying is disabled to prevent transcripts leaving this folder.
            </p>
            <div style={{ userSelect: "none" }} onCopy={(e) => e.preventDefault()}>
              <Ledger transcript={openStudent.transcript} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function AddSubjectPanel({ onCancel, onAdded }) {
  const [available, setAvailable] = useState(null);
  const [mode, setMode] = useState("pick"); // 'pick' | 'new'
  const [subjectName, setSubjectName] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAvailableSubjects()
      .then((r) => setAvailable(r.subjects))
      .catch(() => setAvailable([]));
  }, []);

  const addExisting = async (subject) => {
    setSaving(true);
    try {
      await addMySubject({ subject });
      onAdded();
    } catch (e) {
      setError(e.message || "Couldn't add that subject.");
      setSaving(false);
    }
  };

  const addNew = async () => {
    if (!subjectName.trim()) {
      setError("Enter a subject name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addMySubject({ subject: subjectName.trim(), topic: topic.trim(), notes: notes.trim() });
      onAdded();
    } catch (e) {
      setError(e.message || "Couldn't add that subject.");
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ fontFamily: FONTS.serif, fontSize: 22, color: COLORS.ink, margin: "0 0 16px" }}>Teach a subject</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setMode("pick")}
          style={{ flex: 1, padding: "9px 0", cursor: "pointer", borderRadius: 4, fontFamily: FONTS.sans, fontSize: 13, fontWeight: 600, border: `1px solid ${mode === "pick" ? COLORS.rust : COLORS.line}`, background: mode === "pick" ? COLORS.rustBg : COLORS.raised, color: mode === "pick" ? COLORS.rustDark : COLORS.inkSoft }}
        >
          Pick existing
        </button>
        <button
          onClick={() => setMode("new")}
          style={{ flex: 1, padding: "9px 0", cursor: "pointer", borderRadius: 4, fontFamily: FONTS.sans, fontSize: 13, fontWeight: 600, border: `1px solid ${mode === "new" ? COLORS.rust : COLORS.line}`, background: mode === "new" ? COLORS.rustBg : COLORS.raised, color: mode === "new" ? COLORS.rustDark : COLORS.inkSoft }}
        >
          Add new
        </button>
      </div>

      {mode === "pick" && (
        <div>
          {available === null && <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkSoft }}>Loading…</p>}
          {available && !available.length && <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkSoft }}>No other subjects yet — add a new one instead.</p>}
          {available &&
            available.map((s) => (
              <button
                key={s.subject}
                disabled={saving}
                onClick={() => addExisting(s.subject)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  cursor: saving ? "default" : "pointer",
                  background: COLORS.raised,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 6,
                  padding: "12px 14px",
                  marginBottom: 8,
                }}
              >
                <p style={{ fontFamily: FONTS.sans, fontSize: 14, fontWeight: 600, color: COLORS.ink, margin: 0 }}>{s.subject}</p>
                {s.topic && <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.inkSoft, margin: "2px 0 0" }}>{s.topic}</p>}
              </button>
            ))}
        </div>
      )}

      {mode === "new" && (
        <div>
          <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.inkSoft }}>Subject name</label>
          <input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Data structures" style={inputStyle} />
          <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.inkSoft }}>Topic focus (optional)</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Binary trees and traversal" style={inputStyle} />
          <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.inkSoft }}>Reference notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Ground the generated questions in your own material"
            style={{ ...inputStyle, fontSize: 13, resize: "vertical" }}
          />
          <button
            onClick={addNew}
            disabled={saving}
            style={{ padding: "9px 16px", cursor: saving ? "default" : "pointer", background: COLORS.rust, color: "#FBF4EF", border: "none", borderRadius: 4, fontFamily: FONTS.sans, fontSize: 13, fontWeight: 600 }}
          >
            {saving ? "Adding…" : "Add subject"}
          </button>
        </div>
      )}

      {error && <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.danger, margin: "12px 0 0" }}>{error}</p>}

      <button
        onClick={onCancel}
        style={{ display: "block", marginTop: 16, padding: "8px 0", cursor: "pointer", background: "transparent", border: "none", fontFamily: FONTS.sans, fontSize: 12, color: COLORS.inkSoft, textDecoration: "underline" }}
      >
        Cancel
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  margin: "6px 0 14px",
  padding: "9px 12px",
  borderRadius: 4,
  border: `1px solid ${COLORS.line}`,
  background: COLORS.raised,
  fontFamily: FONTS.sans,
  fontSize: 14,
  color: COLORS.ink,
  boxSizing: "border-box",
};