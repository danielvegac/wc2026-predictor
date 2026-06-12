// ============================================================
// FIFA World Cup 2026 — Group Stage Schedule
// ============================================================
// All 72 group stage matches with actual dates, pairings, and
// kickoff times in COT (Colombia Time, UTC-5).

import type { Match } from "../types";

export const groupStageSchedule: Match[] = [
  // === GROUP A ===
  { id: "GS-A-1", stage: "group", group: "A", homeTeamId: "MEX", awayTeamId: "RSA", matchday: 1, date: "2026-06-11", venue: "", kickoffCOT: "5:00 PM" },
  { id: "GS-A-2", stage: "group", group: "A", homeTeamId: "KOR", awayTeamId: "CZE", matchday: 1, date: "2026-06-11", venue: "", kickoffCOT: "11:00 AM" },
  { id: "GS-A-3", stage: "group", group: "A", homeTeamId: "MEX", awayTeamId: "KOR", matchday: 2, date: "2026-06-17", venue: "", kickoffCOT: "1:00 PM" },
  { id: "GS-A-4", stage: "group", group: "A", homeTeamId: "RSA", awayTeamId: "CZE", matchday: 2, date: "2026-06-17", venue: "", kickoffCOT: "10:00 AM" },
  { id: "GS-A-5", stage: "group", group: "A", homeTeamId: "MEX", awayTeamId: "CZE", matchday: 3, date: "2026-06-25", venue: "", kickoffCOT: "2:00 PM" },
  { id: "GS-A-6", stage: "group", group: "A", homeTeamId: "KOR", awayTeamId: "RSA", matchday: 3, date: "2026-06-25", venue: "", kickoffCOT: "2:00 PM" },

  // === GROUP B ===
  { id: "GS-B-1", stage: "group", group: "B", homeTeamId: "CAN", awayTeamId: "BIH", matchday: 1, date: "2026-06-12", venue: "", kickoffCOT: "2:00 PM" },
  { id: "GS-B-2", stage: "group", group: "B", homeTeamId: "QAT", awayTeamId: "SUI", matchday: 1, date: "2026-06-13", venue: "", kickoffCOT: "11:00 AM" },
  { id: "GS-B-3", stage: "group", group: "B", homeTeamId: "CAN", awayTeamId: "QAT", matchday: 2, date: "2026-06-18", venue: "", kickoffCOT: "11:00 AM" },
  { id: "GS-B-4", stage: "group", group: "B", homeTeamId: "BIH", awayTeamId: "SUI", matchday: 2, date: "2026-06-18", venue: "", kickoffCOT: "2:00 PM" },
  { id: "GS-B-5", stage: "group", group: "B", homeTeamId: "CAN", awayTeamId: "SUI", matchday: 3, date: "2026-06-25", venue: "", kickoffCOT: "8:00 PM" },
  { id: "GS-B-6", stage: "group", group: "B", homeTeamId: "QAT", awayTeamId: "BIH", matchday: 3, date: "2026-06-25", venue: "", kickoffCOT: "8:00 PM" },

  // === GROUP C ===
  { id: "GS-C-1", stage: "group", group: "C", homeTeamId: "BRA", awayTeamId: "MAR", matchday: 1, date: "2026-06-13", venue: "", kickoffCOT: "5:00 PM" },
  { id: "GS-C-2", stage: "group", group: "C", homeTeamId: "HAI", awayTeamId: "SCO", matchday: 1, date: "2026-06-13", venue: "", kickoffCOT: "8:00 PM" },
  { id: "GS-C-3", stage: "group", group: "C", homeTeamId: "BRA", awayTeamId: "SCO", matchday: 2, date: "2026-06-19", venue: "", kickoffCOT: "3:00 PM" },
  { id: "GS-C-4", stage: "group", group: "C", homeTeamId: "MAR", awayTeamId: "HAI", matchday: 2, date: "2026-06-19", venue: "", kickoffCOT: "12:00 PM" },
  { id: "GS-C-5", stage: "group", group: "C", homeTeamId: "BRA", awayTeamId: "HAI", matchday: 3, date: "2026-06-26", venue: "", kickoffCOT: "11:00 AM" },
  { id: "GS-C-6", stage: "group", group: "C", homeTeamId: "MAR", awayTeamId: "SCO", matchday: 3, date: "2026-06-26", venue: "", kickoffCOT: "11:00 AM" },

  // === GROUP D ===
  { id: "GS-D-1", stage: "group", group: "D", homeTeamId: "USA", awayTeamId: "PAR", matchday: 1, date: "2026-06-12", venue: "", kickoffCOT: "8:00 PM" },
  { id: "GS-D-2", stage: "group", group: "D", homeTeamId: "AUS", awayTeamId: "TUR", matchday: 1, date: "2026-06-13", venue: "", kickoffCOT: "2:00 PM" },
  { id: "GS-D-3", stage: "group", group: "D", homeTeamId: "USA", awayTeamId: "AUS", matchday: 2, date: "2026-06-18", venue: "", kickoffCOT: "5:00 PM" },
  { id: "GS-D-4", stage: "group", group: "D", homeTeamId: "PAR", awayTeamId: "TUR", matchday: 2, date: "2026-06-18", venue: "", kickoffCOT: "8:00 PM" },
  { id: "GS-D-5", stage: "group", group: "D", homeTeamId: "USA", awayTeamId: "TUR", matchday: 3, date: "2026-06-26", venue: "", kickoffCOT: "3:00 PM" },
  { id: "GS-D-6", stage: "group", group: "D", homeTeamId: "PAR", awayTeamId: "AUS", matchday: 3, date: "2026-06-26", venue: "", kickoffCOT: "3:00 PM" },

  // === GROUP E ===
  { id: "GS-E-1", stage: "group", group: "E", homeTeamId: "GER", awayTeamId: "CUW", matchday: 1, date: "2026-06-14", venue: "", kickoffCOT: "2:00 PM" },
  { id: "GS-E-2", stage: "group", group: "E", homeTeamId: "CIV", awayTeamId: "ECU", matchday: 1, date: "2026-06-14", venue: "", kickoffCOT: "5:00 PM" },
  { id: "GS-E-3", stage: "group", group: "E", homeTeamId: "GER", awayTeamId: "CIV", matchday: 2, date: "2026-06-19", venue: "", kickoffCOT: "6:00 PM" },
  { id: "GS-E-4", stage: "group", group: "E", homeTeamId: "CUW", awayTeamId: "ECU", matchday: 2, date: "2026-06-20", venue: "", kickoffCOT: "11:00 AM" },
  { id: "GS-E-5", stage: "group", group: "E", homeTeamId: "GER", awayTeamId: "ECU", matchday: 3, date: "2026-06-26", venue: "", kickoffCOT: "8:00 PM" },
  { id: "GS-E-6", stage: "group", group: "E", homeTeamId: "CIV", awayTeamId: "CUW", matchday: 3, date: "2026-06-26", venue: "", kickoffCOT: "8:00 PM" },

  // === GROUP F ===
  { id: "GS-F-1", stage: "group", group: "F", homeTeamId: "NED", awayTeamId: "JPN", matchday: 1, date: "2026-06-14", venue: "", kickoffCOT: "8:00 PM" },
  { id: "GS-F-2", stage: "group", group: "F", homeTeamId: "SWE", awayTeamId: "TUN", matchday: 1, date: "2026-06-14", venue: "", kickoffCOT: "11:00 AM" },
  { id: "GS-F-3", stage: "group", group: "F", homeTeamId: "NED", awayTeamId: "SWE", matchday: 2, date: "2026-06-20", venue: "", kickoffCOT: "2:00 PM" },
  { id: "GS-F-4", stage: "group", group: "F", homeTeamId: "JPN", awayTeamId: "TUN", matchday: 2, date: "2026-06-20", venue: "", kickoffCOT: "5:00 PM" },
  { id: "GS-F-5", stage: "group", group: "F", homeTeamId: "NED", awayTeamId: "TUN", matchday: 3, date: "2026-06-27", venue: "", kickoffCOT: "11:00 AM" },
  { id: "GS-F-6", stage: "group", group: "F", homeTeamId: "JPN", awayTeamId: "SWE", matchday: 3, date: "2026-06-27", venue: "", kickoffCOT: "11:00 AM" },

  // === GROUP G ===
  { id: "GS-G-1", stage: "group", group: "G", homeTeamId: "BEL", awayTeamId: "EGY", matchday: 1, date: "2026-06-15", venue: "", kickoffCOT: "2:00 PM" },
  { id: "GS-G-2", stage: "group", group: "G", homeTeamId: "IRN", awayTeamId: "NZL", matchday: 1, date: "2026-06-15", venue: "", kickoffCOT: "11:00 AM" },
  { id: "GS-G-3", stage: "group", group: "G", homeTeamId: "BEL", awayTeamId: "IRN", matchday: 2, date: "2026-06-20", venue: "", kickoffCOT: "8:00 PM" },
  { id: "GS-G-4", stage: "group", group: "G", homeTeamId: "EGY", awayTeamId: "NZL", matchday: 2, date: "2026-06-21", venue: "", kickoffCOT: "12:00 PM" },
  { id: "GS-G-5", stage: "group", group: "G", homeTeamId: "BEL", awayTeamId: "NZL", matchday: 3, date: "2026-06-27", venue: "", kickoffCOT: "2:00 PM" },
  { id: "GS-G-6", stage: "group", group: "G", homeTeamId: "EGY", awayTeamId: "IRN", matchday: 3, date: "2026-06-27", venue: "", kickoffCOT: "2:00 PM" },

  // === GROUP H ===
  { id: "GS-H-1", stage: "group", group: "H", homeTeamId: "ESP", awayTeamId: "CPV", matchday: 1, date: "2026-06-15", venue: "", kickoffCOT: "8:00 PM" },
  { id: "GS-H-2", stage: "group", group: "H", homeTeamId: "KSA", awayTeamId: "URU", matchday: 1, date: "2026-06-15", venue: "", kickoffCOT: "5:00 PM" },
  { id: "GS-H-3", stage: "group", group: "H", homeTeamId: "ESP", awayTeamId: "URU", matchday: 2, date: "2026-06-21", venue: "", kickoffCOT: "6:00 PM" },
  { id: "GS-H-4", stage: "group", group: "H", homeTeamId: "CPV", awayTeamId: "KSA", matchday: 2, date: "2026-06-21", venue: "", kickoffCOT: "3:00 PM" },
  { id: "GS-H-5", stage: "group", group: "H", homeTeamId: "ESP", awayTeamId: "KSA", matchday: 3, date: "2026-06-27", venue: "", kickoffCOT: "5:00 PM" },
  { id: "GS-H-6", stage: "group", group: "H", homeTeamId: "URU", awayTeamId: "CPV", matchday: 3, date: "2026-06-27", venue: "", kickoffCOT: "5:00 PM" },

  // === GROUP I ===
  { id: "GS-I-1", stage: "group", group: "I", homeTeamId: "FRA", awayTeamId: "IRQ", matchday: 1, date: "2026-06-16", venue: "", kickoffCOT: "6:00 PM" },
  { id: "GS-I-2", stage: "group", group: "I", homeTeamId: "SEN", awayTeamId: "NOR", matchday: 1, date: "2026-06-16", venue: "", kickoffCOT: "1:00 PM" },
  { id: "GS-I-3", stage: "group", group: "I", homeTeamId: "FRA", awayTeamId: "NOR", matchday: 2, date: "2026-06-22", venue: "", kickoffCOT: "12:00 PM" },
  { id: "GS-I-4", stage: "group", group: "I", homeTeamId: "SEN", awayTeamId: "IRQ", matchday: 2, date: "2026-06-22", venue: "", kickoffCOT: "10:00 AM" },
  { id: "GS-I-5", stage: "group", group: "I", homeTeamId: "FRA", awayTeamId: "SEN", matchday: 3, date: "2026-06-28", venue: "", kickoffCOT: "11:00 AM" },
  { id: "GS-I-6", stage: "group", group: "I", homeTeamId: "NOR", awayTeamId: "IRQ", matchday: 3, date: "2026-06-28", venue: "", kickoffCOT: "11:00 AM" },

  // === GROUP J ===
  { id: "GS-J-1", stage: "group", group: "J", homeTeamId: "ARG", awayTeamId: "JOR", matchday: 1, date: "2026-06-16", venue: "", kickoffCOT: "9:00 PM" },
  { id: "GS-J-2", stage: "group", group: "J", homeTeamId: "AUT", awayTeamId: "ALG", matchday: 1, date: "2026-06-16", venue: "", kickoffCOT: "10:00 AM" },
  { id: "GS-J-3", stage: "group", group: "J", homeTeamId: "ARG", awayTeamId: "ALG", matchday: 2, date: "2026-06-22", venue: "", kickoffCOT: "5:00 PM" },
  { id: "GS-J-4", stage: "group", group: "J", homeTeamId: "AUT", awayTeamId: "JOR", matchday: 2, date: "2026-06-22", venue: "", kickoffCOT: "2:00 PM" },
  { id: "GS-J-5", stage: "group", group: "J", homeTeamId: "ARG", awayTeamId: "AUT", matchday: 3, date: "2026-06-28", venue: "", kickoffCOT: "3:00 PM" },
  { id: "GS-J-6", stage: "group", group: "J", homeTeamId: "ALG", awayTeamId: "JOR", matchday: 3, date: "2026-06-28", venue: "", kickoffCOT: "3:00 PM" },

  // === GROUP K ===
  { id: "GS-K-1", stage: "group", group: "K", homeTeamId: "COL", awayTeamId: "UZB", matchday: 1, date: "2026-06-17", venue: "", kickoffCOT: "6:00 PM" },
  { id: "GS-K-2", stage: "group", group: "K", homeTeamId: "POR", awayTeamId: "COD", matchday: 1, date: "2026-06-17", venue: "", kickoffCOT: "9:00 PM" },
  { id: "GS-K-3", stage: "group", group: "K", homeTeamId: "COL", awayTeamId: "COD", matchday: 2, date: "2026-06-23", venue: "", kickoffCOT: "3:00 PM" },
  { id: "GS-K-4", stage: "group", group: "K", homeTeamId: "POR", awayTeamId: "UZB", matchday: 2, date: "2026-06-23", venue: "", kickoffCOT: "6:00 PM" },
  { id: "GS-K-5", stage: "group", group: "K", homeTeamId: "COL", awayTeamId: "POR", matchday: 3, date: "2026-06-27", venue: "", kickoffCOT: "8:00 PM" },
  { id: "GS-K-6", stage: "group", group: "K", homeTeamId: "UZB", awayTeamId: "COD", matchday: 3, date: "2026-06-27", venue: "", kickoffCOT: "8:00 PM" },

  // === GROUP L ===
  { id: "GS-L-1", stage: "group", group: "L", homeTeamId: "ENG", awayTeamId: "GHA", matchday: 1, date: "2026-06-16", venue: "", kickoffCOT: "3:00 PM" },
  { id: "GS-L-2", stage: "group", group: "L", homeTeamId: "CRO", awayTeamId: "PAN", matchday: 1, date: "2026-06-17", venue: "", kickoffCOT: "3:00 PM" },
  { id: "GS-L-3", stage: "group", group: "L", homeTeamId: "ENG", awayTeamId: "CRO", matchday: 2, date: "2026-06-22", venue: "", kickoffCOT: "9:00 PM" },
  { id: "GS-L-4", stage: "group", group: "L", homeTeamId: "GHA", awayTeamId: "PAN", matchday: 2, date: "2026-06-22", venue: "", kickoffCOT: "7:00 PM" },
  { id: "GS-L-5", stage: "group", group: "L", homeTeamId: "ENG", awayTeamId: "PAN", matchday: 3, date: "2026-06-28", venue: "", kickoffCOT: "8:00 PM" },
  { id: "GS-L-6", stage: "group", group: "L", homeTeamId: "CRO", awayTeamId: "GHA", matchday: 3, date: "2026-06-28", venue: "", kickoffCOT: "8:00 PM" },
];

export function formatMatchDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
