import React, { useRef } from "react";
import { COLORS, FONTS } from "../theme.js";

export default function NoPasteField({ value, onChange, onBlockedPaste, placeholder, rows = 4 }) {
  const lastLen = useRef(0);
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onPaste={(e) => {
        e.preventDefault();
        onBlockedPaste();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onBlockedPaste();
      }}
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onChange={(e) => {
        const v = e.target.value;
        // A jump of more than a handful of characters in one change event
        // is not normal keystroke input — treat it as a blocked paste that
        // slipped past the paste handler (e.g. via an IME or extension).
        if (v.length - lastLen.current > 8) {
          onBlockedPaste();
          lastLen.current = v.length;
          return;
        }
        lastLen.current = v.length;
        onChange(v);
      }}
      style={{
        width: "100%",
        fontFamily: FONTS.mono,
        fontSize: 14,
        lineHeight: 1.6,
        color: COLORS.ink,
        background: COLORS.raised,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 4,
        padding: "10px 12px",
        resize: "vertical",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}