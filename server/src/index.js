import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { PORT, CLIENT_ORIGIN } from "./config.js";
import authRouter from "./routes/auth.js";
import subjectsRouter from "./routes/subjects.js";
import facultyRouter from "./routes/faculty.js";
import vivaRouter from "./routes/viva.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { aiStatus } from "./services/aiEngine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Cookies carry the faculty session, so CORS must allow credentials and
// name an exact origin (never "*") — this only matters during development,
// when the Vite dev server (a different port) calls this API. In
// production the built client is served by this same process, so these
// requests become same-origin and this block is effectively unused.
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (req, res) => {
  const ai = await aiStatus();
  res.json({ ok: true, ai });
});

app.use("/api/auth", authRouter);
app.use("/api/subjects", subjectsRouter);
app.use("/api/faculty", facultyRouter);
app.use("/api/viva", vivaRouter);

// Serve the built client (npm run build in /client) if it exists, so a
// single `npm start` on a Raspberry Pi can serve the whole app on one port
// with no cross-origin requests at all.
const clientDist = path.join(__dirname, "..", "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Viva analyser server running at http://localhost:${PORT} (local only, no cloud)`);
});