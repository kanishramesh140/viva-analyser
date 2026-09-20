import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import fs from "node:fs";
import { promises as fsPromises } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  PORT,
  CLIENT_ORIGIN,
} from "./config.js";

import authRouter from "./routes/auth.js";
import subjectsRouter from "./routes/subjects.js";
import facultyRouter from "./routes/faculty.js";
import studentRouter from "./routes/student.js";
import vivaRouter from "./routes/viva.js";
import analyticsRouter from "./routes/analytics.js";

import {
  errorHandler,
} from "./middleware/errorHandler.js";

import {
  aiStatus,
} from "./services/aiEngine.js";

const __dirname =
  path.dirname(
    fileURLToPath(
      import.meta.url
    )
  );

const app =
  express();

app.use(
  cors({
    origin:
      CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(
  cookieParser()
);

app.use(
  express.json({
    limit: "2mb",
  })
);

const dataDirs = [
  "data",
  "data/faculty",
  "data/documents",
  "data/subjects",
  "data/sessions",
  "data/audit",
];

for (
  const dir of dataDirs
) {
  await fsPromises.mkdir(
    path.join(
      process.cwd(),
      dir
    ),
    { recursive: true }
  );
}

app.get(
  "/api/health",
  async (req, res) => {
    const ai =
      await aiStatus();

    res.json({
      ok: true,
      service:
        "Viva Analyser API",
      ai,
      timestamp:
        new Date().toISOString(),
    });
  }
);

app.use(
  "/api/auth",
  authRouter
);

app.use(
  "/api/subjects",
  subjectsRouter
);

app.use(
  "/api/faculty",
  facultyRouter
);

app.use(
  "/api/student",
  studentRouter
);

app.use(
  "/api/viva",
  vivaRouter
);

app.use(
  "/api/analytics",
  analyticsRouter
);

const clientDist =
  path.join(
    __dirname,
    "..",
    "..",
    "client",
    "dist"
  );

if (
  fs.existsSync(
    clientDist
  )
) {
  app.use(
    express.static(
      clientDist
    )
  );

  app.get(
    /^(?!\/api).*/,
    (req, res) => {
      res.sendFile(
        path.join(
          clientDist,
          "index.html"
        )
      );
    }
  );
}

app.use(
  errorHandler
);

app.listen(
  PORT,
  () => {
    console.log(
      `Viva Analyser server running at http://localhost:${PORT}`
    );
  }
);

