// ============================================================
// FIFA World Cup 2026 — Group Stage Schedule
// ============================================================
// All 72 group stage matches with actual dates, pairings, and
// kickoff times in COT (Colombia Time, UTC-5).
// Source: ESPN / FIFA official schedule. ET → COT = ET minus 1 hour.

import type { Match } from "../types";

export const groupStageSchedule: Match[] = [
  // === GROUP A (MEX, KOR, RSA, CZE) ===
  { id: "GS-A-1", stage: "group", group: "A", homeTeamId: "MEX", awayTeamId: "RSA", matchday: 1, date: "2026-06-11", venue: "Estadio Banorte, Mexico City", kickoffCOT: "2:00 PM" },
  { id: "GS-A-2", stage: "group", group: "A", homeTeamId: "KOR", awayTeamId: "CZE", matchday: 1, date: "2026-06-11", venue: "Estadio Akron, Guadalajara", kickoffCOT: "9:00 PM" },
  { id: "GS-A-3", stage: "group", group: "A", homeTeamId: "MEX", awayTeamId: "KOR", matchday: 2, date: "2026-06-18", venue: "", kickoffCOT: "8:00 PM" },
  { id: "GS-A-4", stage: "group", group: "A", homeTeamId: "CZE", awayTeamId: "RSA", matchday: 2, date: "2026-06-18", venue: "Mercedes-Benz Stadium, Atlanta", kickoffCOT: "11:00 AM" },
  { id: "GS-A-5", stage: "group", group: "A", homeTeamId: "CZE", awayTeamId: "MEX", matchday: 3, date: "2026-06-24", venue: "", kickoffCOT: "8:00 PM" },
  { id: "GS-A-6", stage: "group", group: "A", homeTeamId: "KOR", awayTeamId: "RSA", matchday: 3, date: "2026-06-24", venue: "", kickoffCOT: "8:00 PM" },

  // === GROUP B (CAN, QAT, BIH, SUI) ===
  { id: "GS-B-1", stage: "group", group: "B", homeTeamId: "CAN", awayTeamId: "BIH", matchday: 1, date: "2026-06-12", venue: "BC Place, Vancouver", kickoffCOT: "2:00 PM" },
  { id: "GS-B-2", stage: "group", group: "B", homeTeamId: "QAT", awayTeamId: "SUI", matchday: 1, date: "2026-06-13", venue: "", kickoffCOT: "2:00 PM" },
  { id: "GS-B-3", stage: "group", group: "B", homeTeamId: "CAN", awayTeamId: "QAT", matchday: 2, date: "2026-06-18", venue: "BC Place, Vancouver", kickoffCOT: "5:00 PM" },
  { id: "GS-B-4", stage: "group", group: "B", homeTeamId: "SUI", awayTeamId: "BIH", matchday: 2, date: "2026-06-18", venue: "SoFi Stadium, Inglewood", kickoffCOT: "2:00 PM" },
  { id: "GS-B-5", stage: "group", group: "B", homeTeamId: "SUI", awayTeamId: "CAN", matchday: 3, date: "2026-06-24", venue: "", kickoffCOT: "2:00 PM" },
  { id: "GS-B-6", stage: "group", group: "B", homeTeamId: "BIH", awayTeamId: "QAT", matchday: 3, date: "2026-06-24", venue: "", kickoffCOT: "2:00 PM" },

  // === GROUP C (BRA, MAR, HAI, SCO) ===
  { id: "GS-C-1", stage: "group", group: "C", homeTeamId: "BRA", awayTeamId: "MAR", matchday: 1, date: "2026-06-13", venue: "", kickoffCOT: "5:00 PM" },
  { id: "GS-C-2", stage: "group", group: "C", homeTeamId: "HAI", awayTeamId: "SCO", matchday: 1, date: "2026-06-13", venue: "", kickoffCOT: "8:00 PM" },
  { id: "GS-C-3", stage: "group", group: "C", homeTeamId: "SCO", awayTeamId: "MAR", matchday: 2, date: "2026-06-19", venue: "", kickoffCOT: "5:00 PM" },
  { id: "GS-C-4", stage: "group", group: "C", homeTeamId: "BRA", awayTeamId: "HAI", matchday: 2, date: "2026-06-19", venue: "", kickoffCOT: "7:30 PM" },
  { id: "GS-C-5", stage: "group", group: "C", homeTeamId: "SCO", awayTeamId: "BRA", matchday: 3, date: "2026-06-24", venue: "", kickoffCOT: "5:00 PM" },
  { id: "GS-C-6", stage: "group", group: "C", homeTeamId: "MAR", awayTeamId: "HAI", matchday: 3, date: "2026-06-24", venue: "", kickoffCOT: "5:00 PM" },

  // === GROUP D (USA, AUS, PAR, TUR) ===
  { id: "GS-D-1", stage: "group", group: "D", homeTeamId: "USA", awayTeamId: "PAR", matchday: 1, date: "2026-06-12", venue: "", kickoffCOT: "8:00 PM" },
  { id: "GS-D-2", stage: "group", group: "D", homeTeamId: "AUS", awayTeamId: "TUR", matchday: 1, date: "2026-06-14", venue: "BC Place, Vancouver", kickoffCOT: "11:00 AM" },
  { id: "GS-D-3", stage: "group", group: "D", homeTeamId: "USA", awayTeamId: "AUS", matchday: 2, date: "2026-06-19", venue: "", kickoffCOT: "2:00 PM" },
  { id: "GS-D-4", stage: "group", group: "D", homeTeamId: "TUR", awayTeamId: "PAR", matchday: 2, date: "2026-06-19", venue: "", kickoffCOT: "10:00 PM" },
  { id: "GS-D-5", stage: "group", group: "D", homeTeamId: "TUR", awayTeamId: "USA", matchday: 3, date: "2026-06-25", venue: "", kickoffCOT: "9:00 PM" },
  { id: "GS-D-6", stage: "group", group: "D", homeTeamId: "PAR", awayTeamId: "AUS", matchday: 3, date: "2026-06-25", venue: "", kickoffCOT: "9:00 PM" },

  // === GROUP E (GER, CIV, ECU, CUW) ===
  { id: "GS-E-1", stage: "group", group: "E", homeTeamId: "GER", awayTeamId: "CUW", matchday: 1, date: "2026-06-14", venue: "NRG Stadium, Houston", kickoffCOT: "12:00 PM" },
  { id: "GS-E-2", stage: "group", group: "E", homeTeamId: "CIV", awayTeamId: "ECU", matchday: 1, date: "2026-06-14", venue: "Lincoln Financial Field, Philadelphia", kickoffCOT: "6:00 PM" },
  { id: "GS-E-3", stage: "group", group: "E", homeTeamId: "GER", awayTeamId: "CIV", matchday: 2, date: "2026-06-20", venue: "BMO Field, Toronto", kickoffCOT: "3:00 PM" },
  { id: "GS-E-4", stage: "group", group: "E", homeTeamId: "ECU", awayTeamId: "CUW", matchday: 2, date: "2026-06-20", venue: "GEHA Field, Kansas City", kickoffCOT: "7:00 PM" },
  { id: "GS-E-5", stage: "group", group: "E", homeTeamId: "ECU", awayTeamId: "GER", matchday: 3, date: "2026-06-25", venue: "", kickoffCOT: "3:00 PM" },
  { id: "GS-E-6", stage: "group", group: "E", homeTeamId: "CUW", awayTeamId: "CIV", matchday: 3, date: "2026-06-25", venue: "", kickoffCOT: "3:00 PM" },

  // === GROUP F (NED, JPN, SWE, TUN) ===
  { id: "GS-F-1", stage: "group", group: "F", homeTeamId: "NED", awayTeamId: "JPN", matchday: 1, date: "2026-06-14", venue: "AT&T Stadium, Arlington", kickoffCOT: "3:00 PM" },
  { id: "GS-F-2", stage: "group", group: "F", homeTeamId: "SWE", awayTeamId: "TUN", matchday: 1, date: "2026-06-14", venue: "Estadio BBVA, Guadalupe", kickoffCOT: "9:00 PM" },
  { id: "GS-F-3", stage: "group", group: "F", homeTeamId: "NED", awayTeamId: "SWE", matchday: 2, date: "2026-06-20", venue: "NRG Stadium, Houston", kickoffCOT: "12:00 PM" },
  { id: "GS-F-4", stage: "group", group: "F", homeTeamId: "TUN", awayTeamId: "JPN", matchday: 2, date: "2026-06-20", venue: "Estadio BBVA, Guadalupe", kickoffCOT: "11:00 PM" },
  { id: "GS-F-5", stage: "group", group: "F", homeTeamId: "TUN", awayTeamId: "NED", matchday: 3, date: "2026-06-25", venue: "", kickoffCOT: "6:00 PM" },
  { id: "GS-F-6", stage: "group", group: "F", homeTeamId: "JPN", awayTeamId: "SWE", matchday: 3, date: "2026-06-25", venue: "", kickoffCOT: "6:00 PM" },

  // === GROUP G (BEL, IRN, EGY, NZL) ===
  { id: "GS-G-1", stage: "group", group: "G", homeTeamId: "BEL", awayTeamId: "EGY", matchday: 1, date: "2026-06-15", venue: "", kickoffCOT: "2:00 PM" },
  { id: "GS-G-2", stage: "group", group: "G", homeTeamId: "IRN", awayTeamId: "NZL", matchday: 1, date: "2026-06-15", venue: "", kickoffCOT: "8:00 PM" },
  { id: "GS-G-3", stage: "group", group: "G", homeTeamId: "BEL", awayTeamId: "IRN", matchday: 2, date: "2026-06-21", venue: "SoFi Stadium, Inglewood", kickoffCOT: "2:00 PM" },
  { id: "GS-G-4", stage: "group", group: "G", homeTeamId: "NZL", awayTeamId: "EGY", matchday: 2, date: "2026-06-21", venue: "BC Place, Vancouver", kickoffCOT: "8:00 PM" },
  { id: "GS-G-5", stage: "group", group: "G", homeTeamId: "NZL", awayTeamId: "BEL", matchday: 3, date: "2026-06-26", venue: "BC Place, Vancouver", kickoffCOT: "10:00 PM" },
  { id: "GS-G-6", stage: "group", group: "G", homeTeamId: "EGY", awayTeamId: "IRN", matchday: 3, date: "2026-06-26", venue: "Lumen Field, Seattle", kickoffCOT: "10:00 PM" },

  // === GROUP H (ESP, KSA, URU, CPV) ===
  { id: "GS-H-1", stage: "group", group: "H", homeTeamId: "ESP", awayTeamId: "CPV", matchday: 1, date: "2026-06-15", venue: "Mercedes-Benz Stadium, Atlanta", kickoffCOT: "11:00 AM" },
  { id: "GS-H-2", stage: "group", group: "H", homeTeamId: "KSA", awayTeamId: "URU", matchday: 1, date: "2026-06-15", venue: "Hard Rock Stadium, Miami Gardens", kickoffCOT: "5:00 PM" },
  { id: "GS-H-3", stage: "group", group: "H", homeTeamId: "ESP", awayTeamId: "KSA", matchday: 2, date: "2026-06-21", venue: "Mercedes-Benz Stadium, Atlanta", kickoffCOT: "11:00 AM" },
  { id: "GS-H-4", stage: "group", group: "H", homeTeamId: "URU", awayTeamId: "CPV", matchday: 2, date: "2026-06-21", venue: "Hard Rock Stadium, Miami Gardens", kickoffCOT: "5:00 PM" },
  { id: "GS-H-5", stage: "group", group: "H", homeTeamId: "CPV", awayTeamId: "KSA", matchday: 3, date: "2026-06-26", venue: "NRG Stadium, Houston", kickoffCOT: "7:00 PM" },
  { id: "GS-H-6", stage: "group", group: "H", homeTeamId: "URU", awayTeamId: "ESP", matchday: 3, date: "2026-06-26", venue: "Estadio Akron, Guadalajara", kickoffCOT: "7:00 PM" },

  // === GROUP I (FRA, SEN, IRQ, NOR) ===
  { id: "GS-I-1", stage: "group", group: "I", homeTeamId: "FRA", awayTeamId: "SEN", matchday: 1, date: "2026-06-16", venue: "MetLife Stadium, East Rutherford", kickoffCOT: "2:00 PM" },
  { id: "GS-I-2", stage: "group", group: "I", homeTeamId: "IRQ", awayTeamId: "NOR", matchday: 1, date: "2026-06-16", venue: "Gillette Stadium, Foxborough", kickoffCOT: "5:00 PM" },
  { id: "GS-I-3", stage: "group", group: "I", homeTeamId: "FRA", awayTeamId: "IRQ", matchday: 2, date: "2026-06-22", venue: "Lincoln Financial Field, Philadelphia", kickoffCOT: "4:00 PM" },
  { id: "GS-I-4", stage: "group", group: "I", homeTeamId: "NOR", awayTeamId: "SEN", matchday: 2, date: "2026-06-22", venue: "MetLife Stadium, East Rutherford", kickoffCOT: "7:00 PM" },
  { id: "GS-I-5", stage: "group", group: "I", homeTeamId: "NOR", awayTeamId: "FRA", matchday: 3, date: "2026-06-26", venue: "Gillette Stadium, Foxborough", kickoffCOT: "2:00 PM" },
  { id: "GS-I-6", stage: "group", group: "I", homeTeamId: "SEN", awayTeamId: "IRQ", matchday: 3, date: "2026-06-26", venue: "BMO Field, Toronto", kickoffCOT: "2:00 PM" },

  // === GROUP J (ARG, AUT, ALG, JOR) ===
  { id: "GS-J-1", stage: "group", group: "J", homeTeamId: "ARG", awayTeamId: "ALG", matchday: 1, date: "2026-06-16", venue: "GEHA Field, Kansas City", kickoffCOT: "8:00 PM" },
  { id: "GS-J-2", stage: "group", group: "J", homeTeamId: "AUT", awayTeamId: "JOR", matchday: 1, date: "2026-06-16", venue: "Levi's Stadium, Santa Clara", kickoffCOT: "11:00 PM" },
  { id: "GS-J-3", stage: "group", group: "J", homeTeamId: "ARG", awayTeamId: "AUT", matchday: 2, date: "2026-06-22", venue: "AT&T Stadium, Arlington", kickoffCOT: "12:00 PM" },
  { id: "GS-J-4", stage: "group", group: "J", homeTeamId: "JOR", awayTeamId: "ALG", matchday: 2, date: "2026-06-22", venue: "Levi's Stadium, Santa Clara", kickoffCOT: "10:00 PM" },
  { id: "GS-J-5", stage: "group", group: "J", homeTeamId: "ALG", awayTeamId: "AUT", matchday: 3, date: "2026-06-27", venue: "", kickoffCOT: "9:00 PM" },
  { id: "GS-J-6", stage: "group", group: "J", homeTeamId: "JOR", awayTeamId: "ARG", matchday: 3, date: "2026-06-27", venue: "", kickoffCOT: "9:00 PM" },

  // === GROUP K (COL, POR, UZB, COD) ===
  { id: "GS-K-1", stage: "group", group: "K", homeTeamId: "COL", awayTeamId: "UZB", matchday: 1, date: "2026-06-17", venue: "", kickoffCOT: "9:00 PM" },
  { id: "GS-K-2", stage: "group", group: "K", homeTeamId: "POR", awayTeamId: "COD", matchday: 1, date: "2026-06-17", venue: "", kickoffCOT: "12:00 PM" },
  { id: "GS-K-3", stage: "group", group: "K", homeTeamId: "COL", awayTeamId: "COD", matchday: 2, date: "2026-06-23", venue: "Estadio Akron, Guadalajara", kickoffCOT: "9:00 PM" },
  { id: "GS-K-4", stage: "group", group: "K", homeTeamId: "POR", awayTeamId: "UZB", matchday: 2, date: "2026-06-23", venue: "NRG Stadium, Houston", kickoffCOT: "12:00 PM" },
  { id: "GS-K-5", stage: "group", group: "K", homeTeamId: "COL", awayTeamId: "POR", matchday: 3, date: "2026-06-27", venue: "", kickoffCOT: "6:30 PM" },
  { id: "GS-K-6", stage: "group", group: "K", homeTeamId: "COD", awayTeamId: "UZB", matchday: 3, date: "2026-06-27", venue: "", kickoffCOT: "6:30 PM" },

  // === GROUP L (ENG, CRO, GHA, PAN) ===
  { id: "GS-L-1", stage: "group", group: "L", homeTeamId: "ENG", awayTeamId: "CRO", matchday: 1, date: "2026-06-17", venue: "", kickoffCOT: "3:00 PM" },
  { id: "GS-L-2", stage: "group", group: "L", homeTeamId: "GHA", awayTeamId: "PAN", matchday: 1, date: "2026-06-17", venue: "", kickoffCOT: "6:00 PM" },
  { id: "GS-L-3", stage: "group", group: "L", homeTeamId: "ENG", awayTeamId: "GHA", matchday: 2, date: "2026-06-23", venue: "Gillette Stadium, Foxborough", kickoffCOT: "3:00 PM" },
  { id: "GS-L-4", stage: "group", group: "L", homeTeamId: "PAN", awayTeamId: "CRO", matchday: 2, date: "2026-06-23", venue: "BMO Field, Toronto", kickoffCOT: "6:00 PM" },
  { id: "GS-L-5", stage: "group", group: "L", homeTeamId: "PAN", awayTeamId: "ENG", matchday: 3, date: "2026-06-27", venue: "", kickoffCOT: "4:00 PM" },
  { id: "GS-L-6", stage: "group", group: "L", homeTeamId: "CRO", awayTeamId: "GHA", matchday: 3, date: "2026-06-27", venue: "", kickoffCOT: "4:00 PM" },
];

export function formatMatchDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
