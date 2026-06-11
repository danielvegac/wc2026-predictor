// Web Worker for running Monte Carlo simulations off the main thread

import { runMonteCarlo } from "../engine/monteCarlo";
import { calculateStrengthFromElo } from "../engine/strengthCalculator";
import { teams, getTeamMap } from "../data/teams";
import { groups } from "../data/groups";
import type { MonteCarloResults } from "../types";

export interface WorkerRequest {
  type: "run";
  numSimulations: number;
}

export interface WorkerResponse {
  type: "result" | "progress";
  results?: MonteCarloResults;
  completed?: number;
  total?: number;
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  if (e.data.type === "run") {
    const teamMap = getTeamMap();
    const strengths = calculateStrengthFromElo(teams);
    const strengthMap = new Map(strengths.map((s) => [s.teamId, s]));

    const results = runMonteCarlo(
      groups,
      teamMap,
      strengthMap,
      e.data.numSimulations,
      (completed, total) => {
        self.postMessage({ type: "progress", completed, total } satisfies WorkerResponse);
      }
    );

    self.postMessage({ type: "result", results } satisfies WorkerResponse);
  }
};
