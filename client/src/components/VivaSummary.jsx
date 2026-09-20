import React from "react";
import { COLORS, FONTS, TIER_ORDER } from "../theme.js";
import TierBadge from "./TierBadge.jsx";
import Ledger from "./Ledger.jsx";

export default function VivaSummary({ session, transcript, warningCount, onDone }) {
  const correct = transcript.filter((t) => t.correct).length;
  const tiersReached = transcript.map((t) => t.tier);
  const highest = TIER_ORDER.reduce((h, t) => (tiersReached.includes(t) ? t : h), "easy");

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.teal, letterSpacing: 0.4, margin: "0 0 8px" }}>
        Viva complete
      </p>
      <h2 style={{ fontFamily: FONTS.serif, fontSize: 26, color: COLORS.ink, margin: "0 0 20px" }}>
        {correct} of {transcript.length} answered without hints exhausted
      </h2>
      <div style={{ display: "flex", gap: 24, marginBottom: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.inkSoft, margin: "0 0 4px" }}>Highest tier reached</p>
          <TierBadge tier={highest} />
        </div>
        <div>
          <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.inkSoft, margin: "0 0 4px" }}>Stored under</p>
          <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.ink, margin: 0, fontWeight: 600 }}>{session.facultyName}'s folder</p>
        </div>
        <div>
          <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.inkSoft, margin: "0 0 4px" }}>Tab-exit warnings</p>
          <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: warningCount ? COLORS.danger : COLORS.ink, margin: 0, fontWeight: 600 }}>
            {warningCount}
          </p>
        </div>
      </div>
      <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.6, margin: "16px 0 28px" }}>
        This transcript has been written directly to {session.facultyName}'s local folder on this machine — it never leaves
        this device. {session.facultyName} can open it from the faculty view.
      </p>
      <div style={{ userSelect: "none" }} onCopy={(e) => e.preventDefault()}>
        <Ledger transcript={transcript} />
      </div>
      <button
        onClick={onDone}
        style={{
          marginTop: 12,
          padding: "10px 22px",
          cursor: "pointer",
          background: COLORS.raised,
          border: `1px solid ${COLORS.line}`,
          borderRadius: 4,
          fontFamily: FONTS.sans,
          fontSize: 13,
          fontWeight: 600,
          color: COLORS.ink,
        }}
      >
        Back to start
      </button>
    </div>
  );
}
