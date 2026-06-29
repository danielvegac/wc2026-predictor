// ============================================================
// Results Store — Live match results from API
// ============================================================
// Stores actual WC match results fetched from /api/results.
// Used to compare user predictions against real outcomes.

import { create } from "zustand";
import { groupStageSchedule } from "../data/schedule";
import { knockoutMatches } from "../data/knockoutMatches";

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

      // Find our schedule match by team IDs (group stage first, then knockout)
      const gsMatch = groupStageSchedule.find(
        (m) =>
          (m.homeTeamId === r.homeTeamId && m.awayTeamId === r.awayTeamId) ||
          (m.homeTeamId === r.awayTeamId && m.awayTeamId === r.homeTeamId)
      );

      if (gsMatch) {
        const flipped = gsMatch.homeTeamId === r.awayTeamId;
        return {
          ...r,
          matchId: gsMatch.id,
          homeTeamId: gsMatch.homeTeamId,
          awayTeamId: gsMatch.awayTeamId,
          homeScore: flipped ? r.awayScore : r.homeScore,
          awayScore: flipped ? r.homeScore : r.awayScore,
        };
      }

      // Check knockout matches
      const koMatch = knockoutMatches.find(
        (m) =>
          (m.homeTeamId === r.homeTeamId && m.awayTeamId === r.awayTeamId) ||
          (m.homeTeamId === r.awayTeamId && m.awayTeamId === r.homeTeamId)
      );

      if (koMatch) {
        const flipped = koMatch.homeTeamId === r.awayTeamId;
        return {
          ...r,
          matchId: koMatch.matchId,
          homeTeamId: koMatch.homeTeamId,
          awayTeamId: koMatch.awayTeamId,
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
