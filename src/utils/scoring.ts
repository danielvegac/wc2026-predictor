// ============================================================
// Prediction Scoring System — Quiniela / Polla Style
// ============================================================
// Points per match (max 9):
//   Exact score (both goals correct):  3 pts
//   Correct result (W/D/L):            2 pts
//   Correct home goals:                2 pts
//   Correct away goals:                2 pts
// These stack independently.
//
// Tournament bonuses:
//   Correct champion:   15 pts
//   Correct runner-up:  10 pts
//   Correct third place: 5 pts
//
// Max possible: 72 matches × 9 = 648 + 30 bonus = 678 pts

import type { Prediction, ScoreBreakdown, ComparisonScore, MatchScore } from "../types";

type Result = "home" | "draw" | "away";

function getResult(homeGoals: number, awayGoals: number): Result {
  if (homeGoals > awayGoals) return "home";
  if (homeGoals < awayGoals) return "away";
  return "draw";
}

/**
 * Score a single prediction against an actual result.
 */
export function scoreMatch(
  pred: Prediction,
  actual: Prediction
): ScoreBreakdown {
  const predResult = getResult(pred.homeGoals, pred.awayGoals);
  const actualResult = getResult(actual.homeGoals, actual.awayGoals);

  const isCorrectResult = predResult === actualResult;
  const homeGoalsCorrect = pred.homeGoals === actual.homeGoals;
  const awayGoalsCorrect = pred.awayGoals === actual.awayGoals;
  const isExactScore = homeGoalsCorrect && awayGoalsCorrect;

  const exactScorePoints = isExactScore ? 3 : 0;
  const resultPoints = isCorrectResult ? 2 : 0;
  const homeGoalsPoints = homeGoalsCorrect ? 2 : 0;
  const awayGoalsPoints = awayGoalsCorrect ? 2 : 0;

  return {
    exactScorePoints,
    resultPoints,
    homeGoalsPoints,
    awayGoalsPoints,
    totalPoints: exactScorePoints + resultPoints + homeGoalsPoints + awayGoalsPoints,
    isExactScore,
    isCorrectResult,
    homeGoalsCorrect,
    awayGoalsCorrect,
  };
}

/**
 * Score an entire bracket (all matches + champion/runner-up/third)
 */
export function scoreFullBracket(
  userPredictions: Prediction[],
  actualPredictions: Prediction[],
  userChampion: string | null,
  userRunnerUp: string | null,
  userThirdPlace: string | null,
  actualChampion: string | null,
  actualRunnerUp: string | null,
  actualThirdPlace: string | null
): ComparisonScore {
  const actualMap = new Map(actualPredictions.map((p) => [p.matchId, p]));
  const matchScores: Record<string, MatchScore> = {};

  let totalPoints = 0;
  let correctResults = 0;
  let correctScores = 0;
  let totalExactScorePoints = 0;
  let totalResultPoints = 0;
  let totalGoalsPoints = 0;

  for (const userPred of userPredictions) {
    const actualPred = actualMap.get(userPred.matchId);
    if (!actualPred) continue;

    const breakdown = scoreMatch(userPred, actualPred);

    matchScores[userPred.matchId] = {
      matchId: userPred.matchId,
      userPrediction: userPred,
      modelPrediction: actualPred,
      actual: actualPred,
      ...breakdown,
    };

    totalPoints += breakdown.totalPoints;
    totalExactScorePoints += breakdown.exactScorePoints;
    totalResultPoints += breakdown.resultPoints;
    totalGoalsPoints += breakdown.homeGoalsPoints + breakdown.awayGoalsPoints;

    if (breakdown.isCorrectResult) correctResults++;
    if (breakdown.isExactScore) correctScores++;
  }

  // Bonus points
  const championCorrect = userChampion === actualChampion;
  const runnerUpCorrect = userRunnerUp === actualRunnerUp;
  const thirdPlaceCorrect = userThirdPlace === actualThirdPlace;

  if (championCorrect) totalPoints += 15;
  if (runnerUpCorrect) totalPoints += 10;
  if (thirdPlaceCorrect) totalPoints += 5;

  return {
    totalPoints,
    maxPossible: 678,
    correctResults,
    correctScores,
    totalMatches: userPredictions.length,
    totalExactScorePoints,
    totalResultPoints,
    totalGoalsPoints,
    championCorrect,
    runnerUpCorrect,
    thirdPlaceCorrect,
    matchScores,
  };
}
