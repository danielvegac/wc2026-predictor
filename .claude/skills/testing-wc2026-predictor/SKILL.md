---
name: testing-wc2026-predictor
description: End-to-end test the WC2026 Predictor React app (prediction UI, match cards, comparison dashboard). Use when verifying UI/logic changes to match cards, scoring/accuracy, scoreline parsing, or the championship-probability dashboard.
---

# Testing the WC2026 Predictor

React + Vite + TS World Cup 2026 predictor. Three top nav tabs: **Matches**, **Simulation**, **Dashboard**.

## Run it
```bash
npm install          # see env caveats below
npm run dev          # http://localhost:5173
```
Node 20.18 warns ("Vite requires 20.19+") but the dev server still runs fine.

### Env caveats (may change over time)
- Fresh `npm install` may fail to load a rolldown native binding (npm optional-deps bug). Workaround that worked: `npm install --no-save @rolldown/binding-linux-x64-gnu@<installed rolldown version>`.
- `jsdom@29.1.1` was broken upstream (ESM `require` of `@exodus/bytes`), blocking `npm test`. Pinning `jsdom` to `^26.1.0` locally unblocked tests. Both are captured in the environment blueprint; they may already be fixed — try the default first.

## Where the key UI logic lives
- Group match cards: `src/components/prediction/MatchCard.tsx`
- Knockout cards: `src/components/prediction/KnockoutMatchCard.tsx` (NOTE: completed matches force a **green** border regardless of result; the result-based border helper only runs for *upcoming* matches with a user prediction)
- Comparison dashboard: `src/components/dashboard/Dashboard.tsx` (very long page — has a full match-by-match track record, a Signal Accuracy Tracker, a per-team % table, then the "Championship Comparison" favorite cards + "4 Models Compared" bar chart near the bottom)
- Shared utils commonly under test: `src/utils/matchResult.ts` (getMatchResult, getResultBorderClass, extractScoreline/parseScoreline) and `src/utils/collections.ts` (indexBy, toMap, sortByDesc)

## Reachable test scenarios & how to trigger them
- **Match-card border color** (getResultBorderClass): on any *unplayed* group card, type a home score + away score. Border turns green (home win), red (away win), gold (draw). Fast, deterministic, no data needed.
- **α Pick scoreline** (extractScoreline): scroll to a matchday 2/3 group card that has a violet "α Pick" row (e.g. Scotland vs Brazil). Underlying data like `"2-0 Brazil"` must render as bare `"2-0"`.
- **Accuracy badges** (getMatchResult / getAccuracy): only appear for *played* matches, which need live results (see below). Best place to verify is the Dashboard "Model Track Record" table: ⭐ = exact, ✓ = correct result, ✗ = wrong.
- **Rankings sorted descending** (sortByDesc / toMap): Dashboard bottom. Favorite cards should read Opta = Spain ~16.0%, Polymarket = Spain ~17.0% (static reference values per AGENTS.md). The 4-model bar chart is sorted descending by cross-model average (Spain → Argentina → France → England → Brazil).

## Live results / played matches
Match results come from `fetch('/api/results')` (Vercel serverless, `api/results.ts`) via `src/hooks/useLiveData.ts` on mount; they populate `resultsStore`. Knockout matches in `src/data/knockoutMatches.ts` are additionally hard-coded as `status: "completed"`.
- On a plain `npm run dev` (no Vercel functions), `/api/results` returns raw TS source, so group-stage FT badges may not appear immediately — but during the tournament window the app DID load real results and fully populate the Dashboard track record. If group cards show no "FT"/Final row, verify played-match logic on the **Dashboard** instead, where knockout + any loaded results render.
- Reference sanity values (AGENTS.md): Spain Opta 16.04%, France 12.76%, England 11.36%, Argentina 10.35%, Curaçao 0.01%.

## Recording tips
- Maximize Chrome first: `wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`.
- Use `zoom` to read the thin colored card borders and small dashboard numbers — full screenshots are too small to judge border color/values reliably.
- The dashboard is very long; scrolling 15-20 clicks at a time is needed to reach the championship comparison at the bottom.

## Devin Secrets Needed
None. The app runs fully client-side against static data + a public results API; no credentials required for local testing.
