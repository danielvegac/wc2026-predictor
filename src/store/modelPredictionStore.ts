// ============================================================
// Model Prediction Store — Zustand + localStorage persistence
// ============================================================
// Pre-computes analyzeMatch() for all 72 group stage matches
// and stores the most likely score as the "model prediction".
// Supports recalculation with live Elo ratings.
// Tracks TWO prediction sets:
//   - baseline: pre-tournament (no form insights), frozen forever
//   - current (predictions): form-adjusted, updates after each matchday

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { groupStageSchedule } from "../data/schedule";
import { teams, getTeamMap } from "../data/teams";
import { calculateStrengthFromElo, calculateBaseStrengthFromElo } from "../engine/strengthCalculator";
import { analyzeMatch } from "../engine/matchSimulator";
import { matchInsights } from "../data/matchInsights";
import { knockoutMatches } from "../data/knockoutMatches";

export interface ModelPrediction {
  homeGoals: number;
  awayGoals: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  // Knockout-only fields
  koAdvanceProbability?: number;  // Prob the "home" (listed-first) team advances
  aetLikely?: boolean;           // True when predicted score is a draw
}

interface ModelPredictionState {
  predictions: Record<string, ModelPrediction>;
  baselinePredictions: Record<string, ModelPrediction>;
  computedAt: number | null;
  /** Match IDs whose predictions are locked (actual result exists) */
  lockedMatchIds: string[];

  compute: (liveElo?: Record<string, number>) => void;
  lockMatch: (matchId: string) => void;
}

/** Separate localStorage key for baseline — never overwritten after initial computation */
const BASELINE_STORAGE_KEY = "wc2026-model-baseline";

