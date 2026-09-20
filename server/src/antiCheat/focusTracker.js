export function summariseFocusEvents(events = []) {
  let hiddenCount = 0;
  let visibleCount = 0;
  let blurCount = 0;
  let focusCount = 0;

  for (const event of events) {
    switch (event.type) {
      case "TAB_HIDDEN":
        hiddenCount += 1;
        break;
      case "TAB_VISIBLE":
        visibleCount += 1;
        break;
      case "WINDOW_BLUR":
        blurCount += 1;
        break;
      case "WINDOW_FOCUS":
        focusCount += 1;
        break;
      default:
        break;
    }
  }

  return {
    hiddenCount,
    visibleCount,
    blurCount,
    focusCount,
  };
}
