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

  // ==========================================
  // JUNE 15 — GROUP STAGE DAY 5
  // ==========================================

  // GS-H-1: Spain 0-0 Cape Verde
  {
    matchId: "GS-H-1",
    date: "2026-06-15",
    homeTeamId: "ESP", awayTeamId: "CPV",
    homeGoals: 0, awayGoals: 0,
    homeAttackMultiplier: 0.72,  // 27 shots, 2.29 xG but ZERO goals — clinical failure
    homeDefenseMultiplier: 1.05, // Didn't concede, but was exposed late
    awayAttackMultiplier: 1.25,  // Had a late chance to WIN — Diney header saved
    awayDefenseMultiplier: 1.40, // Vozinha 7 saves, 40yo goalkeeper, historic clean sheet
    notes: "BIGGEST SURPRISE OF TOURNAMENT. Spain 0-0 Cape Verde. 27 shots, 2.29 xG, 7 on target — could not breach Vozinha (40yo GK, 7 saves). Yamal only entered at 70'. Without Yamal+Williams at full fitness, Spain clinical edge collapses. Cape Verde nearly WON with late Diney header. Key lesson for mismatch multiplier: even 620 Elo gap, organized defense = ~2.3 xG not 6.0. Spain attack DOWN sharply. Spain defense neutral. Cape Verde defense UP massively.",
  },

  // GS-G-1: Belgium 1-1 Egypt
  {
    matchId: "GS-G-1",
    date: "2026-06-15",
    homeTeamId: "BEL", awayTeamId: "EGY",
    homeGoals: 1, awayGoals: 1,
    homeAttackMultiplier: 0.88,  // Lukaku needed 22 seconds to change game — creative play poor without him
    homeDefenseMultiplier: 0.92, // Conceded to Ashour long ranger
    awayAttackMultiplier: 1.15,  // Salah orchestrating in #10, Ashour dangerous direct runner
    awayDefenseMultiplier: 1.10, // Held Belgium for most of game, Shobeir solid in goal
    notes: "Egypt led through Ashour golazo (Salah assist) and held Belgium for long stretches. Lukaku introduced and forced own goal in 22 seconds. Belgium struggled to create without Lukaku starting. Salah in #10 role is dangerous — hard to pick up. Egypt better than expected. Belgium less fluid than Elo suggests.",
  },

  // GS-H-2: Saudi Arabia 1-1 Uruguay
  {
    matchId: "GS-H-2",
    date: "2026-06-15",
    homeTeamId: "KSA", awayTeamId: "URU",
    homeGoals: 1, awayGoals: 1,
    homeAttackMultiplier: 1.10,
    homeDefenseMultiplier: 1.15,  // Al-Owais multiple brilliant saves, held until 80'
    awayAttackMultiplier: 0.90,   // Uruguay underwhelming first half, only equalized late
    awayDefenseMultiplier: 0.95,
    notes: "Saudi Arabia opened scoring through Al Amri rebound, held until 80'. GK Al-Owais was outstanding — multiple smart saves. Uruguay equalized through Araújo. Bielsa's Uruguay organized but uninspired offensively. Saudi Arabia much better organized than expected — new coach installed just 56 days before tournament.",
  },

  // GS-G-2: Iran 2-2 New Zealand
  {
    matchId: "GS-G-2",
    date: "2026-06-15",
    homeTeamId: "IRN", awayTeamId: "NZL",
    homeGoals: 2, awayGoals: 2,
    homeAttackMultiplier: 1.12,   // Twice came from behind — resilient and clinical
    homeDefenseMultiplier: 0.88,  // Let NZ go 2-0 up
    awayAttackMultiplier: 1.20,   // Elijah Just brace — NZ had WC win in their grasp
    awayDefenseMultiplier: 0.85,  // Conceded 2 after leading 2-0
    notes: "New Zealand 2-0 up through Just brace — would have been historic first WC win. Iran twice equalized. Both teams showed more attacking quality than Elo suggested. NZ attack UP significantly — Just dangerous striker. Iran resilience UP. Both defenses DOWN — couldn't hold leads.",
  },

  // ==========================================
  // JUNE 16 — GROUP STAGE DAY 6
  // ==========================================

  // GS-I-1: France 3-1 Senegal
  {
    matchId: "GS-I-1",
    date: "2026-06-16",
    homeTeamId: "FRA", awayTeamId: "SEN",
    homeGoals: 3, awayGoals: 1,
    homeAttackMultiplier: 1.22,   // Mbappe brace (all-time France scorer), Olise inspired 2nd half
    homeDefenseMultiplier: 0.95,  // Conceded 1 to Senegal
    awayAttackMultiplier: 0.92,   // Scored but couldn't maintain pressure
    awayDefenseMultiplier: 0.85,  // Conceded 3 to France attack
    notes: "France dominant in 2nd half — Mbappe brace makes him all-time France top scorer. Olise excellent. Senegal showed fight with 1 goal but France class told. Mane impact remains crucial for Senegal going forward. France looking like genuine contenders — fluid attack.",
  },

  // GS-I-2: Norway 4-1 Iraq
  {
    matchId: "GS-I-2",
    date: "2026-06-16",
    homeTeamId: "NOR", awayTeamId: "IRQ",
    homeGoals: 4, awayGoals: 1,
    homeAttackMultiplier: 1.30,   // Haaland brace — devastating when on song
    homeDefenseMultiplier: 1.00,
    awayAttackMultiplier: 0.88,
    awayDefenseMultiplier: 0.72,  // Conceded 4
    notes: "Norway 4-1 — Haaland doblete. Confirms Norway as genuine dark horse. Attack devastating with Haaland + supporting cast. Iraq back at WC after 40 years — outclassed. Group I now: France and Norway both on 3pts after MD1, looks like France vs Norway MD3 will decide group winner.",
  },

  // GS-J-1: Argentina 3-0 Algeria
  {
    matchId: "GS-J-1",
    date: "2026-06-16",
    homeTeamId: "ARG", awayTeamId: "ALG",
    homeGoals: 3, awayGoals: 0,
    homeAttackMultiplier: 1.28,   // MESSI HAT-TRICK — first ever in WC, 16 WC goals (all-time record tied)
    homeDefenseMultiplier: 1.08,  // Clean sheet
    awayAttackMultiplier: 0.80,
    awayDefenseMultiplier: 0.78,  // Conceded 3 to Argentina
    notes: "HISTORIC — Messi scores first World Cup hat-trick of his career, ties all-time WC goals record (16). Argentina dominant, Algeria outclassed. Di Maria + Messi + Lautaro combination lethal. Argentina looking ominous — not just Messi, whole team clicking. Algeria defensive weakness exposed.",
  },

  // GS-J-2: Austria 3-1 Jordan
  {
    matchId: "GS-J-2",
    date: "2026-06-17",  // June 17 in COT timezone (early morning)
    homeTeamId: "AUT", awayTeamId: "JOR",
    homeGoals: 3, awayGoals: 1,
    homeAttackMultiplier: 1.18,   // 3-1 win including 100th minute goal
    homeDefenseMultiplier: 0.95,  // Conceded 1
    awayAttackMultiplier: 0.92,
    awayDefenseMultiplier: 0.80,  // Conceded 3
    notes: "Austria back at WC for first time since 1998 — strong debut. 3rd goal in 100th minute of extra time. Strong midfield as expected. Jordan competitive but outclassed. Austria vs Argentina (MD2) now very interesting — Austria showed real quality.",
  },
];

