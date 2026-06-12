// ============================================================
// Team Strength Calculator
// ============================================================
// Computes attack and defense strength relative to tournament average.
// Uses a Dixon-Coles inspired approach adapted for international football.

import type { Team, TeamStrength } from "../types";

/** Historical World Cup average goals per team per match */
export const TOURNAMENT_AVG_GOALS = 1.35;

/**
 * Calculate attack and defense strength for all teams relative to
 * the tournament average. This is a simplified version that derives
 * strength from Elo ratings until real match data is loaded.
 *
 * @param liveElo Optional live Elo ratings (overrides team.eloRating)
 */
export function calculateStrengthFromElo(
  teams: Team[],
  liveElo?: Record<string, number>
): TeamStrength[] {
  const getElo = (t: Team) => liveElo?.[t.id] ?? t.eloRating;
  const avgElo = teams.reduce((sum, t) => sum + getElo(t), 0) / teams.length;

  return teams.map((team) => {
    // Derive attack/defense from Elo as a baseline
    // Better teams (higher Elo) get proportionally higher attack
    // and lower defense (fewer goals conceded)
    const eloRatio = getElo(team) / avgElo;

    // Attack strength: how many goals this team scores relative to average
    // Scale: 1.0 = average, >1 = above average
    const attackStrength = Math.pow(eloRatio, 1.5);

    // Defense strength: how many goals this team concedes relative to average
    // Scale: 1.0 = average, <1 = better defense (concedes fewer)
    const defenseStrength = Math.pow(1 / eloRatio, 1.2);

    // Squad strength: approximate from Elo tier
    // Top teams (Elo > 1900) have ~80-95% players in top-5 leagues
    // Lower teams (Elo < 1500) have ~10-30%
    const squadStrengthIndex = Math.min(
      1,
      Math.max(0, (getElo(team) - 1300) / 800)
    );

    // Form index: baseline 0.5 (neutral), adjusted later from real data
    const formIndex = 0.5;

    return {
      teamId: team.id,
      attackStrength,
      defenseStrength,
      squadStrengthIndex,
      formIndex,
    };
  });
}

/**
 * Get expected goals (lambda) for a team in a specific match
 *
 * lambda_home = attack_home * defense_away * TOURNAMENT_AVG_GOALS
 * lambda_away = attack_away * defense_home * TOURNAMENT_AVG_GOALS
 */
export function getExpectedGoals(
  attackStrength: number,
  opponentDefenseStrength: number,
  avgGoals: number = TOURNAMENT_AVG_GOALS
): number {
  return attackStrength * opponentDefenseStrength * avgGoals;
}

/**
 * Apply qualitative adjustments to team strength
 * These are optional overrides the user or an LLM can set
 */
export interface StrengthAdjustment {
  teamId: string;
  attackMultiplier?: number;   // e.g. 0.9 for key striker injured
  defenseMultiplier?: number;  // e.g. 1.1 for new defensive coach
  reason: string;
}

export function applyAdjustments(
  strengths: TeamStrength[],
  adjustments: StrengthAdjustment[]
): TeamStrength[] {
  const adjustMap = new Map(adjustments.map((a) => [a.teamId, a]));

  return strengths.map((s) => {
    const adj = adjustMap.get(s.teamId);
    if (!adj) return s;

    return {
      ...s,
      attackStrength: s.attackStrength * (adj.attackMultiplier ?? 1),
      defenseStrength: s.defenseStrength * (adj.defenseMultiplier ?? 1),
    };
  });
}
