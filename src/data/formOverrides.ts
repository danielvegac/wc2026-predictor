// ============================================================
// Manual Form Score Overrides
// ============================================================
// For teams whose auto-calculated form score doesn't capture
// the full qualitative picture from the tournament.

export const formOverrides: Record<string, { score: number; note: string }> = {
  "BRA": { score: 32, note: "Structurally disorganized vs Morocco, Ancelotti concerned, Neymar absence glaring" },
  "POR": { score: 38, note: "Ronaldo invisible vs DR Congo, 0.79 xG, sterile possession, Ronaldo fitness concern" },
  "ESP": { score: 42, note: "0-0 vs Cape Verde despite 2.29 xG — clinical failure, Yamal not fit, autoScore inflated" },
  "CAN": { score: 62, note: "6-0 but vs 9-men Qatar. David is elite. Koné injury concern. Real test vs SUI MD3" },
  "QAT": { score: 5, note: "2 red cards, worst attacking stats in group, eliminated effectively" },
  "BIH": { score: 12, note: "Red card vs SUI, 0.32 xG with 11 men, extremely poor. Eliminated effectively" },
  "URU": { score: 38, note: "Uninspired vs Saudi Arabia, Bielsa's system not clicking offensively" },
  "NZL": { score: 22, note: "2-0 up vs Iran and still drew — defensive collapse. OFC weakness exposed" },
  "PAR": { score: 8, note: "Completely outclassed 4-1 by USA. Worst performance of tournament" },
};
