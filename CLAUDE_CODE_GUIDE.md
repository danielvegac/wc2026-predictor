# WC2026 Predictor — Claude Code Setup Guide

## Quick Start (5 minutes)

### 1. Extract the project

```bash
# Download wc2026-predictor-app.tar.gz from Claude, then:
cd ~/projects  # or wherever you keep projects
tar -xzf ~/Downloads/wc2026-predictor-app.tar.gz
cd wc2026-predictor-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Verify everything works

```bash
npm run test     # Should show 12 tests passing
npm run build    # Should build without errors
npm run dev      # Opens at localhost:5173
```

Visit `http://localhost:5173`, click **Run Simulation**, and you should see championship probabilities. Argentina, Spain, and France should be near the top.

### 4. Push to GitHub

```bash
git init
git add .
git commit -m "Initial scaffold: engine + data + tests"
gh repo create wc2026-predictor --public --source=. --push
```

### 5. Deploy to Vercel

```bash
npx vercel
# Follow prompts, accept defaults
# Your app is now live
```

---

## Building with Claude Code

### Starting a session

```bash
cd ~/projects/wc2026-predictor-app
claude
```

Claude Code will automatically read `AGENTS.md` and understand the project structure, current status, and what to build next.

### ⚠️ Important: Zscaler SSL on corporate network

If you're on your Jeeves laptop, remember:

```bash
export NODE_EXTRA_CA_CERTS=/Users/danielvega/zscaler-certs.pem
```

Add this to your shell profile so it's always set. Claude Code's npm operations will fail without it on the corporate network.

---

## Build Phases — What to Tell Claude Code

### Phase 2: User Prediction Input (start here)

**Prompt 1 — Zustand Store:**
```
Create a Zustand store for user predictions at src/store/predictionStore.ts.
It should store predictions for all 104 matches (72 group + 32 knockout).
Include methods: setPrediction(matchId, homeGoals, awayGoals),
lockAllPredictions(), clearAllPredictions().
Persist to localStorage using Zustand's persist middleware.
```

**Prompt 2 — Score Input Component:**
```
Build a ScoreInput component at src/components/prediction/ScoreInput.tsx.
Two number inputs side by side with +/- stepper buttons. Team flags and
short names on each side. Use the broadcast dark design: bg-bg-secondary
cards, JetBrains Mono for scores, accent-gold highlights.
Min 0, max 9 for each score.
```

**Prompt 3 — Group Stage UI:**
```
Build the GroupStage view. Show all 12 groups in a 2-column grid (6 rows).
Each group card shows: group name, 4 teams with flags, and 6 match slots
with ScoreInput components. Below each group, show a live-updating standings
table based on the user's predicted scores.
Wire it to the predictionStore.
```

**Prompt 4 — Knockout Bracket:**
```
Build the KnockoutBracket component. Once the user fills in group predictions,
auto-calculate group standings and populate the Round of 32 matchups.
Show the bracket as a tournament tree. Each knockout match gets a ScoreInput
plus a "winner" indicator. For drawn knockout matches, show a penalty winner
selector.
```

### Phase 3: Comparison Dashboard (MVP)

**Prompt 5 — Run Model + Compare (Three-Way):**
```
Build the ComparisonView dashboard. When the user clicks "Compare with Model",
run a 10,000-simulation Monte Carlo in a web worker (to avoid blocking UI).
Show a THREE-COLUMN split view: left = user's predictions, center = our model's
most likely scores, right = Opta reference data (from src/data/opta.ts).
Use the scoring system from src/utils/scoring.ts.
Color code: green = exact match, blue = correct result, red = wrong.
Show total score at the top with a progress bar toward max (586 points).
```

**Prompt 6 — Championship Comparison + Health Check:**
```
Add a champion/runner-up/third-place comparison panel at the top of the
dashboard. Show the user's pick vs the model's top probability vs Opta's
ranking. Include a horizontal bar chart of all teams' championship
probabilities showing both our model AND Opta side-by-side.
Add a "Model Health Check" panel using the runHealthCheck function from
src/data/opta.ts that flags where our model diverges significantly from Opta.
```

### Phase 4: Live Data

**Prompt 7 — API Routes:**
```
Create Vercel API routes at src/api/ for live data refresh:
- /api/refresh-elo: Fetch current Elo ratings from eloratings.net
- /api/refresh-fotmob: Pull recent match results from the unofficial
  Fotmob API (https://www.fotmob.com/api)
Add a "Refresh Data" button in the UI that calls these endpoints and
updates the team data store.
```

### Phase 5: Polish

**Prompt 8 — Real Results:**
```
As the World Cup progresses (starts June 11), add an "Actual Results" mode.
Allow inputting real match scores. Compare user predictions AND model
predictions against actual results. Track accuracy over time.
```

---

## Tips for Effective Claude Code Sessions

1. **Always run tests first** when starting a session:
   ```
   Run npm test and tell me the results. Then read AGENTS.md.
   ```

2. **One component per prompt** for best results. Don't ask for the entire dashboard in one go.

3. **Reference the design direction** when building UI:
   ```
   Use the broadcast dark design from the spec. bg-bg-primary background,
   Inter font, JetBrains Mono for data, accent-gold for highlights.
   ```

4. **Test the math** after any engine changes:
   ```
   Run the tests and also run a quick 1000-sim Monte Carlo.
   Print the top 10 championship probabilities. Argentina should be 12-18%.
   ```

5. **Use the Web Worker pattern** for Monte Carlo in the browser:
   ```
   The Monte Carlo sim blocks the main thread for ~1-2 seconds at 10K sims.
   Move it to a web worker so the UI stays responsive.
   ```

6. **Tailwind v4 reminder**: No `tailwind.config.js`. Custom colors are in
   `src/index.css` under `@theme { }`. Use them as `bg-bg-primary`,
   `text-accent-gold`, `border-bg-tertiary`, etc.

---

## Project Files Reference

| File | Purpose |
|------|---------|
| `AGENTS.md` | Claude Code reads this automatically — project context |
| `PROJECT_SPEC.md` | Full specification with math, data model, UI design |
| `src/engine/` | Simulation engine (COMPLETE, don't modify unless fixing bugs) |
| `src/data/teams.ts` | All 48 teams with Elo, rankings, groups |
| `src/data/groups.ts` | Group compositions |
| `src/types/index.ts` | All TypeScript interfaces |
| `src/utils/scoring.ts` | Points system for user vs model comparison |
| `tests/engine/` | Engine tests (12 passing) |
| `src/App.tsx` | Current proof-of-concept (replace in Phase 2) |
