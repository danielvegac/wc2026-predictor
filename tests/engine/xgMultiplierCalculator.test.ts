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
    // homeDefense = 1.35 / 0.53 = 2.547 → capped at 1.45
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

  it("red card deflation — Canada 4.46 xG with 2 Qatar red cards (extreme case)", () => {
    // With extreme xG (4.46), both with/without red cards get clamped to 1.45.
    // The deflation IS applied (3.30→2.51 pre-clamp) but clamp masks it.
    // We verify the red card fields don't break anything and Qatar stays floored.
    const withRedCards = calculateXGMultipliers({
      matchId: "GS-B-3",
      homeTeamId: "CAN",
      awayTeamId: "QAT",
      homeXG: 4.46,
      awayXG: 0.30,
      homeGoals: 6,
      awayGoals: 0,
      awayRedCards: 2,
      redCardMinute: 31,
    });

    // homeAttack: 4.46/1.35=3.30 * (1-0.12*2)=0.76 → 2.51, still capped at 1.45
    expect(withRedCards.homeAttackMultiplier).toBe(1.45);
    // Qatar attack: 0.30/1.35=0.222 * (1-0.15*2)=0.70 → 0.156, floored to 0.65
    expect(withRedCards.awayAttackMultiplier).toBe(0.65);
    // Qatar defense: 1.35/4.46=0.303 * (1-0.15*2)=0.70 → 0.212, floored 0.65
    expect(withRedCards.awayDefenseMultiplier).toBe(0.65);
  });

  it("red card deflation lowers multipliers for moderate xG values", () => {
    // Switzerland 2.00 xG vs Bosnia 0.32 xG, 1 away red card
    const withoutRed = calculateXGMultipliers({
      matchId: "GS-B-4",
      homeTeamId: "SUI",
      awayTeamId: "BIH",
      homeXG: 2.00,
      awayXG: 0.32,
      homeGoals: 4,
      awayGoals: 1,
    });

    const withRed = calculateXGMultipliers({
      matchId: "GS-B-4",
      homeTeamId: "SUI",
      awayTeamId: "BIH",
      homeXG: 2.00,
      awayXG: 0.32,
      homeGoals: 4,
      awayGoals: 1,
      awayRedCards: 1,
      redCardMinute: 60,
    });

    // homeAttack without: 2.00/1.35 = 1.481 → capped 1.45
    // homeAttack with red: 1.481 * (1 - 0.12) = 1.481 * 0.88 = 1.303
    expect(withRed.homeAttackMultiplier).toBeCloseTo(1.30, 1);
    expect(withRed.homeAttackMultiplier).toBeLessThan(withoutRed.homeAttackMultiplier);
  });
});
