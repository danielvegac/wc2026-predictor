// ============================================================
// Match Betting Odds — Pre-match market odds for WC2026
// ============================================================
// American format odds from bet365/FanDuel. Updated daily as
// matches approach.

export interface MatchOdds {
  matchId: string;
  homeWin: number;    // American odds e.g. -2500
  draw: number;       // American odds e.g. +1600
  awayWin: number;    // American odds e.g. +2800
  source: string;     // "bet365" | "FanDuel" | "Oddschecker"
  asOf: string;       // Date string "2026-06-14"
}

/** Convert American odds to implied probability (0-1) */
export function americanToProb(odds: number): number {
  if (odds > 0) return 100 / (odds + 100);
  return Math.abs(odds) / (Math.abs(odds) + 100);
}

/** Get no-vig (fair) probabilities — normalized to sum to 1 */
export function noVigProbs(odds: MatchOdds): {
  homeWin: number;
  draw: number;
  awayWin: number;
} {
  const raw = {
    homeWin: americanToProb(odds.homeWin),
    draw: americanToProb(odds.draw),
    awayWin: americanToProb(odds.awayWin),
  };
  const total = raw.homeWin + raw.draw + raw.awayWin;
  return {
    homeWin: raw.homeWin / total,
    draw: raw.draw / total,
    awayWin: raw.awayWin / total,
  };
}

export const matchOdds: MatchOdds[] = [
  // June 14 — MD1 Groups E & F
  { matchId: "GS-E-1", homeWin: -2500, draw: +1600, awayWin: +2800, source: "bet365", asOf: "2026-06-14" },
  { matchId: "GS-F-1", homeWin: +100, draw: +260, awayWin: +270, source: "bet365", asOf: "2026-06-14" },
  { matchId: "GS-E-2", homeWin: +100, draw: +260, awayWin: +270, source: "bet365", asOf: "2026-06-14" },
  { matchId: "GS-F-2", homeWin: -118, draw: +250, awayWin: +320, source: "bet365", asOf: "2026-06-14" },
];

/** Get odds for a specific match (if available) */
export function getOddsForMatch(matchId: string): MatchOdds | undefined {
  return matchOdds.find((o) => o.matchId === matchId);
}
