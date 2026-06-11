# AGENTS.md — WC2026 Predictor

## Project

World Cup 2026 match predictor and bracket simulator. React + Vite + TypeScript + Tailwind. Users predict all 104 match scores, then compare against a Monte Carlo simulation engine. Deployed to Vercel.

**Read `PROJECT_SPEC.md` for the full specification** — it has the complete data model, statistical model math, UI design direction, and implementation phases.

## Architecture

- **Engine** (`src/engine/`): Poisson goal model + Elo ratings + Monte Carlo tournament simulation. Runs client-side. Already built and tested (12 tests passing).
- **Data** (`src/data/`): Static team data for all 48 teams with Elo ratings, FIFA rankings, groups. Live refresh via Vercel API routes (Phase 4).
- **Store** (`src/store/`): Zustand stores for user predictions, simulation results, tournament state.
- **UI** (`src/components/`): React components organized by feature: bracket, prediction, dashboard, simulation, ui.

## Tech stack

React 19, Vite 8, TypeScript 6, Tailwind CSS 4 (v4 uses `@import "tailwindcss"` + `@theme` in CSS, NOT tailwind.config.js), Zustand 5, Recharts 3, Vitest 4.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Type-check + build
npm run test         # Run all tests
npm run test:watch   # Tests in watch mode
```

## Opta Supercomputer Integration

The project uses a **three-way comparison** model:
1. **User** — Daniel's own football-informed predictions
2. **Our Model** — Poisson/Elo Monte Carlo (independent)
3. **Opta** — Supercomputer reference data (25,000 sims, static baseline)

Opta data lives in `src/data/opta.ts` — championship probabilities for all 48 teams plus advancement probabilities where published. Our model runs independently and does NOT calibrate toward Opta. The comparison dashboard shows all three side-by-side.

A **Model Health Check** panel flags divergences between our model and Opta above threshold (>3% championship, >10% advancement). These are diagnostic, not corrections — the user decides which model to trust for each prediction.

Key Opta reference points for sanity checking our model:
- Spain: 16.04% (our model should be in 12-20% range)
- France: 12.76%
- England: 11.36%
- Argentina: 10.35%
- Colombia: 2.10% (Group K is 2nd toughest group per Opta Power Rankings)
- Curaçao: 0.01%

**Phase 4 addition**: scrape the live Opta predictions page (`theanalyst.com/competition/fifa-world-cup/predictions`) via Vercel API route to update Opta reference data as the tournament progresses.

## Current status

**Phase 1 COMPLETE:**
- ✅ Poisson probability calculator (`src/engine/poisson.ts`)
- ✅ Elo rating system (`src/engine/elo.ts`)
- ✅ Team strength calculator (`src/engine/strengthCalculator.ts`)
- ✅ Match simulator (`src/engine/matchSimulator.ts`)
- ✅ Group stage simulator (`src/engine/groupSimulator.ts`)
- ✅ Knockout bracket simulator (`src/engine/knockoutSimulator.ts`)
- ✅ Monte Carlo tournament simulator (`src/engine/monteCarlo.ts`)
- ✅ Scoring system (`src/utils/scoring.ts`)
- ✅ Opta reference data + health check (`src/data/opta.ts`)
- ✅ All 48 teams with data (`src/data/teams.ts`)
- ✅ Group configurations (`src/data/groups.ts`)
- ✅ Types (`src/types/index.ts`)
- ✅ Tests passing (12/12)

**Next: Phase 2 — User Prediction Input UI**
- Group stage prediction interface (all 72 matches)
- Score input components
- Knockout bracket auto-fill from group predictions
- Persist to localStorage

**Then: Phase 3 — Comparison Dashboard (MVP priority)**
- Three-way comparison: User vs Our Model vs Opta
- Points/accuracy scoring
- Divergence analysis + Model Health Check panel

## Design direction

**"Broadcast Data Room"** — dark mode, broadcast aesthetic. NOT a generic dashboard template.

```
Colors:
  --bg-primary: #0A0E17 (deep navy-black)
  --bg-secondary: #111827 (card surfaces)
  --accent-gold: #F59E0B (winners, champion)
  --accent-green: #10B981 (correct predictions)
  --accent-red: #EF4444 (wrong predictions)
  --accent-blue: #3B82F6 (model predictions)

Fonts:
  Display/Body: Inter (700/800 for display, 400/500 for body)
  Data/Scores: JetBrains Mono
```

Already configured in `src/index.css` via Tailwind v4 `@theme`.

## Key rules

1. **Tailwind v4**: No `tailwind.config.js`. Theme is in `src/index.css` using `@theme { }`. Use custom colors as `bg-bg-primary`, `text-accent-gold`, etc.
2. **Engine is done**: Don't modify engine files unless fixing bugs. The math is tested and correct.
3. **Sanity checks**: Argentina should have ~12-18% championship probability. Top 5 favorites should hold ~60% combined. Curaçao < 0.1%.
4. **No hardcoded match data for predictions**: The engine simulates scores probabilistically. Don't hardcode "expected" scores.
5. **localStorage for persistence**: Save user predictions to localStorage. No backend needed for Phase 2-3.
6. **Mobile responsive**: Design for both desktop and mobile from the start.
7. **Group K context**: Colombia (COL) is in Group K with Portugal, Uzbekistan, DR Congo. This is the project creator's national team — the UI should work well for tracking any team but this is the one that'll get the most attention.

## File structure

```
src/
├── engine/         # ✅ COMPLETE — simulation engine
├── data/           # ✅ COMPLETE — team data, groups
├── types/          # ✅ COMPLETE — TypeScript interfaces
├── utils/          # ✅ scoring.ts complete
├── components/     # 🔨 TODO — all UI components
│   ├── bracket/    # GroupTable, GroupStage, KnockoutBracket, MatchCard
│   ├── prediction/ # ScoreInput, PredictionCard, LockPredictions
│   ├── dashboard/  # ComparisonView, AccuracyScore, DivergencePanel
│   ├── simulation/ # SimulationControls, ProbabilityHeatmap
│   └── ui/         # TeamBadge, ProgressBar, Tooltip
├── store/          # 🔨 TODO — Zustand stores
├── hooks/          # 🔨 TODO — custom hooks
└── api/            # Phase 4 — Vercel serverless functions
```

## How to resume work

When starting a session, run `npm run test` first to confirm the engine still works. Then pick up from the current phase.

Typical Phase 2 entry point:
```
"Build the group stage prediction UI. Create a GroupStage component that shows all 12 groups. 
Each group shows 6 matches with score inputs. Use the dark broadcast design from the spec. 
Start with the Zustand store for user predictions."
```

Typical Phase 3 entry point:
```
"Build the comparison dashboard. Run the Monte Carlo simulation (10K sims), then show 
the user's predictions side-by-side with the model's most likely scores. Include the 
scoring system from utils/scoring.ts."
```
