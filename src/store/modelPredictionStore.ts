// ============================================================
// Model Prediction Store — Zustand + localStorage persistence
// ============================================================
// Pre-computes analyzeMatch() for all 72 group stage matches
// and stores the most likely score as the "model prediction".
// Supports recalculation with live Elo ratings.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { groupStageSchedule } from "../data/schedule";
import { teams, getTeamMap } from "../data/teams";
import { calculateStrengthFromElo, calculateBaseStrengthFromElo } from "../engine/strengthCalculator";
import { analyzeMatch } from "../engine/matchSimulator";
import { matchInsights } from "../data/matchInsights";

export interface ModelPrediction {
  homeGoals: number;
  awayGoals: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
}

interface ModelPredictionState {
  predictions: Record<string, ModelPrediction>;
  computedAt: number | null;
  /** Match IDs whose predictions are locked (actual result exists) */
  lockedMatchIds: string[];

  compute: (liveElo?: Record<string, number>) => void;
  lockMatch: (matchId: string) => void;
}

export const useModelPredictionStore = create<ModelPredictionState>()(
  persist(
    (set, get) => ({
      predictions: {},
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

        set({ predictions, computedAt: Date.now() });
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
  // Jun 14 matches (GS-E-1, GS-F-1, GS-E-2, GS-F-2) locked via this loop.
  for (const insight of matchInsights) {
    store.lockMatch(insight.matchId);
  }

  store.compute();
}
