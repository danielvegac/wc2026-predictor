// ============================================================
// Elo Updater Tests
// ============================================================

import { describe, it, expect } from "vitest";
import {
  updateEloFromResult,
  processNewResults,
  type MatchResultForElo,
} from "../../src/engine/eloUpdater";

describe("updateEloFromResult", () => {
  it("is zero-sum: points gained by one team equal points lost by the other", () => {
    const [home, away] = updateEloFromResult(1800, 1800, {
      homeScore: 2,
      awayScore: 0,
    });
    expect(home - 1800).toBe(-(away - 1800));
  });

  it("raises the winner's rating and lowers the loser's", () => {
    const [home, away] = updateEloFromResult(1800, 1800, {
      homeScore: 3,
      awayScore: 1,
    });
    expect(home).toBeGreaterThan(1800);
    expect(away).toBeLessThan(1800);
  });

  it("leaves equal teams unchanged on a draw", () => {
    const [home, away] = updateEloFromResult(1800, 1800, {
      homeScore: 1,
      awayScore: 1,
    });
    expect(home).toBe(1800);
    expect(away).toBe(1800);
  });

  it("moves an upset winner more than an expected winner", () => {
    // underdog (1600) beats favorite (2000)
    const [underdogNew] = updateEloFromResult(1600, 2000, {
      homeScore: 1,
      awayScore: 0,
    });
    // favorite (2000) beats underdog (1600)
    const [favoriteNew] = updateEloFromResult(2000, 1600, {
      homeScore: 1,
      awayScore: 0,
    });
    expect(underdogNew - 1600).toBeGreaterThan(favoriteNew - 2000);
  });

  it("respects a custom K-factor", () => {
    const [homeDefault] = updateEloFromResult(1800, 1800, {
      homeScore: 1,
      awayScore: 0,
    });
    const [homeSmall] = updateEloFromResult(
      1800,
      1800,
      { homeScore: 1, awayScore: 0 },
      20
    );
    expect(homeDefault - 1800).toBeGreaterThan(homeSmall - 1800);
  });
});

describe("processNewResults", () => {
  const results: MatchResultForElo[] = [
    {
      matchId: "m1",
      homeTeamId: "ARG",
      awayTeamId: "BRA",
      homeScore: 2,
      awayScore: 0,
    },
    {
      matchId: "m2",
      homeTeamId: "ARG",
      awayTeamId: "FRA",
      homeScore: 1,
      awayScore: 1,
    },
  ];

  it("updates Elo for all unprocessed matches and reports the processed ids", () => {
    const currentElo = { ARG: 1900, BRA: 1950, FRA: 1980 };
    const { updatedElo, newlyProcessed } = processNewResults(
      results,
      currentElo,
      new Set()
    );

    expect(newlyProcessed).toEqual(["m1", "m2"]);
    expect(updatedElo.ARG).toBeGreaterThan(1900); // won and drew as underdog
    expect(updatedElo.BRA).toBeLessThan(1950);
  });

  it("does not mutate the input Elo map", () => {
    const currentElo = { ARG: 1900, BRA: 1950, FRA: 1980 };
    processNewResults(results, currentElo, new Set());
    expect(currentElo).toEqual({ ARG: 1900, BRA: 1950, FRA: 1980 });
  });

  it("skips already-processed match ids", () => {
    const currentElo = { ARG: 1900, BRA: 1950, FRA: 1980 };
    const { updatedElo, newlyProcessed } = processNewResults(
      results,
      currentElo,
      new Set(["m1"])
    );
    expect(newlyProcessed).toEqual(["m2"]);
    // BRA only appears in the skipped m1, so it stays put
    expect(updatedElo.BRA).toBe(1950);
  });

  it("skips matches referencing an unknown team", () => {
    const currentElo = { ARG: 1900 }; // BRA / FRA missing
    const { updatedElo, newlyProcessed } = processNewResults(
      results,
      currentElo,
      new Set()
    );
    expect(newlyProcessed).toEqual([]);
    expect(updatedElo.ARG).toBe(1900);
  });
});
