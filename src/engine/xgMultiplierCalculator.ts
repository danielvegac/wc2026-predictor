// ============================================================
// xG Multiplier Calculator
// ============================================================
// Auto-calculates form multipliers from xG data.

export interface XGMatchData {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeXG: number;
  awayXG: number;
  homeGoals: number;
  awayGoals: number;
}

const TOURNAMENT_AVG_XG = 1.35;

export function calculateXGMultipliers(data: XGMatchData): {
  homeAttackMultiplier: number;
  homeDefenseMultiplier: number;
  awayAttackMultiplier: number;
  awayDefenseMultiplier: number;
} {
  const homeAttack = Math.max(0.65, Math.min(1.45, data.homeXG / TOURNAMENT_AVG_XG));
  const awayAttack = Math.max(0.65, Math.min(1.45, data.awayXG / TOURNAMENT_AVG_XG));
  const homeDefense = Math.max(0.65, Math.min(1.45, TOURNAMENT_AVG_XG / data.awayXG));
  const awayDefense = Math.max(0.65, Math.min(1.45, TOURNAMENT_AVG_XG / data.homeXG));
  return {
    homeAttackMultiplier: homeAttack,
    homeDefenseMultiplier: homeDefense,
    awayAttackMultiplier: awayAttack,
    awayDefenseMultiplier: awayDefense,
  };
}
