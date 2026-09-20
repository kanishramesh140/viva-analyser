import { useCallback, useEffect, useRef, useState } from "react";

export function useMalpracticeDetection(enabled = true) {
  const [events, setEvents] = useState([]);
  const startedAtRef = useRef(Date.now());

  const addEvent = useCallback((type, details = {}) => {
    const event = {
      type,
      timestamp: new Date().toISOString(),
      elapsedMs: Date.now() - startedAtRef.current,
      details,
    };

    setEvents((current) => [...current, event]);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const onVisibilityChange = () => {
      if (document.hidden) {
        addEvent("TAB_HIDDEN");
      } else {
        addEvent("TAB_VISIBLE");
      }
    };

    const onWindowBlur = () => addEvent("WINDOW_BLUR");
    const onWindowFocus = () => addEvent("WINDOW_FOCUS");

    const onCopy = (event) => {
      event.preventDefault();
      addEvent("COPY_ATTEMPT");
    };

    const onCut = (event) => {
      event.preventDefault();
      addEvent("CUT_ATTEMPT");
    };

    const onPaste = (event) => {
      event.preventDefault();
      addEvent("PASTE_ATTEMPT");
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("focus", onWindowFocus);

    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("paste", onPaste);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange
      );
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("focus", onWindowFocus);

      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("paste", onPaste);
    };
  }, [addEvent, enabled]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    addEvent,
    clearEvents,
  };
}
