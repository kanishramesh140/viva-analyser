import React, { useEffect, useRef, useState } from "react";
import { COLORS, FONTS, QUESTIONS_PER_VIVA } from "../theme.js";
import TierBadge from "./TierBadge.jsx";
import Ledger from "./Ledger.jsx";
import NoPasteField from "./NoPasteField.jsx";
import { startViva, submitAnswer } from "../api.js";

export default function VivaSession({ session, warningCount, onFinish }) {
  const [sessionId, setSessionId] = useState(null);
  const [tier, setTier] = useState("moderate");
  const [question, setQuestion] = useState("");
  const [domainLabel, setDomainLabel] = useState(session?.domainLabel || session?.topic || session?.subject || "Viva");
  const [transcript, setTranscript] = useState([]);
  const [answer, setAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [notice, setNotice] = useState("");
  const [inputError, setInputError] = useState("");
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const startedAt = useRef(Date.now());

  useEffect(() => {
    startViva({
      subject: session.subject,
      facultyUsername: session.facultyUsername,
      name: session.name,
      studentId: session.studentId,
    })
      .then((r) => {
        setSessionId(r.sessionId);
        setQuestion(r.question);
        setTier(r.tier);
        setDomainLabel(r.domainLabel);
        startedAt.current = Date.now();
        setLoading(false);
      })
      .catch((e) => {
        setServerError(e.message || "Couldn't start the viva. Check the local server and try again.");
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!answer.trim()) {
      setInputError("Type an answer before submitting.");
      return;
    }
    const elapsed = Math.round((Date.now() - startedAt.current) / 1000);
    const minPlausible = Math.min(answer.trim().length * 0.05, 6);
    if (answer.trim().length > 25 && elapsed < minPlausible) {
      setInputError("That was typed unusually fast for its length — please answer in your own time.");
      return;
    }
    setInputError("");
    setServerError("");
    setLoading(true);
    try {
      const r = await submitAnswer(sessionId, answer.trim());
      if (r.finished) {
        onFinish(r.transcript, sessionId);
        return;
      }
      if (r.hint) {
        setAttempts([...attempts, answer.trim()]);
        setHintsUsed([...hintsUsed, r.hint]);
        setNotice("Not quite — here's a hint. Revise your answer and submit again.");
        setAnswer("");
        setLoading(false);
        startedAt.current = Date.now();
        return;
      }
      // Correct, or moved on after exhausting hints: log the finished
      // question locally for the on-screen ledger, then show the next one.
      setTranscript([
        ...transcript,
        { question, tier, hintsUsed, attempts: [...attempts, answer.trim()], correct: !!r.correct, timeTakenSec: elapsed },
      ]);
      setQuestion(r.question);
      setTier(r.tier);
      setHintsUsed([]);
      setAttempts([]);
      setAnswer("");
      setNotice("");
      setLoading(false);
      startedAt.current = Date.now();
    } catch (e) {
      setLoading(false);
      setServerError(e.message || "Couldn't reach the local server to check that answer. Try again.");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "70vh" }}>
      <aside style={{ width: 220, flexShrink: 0, padding: "40px 20px", borderRight: `1px solid ${COLORS.line}` }}>
        {domainLabel && (
          <p style={{ fontFamily: FONTS.sans, fontSize: 11, fontWeight: 600, color: COLORS.rust, letterSpacing: 0.4, margin: "0 0 4px" }}>
            {domainLabel.toUpperCase()}
          </p>
        )}
        <p style={{ fontFamily: FONTS.serif, fontSize: 16, color: COLORS.ink, margin: "0 0 20px" }}>{session.subject}</p>
        <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.inkSoft, margin: "0 0 2px" }}>{session.name}</p>
        <p style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.inkSoft, margin: "0 0 2px" }}>{session.studentId}</p>
        <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.inkSoft, margin: "0 0 24px" }}>Faculty: {session.facultyName}</p>
        <p style={{ fontFamily: FONTS.sans, fontSize: 11, fontWeight: 600, color: COLORS.inkSoft, margin: "0 0 8px" }}>Progress</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
          {transcript.map((t, i) => (
            <TierBadge key={i} tier={t.tier} unresolved={!t.correct} />
          ))}
          <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.inkSoft }}>
            question {Math.min(transcript.length + 1, QUESTIONS_PER_VIVA)} of {QUESTIONS_PER_VIVA}
          </span>
        </div>
        {warningCount > 0 && (
          <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.danger, margin: 0 }}>
            {warningCount} tab-exit warning{warningCount === 1 ? "" : "s"} logged
          </p>
        )}
      </aside>

      <main style={{ flex: 1, padding: "40px 40px 60px", maxWidth: 640 }} onCopy={(e) => e.preventDefault()}>
        {transcript.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <Ledger transcript={transcript} />
          </div>
        )}

        {loading && <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkSoft }}>Preparing the next question…</p>}

        {!loading && serverError && (
          <div>
            <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.danger, margin: "0 0 12px" }}>{serverError}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                background: COLORS.raised,
                border: `1px solid ${COLORS.line}`,
                borderRadius: 4,
                fontFamily: FONTS.sans,
                fontSize: 13,
                color: COLORS.ink,
              }}
            >
              Reload
            </button>
          </div>
        )}

        {!loading && !serverError && question && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <TierBadge tier={tier} />
              <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.inkSoft }}>Q{transcript.length + 1}</span>
            </div>
            <p style={{ fontFamily: FONTS.serif, fontSize: 19, color: COLORS.ink, lineHeight: 1.4, margin: "0 0 16px" }}>{question}</p>

            {hintsUsed.map((h, i) => (
              <p
                key={i}
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 13,
                  color: COLORS.gold,
                  margin: "0 0 8px",
                  paddingLeft: 12,
                  borderLeft: `2px solid ${COLORS.amberBg}`,
                }}
              >
                Hint {i + 1}: {h}
              </p>
            ))}
            {notice && <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.danger, margin: "0 0 10px" }}>{notice}</p>}

            <NoPasteField
              value={answer}
              onChange={setAnswer}
              placeholder="Type your answer here — pasting is disabled"
              onBlockedPaste={() => setInputError("That looks pasted. Please type your own answer.")}
            />
            {inputError && <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.danger, margin: "6px 0 0" }}>{inputError}</p>}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.inkSoft, margin: 0 }}>
                {QUESTIONS_PER_VIVA - transcript.length} question{QUESTIONS_PER_VIVA - transcript.length === 1 ? "" : "s"} remaining
              </p>
              <button
                onClick={submit}
                style={{
                  padding: "9px 20px",
                  cursor: "pointer",
                  background: COLORS.ink,
                  color: COLORS.paper,
                  border: "none",
                  borderRadius: 4,
                  fontFamily: FONTS.sans,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Submit answer
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
