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
import { calculateStrengthFromElo } from "../engine/strengthCalculator";
import { analyzeMatch } from "../engine/matchSimulator";

export interface ModelPrediction {
  homeGoals: number;
  awayGoals: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
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
        const strengths = calculateStrengthFromElo(teams, liveElo);
        const strengthMap = new Map(strengths.map((s) => [s.teamId, s]));

        const existing = get().predictions;
        const locked = new Set(get().lockedMatchIds);
        const predictions: Record<string, ModelPrediction> = {};

        for (const match of groupStageSchedule) {
          // Keep locked predictions (matches already played)
          if (locked.has(match.id) && existing[match.id]) {
            predictions[match.id] = existing[match.id];
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
 * Call this once from App mount — only computes if store is empty.
 */
export function initModelPredictions() {
  const store = useModelPredictionStore.getState();
  if (Object.keys(store.predictions).length === 0) {
    store.compute();
  }
}
