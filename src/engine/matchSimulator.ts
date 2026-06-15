// ============================================================
// Match Simulator
// ============================================================
// Combines Elo ratings and Poisson model to simulate individual matches.

import type { Team, TeamStrength, MatchSimResult } from "../types";
import { simulateScore, matchOutcomeProbabilities, mostLikelyScore, scoreDistribution } from "./poisson";
import { getExpectedGoals } from "./strengthCalculator";
import { eloGoalAdjustment } from "./elo";

/**
 * Calculate expected goals (lambdas) for both teams in a match
 * @param liveElo Optional live Elo ratings override
 */
export function calculateLambdas(
  homeTeam: Team,
  awayTeam: Team,
  homeStrength: TeamStrength,
  awayStrength: TeamStrength,
  liveElo?: Record<string, number>
): { lambdaHome: number; lambdaAway: number } {
  const homeElo = liveElo?.[homeTeam.id] ?? homeTeam.eloRating;
  const awayElo = liveElo?.[awayTeam.id] ?? awayTeam.eloRating;

  // Base expected goals from attack/defense strength
  let lambdaHome = getExpectedGoals(
    homeStrength.attackStrength,
    awayStrength.defenseStrength
  );
  let lambdaAway = getExpectedGoals(
    awayStrength.attackStrength,
    homeStrength.defenseStrength
  );

  // Apply Elo adjustment
  const eloAdjHome = eloGoalAdjustment(homeElo, awayElo);
  const eloAdjAway = eloGoalAdjustment(awayElo, homeElo);

  lambdaHome *= eloAdjHome;
  lambdaAway *= eloAdjAway;

  // Mismatch multiplier: when Elo gap ≥ 300, standard Poisson underestimates
  // total goals. Historical WC data shows avg 3.4 goals at 300-500 gap,
  // 4.2 goals at 500+ gap, vs 2.5 at <100 gap.
  const eloGap = Math.abs(homeElo - awayElo);
  const isFavorite = homeElo > awayElo;

  if (eloGap >= 300) {
    const gapFactor = Math.min((eloGap - 300) / 400, 1.0); // 0 to 1
    const favMultiplier = 1.15 + gapFactor * 0.20;          // 1.15 to 1.35
    const underdogMultiplier = 1.08 + gapFactor * 0.04;     // 1.08 to 1.12

    if (isFavorite) {
      lambdaHome *= favMultiplier;
      lambdaAway *= underdogMultiplier;
    } else {
      lambdaAway *= favMultiplier;
      lambdaHome *= underdogMultiplier;
    }
  }

  // Clamp lambdas to reasonable range (0.3 - 6.0 goals expected)
  lambdaHome = Math.max(0.3, Math.min(6.0, lambdaHome));
  lambdaAway = Math.max(0.3, Math.min(6.0, lambdaAway));

  return { lambdaHome, lambdaAway };
}

/**
 * Simulate a single match, returning a random scoreline
 */
export function simulateMatch(
  homeTeam: Team,
  awayTeam: Team,
  homeStrength: TeamStrength,
  awayStrength: TeamStrength
): { homeGoals: number; awayGoals: number } {
  const { lambdaHome, lambdaAway } = calculateLambdas(
    homeTeam, awayTeam, homeStrength, awayStrength
  );

  const [homeGoals, awayGoals] = simulateScore(lambdaHome, lambdaAway);
  return { homeGoals, awayGoals };
}

/**
 * Generate full match analysis (probabilities, distributions, most likely score)
 */
export function analyzeMatch(
  matchId: string,
  homeTeam: Team,
  awayTeam: Team,
  homeStrength: TeamStrength,
  awayStrength: TeamStrength
): MatchSimResult {
  const { lambdaHome, lambdaAway } = calculateLambdas(
    homeTeam, awayTeam, homeStrength, awayStrength
  );

  const outcomes = matchOutcomeProbabilities(lambdaHome, lambdaAway);
  const likely = mostLikelyScore(lambdaHome, lambdaAway);
  const dist = scoreDistribution(lambdaHome, lambdaAway);

  return {
    matchId,
    homeWinProb: outcomes.homeWin,
    drawProb: outcomes.draw,
    awayWinProb: outcomes.awayWin,
    expectedHomeGoals: lambdaHome,
    expectedAwayGoals: lambdaAway,
    mostLikelyScore: likely,
    scoreDistribution: dist,
  };
}

/**
 * Simulate a knockout match with penalties if drawn
 * Returns the winner's team ID along with the score
 */
export function simulateKnockoutMatch(
  homeTeam: Team,
  awayTeam: Team,
  homeStrength: TeamStrength,
  awayStrength: TeamStrength
): { homeGoals: number; awayGoals: number; winner: string; penalties: boolean } {
  const { homeGoals, awayGoals } = simulateMatch(
    homeTeam, awayTeam, homeStrength, awayStrength
  );

  if (homeGoals !== awayGoals) {
    return {
      homeGoals,
      awayGoals,
      winner: homeGoals > awayGoals ? homeTeam.id : awayTeam.id,
      penalties: false,
    };
  }

  // Drawn — penalty shootout
  // Slight bias toward higher-Elo team (55/45 split per 100 Elo points)
  const eloDiff = homeTeam.eloRating - awayTeam.eloRating;
  const homeWinPenaltyProb = 1 / (1 + Math.pow(10, -eloDiff / 800));
  const winner = Math.random() < homeWinPenaltyProb ? homeTeam.id : awayTeam.id;

  return { homeGoals, awayGoals, winner, penalties: true };
}
