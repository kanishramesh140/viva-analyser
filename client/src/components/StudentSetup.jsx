import React, { useEffect, useState } from "react";
import { COLORS, FONTS } from "../theme.js";
import SubjectPicker from "./SubjectPicker.jsx";
import { getSubjects } from "../api.js";

export default function StudentSetup({ onStart }) {
  const [subjects, setSubjects] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [chosen, setChosen] = useState(null);
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getSubjects()
      .then((r) => setSubjects(r.subjects))
      .catch(() => setLoadError("Couldn't reach the local server. Make sure it's running, then reload."));
  }, []);

  if (loadError) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "56px 24px" }}>
        <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.danger }}>{loadError}</p>
      </div>
    );
  }

  if (!chosen) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "56px 24px" }}>
        <h2 style={{ fontFamily: FONTS.serif, fontSize: 24, color: COLORS.ink, margin: "0 0 8px" }}>Choose your subject</h2>
        <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkSoft, margin: "0 0 24px" }}>Pick the subject, then the faculty member examining you.</p>
        {subjects === null ? (
          <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkSoft }}>Loading…</p>
        ) : (
          <SubjectPicker subjects={subjects} onChoose={setChosen} />
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "56px 24px" }}>
      <h2 style={{ fontFamily: FONTS.serif, fontSize: 24, color: COLORS.ink, margin: "0 0 4px" }}>Set up your viva</h2>
      <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkSoft, margin: "0 0 24px" }}>
        Subject: <strong style={{ color: COLORS.ink, fontWeight: 600 }}>{chosen.subject}</strong> · Faculty:{" "}
        <strong style={{ color: COLORS.ink, fontWeight: 600 }}>{chosen.facultyName}</strong>
        <button
          onClick={() => setChosen(null)}
          style={{ marginLeft: 8, background: "transparent", border: "none", color: COLORS.rust, fontFamily: FONTS.sans, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}
        >
          change
        </button>
      </p>

      <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.inkSoft }}>Your name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={inputStyle} />

      <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.inkSoft }}>Student ID</label>
      <input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. 21AU045" style={inputStyle} />

      {error && <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.danger, margin: "0 0 12px" }}>{error}</p>}

      <button
        onClick={() => {
          if (!name.trim() || !studentId.trim()) {
            setError("Fill in your name and student ID before starting.");
            return;
          }
          setError("");
          onStart({
            subject: chosen.subject,
            domainLabel: chosen.domainLabel,
            facultyUsername: chosen.facultyUsername,
            facultyName: chosen.facultyName,
            name: name.trim(),
            studentId: studentId.trim(),
          });
        }}
        style={{
          marginTop: 8,
          width: "100%",
          padding: "11px 0",
          cursor: "pointer",
          background: COLORS.rust,
          color: "#FBF4EF",
          border: "none",
          borderRadius: 4,
          fontFamily: FONTS.sans,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Begin viva
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  margin: "6px 0 16px",
  padding: "9px 12px",
  borderRadius: 4,
  border: `1px solid ${COLORS.line}`,
  background: COLORS.raised,
  fontFamily: FONTS.sans,
  fontSize: 14,
  color: COLORS.ink,
  boxSizing: "border-box",
};