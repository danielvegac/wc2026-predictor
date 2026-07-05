// ============================================================
// Engine Tests
// ============================================================

import { describe, it, expect } from "vitest";
import { poissonPMF, scorelineProbability, matchOutcomeProbabilities, mostLikelyScore } from "../../src/engine/poisson";
import { expectedScore, eloGoalAdjustment } from "../../src/engine/elo";
import { calculateStrengthFromElo } from "../../src/engine/strengthCalculator";
import { analyzeMatch, calculateLambdas } from "../../src/engine/matchSimulator";
import { runMonteCarlo } from "../../src/engine/monteCarlo";
import { teams, getTeamMap } from "../../src/data/teams";
import { groups } from "../../src/data/groups";

describe("Poisson", () => {
  it("PMF sums to ~1 over reasonable range", () => {
    const lambda = 1.5;
    let total = 0;
    for (let k = 0; k <= 15; k++) {
      total += poissonPMF(lambda, k);
    }
    expect(total).toBeCloseTo(1, 4);
  });

  it("most likely goals for lambda=1.35 is 1", () => {
    // For lambda ≈ 1.35 (WC average), k=1 should be most probable
    const p0 = poissonPMF(1.35, 0);
    const p1 = poissonPMF(1.35, 1);
    const p2 = poissonPMF(1.35, 2);
    expect(p1).toBeGreaterThan(p0);
    expect(p1).toBeGreaterThan(p2);
  });

  it("0-0 is possible but not most likely between average teams", () => {
    const prob00 = scorelineProbability(1.35, 1.35, 0, 0);
    const prob11 = scorelineProbability(1.35, 1.35, 1, 1);
    expect(prob00).toBeGreaterThan(0);
    expect(prob11).toBeGreaterThan(prob00);
  });

  it("outcome probabilities sum to 1", () => {
    const { homeWin, draw, awayWin } = matchOutcomeProbabilities(1.5, 1.2);
    expect(homeWin + draw + awayWin).toBeCloseTo(1, 3);
  });

  it("stronger team should have higher win probability", () => {
    const { homeWin, awayWin } = matchOutcomeProbabilities(2.0, 0.8);
    expect(homeWin).toBeGreaterThan(awayWin);
  });
});

describe("Elo", () => {
  it("equal ratings give 50% expected score", () => {
    expect(expectedScore(1800, 1800)).toBeCloseTo(0.5, 2);
  });

  it("200 point advantage gives ~76% expected", () => {
    const e = expectedScore(2000, 1800);
    expect(e).toBeGreaterThan(0.7);
    expect(e).toBeLessThan(0.8);
  });

  it("goal adjustment favors higher-rated team", () => {
    const adj = eloGoalAdjustment(2000, 1800);
    expect(adj).toBeGreaterThan(1);
  });
});

describe("Match Analysis", () => {
  it("Argentina vs Jordan: Argentina heavily favored", () => {
    const teamMap = getTeamMap();
    const strengths = calculateStrengthFromElo(teams);
    const strengthMap = new Map(strengths.map((s) => [s.teamId, s]));

    const result = analyzeMatch(
      "test-1",
      teamMap.get("ARG")!,
      teamMap.get("JOR")!,
      strengthMap.get("ARG")!,
      strengthMap.get("JOR")!
    );

    expect(result.homeWinProb).toBeGreaterThan(0.6);
    expect(result.expectedHomeGoals).toBeGreaterThan(result.expectedAwayGoals);
  });

  it("Spain vs France: competitive match", () => {
    const teamMap = getTeamMap();
    const strengths = calculateStrengthFromElo(teams);
    const strengthMap = new Map(strengths.map((s) => [s.teamId, s]));

    const result = analyzeMatch(
      "test-2",
      teamMap.get("ESP")!,
      teamMap.get("FRA")!,
      strengthMap.get("ESP")!,
      strengthMap.get("FRA")!
    );

    // Should be relatively close — all three outcomes plausible
    expect(result.homeWinProb).toBeGreaterThan(0.15);
    expect(result.awayWinProb).toBeGreaterThan(0.15);
    expect(result.drawProb).toBeGreaterThan(0.15);
  });
});

