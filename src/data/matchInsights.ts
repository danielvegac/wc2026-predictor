// ============================================================
// Match Insights — Post-match form adjustments for WC2026
// ============================================================
// Qualitative + quantitative adjustments derived from actual match
// performance (xG, dominance, tactical performance) — beyond what
// Elo captures from the result alone.

import { getTeamKnockoutInsights } from "./knockoutMatches";

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
  // ==========================================
  // JUNE 17 — GROUP STAGE DAY 7
  // ==========================================

  // GS-K-2: Portugal 1-1 DR Congo
  // AUTO-XG: Portugal 1.07 xG, DR Congo 0.85 xG
  {
    matchId: "GS-K-2",
    date: "2026-06-17",
    homeTeamId: "POR", awayTeamId: "COD",
    homeGoals: 1, awayGoals: 1,
    homeAttackMultiplier: 0.79,
    homeDefenseMultiplier: 1.45,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 1.26,
    notes: "AUTO-XG. Portugal 1.07 xG — deeply disappointing. DR Congo 0.85 xG — actually the BETTER team per xG. Wissa header equalizer. Ronaldo invisible, sterile possession. Portugal have a Ronaldo problem. DR Congo defense UP significantly — held a tournament favorite. Key for Group K: Portugal now must win vs Uzbekistan (MD2) after shock draw. Colombia now sole leaders of Group K with 3pts.",
  },

  // GS-L-1: England 4-2 Croatia
  // AUTO-XG: England 2.82 xG, Croatia 0.53 xG
  {
    matchId: "GS-L-1",
    date: "2026-06-17",
    homeTeamId: "ENG", awayTeamId: "CRO",
    homeGoals: 4, awayGoals: 2,
    homeAttackMultiplier: 1.45,
    homeDefenseMultiplier: 0.65,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 0.65,
    notes: "AUTO-XG. England dominant: 2.82 xG, 36 box touches, Kane brace, Bellingham solo goal, Rashford off bench. Croatia only 0.53 xG but scored 2 — Baturina screamer + Perisic clever play, both massive xG overperformance. England defense DOWN: despite dominating xG, allowed 2 goals from 0.53 xG. Croatia attack overperformed but aging squad showing limits. England are genuine contenders when firing.",
  },

  // GS-L-2: Ghana 1-0 Panama
  // ESTIMATED xG (no verified data): Ghana ~0.65, Panama ~0.80
  {
    matchId: "GS-L-2",
    date: "2026-06-17",
    homeTeamId: "GHA", awayTeamId: "PAN",
    homeGoals: 1, awayGoals: 0,
    homeAttackMultiplier: 0.92,
    homeDefenseMultiplier: 1.10,
    awayAttackMultiplier: 1.02,
    awayDefenseMultiplier: 0.92,
    notes: "ESTIMATED xG. Ghana zero shots on target first 45min. Panama controlled early. Yirenkyi stoppage-time winner from counter. Ghana without Partey (visa denied). Panama created more in 1st half but couldn't finish. Group L: England 3pts, Ghana 3pts, Croatia 0, Panama 0.",
  },

  // GS-K-1: Colombia 3-1 Uzbekistan — QUALITATIVE ANALYSIS
  {
    matchId: "GS-K-1",
    date: "2026-06-17",
    homeTeamId: "COL", awayTeamId: "UZB",
    homeGoals: 3, awayGoals: 1,
    homeAttackMultiplier: 1.25,
    homeDefenseMultiplier: 0.92,
    awayAttackMultiplier: 1.08,
    awayDefenseMultiplier: 0.78,
    notes: "QUALITATIVE ANALYSIS — Colombia. Muñoz 1-0 (Díaz assist, 40'). Uzbekistan equalized with historic first WC goal (Fayzullaev, 57'). Díaz immediately restored 2-1 five minutes later — killer instinct. Campaz sealed 3-1 in 90+9'. KEY QUALITATIVE INSIGHTS: (1) Díaz was the best player on pitch — gol+asistencia, pace, pressing. (2) James Rodríguez creative and controlling in 10 role. (3) Colombia 1st half was cautious vs Uzbekistan 5-4-1 block — not dominant. (4) Defense conceded despite having quality advantage — not impenetrable. (5) Uzbekistan showed real fight under Cannavaro. IMPLICATION: Colombia now sole leaders of Group K. Portugal 1-1 with DR Congo means Jun 27 COL vs POR is now a genuine battle — Portugal not the juggernaut expected, Colombia in form with Díaz firing. Opportunity.",
  },

  // ==========================================
  // JUNE 18 — GROUP STAGE DAY 8
  // ==========================================

  // GS-A-4: Czechia 1-1 South Africa
  // AUTO-XG: CZE 1.04, RSA 1.40
  {
    matchId: "GS-A-4",
    date: "2026-06-18",
    homeTeamId: "CZE", awayTeamId: "RSA",
    homeGoals: 1, awayGoals: 1,
    homeAttackMultiplier: 0.77,  // 1.04/1.35 = 0.77
    homeDefenseMultiplier: 0.96, // 1.35/1.40 = 0.96
    awayAttackMultiplier: 1.04,  // 1.40/1.35 = 1.04
    awayDefenseMultiplier: 1.30, // 1.35/1.04 = 1.30 (capped)
    notes: "AUTO-XG. COUNTER-INTUITIVE RESULT: Czechia 1.04 xG, South Africa 1.40 xG — South Africa were actually the better team by xG despite drawing! Sadilek scored early (6'), but Schick missed two great headers. South Africa equalized via Mokoena penalty (83') after handball. Czechia underperformed badly offensively — Schick not clinical. South Africa defense UP, Czechia attack DOWN. Both teams in trouble in Group A: Mexico 3pts, South Korea 3pts, CZE 1pt, RSA 1pt.",
  },

  // GS-B-4: Switzerland 4-1 Bosnia (Bosnia red card ~60')
  // AUTO-XG with red card deflation: SUI 2.00, BIH 0.32
  {
    matchId: "GS-B-4",
    date: "2026-06-18",
    homeTeamId: "SUI", awayTeamId: "BIH",
    homeGoals: 4, awayGoals: 1,
    homeAttackMultiplier: 1.21,  // 2.00/1.35=1.48, deflated by 0.12 for opp red card → 1.48*0.88=1.30, set conservatively
    homeDefenseMultiplier: 1.10,
    awayAttackMultiplier: 0.65,  // 0.32/1.35=0.24, floored to 0.65, then deflated further
    awayDefenseMultiplier: 0.65,
    notes: "RED CARD CONTEXT. Switzerland 4-1 — looked like statement but Bosnia had red card ~60'. Manzambi (sub) brace in 2nd half, Vargas, Xhaka pen. Switzerland 2.00 xG but 3 of 4 goals came after Bosnia went 10-men. Attack multiplier deflated because numerical advantage inflated stats. Bosnia: genuinely poor — 0.32 xG with 11 men, then reduced. Both teams now fight for 2nd in Group B behind Canada (6pts). Switzerland must beat Canada (Group B MD3) to advance — massive match.",
  },

  // GS-B-3: Canada 6-0 Qatar (Qatar 2 red cards: ~31' and ~62')
  // AUTO-XG with heavy red card deflation: CAN 4.46 xG, QAT ~0.30 xG
  {
    matchId: "GS-B-3",
    date: "2026-06-18",
    homeTeamId: "CAN", awayTeamId: "QAT",
    homeGoals: 6, awayGoals: 0,
    homeAttackMultiplier: 1.25,  // 4.46/1.35=3.30, massively deflated: 2 red cards, conservative read: 6 goals vs 9 men, set to 1.25
    homeDefenseMultiplier: 1.10, // Clean sheet but vs 9-men Qatar — deflated
    awayAttackMultiplier: 0.65,  // Qatar already poor, 2 red cards
    awayDefenseMultiplier: 0.65, // Conceded 6 with 9 men
    notes: "RED CARD CONTEXT — HEAVY DEFLATION. Canada 6-0 but Qatar had 2 red cards (Homam Ahmed straight red ~31' for denying goalscoring opportunity, Madibo red ~62' for brutal foul on Koné — likely broken leg). Qatar were 9 men for 28+ minutes. David hat-trick (goals at 28', 45', 90+). Saliba stunning free kick after Koné injury. Own goal at 75'. CRITICAL: Canada's attack multiplier set conservatively at 1.25 NOT the xG-derived 3.30+ — the 6 goals vs 9-men Qatar should NOT inflate Canada's attacking form for 11v11 matches. Jonathan David IS genuinely elite. Davies likely available for SUI match (MD3). KEY: Canada's real test is vs Switzerland MD3 — that will reveal true level.",
  },

  // GS-A-3: Mexico 1-0 South Korea
  // xG: Mexico ~0.85 xG, South Korea ~1.10 xG (KOR actually had more quality chances but goalkeeper errors cost them)
  {
    matchId: "GS-A-3",
    date: "2026-06-18",
    homeTeamId: "MEX", awayTeamId: "KOR",
    homeGoals: 1, awayGoals: 0,
    homeAttackMultiplier: 0.95,   // 0.85/1.35 — goal came from GK error not quality
    homeDefenseMultiplier: 1.18,  // Rangel double miracle save in 2nd half — excellent GK
    awayAttackMultiplier: 1.05,   // KOR had better chances (1.10 xG), Kim Seung-gyu error decided match
    awayDefenseMultiplier: 0.88,  // Conceded from GK error, defensive structure ok
    notes: "AUTO-XG + context. Mexico 1-0 but South Korea were arguably the better team by xG (~1.10 KOR vs ~0.85 MEX). Goal from Kim Seung-gyu GK error (dropped ball, Romo tap-in). Mexico GK Rangel made miraculous double save late. Neither team clinical — tight tactical battle. Mexico now top of Group A with 6pts, assured of R32. South Korea 3pts, need result vs South Africa MD3. KEY: Mexico attack NOT inflated — goal was a gift. South Korea attack slightly UP despite loss — they created more. Group A: MEX 6pts, KOR 3pts, CZE 1pt, RSA 1pt.",
  },

  // ─── Jun 19 ─────────────────────────────────────────────────

  // GS-D-3: USA 2-0 Australia
  // xG: USA 1.08, AUS 0.35
  {
    matchId: "GS-D-3",
    date: "2026-06-19",
    homeTeamId: "USA", awayTeamId: "AUS",
    homeGoals: 2, awayGoals: 0,
    homeAttackMultiplier: 0.92,   // 1.08 xG — solid but not dominant. 2 goals from limited xG = finishing, not attack quality
    homeDefenseMultiplier: 1.45,  // capped — near-shutout, Australia created almost nothing (0.35 xG)
    awayAttackMultiplier: 0.65,   // floored — 0.35 xG across a full match is alarming
    awayDefenseMultiplier: 1.25,  // conceded 2 but held USA to 1.08 xG — not terrible
    notes: "USA controlled match but overperformed finishing (2 goals from 1.08 xG). Balogun and Reyna scored. Australia barely created anything (0.35 xG) — their MD1 win over Turkey looks increasingly like a GK heroics fluke. USA defense excellent — clean sheet, solid structure. Australia attack deeply concerning across two matches (0.77+0.35=1.12 xG total). USA clinch R32 with 6pts. Group D: USA 6pts, AUS 3pts, PAR 3pts, TUR 0pts. KEY: Australia overrated by MD1 scoreline.",
  },

  // GS-C-3: Scotland 0-1 Morocco
  // xG: SCO 0.51, MAR 0.99
  {
    matchId: "GS-C-3",
    date: "2026-06-19",
    homeTeamId: "SCO", awayTeamId: "MAR",
    homeGoals: 0, awayGoals: 1,
    homeAttackMultiplier: 0.65,   // floored — 0.51 xG, 0 goals across 2 games now
    homeDefenseMultiplier: 1.36,  // held Morocco to 0.99 xG — defense not terrible, just attack nonexistent
    awayAttackMultiplier: 0.73,   // 0.99 xG — consistent but not explosive
    awayDefenseMultiplier: 1.45,  // capped — held Scotland to 0.51 xG, clean sheet
    notes: "Saibari scored in 72 SECONDS — fastest goal in 2026 WC so far. Morocco controlled after early opener. Scotland barely threatened (0.51 xG) — Steve Clarke's system very limited offensively. Morocco consistent across 2 matches: 1.53 xG vs Brazil, 0.99 vs Scotland — genuinely solid defensive team. GK Bounou played despite arm injury concern — performed fine. Scotland need a miracle vs Brazil MD3. Morocco top Group C with 4pts, Scotland eliminated effectively.",
  },

  // GS-C-4: Brazil 3-0 Haiti
  // xG: BRA 1.56, HAI 0.23
  {
    matchId: "GS-C-4",
    date: "2026-06-19",
    homeTeamId: "BRA", awayTeamId: "HAI",
    homeGoals: 3, awayGoals: 0,
    homeAttackMultiplier: 1.16,   // 1.56/1.35 — solid but not elite. 3 goals slight overperformance of xG
    homeDefenseMultiplier: 1.45,  // capped — Haiti had 0.23 xG, dominant clean sheet
    awayAttackMultiplier: 0.65,   // floored — 0.23 xG, completely outclassed
    awayDefenseMultiplier: 0.87,  // conceded 3, allowed 1.56 xG — not great
    notes: "Matheus Cunha brace (23', 31'), Vinícius Júnior goal+assist. Brazil efficient but NOT dominant by xG (1.56 for 3 goals — overperformed finishing). KEY CONCERN: Raphinha substituted off 40' with suspected hamstring injury — could miss MD3 vs Morocco. Cunha excellent as starter over Igor Thiago. Haiti 0.23 xG — completely outclassed, eliminated. Brazil move to top of Group C (4pts). Ancelotti's system looks better with Cunha as focal point. Morocco vs Brazil MD3 now a genuine top-of-group clash.",
  },

  // GS-D-4: Turkey 0-1 Paraguay
  // xG: TUR 2.17, PAR 0.32
  {
    matchId: "GS-D-4",
    date: "2026-06-19",
    homeTeamId: "TUR", awayTeamId: "PAR",
    homeGoals: 0, awayGoals: 1,
    homeAttackMultiplier: 1.45,   // capped — 2.17 xG is dominant. Goals don't reflect attack quality at all
    homeDefenseMultiplier: 1.45,  // capped — only allowed 0.32 xG. Historic bad luck
    awayAttackMultiplier: 0.65,   // floored — 0.32 xG counter-attack sucker punch
    awayDefenseMultiplier: 0.65,  // floored — allowed 2.17 xG. Survived on luck
    notes: "MASSIVE UPSET / xG DISTORTION. Turkey dominated completely — 2.17 xG vs Paraguay 0.32 xG — and LOST 0-1. Two matches now: Turkey 1.33 xG vs AUS (lost 0-2), 2.17 xG vs PAR (lost 0-1). Turkey have generated 3.50 xG across 2 matches and scored ZERO goals. Clinical failure of historic proportions. Arda Güler had 7 shots vs Australia, strong showing vs Paraguay too. Paraguay goal was a counter-attack sucker punch. Turkey effectively ELIMINATED (0pts). Paraguay survival: need win or draw vs Australia MD3. CRITICAL FOR MODEL: Turkey attack multiplier HIGH (1.45 cap) despite 0 goals — their xG is excellent. Scoreline is a historic outlier.",
  },

  // ─── Jun 20 ─────────────────────────────────────────────────

  // GS-F-3: Netherlands 5-1 Sweden
  // xG: NED 2.47, SWE 0.98
  {
    matchId: "GS-F-3",
    date: "2026-06-20",
    homeTeamId: "NED", awayTeamId: "SWE",
    homeGoals: 5, awayGoals: 1,
    homeAttackMultiplier: 1.45,   // capped — 2.47 xG genuinely dominant
    homeDefenseMultiplier: 1.38,  // 1.35/0.98 — solid but Sweden not elite
    awayAttackMultiplier: 0.73,   // 0.98 xG — some threat but not enough
    awayDefenseMultiplier: 0.65,  // floored — 2.47 xG conceded, 5 goals against
    notes: "Netherlands dominant and clinical — 2.47 xG AND converted 5 goals (massive overperformance). Brobbey 2 goals (5', 17'), Gakpo 2 goals (47', 50'), Summerville goal (89'). Sweden replied through Elanga (59'). Koeman's Oranje look genuinely dangerous — combining xG dominance with clinical finishing. After 1-1 draw vs Japan (MD1, 0.78 xG), this is a statement. BUT: 5 goals from 2.47 xG is significant overperformance. Sweden: Gyökeres shot-shy after yellow-card concern? Defense exposed badly. Group F: NED top, SWE must beat Tunisia MD3 to have any hope.",
  },

  // GS-E-3: Germany 2-1 Ivory Coast
  {
    matchId: "GS-E-3",
    date: "2026-06-20",
    homeTeamId: "GER", awayTeamId: "CIV",
    homeGoals: 2, awayGoals: 1,
    homeAttackMultiplier: 1.36,
    homeDefenseMultiplier: 1.10,
    awayAttackMultiplier: 0.91,
    awayDefenseMultiplier: 0.74,
    notes: "Germany won via dramatic late comeback — Undav scored twice as sub (68', 94'). Ivory Coast led from 30' and were full value. Germany xG 1.83 vs CIV 1.23. Undav now has 5 sub contributions this tournament (Roger Milla-level). Triple sub at 60' turned game. CIV defense vulnerable late.",
  },

  // GS-E-4: Ecuador 0-0 Curaçao
  {
    matchId: "GS-E-4",
    date: "2026-06-20",
    homeTeamId: "ECU", awayTeamId: "CUW",
    homeGoals: 0, awayGoals: 0,
    homeAttackMultiplier: 1.45,
    homeDefenseMultiplier: 1.45,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 0.65,
    notes: "ECU generated 3.05 xG from 27 shots — CONMEBOL record since 1966. GK Room made 15 saves (WC record for 90min). Ecuador 0 goals from 15 shots on target — catastrophic clinical failure, not lack of quality. Both multipliers hit ceiling/floor. Ecuador finishing crisis continues (0-1 loss vs CIV MD1). Must beat Germany MD3 to advance.",
  },

  // GS-F-4: Tunisia 0-4 Japan
  {
    matchId: "GS-F-4",
    date: "2026-06-20",
    homeTeamId: "TUN", awayTeamId: "JPN",
    homeGoals: 0, awayGoals: 4,
    homeAttackMultiplier: 0.65,
    homeDefenseMultiplier: 0.65,
    awayAttackMultiplier: 1.45,
    awayDefenseMultiplier: 1.45,
    notes: "Tunisia xG 0.05 (2 shots total) — tournament-worst absolute floor. Japan xG 2.07, dominant from 4'. Kamada (4'), Ueda brace (26', 83'), Ito (69'). Japan now 4-match WC unbeaten streak. Tunisia eliminated — 0.33 xG across 2 games. Herve Renard appointment after coach sack had no impact. Japan emerging as genuine Group F force.",
  },

  // ==========================================
  // JUNE 21 — GROUP STAGE DAY 11
  // ==========================================

  // GS-H-3: Spain 4-0 Saudi Arabia
  {
    matchId: "GS-H-3",
    date: "2026-06-21",
    homeTeamId: "ESP", awayTeamId: "KSA",
    homeGoals: 4, awayGoals: 0,
    homeAttackMultiplier: 1.45,
    homeDefenseMultiplier: 1.45,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 0.65,
    notes: "Yamal first WC start — 10' goal. Oyarzabal brace (21', 24'). Al-Tambakti OG 49'. Spain 2.85 xG, KSA 0.04 xG — total domination. Both Yamal and Oyarzabal withdrawn at HT. Alphametrico predicted 2-goal margin but Spain went 4-0 — magnitude underestimation confirmed again. KSA effectively eliminated. ESP attack and defense both at max after response to Cape Verde shock. Lamine Yamal unlocked the tournament.",
  },

  // GS-G-3: Belgium 0-0 Iran
  // NOTE: Belgium had red card (Ngoy, 66') — BEL attack deflated accordingly
  {
    matchId: "GS-G-3",
    date: "2026-06-21",
    homeTeamId: "BEL", awayTeamId: "IRN",
    homeGoals: 0, awayGoals: 0,
    homeAttackMultiplier: 1.19,
    homeDefenseMultiplier: 1.45,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 0.74,
    notes: "Alphametrico SIGNAL CORRECT — predicted tight, low-scoring game, Iran competitive. Belgium 1.82 xG but 0 goals, 23 shots. Doku absent (illness), Lukaku off-form. Ngoy red card 66' for denying Taremi breakaway — Iran had 0.63 xG but multiple danger moments. Beiranvand 7 saves (again). Belgium now 53 consecutive WC shots without an open-play goal. BEL attack multiplier deflated for red card context. IRN defense was genuine masterclass — not just luck. Belgium clinical crisis is structural, not just Doku absence.",
  },

  // GS-H-4: Uruguay 2-2 Cape Verde
  {
    matchId: "GS-H-4",
    date: "2026-06-21",
    homeTeamId: "URU", awayTeamId: "CPV",
    homeGoals: 2, awayGoals: 2,
    homeAttackMultiplier: 1.45,
    homeDefenseMultiplier: 0.80,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 0.65,
    notes: "Uruguay 2.34 xG (17 shots, only 2 on target) — came back from 0-1 to lead 2-1 (Araujo 44', Canobbio 45+6'). Olivera horror pass gifted Helio Varela empty net equalizer in 61'. Uruguay had disallowed goal (Araujo offside). CPV 0.86 xG but 4 shots on target — Pina historic free kick from 32m (Cape Verde's first ever WC goal). Mozumba 40yo GK Vozinha another heroic display. URU missing Gimenez, R.Araujo, De Arrascaeta, Suarez not picked — structural problems beyond squad issues. Group H: ESP 4pts, CPV 2pts, URU 2pts, KSA 1pt. URU need result vs Spain MD3 to survive. URU defense multiplier DOWN sharply — Olivera error catastrophic.",
  },

  // ==========================================
  // JUNE 22 — GROUP STAGE DAY 12
  // ==========================================

  // ARG 2-0 AUT
  {
    matchId: "GS-J-3",
    date: "2026-06-22",
    homeTeamId: "ARG", awayTeamId: "AUT",
    homeGoals: 2, awayGoals: 0,
    homeAttackMultiplier: 1.22,
    homeDefenseMultiplier: 1.45,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 0.90,
    notes: "Alphametrico Score 80 CORRECT — predicted low-scoring grind. Market expected 3-4 goal show after Messi hat-trick vs Algeria. Argentina 1.23 xG (estimated), clean sheet. Messi scored match-winner in 90+5 to make it 2-0 — match nearly ended 1-0. Austria (Rangnick press) competed well and suppressed volume as predicted. Alpha pick 1-0, model pick 2-0 — both directionally correct, model exact. ARG attack multiplier conservative (efficient not dominant). AUT defense multiplier moderate — they competed.",
  },

  // FRA 3-0 IRQ
  {
    matchId: "GS-I-3",
    date: "2026-06-22",
    homeTeamId: "FRA", awayTeamId: "IRQ",
    homeGoals: 3, awayGoals: 0,
    homeAttackMultiplier: 1.45,
    homeDefenseMultiplier: 1.45,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 0.65,
    notes: "France 2.38 xG, Iraq 0.6 xG. Mbappé brace (14', 54') on his 100th cap — now 16 WC goals, joint 2nd all time with Klose, 2 behind Messi. Dembélé first WC goal (66'). 2hr10min weather delay (thunderstorm) didn't disrupt France rhythm. Olise 3 assists in 2 WC games. Model pick 3-0 CORRECT. Alpha pick was 4-0 — overextended the large-margin signal. Key calibration note: when model and alpha agree on direction (France dominant), use MODEL scoreline. Alpha pick 4-0 cost Daniel points vs majority of quiniela who got 3-0 exact. France qualify for R32 with 6pts.",
  },

  // NOR 3-2 SEN
  {
    matchId: "GS-I-4",
    date: "2026-06-22",
    homeTeamId: "NOR", awayTeamId: "SEN",
    homeGoals: 3, awayGoals: 2,
    homeAttackMultiplier: 1.45,
    homeDefenseMultiplier: 0.79,
    awayAttackMultiplier: 1.26,
    awayDefenseMultiplier: 0.65,
    notes: "Norway 2.1 xG, Senegal 1.7 xG — high-intensity thriller. Pedersen 43' (Koulibaly/Mendy errors), Haaland 48' (roof of net, Norway WC all-time top scorer), Sarr 53' (Mané assist), Haaland 58' (close range), Sarr 90+3' (Jackson assist). Alpha pick 2-0 (clean sheet) WRONG — BTTS No signal Score was only 25, too weak to trust. Calibration rule confirmed: BTTS/Under signals with Score <30 should not override the scoreline. Norway alpha had strongest RESULT signal of day (Norway -1 at +50% EV) — that part was correct. Senegal Mané in deep role created danger. Haaland now 59 Norway goals in 52 games. Both teams qualify race still open — Senegal needs big win vs Iraq MD3 to reach R32.",
  },

  // ==========================================
  // JUNE 23 — GROUP STAGE DAY 13
  // ==========================================

  {
    matchId: "GS-K-3",
    date: "2026-06-23",
    homeTeamId: "POR", awayTeamId: "UZB",
    homeGoals: 5, awayGoals: 0,
    homeAttackMultiplier: 1.45,
    homeDefenseMultiplier: 1.45,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 0.65,
    notes: "Portugal 5-0 Uzbekistan. xG: POR 3.8, UZB 0.3. Dominant throughout — both multipliers at cap. Rule 6 confirmed: form depression from DR Congo draw was single-match outlier vs stronger opponent. Portugal attack/defense now among tournament's strongest. Group K top (6pts).",
  },
  {
    matchId: "GS-L-3",
    date: "2026-06-23",
    homeTeamId: "ENG", awayTeamId: "GHA",
    homeGoals: 0, awayGoals: 0,
    homeAttackMultiplier: 0.67,
    homeDefenseMultiplier: 1.35,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 1.35,
    notes: "England 0-0 Ghana. xG: ENG 0.9, GHA 0.4. England attack DOWN sharply — no shots on target first half, Bellingham/Saka stifled by Ghana 5-4-1 block. Ghana defense UP significantly — held England scoreless. Partey anchored midfield. Major calibration: England attacking form regressed from Croatia blowout.",
  },

  // GS-L-4: Panama 0-1 Croatia
  {
    matchId: "GS-L-4",
    date: "2026-06-23",
    homeTeamId: "PAN",
    awayTeamId: "CRO",
    homeGoals: 0,
    awayGoals: 1,
    homeAttackMultiplier: 0.65,
    homeDefenseMultiplier: 1.10,
    awayAttackMultiplier: 0.85,
    awayDefenseMultiplier: 1.15,
    notes: "QUALITATIVE ANALYSIS. Croatia 1-0 Panama — Budimir sub scored 54' after Musa replaced at HT. Croatia xG: estimated ~0.8 (Baturina post HT1, Pasalic one-on-one saved, Budimir goal). Panama xG: estimated ~0.6 (Rodriguez header onto post 23', Livakovic triple save late). Panama actually competitive — held possession, troubled Croatia defensively, Livakovic was MOM with extraordinary late saves. Croatia attack DOWN: struggled vs Panama 5-4-1 block for 45+ minutes, needed sub to unlock. Panama defense UP: resolute, organized, best performance of their WC campaign. Croatia defense UP: Livakovic heroics preserved 1-0. Key: Panama eliminated. Group L final day: England 4pts (drew Ghana 0-0), Croatia 4pts, Ghana 3pts, Panama 0pts — England vs Croatia and Ghana vs Panama decide who advances.",
  },

  // GS-K-4: Colombia 1-0 DR Congo
  {
    matchId: "GS-K-4",
    date: "2026-06-23",
    homeTeamId: "COL",
    awayTeamId: "COD",
    homeGoals: 1,
    awayGoals: 0,
    homeAttackMultiplier: 0.76,
    homeDefenseMultiplier: 1.26,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 1.35,
    notes: "AUTO-XG. Colombia 1.03 xG / 20 shots — dominant in volume, frustrated by Mpasi (8 saves, standout GK). DR Congo 0.39 xG / 8 shots — deep 5-3-2 block, barely threatened. Muñoz 76' winner (Quintero assist after replacing James). Díaz 5 shots, James 5 chances created (first Colombia player to create 5 WC chances since Valderrama 1998). Colombia xG/1.35 = 0.76 — attack DOWN from MD1 (1.25) due to GK performance, not quality drop. DR Congo xG/1.35 = 0.29, floored to 0.65 — attack capped. DR Congo defense UP significantly: only 2 goals conceded in 2 WC matches (vs 11 as Zaire in 1974). IMPLICATION: Colombia top Group K (6pts), qualify for R32. Jun 27 COL vs POR decides group winner — Colombia can advance as group winners with a draw. DR Congo must beat Uzbekistan to survive.",
  },

  // GS-G-4: New Zealand 1-3 Egypt
  {
    matchId: "GS-G-4",
    date: "2026-06-21",
    homeTeamId: "NZL", awayTeamId: "EGY",
    homeGoals: 1, awayGoals: 3,
    homeAttackMultiplier: 0.90,
    homeDefenseMultiplier: 0.69,
    awayAttackMultiplier: 1.45,
    awayDefenseMultiplier: 1.12,
    notes: "Egypt's first ever World Cup win — came from behind (Surman header 15'). Zico equalizer 58', Salah (67', assist+goal), Trezeguet diving header 82'. Egypt 1.96 xG, NZL 1.21 xG. Salah in #10 role devastating as creator and finisher — 68th international goal. Shobeir solid in goal. Group G now: EGY 4pts (first!), BEL 1pt, IRN 1pt, NZL 1pt. Egypt vs Iran MD3 is group decider — winner likely tops group. NZL defense multiplier DOWN significantly — now 0 wins in 8 WC games all time.",
  },

  // ==========================================
  // JUNE 24 — GROUP STAGE DAY 14
  // ==========================================

  // GS-A-5: Czechia 0-3 Mexico
  // xG: CZE 0.47, MEX 1.79
  {
    matchId: "GS-A-5",
    date: "2026-06-24",
    homeTeamId: "CZE", awayTeamId: "MEX",
    homeGoals: 0, awayGoals: 3,
    homeAttackMultiplier: 0.65,   // 0.47/1.35 = 0.35 → floored to 0.65
    homeDefenseMultiplier: 0.75,  // 1.35/1.79 = 0.75
    awayAttackMultiplier: 1.33,   // 1.79/1.35 = 1.33
    awayDefenseMultiplier: 1.45,  // 1.35/0.47 = 2.87 → capped to 1.45
    notes: "AUTO-XG. Mexico 3-0 with perfect rotation — Chavez (55'), Quinones (61'), Fidalgo sub (90+4'). Mexico made 5 changes (heaviest rotation of campaign), yet dominated by xG (1.79 vs 0.47). Czechia had 13 shots but only 1 on target — purely speculative shooting. Gilberto Mora (17yo) was MOTM catalyst for 2nd-half surge. Mexico finish Group A with 3W/0D/0L — first perfect group stage in their WC history. Ochoa made history at 40yo (6th WC). Czechia eliminated with 1pt (W0D1L2). CONTEXT: Mexico rotated heavily but crowd + home atmosphere elevated performance beyond what form metrics suggested. Czechia's attacking fragility (0.47 xG) confirms what MD1-2 data showed — Schick ineffectual, attack systemically broken.",
  },

  // GS-A-6: South Africa 1-0 South Korea
  // xG: RSA 1.1, KOR 1.0
  {
    matchId: "GS-A-6",
    date: "2026-06-24",
    homeTeamId: "RSA", awayTeamId: "KOR",
    homeGoals: 1, awayGoals: 0,
    homeAttackMultiplier: 0.81,   // 1.1/1.35 = 0.81
    homeDefenseMultiplier: 1.35,  // 1.35/1.0 = 1.35
    awayAttackMultiplier: 0.74,   // 1.0/1.35 = 0.74
    awayDefenseMultiplier: 1.23,  // 1.35/1.1 = 1.23
    notes: "AUTO-XG. South Africa historic 1-0 win — qualify for R32 for the first time ever. Maseko 63' winner. xG was near-even (RSA 1.1 vs KOR 1.0) — genuinely competitive match, not a fluke scoreline. South Korea had 68% possession but couldn't convert — Son Heung-min benched at start, came on HT but failed to ignite again (scoreless from 1.01 xG across tournament). South Africa defended brilliantly in low block after taking the lead. KOR attack multiplier DOWN — 3 matches, consistent underperformance vs xG. RSA defense UP — held Mexico 0.07 xG (MD1 context: 9-men), held Korea to 1.0 xG. Son's form is a genuine concern heading into R32 if they qualify as best 3rd. South Africa face Canada in R32.",
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

  // Also include completed knockout match insights (same multiplier schema)
  const koInsights = getTeamKnockoutInsights(teamId);

  if (insights.length === 0 && koInsights.length === 0) {
    return { attackMultiplier: 1.0, defenseMultiplier: 1.0 };
  }

  // Extract per-match multipliers (chronological order — GS first, then KO)
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

  for (const ko of koInsights) {
    if (ko.homeTeamId === teamId) {
      attackMults.push(ko.homeAttackMultiplier!);
      defenseMults.push(ko.homeDefenseMultiplier!);
    } else {
      attackMults.push(ko.awayAttackMultiplier!);
      defenseMults.push(ko.awayDefenseMultiplier!);
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
