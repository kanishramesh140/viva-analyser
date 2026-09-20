import { summariseClipboardActivity } from "./pasteDetector.js";
import { summariseFocusEvents } from "./focusTracker.js";

export function buildIntegritySummary(events = []) {
  const focus = summariseFocusEvents(events);
  const clipboard = summariseClipboardActivity(events);

  return {
    eventCount: events.length,
    focus,
    clipboard,
    reviewRequired:
      clipboard.total > 0 ||
      focus.hiddenCount > 0 ||
      focus.blurCount > 0,
  };
}
