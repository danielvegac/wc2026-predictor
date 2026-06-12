// ============================================================
// Results Store — Live match results from API
// ============================================================
// Stores actual WC match results fetched from /api/results.
// Used to compare user predictions against real outcomes.

import { create } from "zustand";
import { groupStageSchedule } from "../data/schedule";

export interface MatchResult {
  matchId: string | null;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: string;
  stage: string;
  completed: boolean;
}

interface ResultsState {
  results: MatchResult[];
  lastFetched: number | null;
  source: "live" | "unavailable" | null;

  setResults: (results: MatchResult[], source: "live" | "unavailable") => void;
  getResultForMatch: (matchId: string) => MatchResult | null;
  getCompletedCount: () => number;
}

export const useResultsStore = create<ResultsState>()((set, get) => ({
  results: [],
  lastFetched: null,
  source: null,

  setResults: (results, source) => {
    // Map results to our match IDs by matching team pairs
    const mapped = results.map((r) => {
      if (r.matchId) return r;

      // Find our schedule match by team IDs
      const match = groupStageSchedule.find(
        (m) =>
          (m.homeTeamId === r.homeTeamId && m.awayTeamId === r.awayTeamId) ||
          (m.homeTeamId === r.awayTeamId && m.awayTeamId === r.homeTeamId)
      );

      if (match) {
        // Ensure home/away alignment matches our schedule
        const flipped =
          match.homeTeamId === r.awayTeamId;
        return {
          ...r,
          matchId: match.id,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          homeScore: flipped ? r.awayScore : r.homeScore,
          awayScore: flipped ? r.homeScore : r.awayScore,
        };
      }

      return r;
    });

    set({ results: mapped, lastFetched: Date.now(), source });
  },

  getResultForMatch: (matchId) => {
    return get().results.find((r) => r.matchId === matchId && r.completed) ?? null;
  },

  getCompletedCount: () => {
    return get().results.filter((r) => r.completed && r.matchId).length;
  },
}));
