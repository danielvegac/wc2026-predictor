// ============================================================
// Knockout Match Data — WC2026 Round of 32 and beyond
// ============================================================
// All dates/kickoffs are stored in Colombia Time (America/Bogota,
// UTC-5, no DST) — same convention as groupStageSchedule.

export interface KnockoutMatch {
  matchId: string;            // "R32-01" through "R32-16", then "R16-01" etc.
  round: "R32" | "R16" | "QF" | "SF" | "3P" | "F";
  date: string;               // "2026-06-28" — Colombia calendar date
  homeTeamId: string;         // Visually "home" (listed first) — no actual home advantage
  awayTeamId: string;
  venue: string;
  kickoffCOT: string;         // "2:00 PM" — Colombia local kickoff time
  status: "upcoming" | "completed";
  // Populated after match only:
  homeGoals?: number;
  awayGoals?: number;
  // Post-match form update (same schema as MatchInsight multipliers):
  homeAttackMultiplier?: number;
  homeDefenseMultiplier?: number;
  awayAttackMultiplier?: number;
  awayDefenseMultiplier?: number;
  notes?: string;
}

export const knockoutMatches: KnockoutMatch[] = [
  // ==========================================
  // ROUND OF 32
  // ==========================================

  // June 28
  // Form multipliers for R32-01 through R32-08 are stored in matchInsights.ts
  { matchId: "R32-01", round: "R32", date: "2026-06-28", homeTeamId: "RSA", awayTeamId: "CAN",
    venue: "SoFi Stadium, Inglewood, CA", kickoffCOT: "2:00 PM", status: "completed",
    homeGoals: 0, awayGoals: 1 },

  // June 29
  { matchId: "R32-02", round: "R32", date: "2026-06-29", homeTeamId: "BRA", awayTeamId: "JPN",
    venue: "NRG Stadium, Houston, TX", kickoffCOT: "12:00 PM", status: "completed",
    homeGoals: 2, awayGoals: 1 },
  { matchId: "R32-03", round: "R32", date: "2026-06-29", homeTeamId: "GER", awayTeamId: "PAR",
    venue: "Gillette Stadium, Foxborough, MA", kickoffCOT: "3:30 PM", status: "completed",
    homeGoals: 1, awayGoals: 1 },  // regulation 1-1; Germany advance on penalties
  { matchId: "R32-04", round: "R32", date: "2026-06-29", homeTeamId: "NED", awayTeamId: "MAR",
    venue: "Estadio BBVA, Monterrey, Mexico", kickoffCOT: "8:00 PM", status: "completed",
    homeGoals: 1, awayGoals: 1 },  // regulation 1-1; Morocco advance on penalties

  // June 30
  { matchId: "R32-05", round: "R32", date: "2026-06-30", homeTeamId: "CIV", awayTeamId: "NOR",
    venue: "AT&T Stadium, Arlington, TX", kickoffCOT: "2:00 PM", status: "completed",
    homeGoals: 1, awayGoals: 2 },
  { matchId: "R32-06", round: "R32", date: "2026-06-30", homeTeamId: "FRA", awayTeamId: "SWE",
    venue: "MetLife Stadium, East Rutherford, NJ", kickoffCOT: "4:00 PM", status: "completed",
    homeGoals: 3, awayGoals: 0 },
  { matchId: "R32-07", round: "R32", date: "2026-06-30", homeTeamId: "MEX", awayTeamId: "ECU",
    venue: "Estadio Azteca, Mexico City, Mexico", kickoffCOT: "8:00 PM", status: "completed",
    homeGoals: 2, awayGoals: 0 },

  // July 1
  { matchId: "R32-08", round: "R32", date: "2026-07-01", homeTeamId: "ENG", awayTeamId: "COD",
    venue: "Mercedes-Benz Stadium, Atlanta, GA", kickoffCOT: "11:00 AM", status: "completed",
    homeGoals: 2, awayGoals: 1 },

  // July 1 (continued)
  { matchId: "R32-09", round: "R32", date: "2026-07-01", homeTeamId: "BEL", awayTeamId: "SEN",
    venue: "Lumen Field, Seattle, WA", kickoffCOT: "3:00 PM", status: "completed",
    homeGoals: 3, awayGoals: 2 },  // AET Belgium advance
  { matchId: "R32-10", round: "R32", date: "2026-07-01", homeTeamId: "USA", awayTeamId: "BIH",
    venue: "Levi's Stadium, Santa Clara, CA", kickoffCOT: "7:00 PM", status: "completed",
    homeGoals: 2, awayGoals: 0 },

  // July 2
  { matchId: "R32-11", round: "R32", date: "2026-07-02", homeTeamId: "ESP", awayTeamId: "AUT",
    venue: "SoFi Stadium, Inglewood, CA", kickoffCOT: "2:00 PM", status: "completed",
    homeGoals: 3, awayGoals: 0 },

  // July 3
  { matchId: "R32-12", round: "R32", date: "2026-07-02", homeTeamId: "POR", awayTeamId: "CRO",
    venue: "BMO Field, Toronto, Canada", kickoffCOT: "6:00 PM", status: "completed",
    homeGoals: 2, awayGoals: 1 },
  { matchId: "R32-13", round: "R32", date: "2026-07-02", homeTeamId: "SUI", awayTeamId: "ALG",
    venue: "BC Place, Vancouver, Canada", kickoffCOT: "10:00 PM", status: "completed",
    homeGoals: 2, awayGoals: 0 },
  { matchId: "R32-14", round: "R32", date: "2026-07-03", homeTeamId: "AUS", awayTeamId: "EGY",
    venue: "AT&T Stadium, Arlington, TX", kickoffCOT: "1:00 PM", status: "upcoming" },
  { matchId: "R32-15", round: "R32", date: "2026-07-03", homeTeamId: "ARG", awayTeamId: "CPV",
    venue: "Hard Rock Stadium, Miami Gardens, FL", kickoffCOT: "5:00 PM", status: "completed",
    homeGoals: 3, awayGoals: 2 },  // AET Argentina advance
  { matchId: "R32-16", round: "R32", date: "2026-07-03", homeTeamId: "COL", awayTeamId: "GHA",
    venue: "Arrowhead Stadium, Kansas City, MO", kickoffCOT: "8:30 PM", status: "completed",
    homeGoals: 1, awayGoals: 0 },

  // ==========================================
  // ROUND OF 16
  // ==========================================

  // July 4
  { matchId: "R16-1", round: "R16", date: "2026-07-04", homeTeamId: "CAN", awayTeamId: "MAR",
    venue: "NRG Stadium, Houston, USA", kickoffCOT: "12:00 PM", status: "completed",
    homeGoals: 0, awayGoals: 3 },
  { matchId: "R16-2", round: "R16", date: "2026-07-04", homeTeamId: "PAR", awayTeamId: "FRA",
    venue: "Lincoln Financial Field, Philadelphia, USA", kickoffCOT: "4:00 PM", status: "completed",
    homeGoals: 0, awayGoals: 2 },

  // July 5
  { matchId: "R16-3", round: "R16", date: "2026-07-05", homeTeamId: "BRA", awayTeamId: "NOR",
    venue: "MetLife Stadium, East Rutherford, USA", kickoffCOT: "3:00 PM", status: "completed",
    homeGoals: 1, awayGoals: 2 },
  { matchId: "R16-4", round: "R16", date: "2026-07-05", homeTeamId: "MEX", awayTeamId: "ENG",
    venue: "Estadio Azteca, Mexico City, Mexico", kickoffCOT: "7:00 PM", status: "completed",
    homeGoals: 2, awayGoals: 3 },

  // July 6
  { matchId: "R16-5", round: "R16", date: "2026-07-06", homeTeamId: "POR", awayTeamId: "ESP",
    venue: "AT&T Stadium, Arlington, USA", kickoffCOT: "2:00 PM", status: "completed",
    homeGoals: 0, awayGoals: 1 },
  { matchId: "R16-6", round: "R16", date: "2026-07-06", homeTeamId: "USA", awayTeamId: "BEL",
    venue: "Lumen Field, Seattle, USA", kickoffCOT: "4:00 PM", status: "completed",
    homeGoals: 1, awayGoals: 4 },

  // July 7
  { matchId: "R16-7", round: "R16", date: "2026-07-07", homeTeamId: "ARG", awayTeamId: "EGY",
    venue: "Mercedes-Benz Stadium, Atlanta, USA", kickoffCOT: "11:00 AM", status: "completed",
    homeGoals: 3, awayGoals: 2 },
  { matchId: "R16-8", round: "R16", date: "2026-07-07", homeTeamId: "SUI", awayTeamId: "COL",
    venue: "BC Place, Vancouver, Canada", kickoffCOT: "3:00 PM", status: "completed",
    homeGoals: 0, awayGoals: 0 },

  // ==========================================
  // QUARTER-FINALS
  // ==========================================

  // July 9
  { matchId: "QF-1", round: "QF", date: "2026-07-09", homeTeamId: "FRA", awayTeamId: "MAR",
    venue: "Gillette Stadium, Foxborough, MA", kickoffCOT: "3:00 PM", status: "upcoming" },

  // July 10
  { matchId: "QF-2", round: "QF", date: "2026-07-10", homeTeamId: "ESP", awayTeamId: "BEL",
    venue: "SoFi Stadium, Inglewood, CA", kickoffCOT: "2:00 PM", status: "upcoming" },

  // July 11
  { matchId: "QF-3", round: "QF", date: "2026-07-11", homeTeamId: "NOR", awayTeamId: "ENG",
    venue: "Hard Rock Stadium, Miami Gardens, FL", kickoffCOT: "4:00 PM", status: "upcoming" },
  { matchId: "QF-4", round: "QF", date: "2026-07-11", homeTeamId: "ARG", awayTeamId: "SUI",
    venue: "Arrowhead Stadium, Kansas City, MO", kickoffCOT: "8:00 PM", status: "upcoming" },
];

/** Get all knockout matches for a specific round */
export function getKnockoutMatchesByRound(round: KnockoutMatch["round"]): KnockoutMatch[] {
  return knockoutMatches.filter((m) => m.round === round);
}

/** Get completed knockout matches with form data for a specific team */
export function getTeamKnockoutInsights(teamId: string): KnockoutMatch[] {
  return knockoutMatches.filter(
    (m) =>
      m.status === "completed" &&
      (m.homeTeamId === teamId || m.awayTeamId === teamId) &&
      m.homeAttackMultiplier != null
  );
}
