// ============================================================
// Prediction Scoring System
// ============================================================
// Compares user predictions against model predictions or actual results.
//
// Points:
//   Exact score:              5 pts
//   Correct result + GD:      4 pts
//   Correct result only:      3 pts
//   Wrong result:             0 pts
//   Correct knockout advance: 2 pts (bonus)
//   Correct champion:        10 pts (bonus)
//   Correct runner-up:        7 pts (bonus)
//   Correct third place:      5 pts (bonus)

import type { Prediction, ComparisonScore, MatchScore } from "../types";

type Result = "home" | "draw" | "away";

function getResult(homeGoals: number, awayGoals: number): Result {
  if (homeGoals > awayGoals) return "home";
  if (homeGoals < awayGoals) return "away";
  return "draw";
}

/**
 * Score a single match prediction
 */
export function scoreMatch(
  user: Prediction,
  actual: Prediction
): MatchScore {
  const userResult = getResult(user.homeGoals, user.awayGoals);
  const actualResult = getResult(actual.homeGoals, actual.awayGoals);

  let points = 0;
  let category: MatchScore["category"] = "wrong";

  if (userResult === actualResult) {
    if (user.homeGoals === actual.homeGoals && user.awayGoals === actual.awayGoals) {
      points = 5;
      category = "exact";
    } else if (
      user.homeGoals - user.awayGoals === actual.homeGoals - actual.awayGoals
    ) {
      points = 4;
      category = "goal_diff";
    } else {
      points = 3;
      category = "result";
    }
  }

  return {
    matchId: user.matchId,
    userPrediction: user,
    modelPrediction: actual,
    points,
    category,
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

  for (const userPred of userPredictions) {
    const actualPred = actualMap.get(userPred.matchId);
    if (!actualPred) continue;

    const score = scoreMatch(userPred, actualPred);
    matchScores[userPred.matchId] = score;
    totalPoints += score.points;

    if (score.category !== "wrong") correctResults++;
    if (score.category === "exact") correctScores++;
  }

  // Bonus points
  const championCorrect = userChampion === actualChampion;
  const runnerUpCorrect = userRunnerUp === actualRunnerUp;
  const thirdPlaceCorrect = userThirdPlace === actualThirdPlace;

  if (championCorrect) totalPoints += 10;
  if (runnerUpCorrect) totalPoints += 7;
  if (thirdPlaceCorrect) totalPoints += 5;

  return {
    totalPoints,
    maxPossible: 586,
    correctResults,
    correctScores,
    totalMatches: userPredictions.length,
    championCorrect,
    runnerUpCorrect,
    thirdPlaceCorrect,
    matchScores,
  };
}
