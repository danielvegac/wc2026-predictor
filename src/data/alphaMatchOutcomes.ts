// ============================================================
// Alpha Match Outcome Tracker — verified pre-kickoff data only
// ============================================================
// Tracks Alphametrico's Match Outcome chart (Home/Draw/Away %) as read
// BEFORE kickoff, so we can objectively check whether it favored the
// correct W/D/L result. This is separate from the points-based "Alpha
// total" (exact-score picks): this tracker only asks whether the
// highest-probability outcome matched the actual W/D/L.
//
// Only pre-kickoff reads count. Dashboard re-reads taken after a match
// has been played reflect look-ahead bias and are excluded — see
// R32-15/R32-16 below, where the only data found was an explicitly
// unfinished placeholder, not a genuine registered pre-kickoff read.

import { knockoutMatches } from "./knockoutMatches";

export interface AlphaMatchOutcome {
  matchId: string;
  homeWinPct: number | null;
  drawPct: number | null;
  awayWinPct: number | null;
  source: "chat-history-verified" | "pickjudge-fixture" | "unavailable";
  note?: string;
}

export const alphaMatchOutcomes: AlphaMatchOutcome[] = [
  { matchId: "R32-01", homeWinPct: 21.1, drawPct: 31.7, awayWinPct: 47.2, source: "chat-history-verified" },
  { matchId: "R32-02", homeWinPct: 55.9, drawPct: 25.0, awayWinPct: 19.2, source: "chat-history-verified" },
  { matchId: "R32-03", homeWinPct: 34.5, drawPct: 27.4, awayWinPct: 38.1, source: "chat-history-verified" },
  { matchId: "R32-04", homeWinPct: 41.0, drawPct: 32.4, awayWinPct: 26.6, source: "chat-history-verified" },
  { matchId: "R32-05", homeWinPct: 34.6, drawPct: 29.2, awayWinPct: 36.2, source: "chat-history-verified",
    note: "Initial pre-kickoff read; a later same-day revision raised away-win% further but full breakdown wasn't captured — using initial documented read" },
  { matchId: "R32-06", homeWinPct: 67.8, drawPct: 17.7, awayWinPct: 14.5, source: "chat-history-verified" },
  { matchId: "R32-07", homeWinPct: 18.4, drawPct: 35.0, awayWinPct: 46.5, source: "chat-history-verified" },
  { matchId: "R32-09", homeWinPct: 32.8, drawPct: 27.9, awayWinPct: 39.3, source: "chat-history-verified" },
  { matchId: "R32-10", homeWinPct: 57.8, drawPct: 23.7, awayWinPct: 18.5, source: "chat-history-verified" },
  { matchId: "R32-11", homeWinPct: 68.0, drawPct: 20.2, awayWinPct: 11.8, source: "chat-history-verified" },
  { matchId: "R32-12", homeWinPct: 62.5, drawPct: 23.2, awayWinPct: 14.4, source: "chat-history-verified" },
  { matchId: "R32-13", homeWinPct: 35.3, drawPct: 24.0, awayWinPct: 40.6, source: "chat-history-verified" },
  { matchId: "R32-14", homeWinPct: 21.6, drawPct: 32.2, awayWinPct: 46.2, source: "chat-history-verified" },
  { matchId: "R32-15", homeWinPct: null, drawPct: null, awayWinPct: null, source: "unavailable",
    note: "Only a placeholder marked incomplete exists in historicalFixtures.ts — not a verified pre-kickoff read" },
  { matchId: "R32-16", homeWinPct: null, drawPct: null, awayWinPct: null, source: "unavailable",
    note: "Only a placeholder marked incomplete exists in historicalFixtures.ts — not a verified pre-kickoff read" },
  { matchId: "R16-1", homeWinPct: 20.2, drawPct: 36.7, awayWinPct: 43.0, source: "chat-history-verified" },
  { matchId: "R16-2", homeWinPct: 19.1, drawPct: 28.0, awayWinPct: 52.9, source: "chat-history-verified",
    note: "Away% approximated — third slice partially obscured in source image, inferred as 100 - 19.1 - 28.0" },
  { matchId: "R16-3", homeWinPct: 79.0, drawPct: 13.4, awayWinPct: 7.6, source: "chat-history-verified" },
  { matchId: "R16-4", homeWinPct: 14.0, drawPct: 16.0, awayWinPct: 70.0, source: "pickjudge-fixture" },
  { matchId: "R16-5", homeWinPct: 31.1, drawPct: 29.6, awayWinPct: 39.4, source: "chat-history-verified" },
  { matchId: "R16-6", homeWinPct: 39.0, drawPct: 26.8, awayWinPct: 34.2, source: "chat-history-verified",
    note: "Approximate — read from a text summary, not the exact donut chart" },
  { matchId: "R16-7", homeWinPct: 62.4, drawPct: 27.0, awayWinPct: 10.5, source: "chat-history-verified" },
  { matchId: "R16-8", homeWinPct: 23.0, drawPct: 25.0, awayWinPct: 52.1, source: "chat-history-verified",
    note: "Match ended 0-0 in 90 minutes (Switzerland won on penalties). AET match — exclude from correct-result aggregate per Rule 25, same as existing Signal Accuracy Tracker treatment." },
  { matchId: "QF-1", homeWinPct: 44.6, drawPct: 32.8, awayWinPct: 22.6, source: "chat-history-verified" },
  { matchId: "QF-2", homeWinPct: 50.3, drawPct: 26.7, awayWinPct: 23.0, source: "chat-history-verified" },
  { matchId: "QF-3", homeWinPct: 17.0, drawPct: 24.0, awayWinPct: 59.0, source: "chat-history-verified" },
  { matchId: "QF-4", homeWinPct: 66.2, drawPct: 22.8, awayWinPct: 11.1, source: "chat-history-verified" },
  { matchId: "SF-1", homeWinPct: 31.2, drawPct: 28.6, awayWinPct: 40.2, source: "chat-history-verified" },
  { matchId: "SF-2", homeWinPct: 23.4, drawPct: 34.8, awayWinPct: 41.8, source: "chat-history-verified" },
];

