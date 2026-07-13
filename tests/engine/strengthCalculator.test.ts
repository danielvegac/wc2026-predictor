// ============================================================
// Team Strength Calculator Tests
// ============================================================

import { describe, it, expect } from "vitest";
import {
  calculateStrengthFromElo,
  calculateBaseStrengthFromElo,
  getExpectedGoals,
  applyAdjustments,
  TOURNAMENT_AVG_GOALS,
  type StrengthAdjustment,
} from "../../src/engine/strengthCalculator";
import type { Team, TeamStrength } from "../../src/types";

// Fictional team ids (uppercase) so no real match-insight form overrides apply,
// making calculateStrengthFromElo == calculateBaseStrengthFromElo deterministic.
const team = (id: string, eloRating: number): Team => ({
  id,
  name: id,
  shortName: id,
  group: "A",
  confederation: "UEFA",
  fifaRanking: 1,
  eloRating,
  flagEmoji: "",
  primaryColor: "#000000",
  isHost: false,
});

const teams = [team("TA", 2000), team("TB", 1800), team("TC", 1600)];

describe("calculateBaseStrengthFromElo", () => {
  it("returns a strength entry per team", () => {
    const strengths = calculateBaseStrengthFromElo(teams);
    expect(strengths.map((s) => s.teamId)).toEqual(["TA", "TB", "TC"]);
  });

  it("gives stronger teams higher attack and lower (better) defense", () => {
    const [a, , c] = calculateBaseStrengthFromElo(teams);
    expect(a.attackStrength).toBeGreaterThan(c.attackStrength);
    expect(a.defenseStrength).toBeLessThan(c.defenseStrength);
  });

  it("assigns strength ~1.0 to a team at the tournament average Elo", () => {
    // average of 2000/1800/1600 = 1800, so TB is exactly average
    const strengths = calculateBaseStrengthFromElo(teams);
    const avg = strengths.find((s) => s.teamId === "TB")!;
    expect(avg.attackStrength).toBeCloseTo(1, 10);
    expect(avg.defenseStrength).toBeCloseTo(1, 10);
  });

  it("clamps squadStrengthIndex to the [0, 1] range", () => {
    const extremes = calculateBaseStrengthFromElo([
      team("HI", 5000),
      team("LO", 1000),
    ]);
    const hi = extremes.find((s) => s.teamId === "HI")!;
    const lo = extremes.find((s) => s.teamId === "LO")!;
    expect(hi.squadStrengthIndex).toBe(1);
    expect(lo.squadStrengthIndex).toBe(0);
  });

  it("sets a neutral 0.5 form index", () => {
    for (const s of calculateBaseStrengthFromElo(teams)) {
      expect(s.formIndex).toBe(0.5);
    }
  });

  it("honors live Elo overrides", () => {
    const base = calculateBaseStrengthFromElo(teams).find((s) => s.teamId === "TC")!;
    const boosted = calculateBaseStrengthFromElo(teams, { TC: 2200 }).find(
      (s) => s.teamId === "TC"
    )!;
    expect(boosted.attackStrength).toBeGreaterThan(base.attackStrength);
  });
});

describe("calculateStrengthFromElo", () => {
  it("matches base strengths for teams with no form data", () => {
    const withForm = calculateStrengthFromElo(teams);
    const base = calculateBaseStrengthFromElo(teams);
    for (let i = 0; i < teams.length; i++) {
      expect(withForm[i].attackStrength).toBeCloseTo(base[i].attackStrength, 10);
      expect(withForm[i].defenseStrength).toBeCloseTo(base[i].defenseStrength, 10);
    }
  });
});

describe("getExpectedGoals", () => {
  it("multiplies attack, opponent defense, and the average", () => {
    expect(getExpectedGoals(1.2, 0.9)).toBeCloseTo(1.2 * 0.9 * TOURNAMENT_AVG_GOALS, 10);
  });

  it("uses the average as the baseline for neutral strengths", () => {
    expect(getExpectedGoals(1, 1)).toBeCloseTo(TOURNAMENT_AVG_GOALS, 10);
  });

  it("accepts a custom average goals figure", () => {
    expect(getExpectedGoals(1, 1, 2)).toBe(2);
  });
});

describe("applyAdjustments", () => {
  const strengths: TeamStrength[] = [
    { teamId: "TA", attackStrength: 1.2, defenseStrength: 0.8, squadStrengthIndex: 0.9, formIndex: 0.5 },
    { teamId: "TB", attackStrength: 1.0, defenseStrength: 1.0, squadStrengthIndex: 0.5, formIndex: 0.5 },
  ];

  it("applies attack and defense multipliers to the matching team", () => {
    const adj: StrengthAdjustment[] = [
      { teamId: "TA", attackMultiplier: 0.9, defenseMultiplier: 1.1, reason: "injury" },
    ];
    const [a, b] = applyAdjustments(strengths, adj);
    expect(a.attackStrength).toBeCloseTo(1.2 * 0.9, 10);
    expect(a.defenseStrength).toBeCloseTo(0.8 * 1.1, 10);
    // untouched team is unchanged
    expect(b.attackStrength).toBe(1.0);
  });

  it("defaults missing multipliers to 1", () => {
    const adj: StrengthAdjustment[] = [
      { teamId: "TB", attackMultiplier: 1.5, reason: "new coach" },
    ];
    const b = applyAdjustments(strengths, adj).find((s) => s.teamId === "TB")!;
    expect(b.attackStrength).toBeCloseTo(1.5, 10);
    expect(b.defenseStrength).toBe(1.0);
  });

  it("returns teams unchanged when there is no matching adjustment", () => {
    expect(applyAdjustments(strengths, [])).toEqual(strengths);
  });
});
