// ============================================================
// Knockout Stage Simulator
// ============================================================
// Maps group stage qualifiers into the R32 bracket and simulates
// all knockout matches through to the final.

import type { Team, TeamStrength, GroupStanding } from "../types";
import { simulateKnockoutMatch } from "./matchSimulator";

/**
 * FIFA's Round of 32 bracket structure for the 48-team format.
 *
 * The bracket is divided into two halves (top/bottom) to prevent
 * the top two seeded teams from meeting before the final.
 *
 * R32 matchups (simplified — actual FIFA bracket depends on which
 * 3rd-place teams qualify, but this captures the general structure):
 *
 * Each R32 match pairs a group winner/runner-up against a team
 * from a different group (runner-up or qualifying 3rd-place team).
 */
export interface BracketSlot {
  matchId: string;
  home: string; // team ID
  away: string; // team ID
}

/**
 * Build the Round of 32 bracket from group results.
 *
 * This uses a simplified but valid mapping:
 * - 24 automatic qualifiers (12 winners + 12 runners-up)
 * - 8 best third-place teams
 * - Group winners play third-place qualifiers or runners-up from distant groups
 *
 * The actual FIFA bracket is complex and depends on which third-place
 * teams qualify. This implementation uses a deterministic mapping
 * that preserves the spirit of the seeding.
 */
export function buildR32Bracket(
  standings: Record<string, GroupStanding[]>,
  qualifiedThird: string[]
): BracketSlot[] {
  const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  const winners: Record<string, string> = {};
  const runnersUp: Record<string, string> = {};

  for (const g of groups) {
    winners[g] = standings[g][0].teamId;
    runnersUp[g] = standings[g][1].teamId;
  }

  // Simplified R32 bracket mapping
  // Top half: Groups A-F, Bottom half: Groups G-L
  // Winners face third-place or runners-up from opposite half where possible
  const bracket: BracketSlot[] = [
    // Top half
    { matchId: "R32-1", home: winners["A"], away: runnersUp["C"] },
    { matchId: "R32-2", home: winners["B"], away: runnersUp["D"] },
    { matchId: "R32-3", home: winners["C"], away: runnersUp["A"] },
    { matchId: "R32-4", home: winners["D"], away: runnersUp["B"] },
    { matchId: "R32-5", home: winners["E"], away: runnersUp["F"] },
    { matchId: "R32-6", home: winners["F"], away: runnersUp["E"] },
    // Third-place matchups (top half)
    { matchId: "R32-7", home: qualifiedThird[0] || "TBD", away: qualifiedThird[1] || "TBD" },
    { matchId: "R32-8", home: qualifiedThird[2] || "TBD", away: qualifiedThird[3] || "TBD" },

    // Bottom half
    { matchId: "R32-9", home: winners["G"], away: runnersUp["I"] },
    { matchId: "R32-10", home: winners["H"], away: runnersUp["J"] },
    { matchId: "R32-11", home: winners["I"], away: runnersUp["G"] },
    { matchId: "R32-12", home: winners["J"], away: runnersUp["H"] },
    { matchId: "R32-13", home: winners["K"], away: runnersUp["L"] },
    { matchId: "R32-14", home: winners["L"], away: runnersUp["K"] },
    // Third-place matchups (bottom half)
    { matchId: "R32-15", home: qualifiedThird[4] || "TBD", away: qualifiedThird[5] || "TBD" },
    { matchId: "R32-16", home: qualifiedThird[6] || "TBD", away: qualifiedThird[7] || "TBD" },
  ];

  return bracket;
}

/**
 * Simulate the entire knockout stage from R32 through the Final.
 * Returns champion, runner-up, and third-place team.
 */
export function simulateKnockoutStage(
  r32Bracket: BracketSlot[],
  teams: Map<string, Team>,
  strengths: Map<string, TeamStrength>
): { champion: string; runnerUp: string; thirdPlace: string } {
  // Round of 32 → 16 winners
  const r16Winners = simulateRound(r32Bracket, teams, strengths);

  // Round of 16 → 8 winners
  const r16Matches = pairWinners(r16Winners, "R16");
  const qfWinners = simulateRound(r16Matches, teams, strengths);

  // Quarter-finals → 4 winners
  const qfMatches = pairWinners(qfWinners, "QF");
  const sfWinners = simulateRound(qfMatches, teams, strengths);

  // Semi-finals → 2 winners + 2 losers
  const sfMatches = pairWinners(sfWinners, "SF");
  const sfResults = sfMatches.map((m) => {
    const homeTeam = teams.get(m.home)!;
    const awayTeam = teams.get(m.away)!;
    const homeStr = strengths.get(m.home)!;
    const awayStr = strengths.get(m.away)!;
    const result = simulateKnockoutMatch(homeTeam, awayTeam, homeStr, awayStr);
    const loser = result.winner === m.home ? m.away : m.home;
    return { winner: result.winner, loser };
  });

  const finalists = sfResults.map((r) => r.winner);
  const sfLosers = sfResults.map((r) => r.loser);

  // Third-place playoff
  const thirdHome = teams.get(sfLosers[0])!;
  const thirdAway = teams.get(sfLosers[1])!;
  const thirdHomeStr = strengths.get(sfLosers[0])!;
  const thirdAwayStr = strengths.get(sfLosers[1])!;
  const thirdResult = simulateKnockoutMatch(thirdHome, thirdAway, thirdHomeStr, thirdAwayStr);

  // Final
  const finalHome = teams.get(finalists[0])!;
  const finalAway = teams.get(finalists[1])!;
  const finalHomeStr = strengths.get(finalists[0])!;
  const finalAwayStr = strengths.get(finalists[1])!;
  const finalResult = simulateKnockoutMatch(finalHome, finalAway, finalHomeStr, finalAwayStr);

  return {
    champion: finalResult.winner,
    runnerUp: finalResult.winner === finalists[0] ? finalists[1] : finalists[0],
    thirdPlace: thirdResult.winner,
  };
}

/**
 * Simulate a round of knockout matches, returning winner IDs in order
 */
function simulateRound(
  matches: BracketSlot[],
  teams: Map<string, Team>,
  strengths: Map<string, TeamStrength>
): string[] {
  return matches.map((m) => {
    const homeTeam = teams.get(m.home)!;
    const awayTeam = teams.get(m.away)!;
    const homeStr = strengths.get(m.home)!;
    const awayStr = strengths.get(m.away)!;
    const result = simulateKnockoutMatch(homeTeam, awayTeam, homeStr, awayStr);
    return result.winner;
  });
}

/**
 * Pair winners from previous round into next round matches
 */
function pairWinners(winners: string[], prefix: string): BracketSlot[] {
  const matches: BracketSlot[] = [];
  for (let i = 0; i < winners.length; i += 2) {
    matches.push({
      matchId: `${prefix}-${i / 2 + 1}`,
      home: winners[i],
      away: winners[i + 1],
    });
  }
  return matches;
}
