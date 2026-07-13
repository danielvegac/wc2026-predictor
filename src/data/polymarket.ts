// ============================================================
// Polymarket Reference Data (Prediction Market)
// ============================================================
// Live market probabilities from Polymarket prediction market
// Snapshot: June 11, 2026 — $1.26B total trading volume
//
// Polymarket is a prediction market where traders bet real money
// on outcomes. Prices reflect crowd consensus probability.
// This is the most liquid and accurate real-time signal available.

import { sortByDesc } from "../utils/collections";

export interface PolymarketTeamPrediction {
  teamId: string;
  championshipProb: number; // % chance of winning the World Cup
}

export const polymarketPredictions: PolymarketTeamPrediction[] = [
  { teamId: "ESP", championshipProb: 17.0 },
  { teamId: "FRA", championshipProb: 16.7 },
  { teamId: "ENG", championshipProb: 11.2 },
  { teamId: "POR", championshipProb: 10.3 },
  { teamId: "BRA", championshipProb: 9.4 },
  { teamId: "ARG", championshipProb: 8.6 },
  { teamId: "GER", championshipProb: 5.2 },
  { teamId: "NED", championshipProb: 3.8 },
  { teamId: "NOR", championshipProb: 2.9 },
  { teamId: "JPN", championshipProb: 2.1 },
  { teamId: "COL", championshipProb: 2.0 },
  { teamId: "MAR", championshipProb: 1.8 },
  { teamId: "URU", championshipProb: 1.5 },
  { teamId: "BEL", championshipProb: 1.4 },
  { teamId: "USA", championshipProb: 1.3 },
  { teamId: "CRO", championshipProb: 1.1 },
  { teamId: "MEX", championshipProb: 0.9 },
  { teamId: "SEN", championshipProb: 0.8 },
  { teamId: "SUI", championshipProb: 0.6 },
  { teamId: "ECU", championshipProb: 0.4 },
];

/** Get all teams sorted by Polymarket championship probability */
export function getPolymarketRanking(): PolymarketTeamPrediction[] {
  return sortByDesc(polymarketPredictions, (p) => p.championshipProb);
}
