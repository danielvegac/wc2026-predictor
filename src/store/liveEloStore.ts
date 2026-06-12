// ============================================================
// Live Elo Store — Zustand + localStorage persistence
// ============================================================
// Tracks "live" Elo ratings that update as match results come in.
// Starts from the static baseline in teams.ts.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { teams } from "../data/teams";
import { processNewResults, type MatchResultForElo } from "../engine/eloUpdater";

interface EloChange {
  teamId: string;
  before: number;
  after: number;
}

interface LiveEloState {
  /** Current live Elo ratings keyed by team ID */
  ratings: Record<string, number>;
  /** Match IDs already processed (to avoid double-counting) */
  processedMatchIds: string[];
  /** Last sync timestamp */
  lastSyncAt: number | null;
  /** Changes from the most recent sync */
  recentChanges: EloChange[];

  /** Initialize from static baseline (idempotent) */
  init: () => void;
  /** Process new completed match results */
  syncWithResults: (results: MatchResultForElo[]) => void;
  /** Get Elo for a specific team (falls back to static) */
  getElo: (teamId: string) => number;
}

function buildBaselineElo(): Record<string, number> {
  const baseline: Record<string, number> = {};
  for (const t of teams) {
    baseline[t.id] = t.eloRating;
  }
  return baseline;
}

export const useLiveEloStore = create<LiveEloState>()(
  persist(
    (set, get) => ({
      ratings: {},
      processedMatchIds: [],
      lastSyncAt: null,
      recentChanges: [],

      init: () => {
        const state = get();
        if (Object.keys(state.ratings).length === 0) {
          set({ ratings: buildBaselineElo() });
        }
      },

      syncWithResults: (results) => {
        const state = get();

        // Ensure ratings are initialized
        let currentRatings = state.ratings;
        if (Object.keys(currentRatings).length === 0) {
          currentRatings = buildBaselineElo();
        }

        const processedSet = new Set(state.processedMatchIds);

        const { updatedElo, newlyProcessed } = processNewResults(
          results,
          currentRatings,
          processedSet
        );

        if (newlyProcessed.length === 0) return;

        // Build change records
        const changes: EloChange[] = [];
        for (const r of results) {
          if (!newlyProcessed.includes(r.matchId)) continue;
          for (const tid of [r.homeTeamId, r.awayTeamId]) {
            const before = currentRatings[tid] ?? 0;
            const after = updatedElo[tid] ?? 0;
            if (before !== after) {
              changes.push({ teamId: tid, before, after });
            }
          }
        }

        set({
          ratings: updatedElo,
          processedMatchIds: [...state.processedMatchIds, ...newlyProcessed],
          lastSyncAt: Date.now(),
          recentChanges: changes,
        });
      },

      getElo: (teamId) => {
        const state = get();
        return state.ratings[teamId] ?? teams.find((t) => t.id === teamId)?.eloRating ?? 1500;
      },
    }),
    {
      name: "wc2026-live-elo",
    }
  )
);
