import { useState } from "react";

import {
  login,
  register,
  forgotPassword,
} from "../../api/auth.js";

function PasswordField({
  value,
  onChange,
  placeholder,
  name,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="current-password"
        required
      />

      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("student");

  const [username, setUsername] = useState("");
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [generatedRecoveryCode, setGeneratedRecoveryCode] =
    useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function clearMessages() {
    setMessage("");
    setError("");
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    clearMessages();
  }

  function changeRole(nextRole) {
    setRole(nextRole);
    clearMessages();
  }

  async function handleLogin(event) {
    event.preventDefault();

    clearMessages();
    setLoading(true);

    try {
      const result = await login(role, {
        username,
        password,
      });

      setMessage("Login successful.");

      onAuthenticated(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    clearMessages();
    setGeneratedRecoveryCode("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username,
        name,
        password,
      };

      if (role === "student") {
        payload.studentId = studentId;
      }

      const result = await register(role, payload);

      setGeneratedRecoveryCode(result.recoveryCode || "");

      setMessage(
        "Registration successful. Save your recovery code before leaving this page."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(event) {
    event.preventDefault();

    clearMessages();
    setLoading(true);

    try {
      await forgotPassword({
        role,
        username,
        recoveryCode,
        newPassword,
      });

      setMessage(
        "Password reset successfully. You can now log in."
      );

      setPassword("");
      setNewPassword("");
      setRecoveryCode("");
      setConfirmPassword("");
      setMode("login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyRecoveryCode() {
    if (!generatedRecoveryCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        generatedRecoveryCode
      );

      setMessage("Recovery code copied. Store it securely.");
    } catch {
      setError(
        "Copy failed. Please manually copy the recovery code."
      );
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand">
          <div className="brand-mark">VA</div>

          <div>
            <h1>Viva Analyser</h1>
            <p>Local adaptive viva platform</p>
          </div>
        </div>

        <div className="segmented">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => changeMode("login")}
          >
            Login
          </button>

          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => changeMode("register")}
          >
            Register
          </button>

          <button
            type="button"
            className={mode === "forgot" ? "active" : ""}
            onClick={() => changeMode("forgot")}
          >
            Forgot Password
          </button>
        </div>

        <div className="role-switch">
          <button
            type="button"
            className={role === "student" ? "active" : ""}
            onClick={() => changeRole("student")}
          >
            Student
          </button>

          <button
            type="button"
            className={role === "faculty" ? "active" : ""}
            onClick={() => changeRole("faculty")}
          >
            Faculty
          </button>
        </div>

        {mode === "login" && (
          <form
            onSubmit={handleLogin}
            className="auth-form"
          >
            <label>
              Username
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </label>

            <label>
              Password
              <PasswordField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                name="password"
              />
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        )}

        {mode === "register" && (
          <form
            onSubmit={handleRegister}
            className="auth-form"
          >
            {role === "student" && (
              <label>
                Student ID / Register Number
                <input
                  value={studentId}
                  onChange={(e) =>
                    setStudentId(e.target.value)
                  }
                  placeholder="Example: 24BEC065"
                  required
                />
              </label>
            )}

            <label>
              Full Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </label>

            <label>
              Username
              <input
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Create username"
                autoComplete="username"
                required
              />
            </label>

            <label>
              Password
              <PasswordField
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Minimum 8 characters"
                name="new-password"
              />
            </label>

            <label>
              Confirm Password
              <PasswordField
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Re-enter password"
                name="confirm-password"
              />
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : `Register as ${
                    role === "student"
                      ? "Student"
                      : "Faculty"
                  }`}
            </button>

            {generatedRecoveryCode && (
              <div className="recovery-box">
                <h3>Your Recovery Code</h3>

                <div className="recovery-code">
                  {generatedRecoveryCode}
                </div>

                <p>
                  Save this code securely. It can be used
                  to reset your password.
                </p>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={copyRecoveryCode}
                >
                  Copy Recovery Code
                </button>
              </div>
            )}
          </form>
        )}

        {mode === "forgot" && (
          <form
            onSubmit={handleForgot}
            className="auth-form"
          >
            <label>
              Username
              <input
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </label>

            <label>
              Recovery Code
              <input
                value={recoveryCode}
                onChange={(e) =>
                  setRecoveryCode(e.target.value)
                }
                placeholder="XXXX-XXXX-XXXX"
                required
              />
            </label>

            <label>
              New Password
              <PasswordField
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="Minimum 8 characters"
                name="reset-password"
              />
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <p className="offline-note">
          Runs locally. Viva answers and results stay on this system.
        </p>
      </section>
    </main>
  );
}
