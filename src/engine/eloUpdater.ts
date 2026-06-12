// ============================================================
// Elo Updater — Apply Elo changes from match results
// ============================================================

import { expectedScore, updateElo } from "./elo";

export interface MatchResultForElo {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
}

/**
 * Compute updated Elo ratings for both teams after a single match.
 * Returns [newEloHome, newEloAway].
 */
export function updateEloFromResult(
  team1Elo: number,
  team2Elo: number,
  result: { homeScore: number; awayScore: number },
  kFactor: number = 60
): [number, number] {
  const eHome = expectedScore(team1Elo, team2Elo);
  const eAway = 1 - eHome;

  let actualHome: number;
  let actualAway: number;
  if (result.homeScore > result.awayScore) {
    actualHome = 1;
    actualAway = 0;
  } else if (result.homeScore < result.awayScore) {
    actualHome = 0;
    actualAway = 1;
  } else {
    actualHome = 0.5;
    actualAway = 0.5;
  }

  const newHome = updateElo(team1Elo, eHome, actualHome, kFactor);
  const newAway = updateElo(team2Elo, eAway, actualAway, kFactor);

  return [newHome, newAway];
}

/**
 * Process a batch of new results and return updated Elo ratings.
 * Only processes results whose matchId is NOT in processedIds.
 */
export function processNewResults(
  results: MatchResultForElo[],
  currentElo: Record<string, number>,
  processedIds: Set<string>
): { updatedElo: Record<string, number>; newlyProcessed: string[] } {
  const elo = { ...currentElo };
  const newlyProcessed: string[] = [];

  for (const r of results) {
    if (processedIds.has(r.matchId)) continue;

    const homeElo = elo[r.homeTeamId];
    const awayElo = elo[r.awayTeamId];
    if (homeElo === undefined || awayElo === undefined) continue;

    const [newHome, newAway] = updateEloFromResult(homeElo, awayElo, r);
    elo[r.homeTeamId] = newHome;
    elo[r.awayTeamId] = newAway;
    newlyProcessed.push(r.matchId);
  }

  return { updatedElo: elo, newlyProcessed };
}
