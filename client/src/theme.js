export const COLORS = {
  ink: "#1C2426",
  inkSoft: "#4B5A5D",
  paper: "#E7EAE6",
  raised: "#F5F6F2",
  line: "#C8CDC4",
  rust: "#B5502E",
  rustDark: "#7C3A22",
  rustBg: "#F1DED4",
  teal: "#2B6E5C",
  tealDark: "#1B4A3D",
  tealBg: "#DCEBE5",
  danger: "#93342B",
  dangerBg: "#F3DEDA",
  amber: "#8C611B",
  amberBg: "#F1E3C4",
  gold: "#8A6A1F",
};

export const FONTS = {
  serif: "'Source Serif 4', Georgia, serif",
  sans: "'IBM Plex Sans', system-ui, -apple-system, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace",
};

export const TIER_ORDER = ["easy", "moderate", "tough", "complex"];
export const TIER_LABEL = { easy: "Easy", moderate: "Moderate", tough: "Tough", complex: "Complex" };
export const TIER_COLOR = {
  easy: { fg: COLORS.tealDark, bg: COLORS.tealBg },
  moderate: { fg: COLORS.inkSoft, bg: "#DDDFD8" },
  tough: { fg: COLORS.rustDark, bg: COLORS.rustBg },
  complex: { fg: COLORS.danger, bg: COLORS.dangerBg },
};
export const QUESTIONS_PER_VIVA = 5;
