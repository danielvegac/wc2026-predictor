// ============================================================
// Group Stage Simulator
// ============================================================
// Simulates all 72 group stage matches and computes standings.

import type { Team, TeamStrength, GroupStanding } from "../types";
import { simulateMatch } from "./matchSimulator";

/**
 * Generate the 6 matches for a group of 4 teams
 * Standard FIFA pairing: each team plays every other team once
 */
export function generateGroupMatches(teamIds: string[]): [string, string][] {
  if (teamIds.length !== 4) throw new Error("Groups must have exactly 4 teams");

  return [
    [teamIds[0], teamIds[1]], // MD1: 1 vs 2
    [teamIds[2], teamIds[3]], // MD1: 3 vs 4
    [teamIds[0], teamIds[2]], // MD2: 1 vs 3
    [teamIds[1], teamIds[3]], // MD2: 2 vs 4
    [teamIds[0], teamIds[3]], // MD3: 1 vs 4
    [teamIds[1], teamIds[2]], // MD3: 2 vs 3
  ];
}

/**
 * Simulate an entire group and return standings
 */
export function simulateGroup(
  groupTeamIds: string[],
  teams: Map<string, Team>,
  strengths: Map<string, TeamStrength>
): GroupStanding[] {
  const standings = new Map<string, GroupStanding>();

  // Initialize standings
  for (const id of groupTeamIds) {
    standings.set(id, {
      teamId: id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      position: 0,
    });
  }

  // Play all 6 matches
  const matches = generateGroupMatches(groupTeamIds);
  for (const [homeId, awayId] of matches) {
    const homeTeam = teams.get(homeId)!;
    const awayTeam = teams.get(awayId)!;
    const homeStr = strengths.get(homeId)!;
    const awayStr = strengths.get(awayId)!;

    const result = simulateMatch(homeTeam, awayTeam, homeStr, awayStr);

    const homeSt = standings.get(homeId)!;
    const awaySt = standings.get(awayId)!;

    homeSt.played++;
    awaySt.played++;
    homeSt.goalsFor += result.homeGoals;
    homeSt.goalsAgainst += result.awayGoals;
    awaySt.goalsFor += result.awayGoals;
    awaySt.goalsAgainst += result.homeGoals;

    if (result.homeGoals > result.awayGoals) {
      homeSt.won++;
      homeSt.points += 3;
      awaySt.lost++;
    } else if (result.homeGoals === result.awayGoals) {
      homeSt.drawn++;
      homeSt.points += 1;
      awaySt.drawn++;
      awaySt.points += 1;
    } else {
      awaySt.won++;
      awaySt.points += 3;
      homeSt.lost++;
    }
  }

  // Calculate goal difference and sort
  const sorted = Array.from(standings.values())
    .map((s) => ({ ...s, goalDifference: s.goalsFor - s.goalsAgainst }))
    .sort((a, b) => {
      // FIFA tiebreaker order:
      // 1. Points
      if (b.points !== a.points) return b.points - a.points;
      // 2. Goal difference
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      // 3. Goals scored
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      // 4. Fair play (not modeled, use random)
      return Math.random() - 0.5;
    });

  // Assign positions
  return sorted.map((s, i) => ({ ...s, position: i + 1 }));
}

/**
 * Rank all third-place teams across groups and return the best 8
 * FIFA criteria: points → goal difference → goals scored → FIFA ranking
 */
export function rankThirdPlaceTeams(
  allGroupStandings: Record<string, GroupStanding[]>,
  teams: Map<string, Team>
): string[] {
  const thirdPlaceTeams: (GroupStanding & { group: string })[] = [];

  for (const [group, standings] of Object.entries(allGroupStandings)) {
    const third = standings.find((s) => s.position === 3);
    if (third) {
      thirdPlaceTeams.push({ ...third, group });
    }
  }

  // Sort by FIFA third-place ranking criteria
  thirdPlaceTeams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    // Use FIFA ranking as final tiebreaker
    const rankA = teams.get(a.teamId)?.fifaRanking ?? 100;
    const rankB = teams.get(b.teamId)?.fifaRanking ?? 100;
    return rankA - rankB; // Lower rank = better
  });

  // Return best 8 third-place team IDs
  return thirdPlaceTeams.slice(0, 8).map((t) => t.teamId);
}
