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
 */
export function calculateLambdas(
  homeTeam: Team,
  awayTeam: Team,
  homeStrength: TeamStrength,
  awayStrength: TeamStrength
): { lambdaHome: number; lambdaAway: number } {
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
  const eloAdjHome = eloGoalAdjustment(homeTeam.eloRating, awayTeam.eloRating);
  const eloAdjAway = eloGoalAdjustment(awayTeam.eloRating, homeTeam.eloRating);

  lambdaHome *= eloAdjHome;
  lambdaAway *= eloAdjAway;

  // Clamp lambdas to reasonable range (0.3 - 4.0 goals expected)
  lambdaHome = Math.max(0.3, Math.min(4.0, lambdaHome));
  lambdaAway = Math.max(0.3, Math.min(4.0, lambdaAway));

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
