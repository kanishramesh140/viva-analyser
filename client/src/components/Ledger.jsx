import React from "react";
import { COLORS, FONTS } from "../theme.js";
import TierBadge from "./TierBadge.jsx";

export default function Ledger({ transcript }) {
  return (
    <div>
      {transcript.map((t, i) => (
        <div
          key={i}
          style={{
            marginBottom: 22,
            paddingBottom: 18,
            borderBottom: i < transcript.length - 1 ? `1px solid ${COLORS.line}` : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.inkSoft }}>Q{i + 1}</span>
            <TierBadge tier={t.tier} unresolved={!t.correct} />
            {typeof t.timeTakenSec === "number" && (
              <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.inkSoft }}>{t.timeTakenSec}s</span>
            )}
          </div>
          <p style={{ fontFamily: FONTS.serif, fontSize: 16, color: COLORS.ink, margin: "0 0 8px" }}>{t.question}</p>
          {t.hintsUsed.map((h, hi) => (
            <p
              key={hi}
              style={{
                fontFamily: FONTS.sans,
                fontSize: 13,
                color: COLORS.gold,
                margin: "0 0 6px",
                paddingLeft: 12,
                borderLeft: `2px solid ${COLORS.amberBg}`,
              }}
            >
              Hint {hi + 1}: {h}
            </p>
          ))}
          {t.attempts.map((a, ai) => (
            <p
              key={ai}
              style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.inkSoft, margin: "0 0 4px", whiteSpace: "pre-wrap" }}
            >
              A{t.attempts.length > 1 ? ai + 1 : ""}: {a}
            </p>
          ))}
          <p
            style={{
              fontFamily: FONTS.sans,
              fontSize: 12,
              fontWeight: 600,
              color: t.correct ? COLORS.tealDark : COLORS.danger,
              margin: "6px 0 0",
            }}
          >
            {t.correct ? "Answered correctly" : "Moved on without full resolution"}
          </p>
        </div>
      ))}
    </div>
  );
}
