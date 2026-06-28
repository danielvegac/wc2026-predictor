// ============================================================
// Knockout Match Data — WC2026 Round of 32 and beyond
// ============================================================

export interface KnockoutMatch {
  matchId: string;            // "R32-01" through "R32-16", then "R16-01" etc.
  round: "R32" | "R16" | "QF" | "SF" | "3P" | "F";
  date: string;               // "2026-06-28"
  homeTeamId: string;         // Visually "home" (listed first) — no actual home advantage
  awayTeamId: string;
  venue: string;
  kickoffET: string;          // "15:00"
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
  { matchId: "R32-01", round: "R32", date: "2026-06-28", homeTeamId: "RSA", awayTeamId: "CAN",
    venue: "SoFi Stadium, Inglewood, CA", kickoffET: "15:00", status: "upcoming" },

  // June 29
  { matchId: "R32-02", round: "R32", date: "2026-06-29", homeTeamId: "BRA", awayTeamId: "JPN",
    venue: "NRG Stadium, Houston, TX", kickoffET: "13:00", status: "upcoming" },
  { matchId: "R32-03", round: "R32", date: "2026-06-29", homeTeamId: "GER", awayTeamId: "PAR",
    venue: "Gillette Stadium, Foxborough, MA", kickoffET: "16:30", status: "upcoming" },

  // June 30
  { matchId: "R32-04", round: "R32", date: "2026-06-30", homeTeamId: "NED", awayTeamId: "MAR",
    venue: "Estadio BBVA, Monterrey, Mexico", kickoffET: "21:00", status: "upcoming" },
  { matchId: "R32-05", round: "R32", date: "2026-06-30", homeTeamId: "CIV", awayTeamId: "NOR",
    venue: "AT&T Stadium, Arlington, TX", kickoffET: "13:00", status: "upcoming" },
  { matchId: "R32-06", round: "R32", date: "2026-06-30", homeTeamId: "FRA", awayTeamId: "SWE",
    venue: "MetLife Stadium, East Rutherford, NJ", kickoffET: "17:00", status: "upcoming" },

  // July 1
  { matchId: "R32-07", round: "R32", date: "2026-07-01", homeTeamId: "MEX", awayTeamId: "ECU",
    venue: "Estadio Azteca, Mexico City, Mexico", kickoffET: "21:00", status: "upcoming" },
  { matchId: "R32-08", round: "R32", date: "2026-07-01", homeTeamId: "ENG", awayTeamId: "COD",
    venue: "Mercedes-Benz Stadium, Atlanta, GA", kickoffET: "12:00", status: "upcoming" },

  // July 2
  { matchId: "R32-09", round: "R32", date: "2026-07-02", homeTeamId: "BEL", awayTeamId: "SEN",
    venue: "Lumen Field, Seattle, WA", kickoffET: "16:00", status: "upcoming" },
  { matchId: "R32-10", round: "R32", date: "2026-07-02", homeTeamId: "USA", awayTeamId: "BIH",
    venue: "Levi's Stadium, Santa Clara, CA", kickoffET: "20:00", status: "upcoming" },
  { matchId: "R32-11", round: "R32", date: "2026-07-02", homeTeamId: "ESP", awayTeamId: "AUT",
    venue: "SoFi Stadium, Inglewood, CA", kickoffET: "15:00", status: "upcoming" },

  // July 3
  { matchId: "R32-12", round: "R32", date: "2026-07-03", homeTeamId: "POR", awayTeamId: "CRO",
    venue: "BMO Field, Toronto, Canada", kickoffET: "19:00", status: "upcoming" },
  { matchId: "R32-13", round: "R32", date: "2026-07-03", homeTeamId: "SUI", awayTeamId: "ALG",
    venue: "BC Place, Vancouver, Canada", kickoffET: "23:00", status: "upcoming" },
  { matchId: "R32-14", round: "R32", date: "2026-07-03", homeTeamId: "AUS", awayTeamId: "EGY",
    venue: "AT&T Stadium, Arlington, TX", kickoffET: "14:00", status: "upcoming" },
  { matchId: "R32-15", round: "R32", date: "2026-07-03", homeTeamId: "ARG", awayTeamId: "CPV",
    venue: "Hard Rock Stadium, Miami Gardens, FL", kickoffET: "18:00", status: "upcoming" },
  { matchId: "R32-16", round: "R32", date: "2026-07-03", homeTeamId: "COL", awayTeamId: "GHA",
    venue: "Arrowhead Stadium, Kansas City, MO", kickoffET: "21:30", status: "upcoming" },
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
