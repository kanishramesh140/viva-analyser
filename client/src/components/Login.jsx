import React, { useState } from "react";
import { COLORS, FONTS } from "../theme.js";
import { login } from "../api.js";

export default function Login({ onLoggedIn, onGoRegister, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const account = await login({ username: username.trim(), password });
      onLoggedIn(account);
    } catch (e) {
      setError(e.message || "Couldn't sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "56px 24px" }}>
      <h2 style={{ fontFamily: FONTS.serif, fontSize: 24, color: COLORS.ink, margin: "0 0 24px" }}>Faculty sign in</h2>

      <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.inkSoft }}>Username</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="your.username"
        autoComplete="username"
        style={inputStyle}
      />

      <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.inkSoft }}>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="••••••••"
        autoComplete="current-password"
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
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkSoft, margin: "16px 0 0" }}>
        New faculty member?{" "}
        <button
          onClick={onGoRegister}
          style={{ background: "transparent", border: "none", color: COLORS.rust, cursor: "pointer", fontFamily: FONTS.sans, fontSize: 13, textDecoration: "underline", padding: 0 }}
        >
          Create an account
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