const outcomesByMatchId = new Map(alphaMatchOutcomes.map((o) => [o.matchId, o]));
const knockoutByMatchId = new Map(knockoutMatches.map((m) => [m.matchId, m]));

export type MatchOutcomeResult = "home" | "draw" | "away";

/** Derive the actual W/D/L result for a knockout match from its stored scoreline. */
function getActualResult(matchId: string): MatchOutcomeResult | null {
  const match = knockoutByMatchId.get(matchId);
  if (!match || match.homeGoals == null || match.awayGoals == null) return null;
  if (match.homeGoals > match.awayGoals) return "home";
  if (match.homeGoals < match.awayGoals) return "away";
  return "draw";
}

export interface AlphaResultComputation {
  alphaPick: MatchOutcomeResult | null;
  correct: boolean | null;
}

/**
 * Derives Alphametrico's implied pick (highest of home/draw/away %) and whether
 * it matched the actual result. Returns nulls when the data is unavailable or
 * the match is AET-excluded per Rule 25 (flagged via the outcome's note).
 */
export function computeAlphaResult(
  outcome: AlphaMatchOutcome,
  actualResult: MatchOutcomeResult | null
): AlphaResultComputation {
  if (outcome.source === "unavailable") return { alphaPick: null, correct: null };
  if (outcome.homeWinPct == null || outcome.drawPct == null || outcome.awayWinPct == null) {
    return { alphaPick: null, correct: null };
  }
  if (outcome.matchId === "R16-8") return { alphaPick: null, correct: null };
  if (actualResult == null) return { alphaPick: null, correct: null };

  const { homeWinPct, drawPct, awayWinPct } = outcome;
  let alphaPick: MatchOutcomeResult = "home";
  let best = homeWinPct;
  if (drawPct > best) {
    alphaPick = "draw";
    best = drawPct;
  }
  if (awayWinPct > best) {
    alphaPick = "away";
    best = awayWinPct;
  }

  return { alphaPick, correct: alphaPick === actualResult };
}

/** Get the Alpha Result verdict for a given knockout matchId, or null if not tracked. */
export function getAlphaResultForMatch(matchId: string): AlphaResultComputation | null {
  const outcome = outcomesByMatchId.get(matchId);
  if (!outcome) return null;
  return computeAlphaResult(outcome, getActualResult(matchId));
}