function loadBaseline(): Record<string, ModelPrediction> {
  try {
    const raw = localStorage.getItem(BASELINE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveBaseline(baseline: Record<string, ModelPrediction>) {
  localStorage.setItem(BASELINE_STORAGE_KEY, JSON.stringify(baseline));
}

export const useModelPredictionStore = create<ModelPredictionState>()(
  persist(
    (set, get) => ({
      predictions: {},
      baselinePredictions: {},
      computedAt: null,
      lockedMatchIds: [],

      compute: (liveElo?: Record<string, number>) => {
        const teamMap = getTeamMap();
        // Form-adjusted strengths for future matches
        const strengths = calculateStrengthFromElo(teams, liveElo);
        const strengthMap = new Map(strengths.map((s) => [s.teamId, s]));
        // Base strengths (no form adjustments) for recovering locked match predictions
        const baseStrengths = calculateBaseStrengthFromElo(teams, liveElo);
        const baseStrengthMap = new Map(baseStrengths.map((s) => [s.teamId, s]));

        const existing = get().predictions;
        const locked = new Set(get().lockedMatchIds);
        const predictions: Record<string, ModelPrediction> = {};

        // --- Baseline: compute once, freeze forever ---
        let baseline = loadBaseline();
        const baselineEmpty = Object.keys(baseline).length === 0;
        if (baselineEmpty) {
          for (const match of groupStageSchedule) {
            const home = teamMap.get(match.homeTeamId);
            const away = teamMap.get(match.awayTeamId);
            const homeStr = baseStrengthMap.get(match.homeTeamId);
            const awayStr = baseStrengthMap.get(match.awayTeamId);
            if (!home || !away || !homeStr || !awayStr) continue;

            const result = analyzeMatch(match.id, home, away, homeStr, awayStr);
            baseline[match.id] = {
              homeGoals: result.mostLikelyScore[0],
              awayGoals: result.mostLikelyScore[1],
              homeWinProb: result.homeWinProb,
              drawProb: result.drawProb,
              awayWinProb: result.awayWinProb,
              expectedHomeGoals: result.expectedHomeGoals,
              expectedAwayGoals: result.expectedAwayGoals,
            };
          }
          saveBaseline(baseline);
        }

        // --- Current (form-adjusted) predictions ---
        for (const match of groupStageSchedule) {
          // Keep locked predictions (matches already played)
          if (locked.has(match.id)) {
            if (existing[match.id]) {
              predictions[match.id] = existing[match.id];
              continue;
            }
            // localStorage was cleared — recover using base (pre-form) strengths
            // so the "original prediction" is reconstructed without post-hoc bias
            const home = teamMap.get(match.homeTeamId);
            const away = teamMap.get(match.awayTeamId);
            const homeStr = baseStrengthMap.get(match.homeTeamId);
            const awayStr = baseStrengthMap.get(match.awayTeamId);
            if (!home || !away || !homeStr || !awayStr) continue;

            const result = analyzeMatch(match.id, home, away, homeStr, awayStr);
            predictions[match.id] = {
              homeGoals: result.mostLikelyScore[0],
              awayGoals: result.mostLikelyScore[1],
              homeWinProb: result.homeWinProb,
              drawProb: result.drawProb,
              awayWinProb: result.awayWinProb,
              expectedHomeGoals: result.expectedHomeGoals,
              expectedAwayGoals: result.expectedAwayGoals,
            };
            continue;
          }

          const home = teamMap.get(match.homeTeamId);
          const away = teamMap.get(match.awayTeamId);
          const homeStr = strengthMap.get(match.homeTeamId);
          const awayStr = strengthMap.get(match.awayTeamId);
          if (!home || !away || !homeStr || !awayStr) continue;

          const result = analyzeMatch(match.id, home, away, homeStr, awayStr);

          predictions[match.id] = {
            homeGoals: result.mostLikelyScore[0],
            awayGoals: result.mostLikelyScore[1],
            homeWinProb: result.homeWinProb,
            drawProb: result.drawProb,
            awayWinProb: result.awayWinProb,
            expectedHomeGoals: result.expectedHomeGoals,
            expectedAwayGoals: result.expectedAwayGoals,
          };
        }

        // --- Knockout match predictions (R32+) ---
        for (const ko of knockoutMatches) {
          if (locked.has(ko.matchId)) {
            if (existing[ko.matchId]) {
              predictions[ko.matchId] = existing[ko.matchId];
              continue;
            }
          }

          const home = teamMap.get(ko.homeTeamId);
          const away = teamMap.get(ko.awayTeamId);
          const homeStr = strengthMap.get(ko.homeTeamId);
          const awayStr = strengthMap.get(ko.awayTeamId);
          if (!home || !away || !homeStr || !awayStr) continue;

          const result = analyzeMatch(ko.matchId, home, away, homeStr, awayStr);
          const isDraw = result.mostLikelyScore[0] === result.mostLikelyScore[1];
          // Advance prob = winProb + (drawProb * 0.5) since penalties are ~50/50
          const koAdvanceProbability = result.homeWinProb + result.drawProb * 0.5;

          predictions[ko.matchId] = {
            homeGoals: result.mostLikelyScore[0],
            awayGoals: result.mostLikelyScore[1],
            homeWinProb: result.homeWinProb,
            drawProb: result.drawProb,
            awayWinProb: result.awayWinProb,
            expectedHomeGoals: result.expectedHomeGoals,
            expectedAwayGoals: result.expectedAwayGoals,
            koAdvanceProbability,
            aetLikely: isDraw,
          };
        }

        set({ predictions, baselinePredictions: baseline, computedAt: Date.now() });
      },

      lockMatch: (matchId: string) => {
        const state = get();
        if (!state.lockedMatchIds.includes(matchId)) {
          set({ lockedMatchIds: [...state.lockedMatchIds, matchId] });
        }
      },
    }),
    {
      name: "wc2026-model-predictions",
    }
  )
);

// --- Selectors ---

/** Get the frozen pre-tournament baseline prediction for a match */
export function useBaselinePrediction(matchId: string): ModelPrediction | undefined {
  return useModelPredictionStore((s) => s.baselinePredictions[matchId]);
}

/** Get the current form-adjusted prediction for a match */
export function useCurrentPrediction(matchId: string): ModelPrediction | undefined {
  return useModelPredictionStore((s) => s.predictions[matchId]);
}

/**
 * Initialize model predictions on first load.
 * Locks all completed matches (from matchInsights) before recomputing,
 * so predictions for already-played matches are never overwritten.
 */
export function initModelPredictions() {
  const store = useModelPredictionStore.getState();

  // Migrate stale localStorage: if any existing prediction is missing
  // expectedHomeGoals (added later), clear all predictions so they're
  // recomputed fresh with the new fields.
  const existing = store.predictions;
  const anyStale = Object.values(existing).some((p) => p.expectedHomeGoals == null);
  if (anyStale) {
    useModelPredictionStore.setState({ predictions: {}, lockedMatchIds: [] });
  }

  // Ensure all matches with known results are locked before recomputing.
  // This protects against localStorage being cleared — matchInsights is
  // the source of truth for which matches have been played.
  for (const insight of matchInsights) {
    store.lockMatch(insight.matchId);
  }
  // Lock completed knockout matches too
  for (const ko of knockoutMatches) {
    if (ko.status === "completed") {
      store.lockMatch(ko.matchId);
    }
  }

  store.compute();
}