describe("Mismatch Multiplier", () => {
  const teamMap = getTeamMap();
  const strengths = calculateStrengthFromElo(teams);
  const strengthMap = new Map(strengths.map((s) => [s.teamId, s]));

  it("Spain (2040) vs Cape Verde (1420): gap=620 → mismatch multiplier applied (recalibrated)", () => {
    const esp = teamMap.get("ESP")!;
    const cpv = teamMap.get("CPV")!;
    const { lambdaHome } = calculateLambdas(esp, cpv, strengthMap.get("ESP")!, strengthMap.get("CPV")!);
    // With recalibrated mismatch multiplier (gap=620, gapFactor=0.8, favMult≈1.20), lambda moderate
    expect(lambdaHome).toBeGreaterThanOrEqual(2.2);
    expect(lambdaHome).toBeLessThanOrEqual(4.0);
  });

  it("Argentina (2060) vs Jordan (1500): gap=560 → mismatch boost", () => {
    const arg = teamMap.get("ARG")!;
    const jor = teamMap.get("JOR")!;
    const { lambdaHome } = calculateLambdas(arg, jor, strengthMap.get("ARG")!, strengthMap.get("JOR")!);
    expect(lambdaHome).toBeGreaterThanOrEqual(2.2);
    expect(lambdaHome).toBeLessThanOrEqual(4.0);
  });

  it("Brazil (1970) vs Morocco (1830): gap=140 → NO multiplier", () => {
    const bra = teamMap.get("BRA")!;
    const mar = teamMap.get("MAR")!;
    const lambdasWith = calculateLambdas(bra, mar, strengthMap.get("BRA")!, strengthMap.get("MAR")!);
    // Gap < 300 — no mismatch multiplier. Lambda should be moderate (well below 4.0 cap).
    // Threshold updated after R16-1 Morocco defense data improved their form rating.
    expect(lambdasWith.lambdaHome).toBeLessThan(3.2);
  });

  it("Spain vs Cape Verde prediction shows expectedHomeGoals in recalibrated range", () => {
    const result = analyzeMatch(
      "test-mismatch",
      teamMap.get("ESP")!,
      teamMap.get("CPV")!,
      strengthMap.get("ESP")!,
      strengthMap.get("CPV")!
    );
    expect(result.expectedHomeGoals).toBeGreaterThanOrEqual(2.2);
    expect(result.expectedHomeGoals).toBeLessThanOrEqual(4.0);
  });
});

describe("Monte Carlo (smoke test)", () => {
  it("runs 100 simulations without crashing", () => {
    const teamMap = getTeamMap();
    const strengths = calculateStrengthFromElo(teams);
    const strengthMap = new Map(strengths.map((s) => [s.teamId, s]));

    const results = runMonteCarlo(groups, teamMap, strengthMap, 100);

    expect(results.numSimulations).toBe(100);
    expect(Object.keys(results.championProbs).length).toBe(48);
  });

  it("top teams have highest championship probability (500 sims)", () => {
    const teamMap = getTeamMap();
    const strengths = calculateStrengthFromElo(teams);
    const strengthMap = new Map(strengths.map((s) => [s.teamId, s]));

    const results = runMonteCarlo(groups, teamMap, strengthMap, 500);

    // Sort by championship probability
    const sorted = Object.entries(results.championProbs)
      .sort(([, a], [, b]) => b - a);

    // Top 5 should include at least 3 of: ARG, ESP, FRA, BRA, ENG, GER
    const topFive = sorted.slice(0, 5).map(([id]) => id);
    const bigTeams = ["ARG", "ESP", "FRA", "BRA", "ENG", "GER"];
    const overlap = topFive.filter((t) => bigTeams.includes(t));
    expect(overlap.length).toBeGreaterThanOrEqual(3);

    // Curaçao should have very low probability
    expect(results.championProbs["CUW"]).toBeLessThan(0.02);
  });
});
