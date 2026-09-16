import React from "react";
import { COLORS, FONTS } from "../theme.js";

// Students choose from subjects a real, signed-in faculty member has
// already opted into — they can never create a subject or type a faculty
// name themselves, which is what keeps every submission accountable to a
// real account.
export default function SubjectPicker({ subjects, onChoose }) {
  if (!subjects.length) {
    return (
      <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.6 }}>
        No subjects are open for a viva yet. Ask your faculty to sign in and add their subject first.
      </p>
    );
  }

  return (
    <div>
      {subjects.map((s) => (
        <div key={s.subject} style={{ marginBottom: 16, background: COLORS.raised, border: `1px solid ${COLORS.line}`, borderRadius: 6, padding: "14px 16px" }}>
          <p style={{ fontFamily: FONTS.serif, fontSize: 16, color: COLORS.ink, margin: "0 0 2px" }}>
            {s.subject}
            {s.domainLabel && <span style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.rust, marginLeft: 8 }}>{s.domainLabel.toUpperCase()}</span>}
          </p>
          {s.topic && <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.inkSoft, margin: "0 0 10px" }}>{s.topic}</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {s.faculty.map((f) => (
              <button
                key={f.username}
                onClick={() => onChoose({ subject: s.subject, domainLabel: s.domainLabel, facultyUsername: f.username, facultyName: f.name })}
                style={{
                  padding: "7px 12px",
                  cursor: "pointer",
                  borderRadius: 4,
                  fontFamily: FONTS.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  border: `1px solid ${COLORS.line}`,
                  background: COLORS.paper,
                  color: COLORS.ink,
                }}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}