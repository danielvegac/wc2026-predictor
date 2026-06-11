// ============================================================
// Monte Carlo Tournament Simulator
// ============================================================
// Runs N complete tournament simulations and aggregates results
// to produce championship probabilities, advancement odds, etc.

import type { Team, TeamStrength, GroupStanding, MonteCarloResults, Stage } from "../types";
import { simulateGroup, rankThirdPlaceTeams } from "./groupSimulator";
import { buildR32Bracket, simulateKnockoutStage } from "./knockoutSimulator";

export const DEFAULT_SIMULATIONS = 10_000;

export interface GroupConfig {
  name: string;
  teamIds: string[];
}

/**
 * Run a full Monte Carlo simulation of the World Cup tournament.
 *
 * @param groups - Array of group configurations
 * @param teams - Map of team ID to Team data
 * @param strengths - Map of team ID to TeamStrength metrics
 * @param numSimulations - Number of tournament simulations to run
 * @param onProgress - Optional callback for progress updates
 */
export function runMonteCarlo(
  groups: GroupConfig[],
  teams: Map<string, Team>,
  strengths: Map<string, TeamStrength>,
  numSimulations: number = DEFAULT_SIMULATIONS,
  onProgress?: (completed: number, total: number) => void
): MonteCarloResults {
  // Counters
  const championCount: Record<string, number> = {};
  const runnerUpCount: Record<string, number> = {};
  const thirdPlaceCount: Record<string, number> = {};
  const advancementCount: Record<string, Record<string, number>> = {};
  const groupWinnerCount: Record<string, Record<string, number>> = {};

  // Initialize counters for all teams
  for (const [id] of teams) {
    championCount[id] = 0;
    runnerUpCount[id] = 0;
    thirdPlaceCount[id] = 0;
    advancementCount[id] = {
      group: 0,
      round32: 0,
      round16: 0,
      quarterfinal: 0,
      semifinal: 0,
      third_place: 0,
      final: 0,
    };
  }

  // Initialize group winner counters
  for (const group of groups) {
    groupWinnerCount[group.name] = {};
    for (const teamId of group.teamIds) {
      groupWinnerCount[group.name][teamId] = 0;
    }
  }

  // Run simulations
  for (let sim = 0; sim < numSimulations; sim++) {
    // 1. Simulate group stage
    const allStandings: Record<string, GroupStanding[]> = {};

    for (const group of groups) {
      allStandings[group.name] = simulateGroup(group.teamIds, teams, strengths);
    }

    // Track group winners
    for (const group of groups) {
      const winner = allStandings[group.name][0].teamId;
      groupWinnerCount[group.name][winner]++;
    }

    // 2. Determine qualifiers
    const qualifiedTeams = new Set<string>();

    // Top 2 from each group
    for (const group of groups) {
      const standings = allStandings[group.name];
      qualifiedTeams.add(standings[0].teamId);
      qualifiedTeams.add(standings[1].teamId);
    }

    // Best 8 third-place teams
    const thirdPlaceQualifiers = rankThirdPlaceTeams(allStandings, teams);
    for (const id of thirdPlaceQualifiers) {
      qualifiedTeams.add(id);
    }

    // Track advancement to R32
    for (const id of qualifiedTeams) {
      advancementCount[id]["round32"]++;
    }

    // 3. Build and simulate knockout bracket
    const r32Bracket = buildR32Bracket(allStandings, thirdPlaceQualifiers);

    try {
      const result = simulateKnockoutStage(r32Bracket, teams, strengths);

      championCount[result.champion]++;
      runnerUpCount[result.runnerUp]++;
      thirdPlaceCount[result.thirdPlace]++;

      // Track final/semifinal advancement
      advancementCount[result.champion]["final"]++;
      advancementCount[result.runnerUp]["final"]++;
      advancementCount[result.champion]["semifinal"]++;
      advancementCount[result.runnerUp]["semifinal"]++;
      advancementCount[result.thirdPlace]["semifinal"]++;
    } catch {
      // Skip failed simulations (shouldn't happen but defensive)
    }

    // Progress callback
    if (onProgress && sim % 1000 === 0) {
      onProgress(sim, numSimulations);
    }
  }

  // Normalize to probabilities
  const championProbs: Record<string, number> = {};
  const podiumProbs: Record<string, { champion: number; runnerUp: number; thirdPlace: number }> = {};
  const advancementProbs: Record<string, Record<Stage, number>> = {};

  for (const [id] of teams) {
    championProbs[id] = championCount[id] / numSimulations;
    podiumProbs[id] = {
      champion: championCount[id] / numSimulations,
      runnerUp: runnerUpCount[id] / numSimulations,
      thirdPlace: thirdPlaceCount[id] / numSimulations,
    };

    advancementProbs[id] = {} as Record<Stage, number>;
    for (const stage of Object.keys(advancementCount[id])) {
      advancementProbs[id][stage as Stage] = advancementCount[id][stage] / numSimulations;
    }
  }

  // Group winner probabilities
  const groupWinnerProbs: Record<string, Record<string, number>> = {};
  for (const group of groups) {
    groupWinnerProbs[group.name] = {};
    for (const teamId of group.teamIds) {
      groupWinnerProbs[group.name][teamId] =
        groupWinnerCount[group.name][teamId] / numSimulations;
    }
  }

  if (onProgress) {
    onProgress(numSimulations, numSimulations);
  }

  return {
    numSimulations,
    championProbs,
    podiumProbs,
    advancementProbs,
    groupWinnerProbs,
    matchResults: {}, // TODO: aggregate per-match results
  };
}
