// ============================================================
// Manual Form Score Overrides
// ============================================================
// For teams whose auto-calculated form score doesn't capture
// the full qualitative picture from the tournament.

export const formOverrides: Record<string, { score: number; note: string }> = {
  "BRA": { score: 58, note: "3-0 vs Haiti after 1-1 Morocco draw. Cunha excellent starter. Raphinha injury concern (hamstring, 40'). 1.56+1.23=2.79 xG across 2 — functional not dominant. Ancelotti finding shape." },
  "POR": { score: 38, note: "Ronaldo invisible vs DR Congo, 0.79 xG, sterile possession, Ronaldo fitness concern" },
  "ESP": { score: 95, note: "MD2: 4-0 KSA. Lamine Yamal first start — instant impact (goal). Oyarzabal brace. 2.85 xG. Magnitude underestimation by models confirmed (alphametrico said 2-goal margin, actual was 4-0). Both withdrawn at HT. Full attack + defense confidence restored after Cape Verde shock." },
  "KSA": { score: 12, note: "MD2: 0-4 ESP. 0.04 xG — barely existed. Al-Owais conceded 3 (1 OG). Effectively eliminated from Group H. Cannot score vs quality opposition." },
  "BEL": { score: 25, note: "MD2: 0-0 IRN (10 men from 66'). 53 consecutive WC shots without open-play goal. Doku absent (illness). Lukaku off-form. Ngoy red card. 1.82 xG 0 goals — profound clinical failure. Attack deeply concerning going into Belgium-NZL MD3 (must win)." },
  "IRN": { score: 72, note: "MD2: 0-0 BEL (with Belgian red card). Beiranvand 7 saves again. Taremi had goal ruled out (offside). Iran have outperformed xG expectations twice now — Ghalenoei's defensive setup is world-class at this tournament. MD3 vs Egypt is group decider." },
  "CAN": { score: 62, note: "6-0 but vs 9-men Qatar. David is elite. Koné injury concern. Real test vs SUI MD3" },
  "QAT": { score: 5, note: "2 red cards, worst attacking stats in group, eliminated effectively" },
  "BIH": { score: 12, note: "Red card vs SUI, 0.32 xG with 11 men, extremely poor. Eliminated effectively" },
  "URU": { score: 22, note: "MD2: 2-2 CPV. 2.34 xG, 17 shots, only 2 on target. Olivera horror pass gifted equalizer. Bielsa's biggest WC disappointment. Missing Gimenez, R.Araujo, De Arrascaeta — structural not just tactical. Need result vs ESP MD3 (almost impossible). Attack potential still there but conversion rate catastrophic." },
  "NZL": { score: 10, note: "MD2: 1-3 EGY. Scored first (Surman 15') but couldn't hold — conceded 3. 0 wins in 8 WC all-time games. Defense consistently soft in 2nd half. MD3 vs BEL — must win, very hard." },
  "PAR": { score: 28, note: "1pt from lucky counter vs Turkey. 0.32 xG that match, 0.47 MD1. Genuine bottom-tier attack. Survival mode only." },
  "TUR": { score: 55, note: "0pts but 3.50 xG across 2 matches — historically unlucky. Arda Güler creating. Attack real, finishing broken. Eliminated but xG says top-half team." },
  "AUS": { score: 40, note: "3pts but 0.77+0.35=1.12 xG across 2 matches. Patrick Beach heroics and finishing luck. Real attacking output is poor. Overrated by scoreline." },
  "NED": { score: 78, note: "Statement 5-1 vs Sweden. 2.47 xG dominant. Brobbey-Gakpo clinical. Some 5-goal overperformance but real quality shown. Top Group F." },
  "SWE": { score: 32, note: "Conceded 2.47 xG vs NED, defense exposed. Gyökeres needs more service. Must beat Tunisia MD3 to survive." },
  "MAR": { score: 68, note: "Consistent across 2 matches: 1.53 xG vs BRA, 0.99 vs SCO. Saibari clinical. Defense excellent (held both BRA and SCO). 4pts, Group C leaders. Genuine dark horse." },
  "SCO": { score: 18, note: "0.51 xG vs Morocco, 1.05 vs Haiti. Near-zero attack output. Clarke's system too passive. Eliminated effectively after 2 matches." },
  "HAI": { score: 8, note: "0.23 xG vs Brazil, eliminated. Showed spirit vs Scotland (1.21 xG) but quality gap too large at this level." },
  "GER": { score: 72, note: "9 goals in 2 games, elite sub bench (Undav 5 contributions). xG: 4.22 + 1.83. Showed character vs CIV — came back from 0-1 deficit. Best squad depth in tournament." },
  "CIV": { score: 45, note: "Beat Ecuador (MD1), lost 1-2 to Germany (MD2). Kessie goal showed clinical edge. BUT conceded to late sub — defensive fragility under pressure. Amad Diallo/Diomande dangerous on counter. Need MD3 result vs ECU." },
  "ECU": { score: 28, note: "CLINICAL CRISIS. 3.05 xG vs Curaçao, 0 goals. 0 goals from 2 matches despite generating chances (also lost 0-1 to CIV). Must beat Germany to advance — nearly impossible after this form. Attack multipliers at ceiling but conversion rate tournament-worst." },
  "CUW": { score: 18, note: "0-4 vs Germany (MD1), 0-0 vs Ecuador (MD2). Room GK heroics stole WC point — 15 saves, not systemic defense. Attack: scored 1 historic goal (0.41 xG vs GER). Effectively eliminated. Slight upward revision from worst-tier due to MD2 survival." },
  "JPN": { score: 68, note: "2-2 NED (MD1), 4-0 TUN (MD2). Tournament-best defensive xG conceded in MD2 (0.05). Kamada/Ueda clinical. 4-match WC unbeaten streak. Strongest Asian team in tournament. Contending for Group F top spot vs NED MD3." },
  "TUN": { score: 2, note: "Eliminated. 0.33 xG across 2 games — worst in tournament. Fired manager after MD1, 0-4 vs Japan MD2. 0.05 xG vs Japan is tournament absolute floor. 9 goals conceded in 2 matches. No attacking threat whatsoever." },
  "CPV": { score: 80, note: "MD2: 2-2 URU. Kevin Pina historic free kick (32m, first WC goal for CPV). Helio Varela sub equalizer. Vozinha (40yo) another heroic display — WC GK of the tournament so far. 2pts from Spain and Uruguay. Confirmed: NOT lucky draws, genuine tactical excellence. MD3 vs KSA — can make R32." },
  "EGY": { score: 75, note: "MD2: 3-1 NZL (came from behind). 1.96 xG. Zico, Salah, Trezeguet. First ever WC win. Salah in #10 devastating. Shobeir consistent. Ashour direct runner. MD3 vs IRN is group decider — Egypt likely tops Group G if they get a draw or win." },
};
