// ============================================================
// Tournament Form Ranking Engine
// ============================================================
// Calculates composite form scores for all 48 teams based on
// xG performance, results, and Elo change during the tournament.

import type { Team } from "../types";
import type { MatchInsight } from "../data/matchInsights";

export interface TeamFormScore {
  teamId: string;
  // Auto-calculated components
  xgPerformanceScore: number;   // avg attackMultiplier across matches
  resultScore: number;          // W=3, D=1, L=0, normalized 0-1
  eloChangeScore: number;       // Elo gained/lost since tournament start, normalized 0-1
  // Composite
  autoScore: number;            // weighted: xG 40% + result 30% + Elo 30%, scaled 0-100
  // Manual override
  manualOverride?: number;      // 0-100, set manually for qualitative reasons
  manualNote?: string;          // reason for override
  // Final score
  finalScore: number;           // manualOverride if set, else autoScore
  matchesPlayed: number;
}

export function calculateFormRankings(
  teams: Team[],
  matchInsights: MatchInsight[],
  liveElo: Record<string, number>,
  baselineElo: Record<string, number>,
  manualOverrides?: Record<string, { score: number; note: string }>
): TeamFormScore[] {
  const scores: TeamFormScore[] = [];

  for (const team of teams) {
    const teamInsights = matchInsights.filter(
      (m) => m.homeTeamId === team.id || m.awayTeamId === team.id
    );

    const matchesPlayed = teamInsights.length;

    if (matchesPlayed === 0) {
      const override = manualOverrides?.[team.id];
      scores.push({
        teamId: team.id,
        xgPerformanceScore: 1.0,
        resultScore: 0,
        eloChangeScore: 0.5,
        autoScore: 50,
        manualOverride: override?.score,
        manualNote: override?.note,
        finalScore: override?.score ?? 50,
        matchesPlayed: 0,
      });
      continue;
    }

    // xG performance: average attack multiplier across matches
    const attackMults: number[] = [];
    let wins = 0;
    let draws = 0;

    for (const insight of teamInsights) {
      const isHome = insight.homeTeamId === team.id;
      attackMults.push(isHome ? insight.homeAttackMultiplier : insight.awayAttackMultiplier);

      const teamGoals = isHome ? insight.homeGoals : insight.awayGoals;
      const oppGoals = isHome ? insight.awayGoals : insight.homeGoals;
      if (teamGoals > oppGoals) wins++;
      else if (teamGoals === oppGoals) draws++;
    }

    const xgPerformanceScore = attackMults.reduce((a, b) => a + b, 0) / attackMults.length;

    // Result score: normalized 0-1
    const resultScore = (wins * 3 + draws * 1) / (matchesPlayed * 3);

    // Elo change score: normalized to [0, 1]
    const eloDelta = (liveElo[team.id] ?? team.eloRating) - (baselineElo[team.id] ?? team.eloRating);
    const eloChangeNorm = Math.max(-0.5, Math.min(0.5, eloDelta / 100));
    const eloChangeScore = eloChangeNorm + 0.5; // now 0-1

    // Auto composite: xG 40%, result 30%, Elo 30%
    // xgPerformanceScore is typically 0.65-1.45 range, normalize to ~0-1:
    // map [0.65, 1.45] → [0, 1]
    const xgNorm = Math.max(0, Math.min(1, (xgPerformanceScore - 0.65) / 0.80));

    const autoScore = (xgNorm * 0.4 + resultScore * 0.3 + eloChangeScore * 0.3) * 100;

    const override = manualOverrides?.[team.id];

    scores.push({
      teamId: team.id,
      xgPerformanceScore,
      resultScore,
      eloChangeScore,
      autoScore: Math.round(autoScore * 10) / 10,
      manualOverride: override?.score,
      manualNote: override?.note,
      finalScore: override?.score ?? Math.round(autoScore * 10) / 10,
      matchesPlayed,
    });
  }

  // Sort by finalScore descending
  scores.sort((a, b) => b.finalScore - a.finalScore);

  return scores;
}
