// ============================================================
// xG Multiplier Calculator
// ============================================================
// Auto-calculates form multipliers from xG data.
// Includes red card deflation: goals scored/conceded with
// numerical advantage are discounted.

export interface XGMatchData {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeXG: number;
  awayXG: number;
  homeGoals: number;
  awayGoals: number;
  // Red card context
  homeRedCards?: number;   // red cards received by home team
  awayRedCards?: number;   // red cards received by away team
  redCardMinute?: number;  // approx minute red card occurred
}

const TOURNAMENT_AVG_XG = 1.35;

// Per red card: deflate the red-carded team's multipliers
const RED_CARD_DEFLATION = 0.15;
// Per red card: deflate the opponent's multipliers (goals vs fewer men are easier)
const OPPONENT_DEFLATION = 0.12;

export function calculateXGMultipliers(data: XGMatchData): {
  homeAttackMultiplier: number;
  homeDefenseMultiplier: number;
  awayAttackMultiplier: number;
  awayDefenseMultiplier: number;
} {
  // Base xG calculation (before clamp)
  let homeAttack = data.homeXG / TOURNAMENT_AVG_XG;
  let awayAttack = data.awayXG / TOURNAMENT_AVG_XG;
  let homeDefense = TOURNAMENT_AVG_XG / data.awayXG;
  let awayDefense = TOURNAMENT_AVG_XG / data.homeXG;

  // Red card deflation — applied AFTER base calc, BEFORE clamp
  const homeReds = data.homeRedCards ?? 0;
  const awayReds = data.awayRedCards ?? 0;

  if (awayReds > 0) {
    // Away team got red cards: deflate away team + deflate home team (easier goals)
    awayAttack *= (1 - RED_CARD_DEFLATION * awayReds);
    awayDefense *= (1 - RED_CARD_DEFLATION * awayReds);
    homeAttack *= (1 - OPPONENT_DEFLATION * awayReds);
    homeDefense *= (1 - OPPONENT_DEFLATION * awayReds);
  }

  if (homeReds > 0) {
    // Home team got red cards: deflate home team + deflate away team (easier goals)
    homeAttack *= (1 - RED_CARD_DEFLATION * homeReds);
    homeDefense *= (1 - RED_CARD_DEFLATION * homeReds);
    awayAttack *= (1 - OPPONENT_DEFLATION * homeReds);
    awayDefense *= (1 - OPPONENT_DEFLATION * homeReds);
  }

  // Clamp to [0.65, 1.45]
  return {
    homeAttackMultiplier: Math.max(0.65, Math.min(1.45, homeAttack)),
    homeDefenseMultiplier: Math.max(0.65, Math.min(1.45, homeDefense)),
    awayAttackMultiplier: Math.max(0.65, Math.min(1.45, awayAttack)),
    awayDefenseMultiplier: Math.max(0.65, Math.min(1.45, awayDefense)),
  };
}
