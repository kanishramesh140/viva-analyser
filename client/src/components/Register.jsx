import React, { useState } from "react";
import { COLORS, FONTS } from "../theme.js";
import { register } from "../api.js";

export default function Register({ onLoggedIn, onGoLogin, onBack }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || !username.trim() || !password) {
      setError("Fill in your name, a username, and a password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const account = await register({ username: username.trim(), name: name.trim(), password });
      onLoggedIn(account);
    } catch (e) {
      setError(e.message || "Couldn't create that account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "56px 24px" }}>
      <h2 style={{ fontFamily: FONTS.serif, fontSize: 24, color: COLORS.ink, margin: "0 0 4px" }}>Create a faculty account</h2>
      <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkSoft, margin: "0 0 24px" }}>
        Any faculty member can register. Your account only ever sees the students and subjects you add yourself.
      </p>

      <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.inkSoft }}>Full name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dr. Priya Menon" autoComplete="name" style={inputStyle} />

      <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.inkSoft }}>Username</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="letters, numbers, . _ - only"
        autoComplete="username"
        style={inputStyle}
      />

      <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.inkSoft }}>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 8 characters"
        autoComplete="new-password"
        style={inputStyle}
      />

      <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.inkSoft }}>Confirm password</label>
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoComplete="new-password"
        style={inputStyle}
      />

      {error && <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.danger, margin: "0 0 12px" }}>{error}</p>}

      <button
        onClick={submit}
        disabled={loading}
        style={{
          width: "100%",
          padding: "11px 0",
          cursor: loading ? "default" : "pointer",
          background: COLORS.rust,
          color: "#FBF4EF",
          border: "none",
          borderRadius: 4,
          fontFamily: FONTS.sans,
          fontSize: 14,
          fontWeight: 600,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkSoft, margin: "16px 0 0" }}>
        Already registered?{" "}
        <button
          onClick={onGoLogin}
          style={{ background: "transparent", border: "none", color: COLORS.rust, cursor: "pointer", fontFamily: FONTS.sans, fontSize: 13, textDecoration: "underline", padding: 0 }}
        >
          Sign in
        </button>
      </p>
      <button
        onClick={onBack}
        style={{ marginTop: 20, background: "transparent", border: "none", color: COLORS.inkSoft, cursor: "pointer", fontFamily: FONTS.sans, fontSize: 12, textDecoration: "underline", padding: 0 }}
      >
        Back to start
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
