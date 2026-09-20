import React from "react";
import { FONTS, TIER_LABEL, TIER_COLOR } from "../theme.js";

export default function TierBadge({ tier, unresolved }) {
  const c = TIER_COLOR[tier];
  return (
    <span
      style={{
        fontFamily: FONTS.sans,
        fontSize: 11,
        fontWeight: 600,
        color: c.fg,
        background: c.bg,
        borderRadius: 3,
        padding: "2px 7px",
        letterSpacing: 0.2,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {TIER_LABEL[tier]}
      {unresolved ? " · unresolved" : ""}
    </span>
  );
}
