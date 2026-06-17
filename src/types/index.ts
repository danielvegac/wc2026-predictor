// ============================================================
// WC2026 Predictor — Core Types
// ============================================================

export type Confederation = "AFC" | "CAF" | "CONCACAF" | "CONMEBOL" | "OFC" | "UEFA";

export type Stage =
  | "group"
  | "round32"
  | "round16"
  | "quarterfinal"
  | "semifinal"
  | "third_place"
  | "final";

// --- Team ---

export interface Team {
  id: string;                     // ISO 3166 alpha-3 (e.g. "COL")
  name: string;
  shortName: string;              // 3-letter display code
  group: string;                  // "A" through "L"
  confederation: Confederation;
  fifaRanking: number;
  eloRating: number;
  flagEmoji: string;
  primaryColor: string;
  isHost: boolean;
}

export interface TeamStrength {
  teamId: string;
  attackStrength: number;         // Relative to tournament average
  defenseStrength: number;        // Relative to tournament average
  squadStrengthIndex: number;     // 0-1, % of squad in top-5 leagues
  formIndex: number;              // 0-1, weighted recent form
}

export interface MatchRecord {
  opponent: string;
  date: string;
  goalsFor: number;
  goalsAgainst: number;
  venue: "home" | "away" | "neutral";
  competition: string;
  weight: number;                 // Recency weight
}

export interface QualRecord {
  confederation: Confederation;
  groupPosition: number | null;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  qualifiedVia: "auto" | "group" | "playoff" | "host";
}

// --- Match ---

export interface Match {
  id: string;                     // e.g. "GS-A-1", "R32-1", "F"
  stage: Stage;
  group?: string;
  homeTeamId: string;
  awayTeamId: string;
  matchday?: number;
  date: string;
  venue: string;
  kickoffCOT?: string;            // e.g. "2:00 PM" — Colombia Time (UTC-5)
}

// --- Prediction ---

export interface Prediction {
  matchId: string;
  homeGoals: number;
  awayGoals: number;
  source: "user" | "model";
  penaltyWinner?: string;         // Team ID if knockout draw
}

// --- Simulation ---

export interface MatchSimResult {
  matchId: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  expectedHomeGoals: number;      // Poisson lambda
  expectedAwayGoals: number;
  mostLikelyScore: [number, number];
  scoreDistribution: Record<string, number>; // "2-1" -> 0.082
}

export interface GroupStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}

export interface TournamentSimulation {
  groupStandings: Record<string, GroupStanding[]>;
  champion: string;
  runnerUp: string;
  thirdPlace: string;
}

export interface MonteCarloResults {
  numSimulations: number;
  championProbs: Record<string, number>;
  podiumProbs: Record<string, { champion: number; runnerUp: number; thirdPlace: number }>;
  advancementProbs: Record<string, Record<Stage, number>>;
  groupWinnerProbs: Record<string, Record<string, number>>; // group -> team -> prob
  matchResults: Record<string, MatchSimResult>;              // matchId -> aggregated result
}

// --- Scoring ---

export interface ComparisonScore {
  totalPoints: number;
  maxPossible: number;            // 678 = 72×9 + 15 + 10 + 5
  correctResults: number;
  correctScores: number;
  totalMatches: number;
  // Points breakdown
  totalExactScorePoints: number;
  totalResultPoints: number;
  totalGoalsPoints: number;       // home + away goals points combined
  championCorrect: boolean;
  runnerUpCorrect: boolean;
  thirdPlaceCorrect: boolean;
  matchScores: Record<string, MatchScore>;
}

export interface MatchScore {
  matchId: string;
  userPrediction: Prediction;
  modelPrediction: Prediction;
  actual: Prediction;
  // Points breakdown
  exactScorePoints: number;      // 3 or 0
  resultPoints: number;          // 2 or 0
  homeGoalsPoints: number;       // 2 or 0
  awayGoalsPoints: number;       // 2 or 0
  totalPoints: number;           // sum of above (max 9)
  // Flags
  isExactScore: boolean;
  isCorrectResult: boolean;
  homeGoalsCorrect: boolean;
  awayGoalsCorrect: boolean;
}

/** Lightweight score result from scoreMatch() — no prediction refs */
export interface ScoreBreakdown {
  exactScorePoints: number;
  resultPoints: number;
  homeGoalsPoints: number;
  awayGoalsPoints: number;
  totalPoints: number;
  isExactScore: boolean;
  isCorrectResult: boolean;
  homeGoalsCorrect: boolean;
  awayGoalsCorrect: boolean;
}
