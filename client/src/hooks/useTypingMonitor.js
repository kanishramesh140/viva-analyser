import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export function useTypingMonitor(
  enabled = true
) {
  const [stats, setStats] =
    useState({
      keypresses: 0,
      backspaces: 0,
      firstKeyAt: null,
      lastKeyAt: null,
      durationMs: 0,
    });

  const startedAtRef =
    useRef(null);

  const keypressesRef =
    useRef(0);

  const backspacesRef =
    useRef(0);

  const reset =
    useCallback(() => {
      startedAtRef.current =
        null;

      keypressesRef.current =
        0;

      backspacesRef.current =
        0;

      setStats({
        keypresses: 0,
        backspaces: 0,
        firstKeyAt: null,
        lastKeyAt: null,
        durationMs: 0,
      });
    }, []);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const onKeyDown =
      (event) => {
        if (
          !startedAtRef.current
        ) {
          startedAtRef.current =
            Date.now();
        }

        keypressesRef.current +=
          1;

        if (
          event.key ===
          "Backspace"
        ) {
          backspacesRef.current +=
            1;
        }

        const now =
          Date.now();

        setStats({
          keypresses:
            keypressesRef.current,

          backspaces:
            backspacesRef.current,

          firstKeyAt:
            startedAtRef.current,

          lastKeyAt:
            now,

          durationMs:
            now -
            startedAtRef.current,
        });
      };

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [enabled]);

  const snapshot =
    useCallback(() => {
      const now =
        Date.now();

      return {
        keypresses:
          keypressesRef.current,

        backspaces:
          backspacesRef.current,

        firstKeyAt:
          startedAtRef.current,

        lastKeyAt:
          stats.lastKeyAt,

        durationMs:
          startedAtRef.current
            ? now -
              startedAtRef.current
            : 0,
      };
    }, [stats.lastKeyAt]);

  return {
    stats,
    snapshot,
    reset,
  };
}
