import React from "react";
import { COLORS, FONTS } from "../theme.js";

export default function Home({ onPick }) {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px" }}>
      <p style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.rust, letterSpacing: 0.4, margin: "0 0 8px" }}>
        Runs locally · local host · no cloud storage
      </p>
      <h1 style={{ fontFamily: FONTS.serif, fontSize: 34, color: COLORS.ink, margin: "0 0 12px", lineHeight: 1.2 }}>
        Viva analyser
      </h1>
      <p style={{ fontFamily: FONTS.sans, fontSize: 15, color: COLORS.inkSoft, maxWidth: 540, lineHeight: 1.6, margin: "0 0 40px" }}>
        A self-learning oral exam for any subject. Faculty pick a subject or add a new one with its
        own topic focus, questions adapt to every answer, wrong answers get guiding hints instead of
        the solution, and every transcript is written straight into the responsible faculty member's
        own local folder on this machine — nothing leaves this device.
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <button
          onClick={() => onPick("student")}
          style={{
            flex: "1 1 260px",
            textAlign: "left",
            cursor: "pointer",
            background: COLORS.raised,
            border: `1px solid ${COLORS.line}`,
            borderRadius: 8,
            padding: "20px 20px 22px",
          }}
        >
          <p style={{ fontFamily: FONTS.serif, fontSize: 18, color: COLORS.ink, margin: "0 0 6px" }}>Take a viva</p>
          <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkSoft, margin: 0, lineHeight: 1.5 }}>
            Answer by typing only — cut, copy and paste are disabled, and leaving the tab is logged.
          </p>
        </button>
        <button
          onClick={() => onPick("faculty")}
          style={{
            flex: "1 1 260px",
            textAlign: "left",
            cursor: "pointer",
            background: COLORS.raised,
            border: `1px solid ${COLORS.line}`,
            borderRadius: 8,
            padding: "20px 20px 22px",
          }}
        >
          <p style={{ fontFamily: FONTS.serif, fontSize: 18, color: COLORS.ink, margin: "0 0 6px" }}>Faculty sign in</p>
          <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkSoft, margin: 0, lineHeight: 1.5 }}>
            Any faculty member can register their own account, choose the subjects they teach, and see only their
            own students. Read-only, no copying.
          </p>
        </button>
      </div>
    </div>
  );
}