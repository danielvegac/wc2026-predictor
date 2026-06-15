// ============================================================
// Match Insights — Post-match form adjustments for WC2026
// ============================================================
// Qualitative + quantitative adjustments derived from actual match
// performance (xG, dominance, tactical performance) — beyond what
// Elo captures from the result alone.

export interface MatchInsight {
  matchId: string;
  date: string;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
  // Performance adjustments BEYOND what Elo captures
  // These reflect dominance, xG, tactical performance
  homeAttackMultiplier: number;   // >1 = better than expected, <1 = worse
  homeDefenseMultiplier: number;  // <1 = more solid than expected
  awayAttackMultiplier: number;
  awayDefenseMultiplier: number;
  // Source context
  notes: string;
}

export const matchInsights: MatchInsight[] = [
  // June 11
  {
    matchId: "GS-A-1",
    date: "2026-06-11",
    homeTeamId: "MEX", awayTeamId: "RSA",
    homeGoals: 2, awayGoals: 0,
    homeAttackMultiplier: 1.10,
    homeDefenseMultiplier: 0.92,
    awayAttackMultiplier: 0.88,
    awayDefenseMultiplier: 1.05,
    notes: "Mexico controlled the game comfortably. South Africa had moments but lacked cutting edge.",
  },
  {
    matchId: "GS-A-2",
    date: "2026-06-11",
    homeTeamId: "KOR", awayTeamId: "CZE",
    homeGoals: 2, awayGoals: 1,
    homeAttackMultiplier: 1.08,
    homeDefenseMultiplier: 0.97,
    awayAttackMultiplier: 0.95,
    awayDefenseMultiplier: 1.02,
    notes: "South Korea deserved the win. Czechia showed some attack but defensively fragile.",
  },
  // June 12
  {
    matchId: "GS-B-1",
    date: "2026-06-12",
    homeTeamId: "CAN", awayTeamId: "BIH",
    homeGoals: 1, awayGoals: 1,
    homeAttackMultiplier: 0.93,
    homeDefenseMultiplier: 1.02,
    awayAttackMultiplier: 1.05,
    awayDefenseMultiplier: 1.08,
    notes: "Canada without Alphonso Davies struggled to create. Bosnia more organized than expected. Without Davies, Canada attack is limited.",
  },
  {
    matchId: "GS-D-1",
    date: "2026-06-12",
    homeTeamId: "USA", awayTeamId: "PAR",
    homeGoals: 4, awayGoals: 1,
    homeAttackMultiplier: 1.35,
    homeDefenseMultiplier: 0.90,
    awayAttackMultiplier: 0.72,
    awayDefenseMultiplier: 0.75,
    notes: "USA historic performance — most goals ever in a World Cup match. Balogun (2), own goal, Reyna. Pulisic pulled with calf at HT. Paraguay completely outclassed. Biggest positive surprise of tournament so far.",
  },
  // June 13
  {
    matchId: "GS-B-2",
    date: "2026-06-13",
    homeTeamId: "QAT", awayTeamId: "SUI",
    homeGoals: 1, awayGoals: 1,
    homeAttackMultiplier: 1.12,
    homeDefenseMultiplier: 1.08,
    awayAttackMultiplier: 0.88,
    awayDefenseMultiplier: 0.95,
    notes: "Qatar scored in 90+5 to deny Switzerland. Swiss had 23 shots, dominated possession but couldn't kill game. Qatar much more organized than 2022 group stage exit suggested. Switzerland profligate in front of goal.",
  },
  {
    matchId: "GS-C-1",
    date: "2026-06-13",
    homeTeamId: "BRA", awayTeamId: "MAR",
    homeGoals: 1, awayGoals: 1,
    homeAttackMultiplier: 0.82,
    homeDefenseMultiplier: 0.85,
    awayAttackMultiplier: 1.18,
    awayDefenseMultiplier: 1.12,
    notes: "MAJOR SURPRISE. Brazil were structurally disorganized — no press resistance, midfield destroyed by Morocco. Neymar absence glaring. Carlo Ancelotti 'worried'. Despite 1-1, Morocco were clearly the better team. Brazil's 0.8 xG vs Morocco 1.4 xG. Brazil must be DOWNGRADED significantly.",
  },
  {
    matchId: "GS-C-2",
    date: "2026-06-13",
    homeTeamId: "HAI", awayTeamId: "SCO",
    homeGoals: 0, awayGoals: 1,
    homeAttackMultiplier: 0.90,
    homeDefenseMultiplier: 1.05,
    awayAttackMultiplier: 0.95,
    awayDefenseMultiplier: 1.08,
    notes: "Scotland won with a McGinn goal in 28'. Haiti defended resolutely. Scotland disciplined but not impressive offensively. 1-0 reflects more defensive quality than attacking excellence.",
  },
  {
    matchId: "GS-D-2",
    date: "2026-06-14",
    homeTeamId: "AUS", awayTeamId: "TUR",
    homeGoals: 2, awayGoals: 0,
    homeAttackMultiplier: 1.20,
    homeDefenseMultiplier: 1.15,
    awayAttackMultiplier: 0.80,
    awayDefenseMultiplier: 0.78,
    notes: "MAJOR UPSET. Australia won 2-0 with just 28.3% possession — their lowest ever in a World Cup (Opta). Counter-attacking masterclass. Irankunda youngest Australian WC scorer. Metcalfe added 2nd from outside box. Turkey dominated possession but toothless. Australia now tied with USA atop Group D.",
  },

  // ==========================================
  // JUNE 14 — GROUP STAGE DAY 4
  // ==========================================

  // GS-E-1: Germany 7-1 Curaçao
  {
    matchId: "GS-E-1",
    date: "2026-06-14",
    homeTeamId: "GER", awayTeamId: "CUW",
    homeGoals: 7, awayGoals: 1,
    homeAttackMultiplier: 1.40,
    homeDefenseMultiplier: 0.95,  // Conceded 1 to Curaçao — slight vulnerability flagged
    awayAttackMultiplier: 1.05,   // Comenencia scored — historic first WC goal, showed some spirit
    awayDefenseMultiplier: 0.60,  // Conceded 7
    notes: "Germany 7-1 in a statement win — now all-time WC top scorers (239 goals). Havertz brace, Musiala, Brown, Undav, Nmecha, Schlotterbeck. Wirtz/Musiala/Sane attacking trio elite. BUT: Curaçao equalized 1-1 at 21' — analysts flag defensive vulnerability that better teams will exploit. Attack is world class, defense not flawless.",
  },

  // GS-F-1: Netherlands 2-2 Japan
  {
    matchId: "GS-F-1",
    date: "2026-06-14",
    homeTeamId: "NED", awayTeamId: "JPN",
    homeGoals: 2, awayGoals: 2,
    homeAttackMultiplier: 1.00,   // Scored 2 but couldn't kill the game
    homeDefenseMultiplier: 0.90,  // Conceded twice, including 88' equalizer — fragile late
    awayAttackMultiplier: 1.18,   // Twice came back from behind — clinical counter
    awayDefenseMultiplier: 1.05,
    notes: "MAJOR SURPRISE — Japan confirmed dark horse. Twice came from behind (57', 88') to draw 2-2. Neither team conceded a full xG — very balanced per Opta. Netherlands dominant in possession (60%) but Japan lethal on counter. Kamada 88' header off corner sealed draw. Summerville curled a beautiful 2-1 that looked like winner. Japan: attack UP significantly. Netherlands: attack neutral, defense DOWN — conceded late twice.",
  },

  // GS-E-2: Ivory Coast 1-0 Ecuador
  {
    matchId: "GS-E-2",
    date: "2026-06-14",
    homeTeamId: "CIV", awayTeamId: "ECU",
    homeGoals: 1, awayGoals: 0,
    homeAttackMultiplier: 1.10,
    homeDefenseMultiplier: 1.15,  // Clean sheet despite Ecuador hitting post 3 times — very resilient
    awayAttackMultiplier: 1.08,   // Hit post THREE times — genuinely dangerous, unlucky
    awayDefenseMultiplier: 0.88,  // Conceded 1 but controlled most of the game
    notes: "UPSET — Amad Diallo 90th minute winner ends Ecuador's 19-game unbeaten run. Ecuador hit the post 3 times (only 3rd team since 1966 to do so without scoring). Yan Diomande was best player. Ecuador were arguably better team — their attack multiplier RISES despite losing. Ivory Coast: mentality boost and defensive solidity rewarded. ECU xG was higher than CIV. Note: Ecuador -25 attack form from pre-tournament (Paraguay level) but this performance shows more quality.",
  },

  // GS-F-2: Sweden 5-1 Tunisia
  {
    matchId: "GS-F-2",
    date: "2026-06-14",
    homeTeamId: "SWE", awayTeamId: "TUN",
    homeGoals: 5, awayGoals: 1,
    homeAttackMultiplier: 1.35,   // Ayari x2 longrangers, Isak, Gyokeres, Svanberg — elite attack
    homeDefenseMultiplier: 1.05,
    awayAttackMultiplier: 0.85,
    awayDefenseMultiplier: 0.62,  // Conceded 5
    notes: "Sweden historic 5-1 — only 2nd time in their WC history scoring 5+ (last was 8-0 vs Cuba in 1938). Yasin Ayari with two stunning long-range efforts. Alexander Isak and Viktor Gyokeres both on scoresheet — devastating strike partnership. Tunisia defensively abysmal. Group F now wide open: Sweden top with 1pt (draw with NED), NED 1pt, JPN 1pt, TUN 0pt.",
  },
];

/** Get all insights for a team across all matches played */
export function getTeamInsights(teamId: string): MatchInsight[] {
  return matchInsights.filter(
    (m) => m.homeTeamId === teamId || m.awayTeamId === teamId
  );
}

/** Get composite form multipliers for a team (product of all tournament matches) */
export function getTeamFormMultipliers(teamId: string): {
  attackMultiplier: number;
  defenseMultiplier: number;
} {
  const insights = getTeamInsights(teamId);
  if (insights.length === 0) return { attackMultiplier: 1.0, defenseMultiplier: 1.0 };

  let attackMult = 1.0;
  let defenseMult = 1.0;

  for (const insight of insights) {
    if (insight.homeTeamId === teamId) {
      attackMult *= insight.homeAttackMultiplier;
      defenseMult *= insight.homeDefenseMultiplier;
    } else {
      attackMult *= insight.awayAttackMultiplier;
      defenseMult *= insight.awayDefenseMultiplier;
    }
  }

  return { attackMultiplier: attackMult, defenseMultiplier: defenseMult };
}
