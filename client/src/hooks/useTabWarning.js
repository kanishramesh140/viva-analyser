import { useEffect, useState } from "react";

// Detects the closest available proxy for "the student left the viva":
// the tab going hidden, or the window losing focus. A page genuinely
// cannot see which other site or app the student switched to — this is
// the most a browser can observe, so a warning (not a hard block) is
// the honest response.
export default function useTabWarning(active) {
  const [warningCount, setWarningCount] = useState(0);
  const [warnToast, setWarnToast] = useState(false);

  useEffect(() => {
    if (!active) return undefined;
    const trigger = () => {
      setWarningCount((c) => c + 1);
      setWarnToast(true);
      setTimeout(() => setWarnToast(false), 4000);
    };
    const onVisibility = () => {
      if (document.hidden) trigger();
    };
    const onBlur = () => trigger();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, [active]);

  const reset = () => setWarningCount(0);

  return { warningCount, warnToast, reset };
}
