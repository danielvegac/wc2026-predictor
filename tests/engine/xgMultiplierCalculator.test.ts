import { describe, it, expect } from "vitest";
import { calculateXGMultipliers } from "../../src/engine/xgMultiplierCalculator";

describe("calculateXGMultipliers", () => {
  it("caps extreme values — England 2.82 xG vs Croatia 0.53 xG", () => {
    const result = calculateXGMultipliers({
      matchId: "GS-L-1",
      homeTeamId: "ENG",
      awayTeamId: "CRO",
      homeXG: 2.82,
      awayXG: 0.53,
      homeGoals: 4,
      awayGoals: 2,
    });

    // homeAttack = 2.82 / 1.35 = 2.089 → capped at 1.45
    expect(result.homeAttackMultiplier).toBe(1.45);
    // awayAttack = 0.53 / 1.35 = 0.393 → floored at 0.65
    expect(result.awayAttackMultiplier).toBe(0.65);
    // homeDefense = 1.35 / 0.53 = 2.547 → capped at 1.45 (worse defense since opponent had low xG? No — homeDefense = avgXG / awayXG)
    // Wait: homeDefense = TOURNAMENT_AVG_XG / awayXG = 1.35 / 0.53 = 2.547 → capped at 1.45
    expect(result.homeDefenseMultiplier).toBeCloseTo(1.45, 2);
    // awayDefense = 1.35 / 2.82 = 0.479 → floored at 0.65
    expect(result.awayDefenseMultiplier).toBeCloseTo(0.65, 2);
  });

  it("returns unclamped values for moderate xG", () => {
    const result = calculateXGMultipliers({
      matchId: "test",
      homeTeamId: "A",
      awayTeamId: "B",
      homeXG: 1.5,
      awayXG: 1.2,
      homeGoals: 1,
      awayGoals: 1,
    });

    expect(result.homeAttackMultiplier).toBeCloseTo(1.5 / 1.35, 2);
    expect(result.awayAttackMultiplier).toBeCloseTo(1.2 / 1.35, 2);
    expect(result.homeDefenseMultiplier).toBeCloseTo(1.35 / 1.2, 2);
    expect(result.awayDefenseMultiplier).toBeCloseTo(1.35 / 1.5, 2);
  });
});
