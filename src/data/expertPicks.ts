// ============================================================
// Expert / Pundit Score Predictions for WC2026
// ============================================================

import { scoreMatch } from "../utils/scoring";

export interface ExpertPick {
  matchId: string;
  source: string;
  homeGoals: number;
  awayGoals: number;
  note?: string;
}

export const expertPicks: ExpertPick[] = [
  // Group B - MD1
  { matchId: "GS-B-1", source: "LWOF", homeGoals: 2, awayGoals: 1, note: "Canada vs Bosnia" },
  { matchId: "GS-B-1", source: "Squawka AI", homeGoals: 1, awayGoals: 0, note: "Canada vs Bosnia" },

  // Group D - MD1
  { matchId: "GS-D-1", source: "Squawka AI", homeGoals: 1, awayGoals: 0, note: "USA vs Paraguay" },

  // Group C - MD1
  { matchId: "GS-C-1", source: "CBS Sports", homeGoals: 2, awayGoals: 1, note: "Brazil vs Morocco" },
  { matchId: "GS-C-2", source: "CBS Sports", homeGoals: 1, awayGoals: 2, note: "Haiti vs Scotland (CBS picks Scotland 2-1)" },

  // June 14 - MD1 Groups E & F
  { matchId: "GS-E-1", source: "Squawka AI", homeGoals: 3, awayGoals: 0, note: "Germany vs Curaçao — predicted 3-0 → actual 7-1 (correct result, wrong score)" },
  { matchId: "GS-E-1", source: "FootballPredictions.com", homeGoals: 3, awayGoals: 0, note: "Germany vs Curaçao — predicted 3-0" },
  { matchId: "GS-F-1", source: "Squawka AI", homeGoals: 2, awayGoals: 1, note: "Netherlands vs Japan — predicted 2-1 NED → actual 2-2 (wrong — missed Japan comeback)" },
  { matchId: "GS-E-2", source: "Squawka AI", homeGoals: 1, awayGoals: 1, note: "Ivory Coast vs Ecuador — predicted 1-1 → actual 1-0 CIV (wrong — Diallo 90' winner)" },
  { matchId: "GS-F-2", source: "Squawka AI", homeGoals: 1, awayGoals: 0, note: "Sweden vs Tunisia — predicted 1-0 → actual 5-1 (correct result, massively wrong score)" },

  // June 15 - MD1 Groups G & H
  { matchId: "GS-G-1", source: "Squawka AI", homeGoals: 2, awayGoals: 0, note: "Belgium vs Egypt — predicted 2-0 → actual 1-1 (wrong — Egypt drew)" },
  { matchId: "GS-H-1", source: "FootballPredictions.com", homeGoals: 2, awayGoals: 0, note: "Spain vs Cape Verde — predicted 2-0 → actual 0-0 (wrong)" },
  { matchId: "GS-H-2", source: "Squawka AI", homeGoals: 0, awayGoals: 2, note: "Saudi Arabia vs Uruguay — predicted Uruguay 2-0 → actual 1-1 (wrong — Saudi Arabia held)" },

  // June 16 - MD1 Groups I & J
  { matchId: "GS-I-1", source: "CBS Sports", homeGoals: 2, awayGoals: 0, note: "France vs Senegal — predicted 2-0 → actual 3-1 (correct result)" },
  { matchId: "GS-I-1", source: "FootballPredictions.com", homeGoals: 2, awayGoals: 0, note: "France vs Senegal — predicted 2-0" },
  { matchId: "GS-I-2", source: "Squawka AI", homeGoals: 2, awayGoals: 0, note: "Norway vs Iraq — predicted 2-0 → actual 4-1 (correct result, wrong score)" },
  { matchId: "GS-I-2", source: "FootballPredictions.com", homeGoals: 2, awayGoals: 1, note: "Norway vs Iraq — predicted 2-1" },
  { matchId: "GS-J-1", source: "Squawka AI", homeGoals: 3, awayGoals: 0, note: "Argentina vs Algeria — predicted 3-0 → actual 3-0 (EXACT score!)" },
  { matchId: "GS-J-1", source: "FootballPredictions.com", homeGoals: 2, awayGoals: 0, note: "Argentina vs Algeria — predicted 2-0" },
  { matchId: "GS-J-2", source: "Squawka AI", homeGoals: 2, awayGoals: 0, note: "Austria vs Jordan — predicted 2-0 → actual 3-1 (correct result)" },
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
  totalPts: number;
  // Points breakdown
  exactScorePts: number;
  resultPts: number;
  goalsPts: number;
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
        totalPts: 0,
        exactScorePts: 0,
        resultPts: 0,
        goalsPts: 0,
      };
    }

    const acc = bySource[pick.source];
    acc.totalPicks++;

    const breakdown = scoreMatch(
      { matchId: pick.matchId, homeGoals: pick.homeGoals, awayGoals: pick.awayGoals, source: "model" },
      { matchId: pick.matchId, homeGoals: actual.homeGoals, awayGoals: actual.awayGoals, source: "model" }
    );

    if (breakdown.isCorrectResult) acc.correctResults++;
    if (breakdown.isExactScore) acc.exactScores++;
    acc.totalPts += breakdown.totalPoints;
    acc.exactScorePts += breakdown.exactScorePoints;
    acc.resultPts += breakdown.resultPoints;
    acc.goalsPts += breakdown.homeGoalsPoints + breakdown.awayGoalsPoints;
  }

  return Object.values(bySource);
}
