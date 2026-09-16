# Viva analyser

A local, offline, self-learning oral-exam (viva) app. Any number of faculty
can register their own account and choose which subjects they teach.
Students are examined subject by subject; questions get harder or easier
based on each answer; wrong answers get an indirect hint instead of the
solution; and every transcript is written straight into the responsible
faculty member's own folder on this machine — nothing is ever sent to the
cloud, and no faculty member can ever see another's data.

---

## 1. Project structure
viva-analyser/
├── package.json # root convenience scripts
├── .gitignore
├── README.md
│
├── server/ # Node/Express backend — local host only
│ ├── package.json
│ ├── .env.example
│ ├── data/ # created at runtime — nothing here ships
│ │ ├── faculty_accounts.json # hashed faculty credentials
│ │ ├── subject_faculty.json # which faculty teach which subject
│ │ └── faculty/ # one real folder per faculty username
│ │ └── .gitkeep # e.g. data/faculty/dmenon/21AU045_...json
│ └── src/
│ ├── index.js # Express app entry point
│ ├── config.js # env-driven config
│ ├── middleware/
│ │ ├── errorHandler.js
│ │ ├── requireAuth.js # resolves session cookie -> faculty identity
│ │ └── rateLimit.js # brute-force throttling for auth routes
│ ├── routes/
│ │ ├── auth.js # register / login / logout / me
│ │ ├── subjects.js # PUBLIC, read-only subject+faculty listing
│ │ ├── faculty.js # AUTH-ONLY, everything scoped to "me"
│ │ └── viva.js # start / answer / finish a viva session
│ └── services/
│ ├── accounts.js # password hashing, lockout, account storage
│ ├── sessions.js # in-memory session store with expiry
│ ├── subjects.js # subject <-> faculty association (source of truth)
│ ├── questionBank.js # preset offline question banks
│ ├── vivaLogic.js # tier progression + local answer checking
│ ├── aiEngine.js # local Ollama model, or offline fallback
│ └── storage.js # reads/writes faculty folders on disk
│
└── client/ # React (Vite) frontend
├── package.json
├── vite.config.js
├── index.html
└── src/
├── main.jsx
├── App.jsx # screen routing, auth state, warning banner
├── api.js # fetch wrapper to the local server
├── theme.js # colors, fonts, tier labels
├── index.css
├── hooks/
│ └── useTabWarning.js # detects leaving the viva tab/window
└── components/
├── Home.jsx
├── Login.jsx
├── Register.jsx
├── FacultyDashboard.jsx # manage subjects taught, browse own students
├── SubjectPicker.jsx # student-facing, read-only
├── StudentSetup.jsx
├── VivaSession.jsx
├── VivaSummary.jsx
├── Ledger.jsx
├── TierBadge.jsx
└── NoPasteField.jsx

---

## 2. The security model (read this before deploying to many faculty)

The core problem this version solves: once many faculty you don't
personally know are using the same instance, a "faculty name" typed into a
text box is not an identity — anyone could type anyone else's name. So
identity is now a real account, and the API is built so that **a faculty
name or username is never accepted from the client for anything that
matters.**

- **Accounts, not free text.** Any faculty member registers their own
  username + password. Passwords are hashed with `scrypt` (Node's built-in,
  no extra native dependency) with a random salt per account, compared with
  a timing-safe check.
- **Sessions live server-side.** Login sets an `httpOnly`, `SameSite=Strict`
  cookie holding a random 32-byte session id; the actual session data
  (which account, when it expires) lives only in server memory, never in
  the cookie itself. Sessions expire after 12 hours.
- **Every faculty-only route reads identity from the session, never from
  the URL or body.** There is deliberately no `GET /api/faculty/:name`
  anywhere — only `GET /api/faculty/me/...`. A signed-in faculty member
  physically cannot request another faculty member's folder; the route
  doesn't accept a name to ask for.
- **Folders are named after the account's username, not a typed display
  name.** This avoids collisions (two "Dr. Smith"s) and stops folder-name
  spoofing. Filenames read back from disk are validated against a strict
  pattern before being opened, closing path traversal.
- **Students can't invent a subject or a faculty member.** The student flow
  only ever lists subjects a real, authenticated account has opted into,
  and only ever submits to a `facultyUsername` the server has verified
  actually teaches that subject (`POST /api/viva/start` checks this and
  rejects otherwise).
- **Students can't poison the question generator.** In the previous
  single-file version, the client could send arbitrary "reference notes" to
  the AI question engine — a student could have stuffed it with trivial
  content. Now `topic`/`notes` are looked up server-side from what the
  *faculty member* saved when they added the subject; the student's request
  can't touch them at all.
- **Brute-force defenses.** Each account locks for 15 minutes after 5
  failed password attempts; a separate per-IP rate limit throttles the auth
  endpoints generally; login returns the same generic error for "no such
  user" and "wrong password" so it can't be used to enumerate accounts.
- **No cut / copy / paste**, tab-exit warnings, and a typing-timing check
  on answers are unchanged from before — see §4.

What this does **not** do, honestly: it doesn't verify a student's identity
(no student accounts), and the tab-exit "warning" can only detect the tab
losing focus, not which other site or app was opened — a browser genuinely
cannot see that. Both are called out again in the feature table below
rather than overstated.

