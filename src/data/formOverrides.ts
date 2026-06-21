// ============================================================
// Manual Form Score Overrides
// ============================================================
// For teams whose auto-calculated form score doesn't capture
// the full qualitative picture from the tournament.

export const formOverrides: Record<string, { score: number; note: string }> = {
  "BRA": { score: 58, note: "3-0 vs Haiti after 1-1 Morocco draw. Cunha excellent starter. Raphinha injury concern (hamstring, 40'). 1.56+1.23=2.79 xG across 2 — functional not dominant. Ancelotti finding shape." },
  "POR": { score: 38, note: "Ronaldo invisible vs DR Congo, 0.79 xG, sterile possession, Ronaldo fitness concern" },
  "ESP": { score: 42, note: "0-0 vs Cape Verde despite 2.29 xG — clinical failure, Yamal not fit, autoScore inflated" },
  "CAN": { score: 62, note: "6-0 but vs 9-men Qatar. David is elite. Koné injury concern. Real test vs SUI MD3" },
  "QAT": { score: 5, note: "2 red cards, worst attacking stats in group, eliminated effectively" },
  "BIH": { score: 12, note: "Red card vs SUI, 0.32 xG with 11 men, extremely poor. Eliminated effectively" },
  "URU": { score: 38, note: "Uninspired vs Saudi Arabia, Bielsa's system not clicking offensively" },
  "NZL": { score: 22, note: "2-0 up vs Iran and still drew — defensive collapse. OFC weakness exposed" },
  "PAR": { score: 28, note: "1pt from lucky counter vs Turkey. 0.32 xG that match, 0.47 MD1. Genuine bottom-tier attack. Survival mode only." },
  "TUR": { score: 55, note: "0pts but 3.50 xG across 2 matches — historically unlucky. Arda Güler creating. Attack real, finishing broken. Eliminated but xG says top-half team." },
  "AUS": { score: 40, note: "3pts but 0.77+0.35=1.12 xG across 2 matches. Patrick Beach heroics and finishing luck. Real attacking output is poor. Overrated by scoreline." },
  "NED": { score: 78, note: "Statement 5-1 vs Sweden. 2.47 xG dominant. Brobbey-Gakpo clinical. Some 5-goal overperformance but real quality shown. Top Group F." },
  "SWE": { score: 32, note: "Conceded 2.47 xG vs NED, defense exposed. Gyökeres needs more service. Must beat Tunisia MD3 to survive." },
  "MAR": { score: 68, note: "Consistent across 2 matches: 1.53 xG vs BRA, 0.99 vs SCO. Saibari clinical. Defense excellent (held both BRA and SCO). 4pts, Group C leaders. Genuine dark horse." },
  "SCO": { score: 18, note: "0.51 xG vs Morocco, 1.05 vs Haiti. Near-zero attack output. Clarke's system too passive. Eliminated effectively after 2 matches." },
  "HAI": { score: 8, note: "0.23 xG vs Brazil, eliminated. Showed spirit vs Scotland (1.21 xG) but quality gap too large at this level." },
};
