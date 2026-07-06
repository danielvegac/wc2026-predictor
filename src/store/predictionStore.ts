// ============================================================
// Prediction Store — Zustand + localStorage persistence
// ============================================================
// Manages user predictions for all 104 matches.
// Uses the real FIFA 2026 schedule for group stage matches.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Prediction, GroupStanding } from "../types";
import { groups } from "../data/groups";
import { groupStageSchedule } from "../data/schedule";

export const GROUP_STAGE_MATCHES = groupStageSchedule;

// --- Standings calculation from user predictions ---

export function computeGroupStandings(
  groupName: string,
  predictions: Record<string, Prediction>
): GroupStanding[] | null {
  const groupMatches = GROUP_STAGE_MATCHES.filter(
    (m) => m.group === groupName
  );

  // Only compute if all 6 matches in the group have predictions
  const groupPredictions = groupMatches.map((m) => predictions[m.id]);
  if (groupPredictions.some((p) => !p)) return null;

  const group = groups.find((g) => g.name === groupName);
  if (!group) return null;

  const standings = new Map<string, GroupStanding>();
  for (const id of group.teamIds) {
    standings.set(id, {
      teamId: id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      position: 0,
    });
  }

  for (const match of groupMatches) {
    const pred = predictions[match.id];
    if (!pred) continue;

    const home = standings.get(match.homeTeamId)!;
    const away = standings.get(match.awayTeamId)!;

    home.played++;
    away.played++;
    home.goalsFor += pred.homeGoals;
    home.goalsAgainst += pred.awayGoals;
    away.goalsFor += pred.awayGoals;
    away.goalsAgainst += pred.homeGoals;

    if (pred.homeGoals > pred.awayGoals) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (pred.homeGoals === pred.awayGoals) {
      home.drawn++;
      home.points += 1;
      away.drawn++;
      away.points += 1;
    } else {
      away.won++;
      away.points += 3;
      home.lost++;
    }
  }

  const sorted = Array.from(standings.values())
    .map((s) => ({ ...s, goalDifference: s.goalsFor - s.goalsAgainst }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return 0;
    });

  return sorted.map((s, i) => ({ ...s, position: i + 1 }));
}

// --- Store types ---

interface PredictionState {
  predictions: Record<string, Prediction>;
  locked: boolean;

  // Actions
  setPrediction: (matchId: string, homeGoals: number, awayGoals: number) => void;
  overridePrediction: (matchId: string, homeGoals: number, awayGoals: number) => void;
  clearPrediction: (matchId: string) => void;
  clearAllPredictions: () => void;
  lockPredictions: () => void;
  unlockPredictions: () => void;

  // Derived helpers
  getGroupStandings: (groupName: string) => GroupStanding[] | null;
  getGroupProgress: (groupName: string) => { completed: number; total: number };
  getTotalProgress: () => { completed: number; total: number };
  isGroupComplete: (groupName: string) => boolean;
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set, get) => ({
      predictions: {},
      locked: false,

      setPrediction: (matchId, homeGoals, awayGoals) => {
        if (get().locked) return;
        set((state) => ({
          predictions: {
            ...state.predictions,
            [matchId]: {
              matchId,
              homeGoals,
              awayGoals,
              source: "user" as const,
            },
          },
        }));
      },

      overridePrediction: (matchId, homeGoals, awayGoals) => {
        set((state) => ({
          predictions: {
            ...state.predictions,
            [matchId]: { matchId, homeGoals, awayGoals, source: "user" as const },
          },
        }));
      },

      clearPrediction: (matchId) => {
        if (get().locked) return;
        set((state) => {
          const { [matchId]: _, ...rest } = state.predictions;
          return { predictions: rest };
        });
      },

      clearAllPredictions: () => {
        if (get().locked) return;
        set({ predictions: {} });
      },

      lockPredictions: () => set({ locked: true }),
      unlockPredictions: () => set({ locked: false }),

      getGroupStandings: (groupName) => {
        return computeGroupStandings(groupName, get().predictions);
      },

      getGroupProgress: (groupName) => {
        const groupMatches = GROUP_STAGE_MATCHES.filter(
          (m) => m.group === groupName
        );
        const completed = groupMatches.filter(
          (m) => get().predictions[m.id]
        ).length;
        return { completed, total: groupMatches.length };
      },

      getTotalProgress: () => {
        const total = GROUP_STAGE_MATCHES.length;
        const completed = GROUP_STAGE_MATCHES.filter(
          (m) => get().predictions[m.id]
        ).length;
        return { completed, total };
      },

      isGroupComplete: (groupName) => {
        const { completed, total } = get().getGroupProgress(groupName);
        return completed === total;
      },
    }),
    {
      name: "wc2026-predictions",
    }
  )
);
