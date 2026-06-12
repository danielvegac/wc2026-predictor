// ============================================================
// Expert / Pundit Score Predictions for WC2026
// ============================================================

export interface ExpertPick {
  matchId: string;
  source: string;
  homeGoals: number;
  awayGoals: number;
  note?: string;
}

export const expertPicks: ExpertPick[] = [
  // Group B - MD1
  { matchId: "GS-B-1", source: "Last Word on Football", homeGoals: 2, awayGoals: 1, note: "Canada vs Bosnia" },
  { matchId: "GS-B-1", source: "Squawka AI", homeGoals: 1, awayGoals: 0, note: "Canada vs Bosnia" },

  // Group D - MD1
  { matchId: "GS-D-1", source: "Squawka AI", homeGoals: 1, awayGoals: 0, note: "USA vs Paraguay" },

  // Group C - MD1
  { matchId: "GS-C-1", source: "CBS Sports", homeGoals: 2, awayGoals: 1, note: "Brazil vs Morocco" },
  { matchId: "GS-C-2", source: "CBS Sports", homeGoals: 1, awayGoals: 2, note: "Haiti vs Scotland (CBS picks Scotland 2-1)" },
];

/** Get all expert picks for a specific match */
export function getExpertPicksForMatch(matchId: string): ExpertPick[] {
  return expertPicks.filter((p) => p.matchId === matchId);
}

// --- Expert accuracy tracking ---

export interface ExpertAccuracy {
  source: string;
  totalPicks: number;
  correctResults: number;
  exactScores: number;
}

export function calculateExpertAccuracy(
  picks: ExpertPick[],
  actualResults: Record<string, { homeGoals: number; awayGoals: number }>
): ExpertAccuracy[] {
  const bySource: Record<string, ExpertAccuracy> = {};

  for (const pick of picks) {
    const actual = actualResults[pick.matchId];
    if (!actual) continue;

    if (!bySource[pick.source]) {
      bySource[pick.source] = {
        source: pick.source,
        totalPicks: 0,
        correctResults: 0,
        exactScores: 0,
      };
    }

    const acc = bySource[pick.source];
    acc.totalPicks++;

    const pickResult =
      pick.homeGoals > pick.awayGoals
        ? "home"
        : pick.homeGoals < pick.awayGoals
        ? "away"
        : "draw";
    const actualResult =
      actual.homeGoals > actual.awayGoals
        ? "home"
        : actual.homeGoals < actual.awayGoals
        ? "away"
        : "draw";

    if (pickResult === actualResult) acc.correctResults++;
    if (
      pick.homeGoals === actual.homeGoals &&
      pick.awayGoals === actual.awayGoals
    )
      acc.exactScores++;
  }

  return Object.values(bySource);
}
