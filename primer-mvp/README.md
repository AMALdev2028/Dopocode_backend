# The Primer — Adaptive Tutor MVP

A working adaptive AI tutor for Class 3–5 fractions: gentle placement, real-time
difficulty adjustment, an "explain why" check that catches correct-but-rote
answers, streaks, and a parent/teacher progress view. Built as the Round 4 MVP,
separate from the Round 3 landing page.

## How it's built

- **Frontend:** Vite + React + TypeScript + Tailwind (same visual theme as the landing page)
- **Backend:** Node.js + Express
- **Database:** SQLite (file-based, zero setup — `server/data.sqlite`, created automatically)
- **AI:** Anthropic Claude API for grading "explain why" answers and for translation.
  **Works fully without an API key too** — falls back to a keyword-based heuristic
  grader and a small static translation dictionary, so the app never breaks if a
  key isn't set.
- **Voice in/out:** the browser's built-in Web Speech API — no key, no external
  service. A speaker icon reads any question aloud; a mic icon lets a child speak
  their "why" explanation instead of typing it. If a browser doesn't support one
  of these (patchy in Firefox), the button just doesn't render — nothing else
  depends on it.

The adaptive logic (what question comes next, how difficulty/streak/mastery
change) is deterministic and lives entirely in `server/src/adaptiveEngine.js` —
no LLM involved in choosing questions, only in judging understanding and
translating text. This matches the architecture from the pitch deck.

## What's in it

- **Question bank:** 120 questions across 4 subjects (Fractions, Addition & Subtraction, Multiplication, Decimals), 5 difficulty tiers each with 6 questions per tier, plus 3 warm-up questions per subject for placement. The child picks a subject on the name-entry screen.
- **Offline grader:** keyword-based heuristic that catches restated answers ("both are correct" repeated verbatim) and no-reasoning guesses ("idk", "i guessed"), separate from genuine step-by-step explanations - tuned to reduce false "understood" verdicts. Has separate reasoning-word lists for English, Hindi, and Telugu, so a real explanation written in Hindi or Telugu is graded on its own merits rather than being marked "rote" for not containing English keywords.
- **Points & streaks:** every answer earns points (correct answers more than wrong ones, but wrong answers still earn participation credit), explanations add or subtract a bonus depending on verdict, and a day-streak counter tracks consecutive calendar days of practice - visible as a monthly calendar in the parent dashboard
- **Voice in/out:** browser-native, no API key required
- **Multilingual:** picking Hindi or Telugu translates the question, its choices, and the
  explanation shown after answering - one batched Claude API call per question, not one
  call per field. **Without an API key this is an honest no-op**: it shows the original
  English rather than pretending to translate, since the small offline dictionary only
  covers a few fixed UI phrases, not arbitrary question text. The child's chosen language
  also sets the voice recognition/synthesis locale either way.

## Project structure

```
primer-mvp/
  server/
    src/
      db.js              SQLite schema + connection
      questionBank.js     Question tree - 4 subjects x 5 difficulty tiers + warm-ups
      adaptiveEngine.js   Difficulty/mastery/streak logic, dashboard aggregation
      stats.js            Points and daily-streak tracking (separate from in-session streak)
      claude.js           Claude API wrapper with offline heuristic fallback
      routes.js           REST API endpoints
      index.js            Server entrypoint (also serves the built client)
    .env.example
  client/
    src/
      components/         NameEntry, Warmup, TutorSession, Dashboard, Header, StreakCalendar
      speech.ts           Web Speech API wrapper (read-aloud + speech-to-text)
      api.ts              Typed fetch wrapper for the backend
      App.tsx
```

## Running it locally

**1. Install dependencies (both folders):**

```
cd server && npm install
cd ../client && npm install
```

**2. (Optional) Add a real Claude API key:**

```
cd server
cp .env.example .env
# then edit .env and paste your key into ANTHROPIC_API_KEY=
```

Without this step the app still works completely — it just uses the offline
heuristic grader instead of real Claude grading.

**3. Run both together for development:**

Terminal 1:
```
cd server
npm run dev
```

Terminal 2:
```
cd client
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`) — it proxies API
calls to the backend on port 4000 automatically.

**4. Run as a single combined app (closer to production):**

```
cd client && npm run build
cd ../server && npm start
```

Open `http://localhost:4000` — the backend now serves the built frontend
directly, so it's one process, one port.

## Deploying

This needs a real running server (not a static host like Vercel/Netlify,
since it uses a persistent SQLite file). **Render.com** (free tier) is a good
fit:

1. Push this `primer-mvp` folder to your GitHub repo
2. On Render: New → Web Service → connect the repo
3. Root directory: `primer-mvp/server`
4. Build command: `cd ../client && npm install && npm run build && cd ../server && npm install`
5. Start command: `npm start`
6. Add environment variable `ANTHROPIC_API_KEY` if you want live grading/translation
7. Render gives you a persistent disk by default on the free tier for the SQLite file — no extra config needed for a demo

Round 4 doesn't require a public link the way Round 3 did, so running this
locally on your laptop during the live demo is also completely fine.

## Demo script

1. Enter a name, pick a language, do the 3-question warm-up
2. Answer a couple of questions correctly in a row — watch the difficulty
   climb and the streak flame light up
3. At difficulty 3+, a correct answer triggers "now tell me why" — type a
   real explanation once, then type something like "idk" another time, to
   show the tutor telling the difference
4. Open the parent view (top-right icon) to show mastery, streak, and the
   "needs help" flag triggering even on a correct-answer streak if the
   explanations were weak
