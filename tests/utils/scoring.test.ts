// ============================================================
// Scoring System Tests
// ============================================================

import { describe, it, expect } from "vitest";
import { scoreMatch, scoreFullBracket } from "../../src/utils/scoring";
import type { Prediction } from "../../src/types";

const pred = (
  matchId: string,
  homeGoals: number,
  awayGoals: number,
  source: "user" | "model" = "user"
): Prediction => ({ matchId, homeGoals, awayGoals, source });

describe("scoreMatch", () => {
  it("awards the full 9 points for an exact-score match", () => {
    const b = scoreMatch(pred("m1", 2, 1), pred("m1", 2, 1));
    expect(b.exactScorePoints).toBe(3);
    expect(b.resultPoints).toBe(2);
    expect(b.homeGoalsPoints).toBe(2);
    expect(b.awayGoalsPoints).toBe(2);
    expect(b.totalPoints).toBe(9);
    expect(b.isExactScore).toBe(true);
    expect(b.isCorrectResult).toBe(true);
    expect(b.homeGoalsCorrect).toBe(true);
    expect(b.awayGoalsCorrect).toBe(true);
  });

  it("awards result + one goal tally when only home goals match", () => {
    // predicted 2-0 (home win), actual 2-1 (home win)
    const b = scoreMatch(pred("m1", 2, 0), pred("m1", 2, 1));
    expect(b.isExactScore).toBe(false);
    expect(b.exactScorePoints).toBe(0);
    expect(b.homeGoalsCorrect).toBe(true);
    expect(b.awayGoalsCorrect).toBe(false);
    expect(b.homeGoalsPoints).toBe(2);
    expect(b.awayGoalsPoints).toBe(0);
    expect(b.isCorrectResult).toBe(true);
    expect(b.resultPoints).toBe(2);
    expect(b.totalPoints).toBe(4);
  });

  it("awards only the away goal tally when result is wrong", () => {
    // predicted 0-1 (away win), actual 2-1 (home win)
    const b = scoreMatch(pred("m1", 0, 1), pred("m1", 2, 1));
    expect(b.isCorrectResult).toBe(false);
    expect(b.resultPoints).toBe(0);
    expect(b.homeGoalsCorrect).toBe(false);
    expect(b.awayGoalsCorrect).toBe(true);
    expect(b.awayGoalsPoints).toBe(2);
    expect(b.totalPoints).toBe(2);
  });

  it("scores a correct draw result without exact score", () => {
    // predicted 1-1, actual 2-2 -> correct result (draw), no goal tallies
    const b = scoreMatch(pred("m1", 1, 1), pred("m1", 2, 2));
    expect(b.isCorrectResult).toBe(true);
    expect(b.resultPoints).toBe(2);
    expect(b.isExactScore).toBe(false);
    expect(b.homeGoalsPoints).toBe(0);
    expect(b.awayGoalsPoints).toBe(0);
    expect(b.totalPoints).toBe(2);
  });

  it("awards zero for a completely wrong prediction", () => {
    // predicted 3-0 (home win), actual 0-1 (away win)
    const b = scoreMatch(pred("m1", 3, 0), pred("m1", 0, 1));
    expect(b.totalPoints).toBe(0);
    expect(b.isExactScore).toBe(false);
    expect(b.isCorrectResult).toBe(false);
  });
});

describe("scoreFullBracket", () => {
  it("sums match points and adds all three tournament bonuses when correct", () => {
    const user = [pred("m1", 2, 1), pred("m2", 0, 0)];
    const actual = [pred("m1", 2, 1, "model"), pred("m2", 0, 0, "model")];

    const score = scoreFullBracket(
      user,
      actual,
      "ARG",
      "FRA",
      "ESP",
      "ARG",
      "FRA",
      "ESP"
    );

    // two exact scores = 18 match points + 30 bonus
    expect(score.totalPoints).toBe(18 + 30);
    expect(score.correctScores).toBe(2);
    expect(score.correctResults).toBe(2);
    expect(score.totalMatches).toBe(2);
    expect(score.championCorrect).toBe(true);
    expect(score.runnerUpCorrect).toBe(true);
    expect(score.thirdPlaceCorrect).toBe(true);
    expect(score.maxPossible).toBe(678);
    expect(Object.keys(score.matchScores)).toHaveLength(2);
  });

  it("ignores user predictions with no matching actual result", () => {
    const user = [pred("m1", 1, 0), pred("orphan", 5, 5)];
    const actual = [pred("m1", 1, 0, "model")];

    // Mismatched champions -> no tournament bonuses, isolating match points.
    const score = scoreFullBracket(
      user,
      actual,
      "ARG",
      "BRA",
      "ESP",
      "FRA",
      "ENG",
      "POR"
    );

    expect(Object.keys(score.matchScores)).toEqual(["m1"]);
    expect(score.totalPoints).toBe(9);
    // totalMatches counts submitted user predictions, not scored ones
    expect(score.totalMatches).toBe(2);
  });

  it("applies bonuses independently", () => {
    const score = scoreFullBracket(
      [],
      [],
      "ARG",
      "BRA",
      "ESP",
      "ARG", // champion correct: +15
      "FRA", // runner-up wrong
      "ESP" // third correct: +5
    );
    expect(score.totalPoints).toBe(20);
    expect(score.championCorrect).toBe(true);
    expect(score.runnerUpCorrect).toBe(false);
    expect(score.thirdPlaceCorrect).toBe(true);
  });

  it("accumulates the per-category point breakdown", () => {
    // m1: exact (3+2+2+2=9). m2: home win predicted 2-0, actual 3-0 -> result(2)+away goals(2)=4
    const user = [pred("m1", 1, 1), pred("m2", 2, 0)];
    const actual = [pred("m1", 1, 1, "model"), pred("m2", 3, 0, "model")];

    // Mismatched champions -> no tournament bonuses, isolating match points.
    const score = scoreFullBracket(
      user,
      actual,
      "ARG",
      "BRA",
      "ESP",
      "FRA",
      "ENG",
      "POR"
    );

    expect(score.totalExactScorePoints).toBe(3);
    expect(score.totalResultPoints).toBe(4);
    expect(score.totalGoalsPoints).toBe(4 + 2); // m1 both goals + m2 away goals
    expect(score.totalPoints).toBe(9 + 4);
  });
});