---

## 3. What's implemented, mapped to the spec

| Spec point | Where it lives |
|---|---|
| Many faculty, unknown to each other, can all use it safely | `accounts.js` + `sessions.js` + `requireAuth.js` — self-service registration, hashed passwords, session cookies, and every faculty-only route scoped to `req.faculty` from the session, never client input. |
| No possibility of one faculty seeing another's data | No route ever accepts a faculty identifier from the client (see §2). Folder access is `/api/faculty/me/...` only. |
| Works for **any subject** | `FacultyDashboard.jsx` → "Teach a subject" — pick an existing one or add a brand-new one with topic + optional reference notes. Two subjects ship as fast offline presets (Engine systems, Human physiology); everything else is AI-generated, grounded in what that faculty member wrote. |
| Adaptive difficulty, no menu for the student | `vivaLogic.js` (`nextTier`) on the server — tier moves up after a correct answer, down after an unresolved one. |
| Wrong answer → indirect hint, never the answer | `aiEngine.js` system prompt explicitly forbids stating the answer; preset subjects use hand-written indirect hints. Up to 2 hints per question. |
| No cloud storage; per-faculty folders on disk | `storage.js` writes one JSON file per submission into `server/data/faculty/<username>/`. No database, no external network call for storage. |
| Runs locally, "local host used for web" | Express binds to `localhost`; client talks to it over `http://localhost:4000`; production build is served by that same local process (§6). |
| "AI app → locally run" / Edge AI / Raspberry Pi | `aiEngine.js` calls a **local** [Ollama](https://ollama.com) model if one is running (zero cloud calls) and falls back to a fully offline template generator otherwise — see §5 and §7. |
| No cut / copy / paste | `NoPasteField.jsx` blocks paste, cut, copy, drag-drop and right-click on the answer box; question and transcript views also block copy. |
| Typing-timing check | Each question is timed server-side; an answer that's long but submitted implausibly fast is rejected and the student is asked to type it themselves. |
| Leaving the tab → warning, then continue to finish | `useTabWarning.js` — a banner fires and a count is logged into the summary and the faculty's view of that transcript; the viva itself is not interrupted. |

---

## 4. Requirements

- **Node.js 18 or newer** (for global `fetch`, `crypto.scrypt`, `crypto.randomUUID`)
- npm (comes with Node)
- *Optional, for real AI-generated questions on custom subjects:*
  [Ollama](https://ollama.com) running locally. Without it, custom subjects
  still work using a simpler offline template generator (§5).

---

## 5. First-time setup

```bash
# from the project root
npm run install:all
```

This runs `npm install` inside both `server/` and `client/`.

(Optional, for full local AI question generation on any subject:)

```bash
ollama pull llama3.2:1b
ollama serve
```

A small model like `llama3.2:1b` or `phi3:mini` fits comfortably on a
laptop or a Raspberry Pi. Without Ollama running, the app still works end
to end — the two preset subjects always work fully offline, and any custom
subject falls back to a simpler notes-based question generator.

Copy the server environment file if you want to change any defaults:

```bash
cp server/.env.example server/.env
```

---

## 6. Running it

Open two terminals from the project root.

**Terminal 1 — backend:**
```bash
cd server
npm run dev
```
Starts the API at `http://localhost:4000`.

**Terminal 2 — frontend:**
```bash
cd client
npm run dev
```
Starts the app at `http://localhost:5173` — open that in a browser.

### First run walkthrough

1. Open the app, click **Faculty sign in → Create an account**. Any teacher
   can do this themselves — no admin step required.
2. From the dashboard, click **Teach a subject** — either pick one of the
   two offline presets or add a brand-new subject with a topic and (optionally) reference notes.
3. Open **Take a viva** as a student — the subject now appears, with that
   faculty member listed as an examiner.

### Single-command production run (one port, e.g. a Raspberry Pi)

```bash
npm run start
```
Builds the client and starts the server, which serves the built client
itself — the whole app then runs from a single `http://localhost:4000`.

---

## 7. Deploying to a Raspberry Pi (Edge AI)

```bash
git clone <this project> viva-analyser
cd viva-analyser
npm run install:all
npm run start
```

To keep it running across reboots:

```bash
npm install -g pm2
pm2 start server/src/index.js --name viva-analyser
pm2 save
pm2 startup
```

For on-device AI question generation, install Ollama on the Pi and pull a
small quantized model (`llama3.2:1b`) — the whole app, including question
generation, then runs with no internet connection at all.

---

## 8. Where data actually lives
server/data/
├── faculty_accounts.json # username, hashed+salted password, lockout state
├── subject_faculty.json # { "Data structures": { topic, notes, faculty: ["dmenon"] } }
└── faculty/
├── dmenon/
│ ├── 21au045_1719999999999.json
│ └── 21au051_1720000012345.json
└── jdoe/
└── ...

Each transcript file is one completed viva: student name/ID, subject, the
full question-by-question record (question, hints given, every attempt,
whether it was resolved, time taken), and the tab-exit warning count. Only
the matching faculty account can ever read its own folder — there is no
route, public or otherwise, that lists or reads another faculty member's
folder.
