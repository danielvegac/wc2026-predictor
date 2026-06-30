import { describe, it, expect, beforeEach } from "vitest";
import { useResultsStore } from "../../src/store/resultsStore";
import { knockoutMatches } from "../../src/data/knockoutMatches";
import { scoreMatch } from "../../src/utils/scoring";

describe("resultsStore — knockout match results from ESPN", () => {
  beforeEach(() => {
    useResultsStore.setState({ results: [], lastFetched: null, source: null });
  });

  it("maps an ESPN scoreboard result to the matching R32 fixture by team pair", () => {
    const ko = knockoutMatches.find((m) => m.matchId === "R32-05")!; // CIV vs NOR
    expect(ko).toBeDefined();

    useResultsStore.getState().setResults(
      [
        {
          matchId: null,
          homeTeamId: ko.homeTeamId,
          awayTeamId: ko.awayTeamId,
          homeScore: 2,
          awayScore: 1,
          date: "2026-06-30",
          stage: "Round of 32",
          completed: true,
        },
      ],
      "live"
    );

    const result = useResultsStore.getState().getResultForMatch("R32-05");
    expect(result).not.toBeNull();
    expect(result?.homeScore).toBe(2);
    expect(result?.awayScore).toBe(1);
  });

  it("flips scores back when ESPN reports the pair with home/away swapped", () => {
    const ko = knockoutMatches.find((m) => m.matchId === "R32-06")!; // FRA vs SWE

    useResultsStore.getState().setResults(
      [
        {
          matchId: null,
          homeTeamId: ko.awayTeamId, // SWE reported as "home" by ESPN
          awayTeamId: ko.homeTeamId,
          homeScore: 0,
          awayScore: 3,
          date: "2026-06-30",
          stage: "Round of 32",
          completed: true,
        },
      ],
      "live"
    );

    const result = useResultsStore.getState().getResultForMatch("R32-06");
    expect(result?.homeTeamId).toBe(ko.homeTeamId); // FRA
    expect(result?.homeScore).toBe(3); // FRA's score, un-flipped
    expect(result?.awayScore).toBe(0);
  });

  it("a completed knockout result scores correctly for both the model and the user pick", () => {
    useResultsStore.getState().setResults(
      [
        {
          matchId: null,
          homeTeamId: "CIV",
          awayTeamId: "NOR",
          homeScore: 2,
          awayScore: 1,
          date: "2026-06-30",
          stage: "Round of 32",
          completed: true,
        },
      ],
      "live"
    );

    const actual = useResultsStore.getState().getResultForMatch("R32-05")!;
    const actualPred = {
      matchId: "R32-05",
      homeGoals: actual.homeScore,
      awayGoals: actual.awayScore,
      source: "model" as const,
    };

    // Model predicted the exact score
    const modelScore = scoreMatch(
      { matchId: "R32-05", homeGoals: 2, awayGoals: 1, source: "model" },
      actualPred
    );
    expect(modelScore.isExactScore).toBe(true);
    expect(modelScore.totalPoints).toBe(9);

    // User predicted the correct result but wrong score
    const userScore = scoreMatch(
      { matchId: "R32-05", homeGoals: 1, awayGoals: 0, source: "user" },
      actualPred
    );
    expect(userScore.isExactScore).toBe(false);
    expect(userScore.isCorrectResult).toBe(true);
    expect(userScore.totalPoints).toBe(2 + 0 + 0); // result only, no goal lines match
  });
});
