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

  // ALG 2-1 JOR (MD2 — missing entry; GS-J-2 was taken by AUT vs JOR MD1)
  {
    matchId: "GS-J-6",
    date: "2026-06-22",
    homeTeamId: "ALG", awayTeamId: "JOR",
    homeGoals: 2, awayGoals: 1,
    homeAttackMultiplier: 1.04,
    homeDefenseMultiplier: 0.95,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 0.74,
    notes: "Algeria 2-1 Jordan MD2. Benbouali 69' header (Mahrez corner), Gouiri 82'. Al-Rashdan 36' gave Jordan lead. Algeria comeback. Amoura out (hamstring). Mahrez-Gouiri axis key.",
  },

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

  // ==========================================
  // GROUP STAGE MATCHDAY 3 — MISSING ENTRIES
  // ==========================================

  // June 24 — Group B MD3
  // GS-B-5: Switzerland 2-1 Canada (CORRECTED from 1-1)
  {
    matchId: "GS-B-5",
    date: "2026-06-24",
    homeTeamId: "SUI", awayTeamId: "CAN",
    homeGoals: 2, awayGoals: 1,
    homeAttackMultiplier: 1.35,   // 2-1 win — stronger attack signal than xG suggested
    homeDefenseMultiplier: 0.96,  // conceded 1 vs Canada — unchanged
    awayAttackMultiplier: 1.04,   // 1.4/1.35 = 1.04
    awayDefenseMultiplier: 0.84,  // 1.35/1.6 = 0.84
    notes: "AUTO-XG. Switzerland 2-1 Canada — Switzerland won to top Group B with 7pts. Davies featured for Canada. Switzerland's clinical finish confirmed attacking quality. CORRECTED: Switzerland WON 2-1, topped Group B with 7pts. Attack confirmed stronger than 1-1 suggested.",
  },

  // GS-B-6: Bosnia 2-0 Qatar
  // AUTO-XG: BIH 1.8, QAT 0.7
  {
    matchId: "GS-B-6",
    date: "2026-06-24",
    homeTeamId: "BIH", awayTeamId: "QAT",
    homeGoals: 2, awayGoals: 0,
    homeAttackMultiplier: 1.33,   // 1.8/1.35 = 1.33
    homeDefenseMultiplier: 1.45,  // 1.35/0.7 = 1.93 → capped
    awayAttackMultiplier: 0.65,   // 0.7/1.35 = 0.52 → floored
    awayDefenseMultiplier: 0.75,  // 1.35/1.8 = 0.75
    notes: "AUTO-XG. Bosnia 2-0 Qatar — straightforward win for Bosnia, finishing 3rd in Group B (3pts). Qatar eliminated with 1pt. Bosnia's physicality and set-piece delivery dominated Qatar's limited defensive structure. 2 red cards received over the tournament (vs Switzerland) hurt their earlier campaign. Qatar failed to build on their MD1 late equalizer vs Switzerland — organization dropped when their plan required goals.",
  },

  // June 25 — Group D MD3
  // GS-D-5: Turkey 3-2 USA
  // NOTA: Turkey FINALMENTE marcó — 3 goles después de 0 en 2 partidos
  // xG estimado: TUR ~2.0, USA ~1.2
  {
    matchId: "GS-D-5",
    date: "2026-06-25",
    homeTeamId: "TUR", awayTeamId: "USA",
    homeGoals: 3, awayGoals: 2,
    homeAttackMultiplier: 1.45,  // capped — Turkey 3 goles, xG estimado ~2.0. Finishing failure ended.
    homeDefenseMultiplier: 0.79, // 1.35/2.0(est) = 0.68, but USA rotated → 0.79 conservatively
    awayAttackMultiplier: 0.89,  // USA scored 2 but rotating squad. 2 goals from ~1.2 xG.
    awayDefenseMultiplier: 0.65, // floored — concedieron 3 a Turkey (dead rubber match, rotating)
    notes: "Turkey 3-2 USA MD3 — dead rubber for both (USA through as group winners, Turkey eliminated). Turkey FINALMENTE convirtió después de 0 goles en 2 partidos anteriores con 3.5+ xG combinado. Kaan Ayhan late winner en stoppage time. USA rotated squad. CRITICAL CALIBRATION: Turkey attack multiplier NOW reflects real scoring capability — their prior 0 goals were historic finishing failure, not lack of quality. USA defense DOWN severely but context is full rotation vs dead rubber — do NOT apply this to USA R32 assessment (already completed vs Bosnia). Australia: advances as Group D runners-up.",
  },

  // GS-D-6: Paraguay 0-0 Australia (Jun 25 MD3)
  // Mutually beneficial draw — both needed at least a point to secure advancement
  {
    matchId: "GS-D-6",
    date: "2026-06-25",
    homeTeamId: "PAR", awayTeamId: "AUS",
    homeGoals: 0, awayGoals: 0,
    homeAttackMultiplier: 0.65, // floored — 0 goals in MD3. PAR scored only via counter vs TUR (MD2).
    homeDefenseMultiplier: 1.45, // capped — Paraguay clean sheet. Defensive identity confirmed.
    awayAttackMultiplier: 0.65, // floored — Australia 0 goals in last 2 matches (vs USA + PAR)
    awayDefenseMultiplier: 1.45, // capped — Australia clean sheet vs Paraguay
    notes: "Paraguay 0-0 Australia MD3 — mutually beneficial draw, both teams advance. Australia as Group D runners-up (2nd), Paraguay as best 3rd-place (3rd). Scoreless match confirms both teams' attacking frailty. Australia enters R32 vs Egypt with attack at floor — 0 goals in last 2 matches. Their only goal came vs Turkey counter-attack (MD1). Paraguay advance to face France in R16.",
  },

  // June 26 — Group G MD3
  // GS-G-5: Egypt 1-1 Iran
  {
    matchId: "GS-G-5",
    date: "2026-06-26",
    homeTeamId: "EGY", awayTeamId: "IRN",
    homeGoals: 1, awayGoals: 1,
    homeAttackMultiplier: 1.10, // Egypt scored 1. Salah contribution likely. ~1.5/1.35 est → 1.10
    homeDefenseMultiplier: 1.10, // Conceded 1 to Iran but solid overall tournament
    awayAttackMultiplier: 0.92, // Iran scored 1 — real attacking threat confirmed. ~1.24/1.35 est
    awayDefenseMultiplier: 1.10, // Iran held Egypt to 1 goal — decent display
    notes: "Egypt 1-1 Iran MD3 — Egypt advance as Group G winners (5pts). Iran eliminated on goal difference despite not losing a match. Belgium topped Group G with 5pts and better goal diff. Egypt's tournament: consistent, Salah-led, never blowout winners but always competitive. Enter R32 vs Australia with balanced attack/defense. Iran showed real quality across tournament — goal vs Egypt confirms attacking capability. KEY: Egypt advance as slight group winners, face Group D runners-up Australia at AT&T Stadium Dallas.",
  },

  // June 26 — Group H MD3
  // GS-H-6: Cape Verde 0-0 Saudi Arabia
  {
    matchId: "GS-H-6",
    date: "2026-06-26",
    homeTeamId: "CPV", awayTeamId: "KSA",
    homeGoals: 0, awayGoals: 0,
    homeAttackMultiplier: 0.65, // floored — 0 goals MD3. Cape Verde identity = defensive block.
    homeDefenseMultiplier: 1.45, // capped — Cape Verde clean sheet. Third 0-0 draw of tournament.
    awayAttackMultiplier: 0.65, // floored — KSA 0 goals vs Cape Verde's Vozinha
    awayDefenseMultiplier: 1.45, // capped — KSA clean sheet (eliminated regardless)
    notes: "Cape Verde 0-0 Saudi Arabia MD3 — Cape Verde advance as Group H runners-up (3pts, 3 draws). Third 0-0 in their group stage — most defensive-oriented team in tournament. Vozinha (40yo) heroic across all 3 matches. Cape Verde profile: attack permanently floored, defense at cap. Their value is entirely in preventing goals. Saudi Arabia eliminated. Cape Verde face Argentina R32 — Rule 9 applies: 0-0 EV historically high for Cape Verde setups.",
  },

  // June 27 — Group K MD3
  // GS-K-5: Colombia 0-0 Portugal
  // Both already qualified. Colombia already group winners (7pts).
  {
    matchId: "GS-K-5",
    date: "2026-06-27",
    homeTeamId: "COL", awayTeamId: "POR",
    homeGoals: 0, awayGoals: 0,
    homeAttackMultiplier: 0.65, // floored — 0 goals. Dead rubber, likely rotation + low intensity.
    homeDefenseMultiplier: 1.45, // capped — Colombia clean sheet vs Portugal. Elite defensive display.
    awayAttackMultiplier: 0.65, // floored — Portugal 0 goals. Ronaldo resting/reduced minutes likely.
    awayDefenseMultiplier: 1.45, // capped — Portugal clean sheet vs Colombia.
    notes: "Colombia 0-0 Portugal MD3 — both already qualified, Colombia group winners. Tactical dead rubber — low intensity, rotation likely. Colombia xG suppressed by mutual low-press approach. KEY FORM NOTE FOR R32: GS-K-5 recency weight (60%) will depress Colombia attack lambda significantly (0.65 floor). This is dead-rubber context, NOT a structural attacking collapse. Defense multiplier UP — clean sheet vs Portugal is a real quality signal. Colombia enters R32 vs Ghana with elevated defense, suppressed attack in model. Apply dead-rubber context when interpreting lambda output.",
  },

  // June 27 — Group J MD3 (ARG-JOR)
  // GS-J-5 data: task says ARG 3-1 JOR (Messi from bench scored) — existing entry has JOR 0-3 ARG
  // Existing GS-J-5 already present with homeTeamId: JOR / awayTeamId: ARG — SKIP per task instructions

  // June 27 — Group I MD3
  // GS-I-5: France 2-1 Norway (group decider)
  // AUTO-XG: FRA 2.5, NOR 1.1
  {
    matchId: "GS-I-5",
    date: "2026-06-27",
    homeTeamId: "FRA", awayTeamId: "NOR",
    homeGoals: 2, awayGoals: 1,
    homeAttackMultiplier: 1.45,   // 2.5/1.35 = 1.85 → capped
    homeDefenseMultiplier: 1.23,  // 1.35/1.1 = 1.23
    awayAttackMultiplier: 0.81,   // 1.1/1.35 = 0.81
    awayDefenseMultiplier: 0.65,  // 1.35/2.5 = 0.54 → floored
    notes: "AUTO-XG. France 2-1 Norway — France win the group. Mbappé instrumental; Olise with a late assist. Norway's Haaland struck a consolation in the final minutes — his tournament form (4 goals in 3 GS matches) remains elite. France 2.5 xG vs Norway 1.1 xG — France clearly dominant. Norway defense DOWN significantly — conceded 2 to France's superior combination play. Both advance: France 1st (9pts), Norway 2nd (6pts). KEY CALIBRATION: Norway defend better vs lesser opposition; France exposed their high defensive line with pace.",
  },

  // GS-I-6: Senegal 2-0 Iraq (Senegal fight for survival)
  // AUTO-XG: SEN 1.9, IRQ 0.7
  {
    matchId: "GS-I-6",
    date: "2026-06-27",
    homeTeamId: "SEN", awayTeamId: "IRQ",
    homeGoals: 2, awayGoals: 0,
    homeAttackMultiplier: 1.41,   // 1.9/1.35 = 1.41
    homeDefenseMultiplier: 1.45,  // 1.35/0.7 = 1.93 → capped
    awayAttackMultiplier: 0.65,   // 0.7/1.35 = 0.52 → floored
    awayDefenseMultiplier: 0.71,  // 1.35/1.9 = 0.71
    notes: "AUTO-XG. Senegal 2-0 Iraq — Senegal secure enough to qualify as best 3rd (3pts). Mané key as creator again. Iraq outclassed across their entire tournament (1 goal in 3 matches, bottom of Group I). Senegal's athleticism and pressing too much for Iraq's passive midfield. Senegal advance to R32 to face Belgium. Group I final: FRA 9pts, NOR 6pts, SEN 3pts (qualified as best 3rd), IRQ 0pts.",
  },

  // June 27 — Group J MD3
  // GS-J-4: Algeria 3-3 Austria (CORRECTED from Austria 1-0 Algeria; home/away also fixed)
  {
    matchId: "GS-J-4",
    date: "2026-06-27",
    homeTeamId: "ALG", awayTeamId: "AUT",
    homeGoals: 3, awayGoals: 3,
    homeAttackMultiplier: 1.45,   // 3 goals — capped
    homeDefenseMultiplier: 0.65,  // 3 conceded — floored
    awayAttackMultiplier: 1.45,   // Austria also scored 3 — capped
    awayDefenseMultiplier: 0.65,  // 3 conceded — floored
    notes: "CORRECTED: Algeria 3-3 Austria thriller at Kansas City. Mahrez 90+' strike nearly eliminated Austria; Kalajdzic 96' equalizer saw both advance. Algeria arrive at R32 with Mahrez in explosive form. Attack multiplier capped — genuine attacking quality confirmed vs Austria. Amoura out (hamstring) but Mahrez-Gouiri axis dangerous.",
  },

  // GS-J-5: Jordan 0-3 Argentina (Argentina rotate)
  // AUTO-XG: JOR 0.4, ARG 3.0
  {
    matchId: "GS-J-5",
    date: "2026-06-27",
    homeTeamId: "JOR", awayTeamId: "ARG",
    homeGoals: 0, awayGoals: 3,
    homeAttackMultiplier: 0.65,   // 0.4/1.35 = 0.30 → floored
    homeDefenseMultiplier: 0.65,  // 1.35/3.0 = 0.45 → floored
    awayAttackMultiplier: 1.45,   // 3.0/1.35 = 2.22 → capped
    awayDefenseMultiplier: 1.45,  // 1.35/0.4 = 3.38 → capped
    notes: "AUTO-XG. Argentina 3-0 Jordan — Alvarez hat-trick with Messi rotated to bench. Argentina rotated heavily (perfect group stage secured) but depth still clinical — Di María and Lautaro featured. Jordan 0.4 xG across the match; exposed by Argentina's rotational pressing. KEY: Argentina attack depth confirmed — not Messi-dependent. Jordan eliminated without a win. Argentina advance to face Cape Verde in R32.",
  },

  // June 27 — Group L MD3
  // GS-L-5: England 3-0 Panama
  // AUTO-XG: ENG 2.8, PAN 0.5
  {
    matchId: "GS-L-5",
    date: "2026-06-27",
    homeTeamId: "ENG", awayTeamId: "PAN",
    homeGoals: 3, awayGoals: 0,
    homeAttackMultiplier: 1.45,   // 2.8/1.35 = 2.07 → capped
    homeDefenseMultiplier: 1.45,  // 1.35/0.5 = 2.70 → capped
    awayAttackMultiplier: 0.65,   // 0.5/1.35 = 0.37 → floored
    awayDefenseMultiplier: 0.65,  // 1.35/2.8 = 0.48 → floored
    notes: "AUTO-XG. England 3-0 Panama — England top Group L. High-press game unlocked Panama's compact structure in second half. Kane, Bellingham, Rashford all on target. England 2.8 xG — dominant once they committed to vertical pressing. PAN 0.5 xG — outplayed but their defensive record (only 1 goal conceded vs Croatia MD2) suggests ability vs less elite press. KEY: England attack UP from Ghana draw — when vertical channel is open, England's attack is genuine elite tier. Defense also clean sheet. Group L: ENG 1st (7pts), CRO 2nd (6pts). England advance to R32 vs Congo DR.",
  },

  // GS-L-6: Croatia 2-1 Ghana
  // AUTO-XG: CRO 1.8, GHA 1.0
  {
    matchId: "GS-L-6",
    date: "2026-06-27",
    homeTeamId: "CRO", awayTeamId: "GHA",
    homeGoals: 2, awayGoals: 1,
    homeAttackMultiplier: 1.33,   // 1.8/1.35 = 1.33
    homeDefenseMultiplier: 1.35,  // 1.35/1.0 = 1.35 (1 goal conceded)
    awayAttackMultiplier: 0.79,   // CORRECCIÓN: recalibrado a 0.79 — Ghana no está en floor al entrar al R32
    awayDefenseMultiplier: 0.75,  // 1.35/1.8 = 0.75
    notes: "AUTO-XG. Croatia 2-1 Ghana — Modric orchestrated a composed midfield performance to confirm 2nd place. Croatia's experience showed against a Ghana side that had overperformed vs Panama. Ghana pulled one back late — Croatia defense not airtight (1 goal conceded). Croatia 1.8 xG — clinical on limited chances. KEY: Croatia defense moderate vs MD2 — Livakovic tested (1 goal allowed). Ghana attack UP from MD2 — scored despite ultimately losing. Croatia advance to R32 vs Portugal. CORRECCIÓN: resultado final fue 2-1 (no 2-0). Ghana marcó consolación tardía. awayAttack recalibrado a 0.79 — Ghana no está en floor al entrar al R32.",
  },

  // ==========================================
  // ROUND OF 32 — COMPLETED MATCHES
  // ==========================================

  // R32-01: South Africa 0-1 Canada (June 28)
  // AUTO-XG: RSA 0.13, CAN 1.32 (from match data)
  {
    matchId: "R32-01",
    date: "2026-06-28",
    homeTeamId: "RSA", awayTeamId: "CAN",
    homeGoals: 0, awayGoals: 1,
    homeAttackMultiplier: 0.65,   // 0.13/1.35 = 0.10 → floored (extreme low-block, not true capability)
    homeDefenseMultiplier: 1.02,  // 1.35/1.32 = 1.02
    awayAttackMultiplier: 0.98,   // 1.32/1.35 = 0.98
    awayDefenseMultiplier: 1.45,  // 1.35/0.13 = 10.38 → capped
    notes: "AUTO-XG. Canada 1-0 via Eustaquio 90+' stoppage-time strike. xG: CAN 1.32, RSA 0.13. South Africa played extreme low-block 4-2-3-1, barely attacked all match (1 shot on target after 6th minute). Canada dominated (12 shots, 7 on target) but underperformed finishing until the last moment. RSA attack floor applied — extreme defensive setup distorted output. Davies came off bench. Canada advance to R16 vs Netherlands/Morocco winner.",
  },

  // R32-02: Brazil 2-1 Japan (June 29)
  // AUTO-XG: BRA 2.4, JPN 0.9
  {
    matchId: "R32-02",
    date: "2026-06-29",
    homeTeamId: "BRA", awayTeamId: "JPN",
    homeGoals: 2, awayGoals: 1,
    homeAttackMultiplier: 1.45,   // 2.4/1.35 = 1.78 → capped
    homeDefenseMultiplier: 1.45,  // 1.35/0.9 = 1.50 → capped
    awayAttackMultiplier: 0.67,   // 0.9/1.35 = 0.67
    awayDefenseMultiplier: 0.65,  // 1.35/2.4 = 0.56 → floored
    notes: "AUTO-XG. Brazil 2-1 Japan. BRA xG 2.4 — dominant in possession and chance creation. Vinícius Júnior brace settled the tie. Japan's pressing created a chaotic goal and kept the match tense, but lacked the individual quality to threaten a genuine upset. JPN 0.9 xG — better than their defensive record in group stage suggested. Brazil advance to face Germany/Paraguay winner in R16. KEY: Cunha–ViniJr combination continued from group stage. Matheus Cunha missed but created. Japan's World Cup ends having overachieved their Elo projection.",
  },

  // R32-03: Germany 1-1 AET Paraguay (Germany win on penalties, regulation score used)
  // AUTO-XG: GER 2.8, PAR 0.6
  {
    matchId: "R32-03",
    date: "2026-06-29",
    homeTeamId: "GER", awayTeamId: "PAR",
    homeGoals: 1, awayGoals: 1,
    homeAttackMultiplier: 1.45,   // 2.8/1.35 = 2.07 → capped
    homeDefenseMultiplier: 1.45,  // 1.35/0.6 = 2.25 → capped
    awayAttackMultiplier: 0.65,   // 0.6/1.35 = 0.44 → floored
    awayDefenseMultiplier: 0.65,  // 1.35/2.8 = 0.48 → floored
    notes: "AUTO-XG (regulation score). Germany 1-1 Paraguay AET, Germany win on penalties. GER xG 2.8 — dominated territory and chance creation. PAR xG 0.6 — classic low-block counter approach. Germany's clinical failure in regulation (missed multiple clear chances) echoes their group stage performance at times. Paraguay's lone goal came from a set piece — their only real moment of threat. Germany advance on pens to R16. KEY: Germany attack remains elite by xG but finishing inconsistency noted. Defense solid (only 0.6 conceded against a direct South American side).",
  },

  // GS-C-5: Morocco 4-2 Haiti (Group C MD3)
  // Morocco top Group C; Haiti eliminated
  {
    matchId: "GS-C-5",
    date: "2026-06-25",
    homeTeamId: "MAR", awayTeamId: "HAI",
    homeGoals: 4, awayGoals: 2,
    homeAttackMultiplier: 1.40,   // 4 goals — dominant attacking display
    homeDefenseMultiplier: 0.88,  // 2 goals conceded vs weak Haiti — slight vulnerability
    awayAttackMultiplier: 1.05,   // Haiti scored 2 — more than expected vs Morocco
    awayDefenseMultiplier: 0.65,  // 4 goals conceded → floored
    notes: "Morocco 4-2 Haiti MD3 — Morocco top Group C (7pts). Hakim Ziyech inspired display; Bounou managed late nerves. Haiti 4 goals conceded hurt but they scored 2 — their best attacking performance. Morocco advance unbeaten in GS with best defensive record in tournament (0.8 xGA/game). KEY FORM NOTE: Morocco attack confirmed multi-dimensional — not just counter-attack. Haiti eliminated after 3 group-stage defeats.",
  },

  // R32-04: Netherlands 1-1 AET Morocco (Morocco win on penalties, regulation score used)
  // AUTO-XG: NED 2.1, MAR 0.9
  {
    matchId: "R32-04",
    date: "2026-06-29",
    homeTeamId: "NED", awayTeamId: "MAR",
    homeGoals: 1, awayGoals: 1,
    homeAttackMultiplier: 1.45,   // 2.1/1.35 = 1.56 → capped
    homeDefenseMultiplier: 1.45,  // 1.35/0.9 = 1.50 → capped
    awayAttackMultiplier: 0.67,   // 0.9/1.35 = 0.67
    awayDefenseMultiplier: 0.65,  // 1.35/2.1 = 0.64 → floored
    notes: "AUTO-XG (regulation score). Netherlands 1-1 Morocco AET, Morocco win on penalties — MASSIVE UPSET. NED xG 2.1 — dominated possession and forward territory. Morocco's defense absorbed pressure brilliantly — Bounou outstanding. Morocco converted their lone clear chance from a clinical counter. Morocco advance to face Canada in R16. KEY: Morocco continue 2022 legacy — penalty shootout specialists (5th shootout in major tournaments). Netherlands penalty record under Koeman poor. Morocco defense multiplier floored — 0.9 xG is actually decent against the Dutch attack. NED eliminate before quarterfinals despite dominant xG across the tournament.",
  },

  // R32-05: Ivory Coast 1-2 Norway (June 30)
  // AUTO-XG: CIV 1.4, NOR 1.9
  {
    matchId: "R32-05",
    date: "2026-06-30",
    homeTeamId: "CIV", awayTeamId: "NOR",
    homeGoals: 1, awayGoals: 2,
    homeAttackMultiplier: 1.04,   // 1.4/1.35 = 1.04
    homeDefenseMultiplier: 0.71,  // 1.35/1.9 = 0.71
    awayAttackMultiplier: 1.41,   // 1.9/1.35 = 1.41
    awayDefenseMultiplier: 0.96,  // 1.35/1.4 = 0.96
    notes: "AUTO-XG. Norway 2-1 Ivory Coast — Haaland opened and closed the scoring; Ivory Coast equalized mid-second half from a set piece (Daniel pick: 1-2 NOR, EXACT). Norway AH cascade had signaled strong away value — Pick Judge Rule 14 correctly identified the flip from model draw to Norway win. Both teams scored (BTTS confirmed). Norway advance to R16 vs France winner bracket. CIV xG 1.4 — competitive and created genuine chances but Norway quality told in the end.",
  },

  // R32-06: France 3-0 Sweden (June 30)
  // AUTO-XG: FRA 3.2, SWE 0.5
  {
    matchId: "R32-06",
    date: "2026-06-30",
    homeTeamId: "FRA", awayTeamId: "SWE",
    homeGoals: 3, awayGoals: 0,
    homeAttackMultiplier: 1.45,   // 3.2/1.35 = 2.37 → capped
    homeDefenseMultiplier: 1.45,  // 1.35/0.5 = 2.70 → capped
    awayAttackMultiplier: 0.65,   // 0.5/1.35 = 0.37 → floored
    awayDefenseMultiplier: 0.65,  // 1.35/3.2 = 0.42 → floored
    notes: "AUTO-XG. France 3-0 Sweden — Mbappé brace, Olise assist. FRA xG 3.2 — dominant throughout. Sweden 0.5 xG — completely shut out, their attack (Gyökeres/Isak) neutralized by France's high defensive line and press. Pick Judge Rule 15 correctly confirmed clean sheet: both result markets zero, BTTS Yes only moderate, Sweden cascade on wide lines only. Daniel pick 3-0 EXACT. France advance to face Norway in R16 — a genuine dark horse clash. Sweden's attack, explosive in group stage, completely stifled by elite opposition.",
  },

  // R32-07: Mexico 2-0 Ecuador (June 30, Estadio Azteca)
  // AUTO-XG: MEX 2.2, ECU 0.8
  {
    matchId: "R32-07",
    date: "2026-06-30",
    homeTeamId: "MEX", awayTeamId: "ECU",
    homeGoals: 2, awayGoals: 0,
    homeAttackMultiplier: 1.45,   // 2.2/1.35 = 1.63 → capped
    homeDefenseMultiplier: 1.45,  // 1.35/0.8 = 1.69 → capped
    awayAttackMultiplier: 0.65,   // 0.8/1.35 = 0.59 → floored
    awayDefenseMultiplier: 0.65,  // 1.35/2.2 = 0.61 → floored
    notes: "AUTO-XG. Mexico 2-0 Ecuador at Estadio Azteca — Rule 16a veto CONFIRMED. Ecuador AH cascade (Score 86-91, 6 lines) pointed to Ecuador, but co-host + perfect group record + Azteca + Ecuador fragility triggered Rule 16a. Pick Judge output 2-0 EXACT (model 2-1 compressed, away goal removed). MEX xG 2.2 — dominant in second half after cautious opening. ECU xG 0.8 — some threat on counter but Ochoa (40yo) excellent when required. Mexico advance to R16 vs England/COD winner. KEY LESSON: Tournament form veto (Rule 16a) overrode market signals correctly — DO NOT fade a perfect-record co-host at their iconic stadium.",
  },

  // R32-08: England 2-1 Congo DR (July 1, 2026)
  // Rule 16b lesson — BTTS No 74 (moderate) + COD λ 0.47 → BTTS compression applied
  {
    matchId: "R32-08",
    date: "2026-07-01",
    homeTeamId: "ENG", awayTeamId: "COD",
    homeGoals: 2, awayGoals: 1,
    homeAttackMultiplier: 0.95,   // England attack DOWN — toothless vs 5-3-2 low block for 60+ mins
    homeDefenseMultiplier: 0.72,  // England defense DOWN sharply — Spence RB crisis, repeatedly exposed
    awayAttackMultiplier: 1.28,   // DRC attack UP — Cipenga finish, Wissa hit frame, real counter threat
    awayDefenseMultiplier: 1.38,  // DRC defense UP — Mpasi-Nzau world-class (5+ saves), held England until 75'
    notes: "England 2-1 but trailed 0-1 from 7' to 75'. Cipenga stunner (Mbemba assist) — Spence left him completely unmarked at back post, defensive howler exposing RB crisis (no James/Quansah). England 1.31 xG at HT from 8 shots, all 8 shots + 20 box touches came AFTER hydration break (OptaJoe). Mpasi-Nzau heroic GK — 5+ saves including point-blank Bellingham header and Rice corner. Wissa hit the frame late — DRC could have led 2-0. Anthony Gordon (sub 61') provided BOTH assists for Kane brace (75' header, 86' shot). First time England won WC match after conceding first since 1966 final. DRC defense UP sharply — Mpasi world-class display. Pick Judge Rule 16b: BTTS No 74 (moderate, 60-79) + COD λ 0.47 + COD scored 2/3 matches → output 2-1 EXACT (Rule 16a veto was moot — COD cascade on wide lines, no tight-line Tier 3 trigger). England advance to face Mexico at Azteca in R16.",
  },
  // R32-09: Belgium 3-2 AET Senegal (July 2, 2026)
  // Pick Judge output 1-1 was structurally correct at 75' — chaos match decided by late variance
  {
    matchId: "R32-09",
    date: "2026-07-02",
    homeTeamId: "BEL", awayTeamId: "SEN",
    homeGoals: 3, awayGoals: 2,
    homeAttackMultiplier: 1.18,
    homeDefenseMultiplier: 0.72,
    awayAttackMultiplier: 1.22,
    awayDefenseMultiplier: 0.68,
    notes: "CHAOS MATCH — Belgium 3-2 AET. Senegal led 2-0 around 75'. Belgium red card + penalty + ET winner. Our pick 1-1 was structurally correct at 75' — result decided by low-probability late chaos (red card, pen, ET). NO ENGINE ADJUSTMENT — this is variance not a systematic gap. Belgium attack UP: De Bruyne second-half masterclass, comeback from 2-0 deficit shows genuine quality. Belgium defense DOWN: conceded 2 before fightback. Senegal attack UP: scored 2 vs Top 9% Belgium defense. Senegal defense DOWN: collapsed late. Belgium advance to R16 vs USA at Seattle.",
  },
  // R32-10: USA 2-0 Bosnia Herzegovina (July 1, 2026)
  // Rule 17 lesson — away λ 0.45 + BIH goal dist 0-peak 38% + USA win% 57.8% → clean sheet override
  {
    matchId: "R32-10",
    date: "2026-07-01",
    homeTeamId: "USA", awayTeamId: "BIH",
    homeGoals: 2, awayGoals: 0,
    homeAttackMultiplier: 0.88,
    homeDefenseMultiplier: 1.38,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 0.72,
    notes: "USA 2-0 10-man heroics. Balogun 45' goal (Tillman assist — Ream intercept → Adams → Tillman → Balogun low left-foot). Balogun red card 64' controversial — wrongly carded per ESPN. Tillman stunning free kick 82'. USA xG 0.92 vs BIH 0.25 (confirmed). Bosnia 5-4-1 low block — USA 63% possession but only 1 SoT first 44 mins. Freese 2 early saves. Clean sheet with 10 men = elite defensive performance. CRITICAL: Balogun suspended vs Belgium in R16. USA attack DOWN without top scorer (3 tournament goals). Bosnia 3-1 vs Qatar was misleading — Qatar bottom tier. Bosnia attacking threat essentially zero vs quality teams.",
  },
  // R32-11: Spain 3-0 Austria (July 2, 2026)
  // Model pick EXACT (3-0 Tier 1 High Confidence). Engine CLI correcto.
  // LECCIÓN: Tier 1 High Confidence + model coincide + cascade underdog colapsado → seguir engine sin override.
  {
    matchId: "R32-11",
    date: "2026-07-02",
    homeTeamId: "ESP", awayTeamId: "AUT",
    homeGoals: 3, awayGoals: 0,
    homeAttackMultiplier: 1.45,
    homeDefenseMultiplier: 1.45,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 0.65,
    notes: "España 3-0 Austria R32. Model pick EXACT (3-0 Tier 1 High Confidence). España xG ajustada ~2.1, dominancia total. Lamine Yamal determinante. Austria λ 0.75 pero no convirtió — defensa española impermeable. Spain attack capped UP: dominancia total confirmada. Spain defense capped UP: clean sheet vs Top 8% ataque. Austria attack floored DOWN: 0 goles, λ ajustada 0.75 pero no convirtió. Austria defense floored DOWN: 3 goles concedidos vs España.",
  },
  // R32-12: Portugal 2-1 Croatia (July 3, 2026)
  {
    matchId: "R32-12",
    date: "2026-07-03",
    homeTeamId: "POR", awayTeamId: "CRO",
    homeGoals: 2, awayGoals: 1,
    homeAttackMultiplier: 1.45,  // POR 2.18 xG / 1.35 = 1.62 → capped
    homeDefenseMultiplier: 0.96, // 1 conceded — Perisic 53'. Defense held late.
    awayAttackMultiplier: 0.99,  // CRO 1.34 xG / 1.35 = 0.99
    awayDefenseMultiplier: 0.65, // 2 goals conceded, 2.18 xG allowed → floored
    notes: "THRILLER. Portugal 2-1 Croatia R32. 0-0 HT despite POR dominating (0.92 xG vs 0.21 HT). Perisic 53' gave Croatia lead from Stanisic cross. Ronaldo pen 68' (VAR) equalized — oldest scorer in WC KO history. Ramos 90+4 header from Leao cross won it. Gvardiol 'goal' disallowed by VAR (Matanovic offside touch) in 100+'. Controversial end. Croatia eliminated — likely Modric's last WC. POR xG 2.18 vs CRO 1.34 — Portugal clearly better team. Ronaldo substituted off 81' — Martinez bravery rewarded. MODEL NOTE: 2-1 was correct pick (model app). 1-1 (our pick) wrong — Rule 11b gap led to incorrect compression.",
  },
  // R32-13: Switzerland 2-0 Algeria (July 3, 2026)
  {
    matchId: "R32-13",
    date: "2026-07-03",
    homeTeamId: "SUI", awayTeamId: "ALG",
    homeGoals: 2, awayGoals: 0,
    homeAttackMultiplier: 1.35,  // SUI scored 2, controlled match
    homeDefenseMultiplier: 1.45, // Clean sheet vs Algeria — capped
    awayAttackMultiplier: 0.65,  // ALG 0 goals, failed to convert — floored
    awayDefenseMultiplier: 0.65, // 2 goals conceded, poor defensive shape — floored
    notes: "Switzerland 2-0 Algeria R32. Embolo 11' (Manzambi assist, counterattack). Ndoye 46' (low shot center box). Switzerland controlled throughout — Algeria struggled to create despite tournament xG of 1.3/game. Manzambi MOTM — 3G+2A in tournament, FIFA Young Player frontrunner. Kobel solid GK, clean sheet. Algeria eliminated — Mahrez contained, Amoura absent (hamstring). SUI xG ~1.8 vs ALG ~0.8 confirmed model app read. MODEL NOTE: Model app correct (2-0 or 1-0). Alpha read misdirected — Alphametrico X thread showed Score 91 for ALG +1 but dashboard (more recent) showed Score 79. Dashboard is authoritative. KEY LESSON: When dashboard and X thread diverge, dashboard wins. Model app λ (SUI 1.8, ALG 0.8) was accurate — Algeria 3-3 AUT was outlier, not form signal.",
  },
  // R32-15: Argentina 3-2 Cape Verde AET (July 3, 2026)
  {
    matchId: "R32-15",
    date: "2026-07-03",
    homeTeamId: "ARG", awayTeamId: "CPV",
    homeGoals: 3, awayGoals: 2,
    homeAttackMultiplier: 1.30,   // scored in all 4 matches, won 3 — consistent quality
    homeDefenseMultiplier: 1.05,  // conceded 2 in AET — acceptable but not elite
    awayAttackMultiplier: 1.15,   // Cape Verde scored 2 in AET — better than expected
    awayDefenseMultiplier: 0.80,  // 3 goals conceded vs Argentina
    notes: "Argentina 3-2 Cape Verde AET — Argentina advance to R16. Tough match: Cape Verde's Vozinha heroics extended into AET. Argentina scored in all 4 tournament matches, won 3. Messi + Lautaro decisive in extra time. Cape Verde showed they can score (2 goals) but defensive limitations exposed across 120 minutes. FORM NOTE: ARG attack steady at ~1.30, defense slightly exposed (1.05) — Cape Verde threat was real. Argentina face Egypt in R16.",
  },

  // R32-16: Colombia 1-0 Ghana (July 3, 2026)
  // AUTO-XG: COL 2.19, GHA 0.26
  {
    matchId: "R32-16",
    date: "2026-07-03",
    homeTeamId: "COL", awayTeamId: "GHA",
    homeGoals: 1, awayGoals: 0,
    homeAttackMultiplier: 1.45,   // 2.19/1.35 = 1.62 → capped — Colombia dominant by xG
    homeDefenseMultiplier: 1.45,  // 1.35/0.26 = 5.19 → capped — Ghana zero shots on target
    awayAttackMultiplier: 0.65,   // 0.26/1.35 = 0.19 → floored — Ghana created nothing
    awayDefenseMultiplier: 0.65,  // 1.35/2.19 = 0.62 → floored — Colombia xG dominance
    notes: "AUTO-XG. Colombia 1-0 Ghana. COL xG 2.19 — dominant possession and chance creation. Ghana xG 0.26 — zero shots on target. Colombia only scored 1 from 2.19 xG (big underperformance of finishing). Key notes: James Rodríguez subbed HT (leggy, fitness concern for R16), Jhon Córdoba injured early (came off 20'). Luis Díaz still key threat — tireless pressing. Colombia advance to R16 vs Switzerland. Ghana eliminated — tournament ended quietly after promising group stage (2 CS, beat Panama).",
  },

  // ==========================================
  // ROUND OF 16 — COMPLETED MATCHES
  // ==========================================

  // R16-1: Canada 0-3 Morocco (July 4, 2026)
  // Real xG: MAR 0.85 / CAN 0.78 — Morocco scored 3 from 0.85 xG (high conversion via counterattacks + set pieces)
  {
    matchId: "R16-1",
    date: "2026-07-04",
    homeTeamId: "CAN", awayTeamId: "MAR",
    homeGoals: 0, awayGoals: 3,
    homeAttackMultiplier: 0.65,   // 0.78/1.35 = 0.58 → floored — Canada created but didn't convert
    homeDefenseMultiplier: 0.65,  // 1.35/0.85 = 1.59 → but 3 goals conceded, extreme overperformance — floored
    awayAttackMultiplier: 0.65,   // 0.85/1.35 = 0.63 → floored — Morocco's 3 goals were conversion outlier, not xG dominance
    awayDefenseMultiplier: 1.45,  // 1.35/0.78 = 1.73 → capped — Morocco defense held Canada to 0 goals
    notes: "Morocco 3-0 Canada. Real xG: MAR 0.85 / CAN 0.78 — essentially even xG, result was a high-conversion outlier for Morocco (3 goals from 0.85 xG via counterattacks and set pieces in final 12 minutes + stoppage time). Under Score 87 was correct about volume; the 3-0 scoreline was driven by conversion not sustained pressure. Morocco attack multiplier floored — xG doesn't support 3-goal attack rating. Morocco defense UP (capped) — held Canada completely scoreless despite even xG. KEY: Tier 2 engine (0-0) was too conservative on direction; model app (0-2 Morocco) was closer. Lambda correction from 0.96 → 2.26 would have changed engine output significantly.",
  },

  // R16-2: Paraguay 0-1 France (July 4, 2026)
  // Real xG: FRA 1.36 / PAR 0.15 — France generated only 1.36 xG despite λ model of 4.0
  {
    matchId: "R16-2",
    date: "2026-07-04",
    homeTeamId: "PAR", awayTeamId: "FRA",
    homeGoals: 0, awayGoals: 1,
    homeAttackMultiplier: 0.65,   // 0.15/1.35 = 0.11 → floored — Paraguay 0 goals, pure defensive block
    homeDefenseMultiplier: 1.00,  // 1.35/1.36 = 0.99 → ~1.00 — Paraguay held France to 1.36 xG (block worked)
    awayAttackMultiplier: 1.00,   // 1.36/1.35 = 1.007 → ~1.00 — France generated only 1.36 xG vs 5-man block
    awayDefenseMultiplier: 0.65,  // 1.35/0.15 = 9.0 → capped then... Paraguay 0 goals → 0.65 floor for consistency
    notes: "France 1-0 Paraguay. Real xG: FRA 1.36 / PAR 0.15. Paraguay played 5-man block, systematic fouling, zero shots on target in first half (only 3rd KO match since 1966 with no first-half SoT). France's λ model of 4.0 was structurally inflated — actual xG was 1.36, not 4.0. Single goal: Mbappe penalty 70' (sub Mbappe entered 61'). CRITICAL LESSON: France awayAttackMultiplier drops from 1.45 to 1.00 — they generated only 1.36 xG against a compact block. This correctly reduces France's projected λ vs Morocco R16-2 (similar defensive setup likely). Rule 20 (λ Cap Override) validated: Under Score 84-85 with λ=4.0 cap → model should compress 0-3 → 0-2 → 0-1 via Tier 2 cascade. Alpha read was correct; model λ was the outlier.",
  },

  // R16-3: Brazil 1-2 Norway (July 5, 2026)
  // xG: BRA 2.73 (penalty-inflated — 2 pens awarded, 1 missed), NOR 0.84 (clean counter-attack xG)
  // Open-play adjusted xG: BRA ~1.30 (subtract ~1.43 for two pen xG at ~0.76 each), NOR 0.84
  // Multipliers: BRA attack 1.30/1.35=0.963→0.96, BRA defense 1.35/0.84=1.607→capped 1.45
  //              NOR attack 0.84/1.35=0.622→floored 0.65, NOR defense 1.35/1.30=1.038→1.04
  {
    matchId: "R16-3",
    date: "2026-07-05",
    homeTeamId: "BRA", awayTeamId: "NOR",
    homeGoals: 1, awayGoals: 2,
    homeAttackMultiplier: 0.96,
    homeDefenseMultiplier: 1.45,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 1.04,
    notes: "Brazil 1-2 Norway. Haaland brace (clinical headers/finishes in 2nd half). Neymar consolation penalty 90+. Nyland saved Bruno Guimarães penalty in 1st half. Brazil xG 2.73 (heavily penalty-inflated — 2 penalties awarded, 1 missed); open-play adjusted xG ~1.30. Norway xG 0.84 (clean counter-attack quality). Model picked 2-0 BRA (Tier 2 compression), actual 1-2 NOR — major upset. Rule 11b post-compression guard now blocks clean sheet vs NOR (scored in every match). Brazil ELIMINATED.",
  },

  // R16-4: Mexico 2-3 England (July 6, 2026, Estadio Azteca)
  // xG: MEX 1.94, ENG 1.55 (both penalty-inflated)
  // Open-play adjusted: MEX ~1.4, ENG ~0.8
  // Multipliers: MEX attack 1.4/1.35=1.037→1.04, MEX defense 1.35/0.8=1.687→capped 1.45
  //              ENG attack 0.8/1.35=0.593→floored 0.65, ENG defense 1.35/1.4=0.964→0.96
  {
    matchId: "R16-4",
    date: "2026-07-06",
    homeTeamId: "MEX",
    awayTeamId: "ENG",
    homeGoals: 2,
    awayGoals: 3,
    homeAttackMultiplier: 1.04,
    homeDefenseMultiplier: 1.45,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 0.96,
    notes: "Mexico 2-3 England. Bellingham brace (36', 38'), Quiñones volley (42'), Kane pen (60'), Jiménez pen (69'). England 10 men from 54' (Quansah red, VAR). MEX xG 1.94 (pen-inflated, open-play ~1.4). ENG xG 1.55 (Bellingham goals were individual quality, open-play ~0.8). Mexico perfect group record ended. England advance to QF vs Norway (Jul 11, Miami). Pickford 17 saves (WC record). 33% possession, 49 clearances for England.",
  },

  // R16-5: Portugal 0-1 Spain (July 6, 2026, AT&T Stadium, Arlington)
  {
    matchId: "R16-5",
    date: "2026-07-06",
    homeTeamId: "POR",
    awayTeamId: "ESP",
    homeGoals: 0,
    awayGoals: 1,
    homeAttackMultiplier: 0.65,
    homeDefenseMultiplier: 1.31,
    awayAttackMultiplier: 1.31,
    awayDefenseMultiplier: 0.65,
    notes: "Portugal 0-1 Spain R16. Merino 90+1' sub winner (Torres assist). POR xG 0.60 — 0 shots on target 2nd half. Ronaldo's likely final WC match. ESP xG 1.77 — controlled throughout, Oyarzabal missed early (8'). Spain: 6 consecutive WC clean sheets, 10h+ without conceding — historically elite defense. POR attack floored: 0.44 raw, worst attacking output this tournament. ESP defense floored: allowed only 0.60 xG. Portugal ELIMINATED. Spain advance QF vs USA/BEL. ALPHA LESSON: Alphametrico implied xG (1.09 vs 1.26) was far more accurate than model λ (1.94 vs 2.72). Lambda divergence >50% between systems flags compression ceiling revision — proposed Rule 23.",
  },
  // R16-6: USA 1-4 Belgium (July 6, 2026, Lumen Field, Seattle)
  {
    matchId: "R16-6",
    date: "2026-07-06",
    homeTeamId: "USA",
    awayTeamId: "BEL",
    homeGoals: 1,
    awayGoals: 4,
    homeAttackMultiplier: 0.65,
    homeDefenseMultiplier: 1.45,
    awayAttackMultiplier: 1.45,
    awayDefenseMultiplier: 0.65,
    notes: "USA 1-4 Belgium R16. De Ketelaere 8' (Lukébakio diagonal → Trossard cross), Tillman 31' free kick deflected (USA), De Ketelaere 33' brace (far-post header off Trossard, 61 seconds after equalizer), Vanaken 57' (Freese goalkeeper error — giveaway outside penalty area), Lukaku 90+3' (Vanaken press). xG USA 0.67 (7 shots) / BEL 2.15 (15 shots). Belgium played without Doku and De Bruyne (bench). De Ketelaere: first Belgian ever with 2G+1A in single WC match. Trossard: 0G+2A. Pulisic injured 52' (right foot, contact Tielemans). Balogun played but 0 goals (Courtois 1v1 save). Freese error directly caused 3rd goal — USA defensive fragility exposed throughout. USA eliminated. Belgium advance QF vs Spain. MODEL LESSON: BEL formOverride was stale (score 25, written after Iran 0-0, never updated after SEN 3-2 AET). Correct value should have been ~70. Stale override suppressed BEL λ. Cumulative Belgium-wins matrix probability (~37%) exceeded draw cluster (~22%) — should have shifted pick to 1-2 BEL rather than anchoring on modal draw cell.",
  },

  // ==========================================
  // ROUND OF 16 — COMPLETED MATCHES
  // ==========================================

  // R16-7: Argentina 3-2 Egypt (July 7, Atlanta)
  // xG: ARG 2.76 / EGY 0.97
  {
    matchId: "R16-7",
    date: "2026-07-07",
    homeTeamId: "ARG", awayTeamId: "EGY",
    homeGoals: 3, awayGoals: 2,
    homeAttackMultiplier: 1.45,   // 2.76/1.35 = 2.04 → capped. 3 goles reales. Messi 8vo gol torneo (21 WC total). Fernández 90+2' 3000th WC goal
    homeDefenseMultiplier: 0.78,  // Concedieron 2 con EGY xG 0.97 — segundo partido consecutivo cediendo 2 goles. Defensa expuesta sistemáticamente
    awayAttackMultiplier: 0.72,   // 0.97/1.35 = 0.72. EGY anotó 2 con solo 0.97 xG — alta eficiencia. Ibrahim (15') + Zico (67')
    awayDefenseMultiplier: 0.65,  // 1.35/2.76 = 0.49 → floored. Shobeir heroico (2 penaltis atajados) pero concedieron 3
    notes: "REMONTADA HISTÓRICA. Argentina 3-2 Egypt. Más tardía remontada de 2 goles en WC sin tiempo extra (79'). Ibrahim header 15' → 0-1. Messi penalti atajado por Shobeir (heroico: ata 2/4 penaltis del torneo). Zico 67' → 0-2. Romero 79' (asistencia Messi) → 1-2. Messi 83' → 2-2. Fernández 90+2' → 3-2 (3000° gol en historia del WC). ARG xG 2.76 (19 tiros, 7 on target), EGY xG 0.97 (5 tiros). Argentina 64% posesión. PICK: 2-0 ARG → WRONG (direction OK, EGY anotó 2). LECCIÓN: Patrón ARG 3-X confirmado (3° partido con 3 goles en 5 jugados: 3-0 ALG, 3-0 JOR, 3-2 CPV, 3-2 EGY). Rule 20 comprimió agresivamente el total a ≤2 pero ARG sobreperforma λ sistemáticamente cuando Messi juega vs rival con resistencia. EGY también sobreperformó su xG (0.97 → 2 goles). Argentina defense DOWN marcadamente — 2 goles concedidos por 2do partido seguido, solo 5 tiros de Egypt. Shobeir fue la figura defensiva — no la defensa argentina. Argentina QF vs Switzerland (Kansas City, July 11/12).",
  },

  // R16-8: Switzerland 0-0 Colombia AET (SUI 4-3 PKs) — July 7, Vancouver BC Place
  // xG 90': SUI 0.29 / COL 0.42. xG total (120'): SUI ~0.35 / COL ~1.03
  {
    matchId: "R16-8",
    date: "2026-07-07",
    homeTeamId: "SUI", awayTeamId: "COL",
    homeGoals: 0, awayGoals: 0,
    homeAttackMultiplier: 0.65,   // 0.29/1.35 = 0.21 → floored. Manzambi ausente. Peor salida ofensiva del torneo en 90'
    homeDefenseMultiplier: 1.45,  // 1.35/0.42 = 3.21 → capped. Kobel heroico de nuevo. Colombia no pudo con la organización suiza
    awayAttackMultiplier: 0.65,   // 0.42/1.35 = 0.31 → floored. COL tuvo más xG que SUI pero Lucumí travesaño, Campaz falló chance clara ET 115'. Sin goles en 120'
    awayDefenseMultiplier: 1.45,  // 1.35/0.29 = 4.66 → capped. Colombia defensiva ejemplar. Solo 0.29 xG concedido en 90'
    notes: "Switzerland 0-0 Colombia (SUI 4-3 PKs). xG más bajo en tiempo normal de cualquier partido del torneo (0.71 combinado en 90'). Kobel salvó a Cucho Hernández en penales. Vargas R. anotó el penal definitivo. COL tuvo el mejor xG total (1.03 vs 0.35 en 120') — más peligrosos en ET. Lucumí dio en travesaño. Campaz falló la mejor ocasión del partido (115'). Manzambi no jugó. Penales SUI: Xhaka (in), Amdouni (in), Itten (in), Akanji (out), Vargas R. (in). Penales COL: Quintero (in), D.Sánchez (travesaño), Campaz (in), Hernández Cucho (atajado). PICK: 1-2 COL → WRONG (0-0 AET, SUI eliminó COL en penales). LECCIÓN: Partido del 3er xG más bajo en historia WC en tiempo normal. Alpha Over 2 Score 81 tenía razón en que los equipos generarían pero el 0.71 total xG desmiente eso — hubo bloqueo táctico mutuo total. Colombia 3ra eliminación consecutiva en prórroga/penales en WC (2018 vs ENG PKs, 2026). SUI advance to QF vs Argentina (Kansas City, July 11/12).",
  },

  // ==========================================
  // QUARTER-FINALS
  // ==========================================

  {
    matchId: "QF-1",
    date: "2026-07-09",
    homeTeamId: "FRA", awayTeamId: "MAR",
    homeGoals: 2, awayGoals: 0,
    homeAttackMultiplier: 1.45,
    homeDefenseMultiplier: 1.45,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 0.65,
    notes: "France dominant 3.04 vs 0.14 xG. Mbappe missed pen first half, " +
           "scored 60min, assisted Dembele 66min. Morocco 34-match unbeaten " +
           "run ended. Saibari absence + France tactical superiority = " +
           "historic low xG for MAR. France shots 22-5, on target 8-1.",
  },
  {
    matchId: "QF-2",
    date: "2026-07-10",
    homeTeamId: "ESP", awayTeamId: "BEL",
    homeGoals: 2, awayGoals: 1,
    homeAttackMultiplier: 1.45,
    homeDefenseMultiplier: 1.45,
    awayAttackMultiplier: 0.65,
    awayDefenseMultiplier: 0.65,
    notes: "Spain 2.08 xG vs Belgium 0.38 xG despite the close 2-1 scoreline " +
           "— both Spanish goals came from second-chance rebounds (Fabian Ruiz " +
           "30', Merino 88' off a Cubarsi shot Lammens spilled). First goal " +
           "conceded all tournament (De Ketelaere equalizer), ending a 5-match " +
           "clean sheet streak, but underlying dominance intact: 16 shots to 5. " +
           "Courtois off injured 73', Lammens in. Belgium played without " +
           "captain Tielemans (warmup injury). SF vs FRA (Dallas, Jul 14).",
  },
  {
    matchId: "QF-3",
    date: "2026-07-11",
    homeTeamId: "NOR", awayTeamId: "ENG",
    homeGoals: 1, awayGoals: 2,
    homeAttackMultiplier: 0.85,
    homeDefenseMultiplier: 0.85,
    awayAttackMultiplier: 1.30,
    awayDefenseMultiplier: 1.10,
    notes: "Norway 1-2 England (AET). Schjelderup opened the scoring ~24' — " +
           "Erling Haaland did NOT score, ending his run of scoring in 14 " +
           "consecutive Norway matches. Bellingham equalized just before " +
           "halftime (1-1 regulation), scoreless second half, then Bellingham's " +
           "extra-time strike won it (brace on the day). England advance to " +
           "face Argentina in the semifinal (SF-2, Mercedes-Benz Stadium, " +
           "Atlanta, Jul 15) after needing extra time despite conceding first.",
  },
  {
    matchId: "QF-4",
    date: "2026-07-11",
    homeTeamId: "ARG", awayTeamId: "SUI",
    homeGoals: 3, awayGoals: 1,
    homeAttackMultiplier: 1.30,
    homeDefenseMultiplier: 0.90,
    awayAttackMultiplier: 0.85,
    awayDefenseMultiplier: 0.85,
    notes: "Argentina 3-1 Switzerland (AET). Mac Allister opened 10' (Messi " +
           "corner assist, Messi himself scoreless). Dan Ndoye equalized 1-1 " +
           "for Switzerland 67' — even after Breel Embolo's 72' red card " +
           "(second yellow, VAR-reviewed) left them a man down for the final " +
           "~48 minutes including all of extra time. Julian Alvarez (112') and " +
           "Lautaro Martinez (120+1') won it in extra time. Argentina conceded " +
           "to a 10-man opponent in regulation — do not inflate their defensive " +
           "rating off the 3-1 scoreline. Switzerland showed real resilience " +
           "(scored down a man against a heavy favorite, same pattern as their " +
           "R16 0-0 AET / 4-3 PK win over Colombia) — eliminated, but this " +
           "pattern motivated Rule 31 (Underdog Resilience Floor) in the pick " +
           "judge engine. Argentina advance to face England in the semifinal " +
           "(SF-2, Mercedes-Benz Stadium, Atlanta, Jul 15).",
  },

  // ==========================================
  // SEMI-FINALS
  // ==========================================

  // July 14
  {
    matchId: "SF-1",
    date: "2026-07-14",
    homeTeamId: "FRA", awayTeamId: "ESP",
    homeGoals: 0, awayGoals: 2,
    // Spain totally suppressed France's attack — 10 shots, only 3 on target,
    // Mbappe recorded ZERO shots on target (only 2nd time in his last 15 WC
    // appearances). Oyarzabal converted a Yamal-won penalty (Digne foul) 22',
    // Porro added a second 58' via a Olmo give-and-go. Spain never trailed
    // in any match this tournament. France's 0.3 xG is their lowest output
    // of the World Cup by a wide margin.
    // Form multipliers (formula: attack = ownXG/1.35, defense = 1.35/oppXG,
    // both floored 0.65 / capped 1.45):
    // FRA attack: 0.3/1.35 = 0.222 -> floored 0.65
    // FRA defense: 1.35/1.63 = 0.828 -> 0.83 (no clamp)
    // ESP attack: 1.63/1.35 = 1.207 -> 1.21 (no clamp)
    // ESP defense: 1.35/0.3 = 4.5 -> capped 1.45
    homeAttackMultiplier: 0.65,
    homeDefenseMultiplier: 0.83,
    awayAttackMultiplier: 1.21,
    awayDefenseMultiplier: 1.45,
    notes: "Spain totally suppressed France 0.3 xG (10 shots, 3 on target, " +
           "Mbappe 0 SOT). Oyarzabal pen 22 (Digne foul on Yamal), Porro 58 " +
           "(Olmo assist). Spain 8th straight knockout win at a major " +
           "tournament (record), never trailed all tournament. FRA eliminated.",
  },

  // July 15
  {
    matchId: "SF-2",
    date: "2026-07-15",
    homeTeamId: "ENG", awayTeamId: "ARG",
    homeGoals: 1, awayGoals: 2,
    // Extremely cagey first half — combined 0.08 xG, second-lowest in a WC
    // first half in 60 years. Gordon opened the scoring 55' (Rogers assist).
    // Fernández equalized 85' (Messi assist — his 11th straight WC game with
    // a goal or assist, longest streak on record). Lautaro Martínez scored
    // the stoppage-time winner (also Messi assist). Argentina's attacking
    // output surged post-73': 5 shots/0.18 xG before Gordon's goal vs 10
    // shots/1.48 xG after. Resolved in 90+ minutes, no AET.
    // Form multipliers (formula: attack = ownXG/1.35, defense = 1.35/oppXG,
    // both floored 0.65 / capped 1.45):
    // ENG attack: 0.53/1.35 = 0.393 -> floored 0.65
    // ENG defense: 1.35/1.84 = 0.734 -> 0.73 (no clamp)
    // ARG attack: 1.84/1.35 = 1.363 -> 1.36 (no clamp)
    // ARG defense: 1.35/0.53 = 2.547 -> capped 1.45
    homeAttackMultiplier: 0.65,
    homeDefenseMultiplier: 0.73,
    awayAttackMultiplier: 1.36,
    awayDefenseMultiplier: 1.45,
    notes: "Argentina came from behind after Gordon's 55' opener (Rogers " +
           "assist). Fernández equalized 85' (Messi assist, his 11th " +
           "straight WC game with a goal or assist — longest streak on " +
           "record). Lautaro Martínez scored the winner in stoppage time " +
           "(also Messi assist). Extremely cagey first half — combined " +
           "0.08 xG, second-lowest in a WC first half in 60 years. " +
           "Argentina's attacking output surged post-73': 5 shots/0.18xG " +
           "before Gordon's goal vs 10 shots/1.48xG after. No AET — " +
           "resolved in 90+ minutes. Argentina advance to the Final vs Spain.",
  },

  // ==========================================
  // THIRD PLACE
  // ==========================================

  // July 18
  {
    matchId: "3P-1",
    date: "2026-07-18",
    homeTeamId: "FRA", awayTeamId: "ENG",
    homeGoals: 4, awayGoals: 6,
    // Most goals in a World Cup match since 1982 (Hungary 10-1 El Salvador,
    // per Opta) and the most-ever in a third-place playoff. England raced to
    // a 4-0 half-time lead: Rice (3', also assisted Konsa's header), Konsa
    // (18'), Saka brace before the break. France stormed back in the second
    // half through Mbappe (48', and again later — his second goal made him
    // the outright all-time FIFA World Cup top scorer with 22, overtaking
    // Messi) and Barcola (assisted by Mbappe). Saka completed his hat-trick
    // from the penalty spot (87') to push England back ahead by two, before
    // Dembele (90+5', assisted by Upamecano) pulled France within one.
    // Bellingham's solo strike (90+7') sealed the 6-4 win and England's
    // third-place finish — their best World Cup result since 1966.
    // Form multipliers (formula: attack = ownXG/1.35, defense = 1.35/oppXG,
    // both floored 0.65 / capped 1.45):
    // FRA attack: 2.92/1.35 = 2.163 -> capped 1.45
    // FRA defense: 1.35/3.21 = 0.421 -> floored 0.65
    // ENG attack: 3.21/1.35 = 2.378 -> capped 1.45
    // ENG defense: 1.35/2.92 = 0.462 -> floored 0.65
    homeAttackMultiplier: 1.45,
    homeDefenseMultiplier: 0.65,
    awayAttackMultiplier: 1.45,
    awayDefenseMultiplier: 0.65,
    notes: "3P-1: England 6-4 France (AET not needed, decided in regulation). " +
           "Both teams eliminated in SF; final placement match. Combined 10 " +
           "goals — most in a WC game since 1982, most ever in a 3rd-place " +
           "playoff (Opta). Last match of the tournament for both sides — " +
           "no forward-looking impact on predictions.",
  },

  // ==========================================
  // FINAL
  // ==========================================

  // July 19
  {
    matchId: "F-1",
    date: "2026-07-19",
    homeTeamId: "ESP", awayTeamId: "ARG",
    homeGoals: 1, awayGoals: 0,
    // Neutral placeholder multipliers — last match of the tournament,
    // no forward-looking impact on predictions.
    homeAttackMultiplier: 1.0,
    homeDefenseMultiplier: 1.0,
    awayAttackMultiplier: 1.0,
    awayDefenseMultiplier: 1.0,
    notes: "F-1: Spain 1-0 Argentina. Spain are 2026 World Cup champions, " +
           "Argentina finish runners-up. Final match of the tournament — " +
           "no forward-looking impact on predictions.",
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

  const result = {
    attackMultiplier: Math.max(0.50, Math.min(1.50, attackMult)),
    defenseMultiplier: Math.max(0.50, Math.min(1.50, defenseMult)),
  };

  // Diagnostic: log form multipliers for R32 teams to verify pipeline
  if (teamId === "RSA" || teamId === "CAN") {
    console.log(
      `[FormPipeline] ${teamId}: attack=${result.attackMultiplier.toFixed(3)}, defense=${result.defenseMultiplier.toFixed(3)} (from ${attackMults.length} matches, raw attack=${attackMults.map(v => v.toFixed(2)).join(",")}, raw defense=${defenseMults.map(v => v.toFixed(2)).join(",")})`
    );
  }

  return result;
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
