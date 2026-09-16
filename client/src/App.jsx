import React, { useEffect, useState } from "react";
import { COLORS, FONTS } from "./theme.js";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import StudentSetup from "./components/StudentSetup.jsx";
import VivaSession from "./components/VivaSession.jsx";
import VivaSummary from "./components/VivaSummary.jsx";
import FacultyDashboard from "./components/FacultyDashboard.jsx";
import useTabWarning from "./hooks/useTabWarning.js";
import { getMe, finishViva } from "./api.js";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [account, setAccount] = useState(null); // signed-in faculty, or null
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [session, setSession] = useState(null);
  const [finishedTranscript, setFinishedTranscript] = useState(null);
  const { warningCount, warnToast, reset } = useTabWarning(screen === "viva");

  useEffect(() => {
    getMe()
      .then((me) => setAccount(me))
      .catch(() => setAccount(null))
      .finally(() => setCheckedAuth(true));
  }, []);

  const startSession = (s) => {
    reset();
    setSession(s);
    setScreen("viva");
  };

  const finishSession = async (transcript, sessionId) => {
    setFinishedTranscript(transcript);
    setScreen("summary");
    try {
      await finishViva(sessionId, warningCount);
    } catch {
      // The transcript is still shown to the student either way; if the
      // local server couldn't be reached to persist it, that's surfaced by
      // the setup/session screens' own connectivity checks instead of
      // blocking the summary the student already earned.
    }
  };

  const goFaculty = () => {
    setScreen(account ? "dashboard" : "login");
  };

  return (
    <div style={{ background: COLORS.paper, minHeight: "100%", fontFamily: FONTS.sans }}>
      <header
        style={{
          borderBottom: `1px solid ${COLORS.line}`,
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span onClick={() => setScreen("home")} style={{ fontFamily: FONTS.serif, fontSize: 15, color: COLORS.ink, cursor: "pointer" }}>
          Viva analyser
        </span>
        <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.inkSoft }}>local host · offline</span>
      </header>

      {warnToast && (
        <div style={{ background: COLORS.dangerBg, borderBottom: `1px solid ${COLORS.danger}`, padding: "10px 24px" }}>
          <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.danger, margin: 0, fontWeight: 600 }}>
            You left the viva tab. This has been logged.
          </p>
        </div>
      )}

      {!checkedAuth && screen === "home" ? null : (
        <>
          {screen === "home" && <Home onPick={(r) => (r === "student" ? setScreen("setup") : goFaculty())} />}

          {screen === "login" && (
            <Login
              onLoggedIn={(acc) => {
                setAccount(acc);
                setScreen("dashboard");
              }}
              onGoRegister={() => setScreen("register")}
              onBack={() => setScreen("home")}
            />
          )}

          {screen === "register" && (
            <Register
              onLoggedIn={(acc) => {
                setAccount(acc);
                setScreen("dashboard");
              }}
              onGoLogin={() => setScreen("login")}
              onBack={() => setScreen("home")}
            />
          )}

          {screen === "dashboard" && account && (
            <FacultyDashboard
              account={account}
              onLoggedOut={() => {
                setAccount(null);
                setScreen("home");
              }}
              onDone={() => setScreen("home")}
            />
          )}

          {screen === "setup" && <StudentSetup onStart={startSession} />}

          {screen === "viva" && session && <VivaSession session={session} warningCount={warningCount} onFinish={finishSession} />}

          {screen === "summary" && session && finishedTranscript && (
            <VivaSummary session={session} transcript={finishedTranscript} warningCount={warningCount} onDone={() => setScreen("home")} />
          )}
        </>
      )}
    </div>
  );
}