/** Get all insights for a team across all matches played */
export function getTeamInsights(teamId: string): MatchInsight[] {
  return matchInsights.filter(
    (m) => m.homeTeamId === teamId || m.awayTeamId === teamId
  );
}

/**
 * Get composite form multipliers for a team using recency-weighted average.
 * Weights: most recent match 60%, previous 30%, all earlier matches share 10%.
 * Clamped to [0.50, 1.50] as a safety net.
 */
export function getTeamFormMultipliers(teamId: string): {
  attackMultiplier: number;
  defenseMultiplier: number;
} {
  const insights = getTeamInsights(teamId);
  if (insights.length === 0) return { attackMultiplier: 1.0, defenseMultiplier: 1.0 };

  // Extract per-match multipliers (chronological order — insights array is chronological)
  const attackMults: number[] = [];
  const defenseMults: number[] = [];

  for (const insight of insights) {
    if (insight.homeTeamId === teamId) {
      attackMults.push(insight.homeAttackMultiplier);
      defenseMults.push(insight.homeDefenseMultiplier);
    } else {
      attackMults.push(insight.awayAttackMultiplier);
      defenseMults.push(insight.awayDefenseMultiplier);
    }
  }

  const attackMult = recencyWeightedAverage(attackMults);
  const defenseMult = recencyWeightedAverage(defenseMults);

  return {
    attackMultiplier: Math.max(0.50, Math.min(1.50, attackMult)),
    defenseMultiplier: Math.max(0.50, Math.min(1.50, defenseMult)),
  };
}

/**
 * Weighted average favoring recent matches.
 * 1 match:  100%
 * 2 matches: 60% most recent, 40% previous
 * 3+ matches: 60% most recent, 30% second most recent, 10% split among rest
 */
function recencyWeightedAverage(values: number[]): number {
  const n = values.length;
  if (n === 1) return values[0];
  if (n === 2) return values[1] * 0.60 + values[0] * 0.40;

  // 3+ matches: build weights array (chronological order, most recent is last)
  const weights = new Array<number>(n);
  const earlierWeight = 0.10 / (n - 2);
  for (let i = 0; i < n - 2; i++) {
    weights[i] = earlierWeight;
  }
  weights[n - 2] = 0.30;
  weights[n - 1] = 0.60;

  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += values[i] * weights[i];
  }
  return sum;
}
