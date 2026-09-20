function timestamp() {
  return new Date().toISOString();
}

export function logInfo(message, meta = {}) {
  console.log(
    JSON.stringify({
      level: "info",
      timestamp: timestamp(),
      message,
      meta,
    })
  );
}

export function logWarn(message, meta = {}) {
  console.warn(
    JSON.stringify({
      level: "warn",
      timestamp: timestamp(),
      message,
      meta,
    })
  );
}

export function logError(message, meta = {}) {
  console.error(
    JSON.stringify({
      level: "error",
      timestamp: timestamp(),
      message,
      meta,
    })
  );
}
