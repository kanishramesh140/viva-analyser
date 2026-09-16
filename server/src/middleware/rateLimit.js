const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 20;
const buckets = new Map();

export function authRateLimit(req, res, next) {
  const key = req.ip || "unknown";
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    return res.status(429).json({ error: "Too many attempts from this device. Please wait a few minutes and try again." });
  }
  next();
}
