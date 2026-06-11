// ============================================================
// PELE Model Reference Data (Nate Silver / Silver Bulletin)
// ============================================================
// Pre-tournament predictions from PELE (100,000 simulations)
// Source: Silver Bulletin — published June 2026
//
// PELE is Nate Silver's Elo-based football model.
// Named after the Brazilian legend, it uses historical Elo ratings,
// squad quality metrics, and match-level simulations.

export interface PeleTeamPrediction {
  teamId: string;
  championshipProb: number; // % chance of winning the World Cup
}

export const pelePredictions: PeleTeamPrediction[] = [
  { teamId: "ARG", championshipProb: 18.7 },
  { teamId: "ESP", championshipProb: 18.5 },
  { teamId: "FRA", championshipProb: 11.7 },
  { teamId: "ENG", championshipProb: 10.4 },
  { teamId: "GER", championshipProb: 6.6 },
  { teamId: "BRA", championshipProb: 6.1 },
  { teamId: "POR", championshipProb: 4.9 },
  { teamId: "NOR", championshipProb: 4.0 },
  { teamId: "NED", championshipProb: 2.9 },
  { teamId: "BEL", championshipProb: 2.1 },
  { teamId: "COL", championshipProb: 1.8 },
  { teamId: "MAR", championshipProb: 1.5 },
  { teamId: "JPN", championshipProb: 1.4 },
  { teamId: "URU", championshipProb: 1.3 },
  { teamId: "USA", championshipProb: 1.2 },
  { teamId: "CRO", championshipProb: 1.0 },
  { teamId: "SEN", championshipProb: 0.9 },
  { teamId: "SUI", championshipProb: 0.7 },
  { teamId: "MEX", championshipProb: 0.6 },
  { teamId: "ECU", championshipProb: 0.5 },
];

/** Get all teams sorted by PELE championship probability */
export function getPeleRanking(): PeleTeamPrediction[] {
  return [...pelePredictions].sort((a, b) => b.championshipProb - a.championshipProb);
}
