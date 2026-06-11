// ============================================================
// WC2026 Team Data — All 48 Teams
// ============================================================
// Static baseline data. Elo ratings and FIFA rankings are approximate
// as of June 2026. Use the refresh API to pull current values.

import type { Team } from "../types";

export const teams: Team[] = [
  // === GROUP A ===
  { id: "MEX", name: "Mexico", shortName: "MEX", group: "A", confederation: "CONCACAF", fifaRanking: 16, eloRating: 1810, flagEmoji: "🇲🇽", primaryColor: "#006847", isHost: true },
  { id: "KOR", name: "South Korea", shortName: "KOR", group: "A", confederation: "AFC", fifaRanking: 22, eloRating: 1750, flagEmoji: "🇰🇷", primaryColor: "#CD2E3A", isHost: false },
  { id: "RSA", name: "South Africa", shortName: "RSA", group: "A", confederation: "CAF", fifaRanking: 43, eloRating: 1550, flagEmoji: "🇿🇦", primaryColor: "#007A4D", isHost: false },
  { id: "CZE", name: "Czechia", shortName: "CZE", group: "A", confederation: "UEFA", fifaRanking: 31, eloRating: 1660, flagEmoji: "🇨🇿", primaryColor: "#D7141A", isHost: false },

  // === GROUP B ===
  { id: "CAN", name: "Canada", shortName: "CAN", group: "B", confederation: "CONCACAF", fifaRanking: 35, eloRating: 1650, flagEmoji: "🇨🇦", primaryColor: "#FF0000", isHost: true },
  { id: "QAT", name: "Qatar", shortName: "QAT", group: "B", confederation: "AFC", fifaRanking: 37, eloRating: 1620, flagEmoji: "🇶🇦", primaryColor: "#8D1B3D", isHost: false },
  { id: "SUI", name: "Switzerland", shortName: "SUI", group: "B", confederation: "UEFA", fifaRanking: 18, eloRating: 1800, flagEmoji: "🇨🇭", primaryColor: "#FF0000", isHost: false },
  { id: "BIH", name: "Bosnia and Herzegovina", shortName: "BIH", group: "B", confederation: "UEFA", fifaRanking: 41, eloRating: 1570, flagEmoji: "🇧🇦", primaryColor: "#002395", isHost: false },

  // === GROUP C ===
  { id: "BRA", name: "Brazil", shortName: "BRA", group: "C", confederation: "CONMEBOL", fifaRanking: 3, eloRating: 1970, flagEmoji: "🇧🇷", primaryColor: "#FFDF00", isHost: false },
  { id: "MAR", name: "Morocco", shortName: "MAR", group: "C", confederation: "CAF", fifaRanking: 14, eloRating: 1830, flagEmoji: "🇲🇦", primaryColor: "#C1272D", isHost: false },
  { id: "HAI", name: "Haiti", shortName: "HAI", group: "C", confederation: "CONCACAF", fifaRanking: 65, eloRating: 1440, flagEmoji: "🇭🇹", primaryColor: "#00209F", isHost: false },
  { id: "SCO", name: "Scotland", shortName: "SCO", group: "C", confederation: "UEFA", fifaRanking: 36, eloRating: 1610, flagEmoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", primaryColor: "#003078", isHost: false },

  // === GROUP D ===
  { id: "USA", name: "United States", shortName: "USA", group: "D", confederation: "CONCACAF", fifaRanking: 15, eloRating: 1820, flagEmoji: "🇺🇸", primaryColor: "#002868", isHost: true },
  { id: "PAR", name: "Paraguay", shortName: "PAR", group: "D", confederation: "CONMEBOL", fifaRanking: 34, eloRating: 1630, flagEmoji: "🇵🇾", primaryColor: "#DA121A", isHost: false },
  { id: "AUS", name: "Australia", shortName: "AUS", group: "D", confederation: "AFC", fifaRanking: 23, eloRating: 1680, flagEmoji: "🇦🇺", primaryColor: "#00843D", isHost: false },
  { id: "TUR", name: "Türkiye", shortName: "TUR", group: "D", confederation: "UEFA", fifaRanking: 20, eloRating: 1760, flagEmoji: "🇹🇷", primaryColor: "#E30A17", isHost: false },

  // === GROUP E ===
  { id: "GER", name: "Germany", shortName: "GER", group: "E", confederation: "UEFA", fifaRanking: 8, eloRating: 1940, flagEmoji: "🇩🇪", primaryColor: "#000000", isHost: false },
  { id: "ECU", name: "Ecuador", shortName: "ECU", group: "E", confederation: "CONMEBOL", fifaRanking: 24, eloRating: 1730, flagEmoji: "🇪🇨", primaryColor: "#FFD100", isHost: false },
  { id: "CIV", name: "Ivory Coast", shortName: "CIV", group: "E", confederation: "CAF", fifaRanking: 30, eloRating: 1660, flagEmoji: "🇨🇮", primaryColor: "#F77F00", isHost: false },
  { id: "CUW", name: "Curaçao", shortName: "CUW", group: "E", confederation: "CONCACAF", fifaRanking: 78, eloRating: 1380, flagEmoji: "🇨🇼", primaryColor: "#002B7F", isHost: false },

  // === GROUP F ===
  { id: "NED", name: "Netherlands", shortName: "NED", group: "F", confederation: "UEFA", fifaRanking: 7, eloRating: 1930, flagEmoji: "🇳🇱", primaryColor: "#FF6600", isHost: false },
  { id: "JPN", name: "Japan", shortName: "JPN", group: "F", confederation: "AFC", fifaRanking: 13, eloRating: 1840, flagEmoji: "🇯🇵", primaryColor: "#000080", isHost: false },
  { id: "SWE", name: "Sweden", shortName: "SWE", group: "F", confederation: "UEFA", fifaRanking: 26, eloRating: 1710, flagEmoji: "🇸🇪", primaryColor: "#006AA7", isHost: false },
  { id: "TUN", name: "Tunisia", shortName: "TUN", group: "F", confederation: "CAF", fifaRanking: 33, eloRating: 1640, flagEmoji: "🇹🇳", primaryColor: "#E70013", isHost: false },

  // === GROUP G ===
  { id: "BEL", name: "Belgium", shortName: "BEL", group: "G", confederation: "UEFA", fifaRanking: 9, eloRating: 1900, flagEmoji: "🇧🇪", primaryColor: "#ED2939", isHost: false },
  { id: "EGY", name: "Egypt", shortName: "EGY", group: "G", confederation: "CAF", fifaRanking: 28, eloRating: 1700, flagEmoji: "🇪🇬", primaryColor: "#CE1126", isHost: false },
  { id: "IRN", name: "Iran", shortName: "IRN", group: "G", confederation: "AFC", fifaRanking: 21, eloRating: 1670, flagEmoji: "🇮🇷", primaryColor: "#239F40", isHost: false },
  { id: "NZL", name: "New Zealand", shortName: "NZL", group: "G", confederation: "OFC", fifaRanking: 60, eloRating: 1460, flagEmoji: "🇳🇿", primaryColor: "#000000", isHost: false },

  // === GROUP H ===
  { id: "ESP", name: "Spain", shortName: "ESP", group: "H", confederation: "UEFA", fifaRanking: 1, eloRating: 2040, flagEmoji: "🇪🇸", primaryColor: "#AA151B", isHost: false },
  { id: "URU", name: "Uruguay", shortName: "URU", group: "H", confederation: "CONMEBOL", fifaRanking: 12, eloRating: 1870, flagEmoji: "🇺🇾", primaryColor: "#5CBFEB", isHost: false },
  { id: "KSA", name: "Saudi Arabia", shortName: "KSA", group: "H", confederation: "AFC", fifaRanking: 40, eloRating: 1590, flagEmoji: "🇸🇦", primaryColor: "#006C35", isHost: false },
  { id: "CPV", name: "Cape Verde", shortName: "CPV", group: "H", confederation: "CAF", fifaRanking: 68, eloRating: 1420, flagEmoji: "🇨🇻", primaryColor: "#003893", isHost: false },

  // === GROUP I ===
  { id: "FRA", name: "France", shortName: "FRA", group: "I", confederation: "UEFA", fifaRanking: 4, eloRating: 2010, flagEmoji: "🇫🇷", primaryColor: "#002395", isHost: false },
  { id: "SEN", name: "Senegal", shortName: "SEN", group: "I", confederation: "CAF", fifaRanking: 17, eloRating: 1790, flagEmoji: "🇸🇳", primaryColor: "#00853F", isHost: false },
  { id: "NOR", name: "Norway", shortName: "NOR", group: "I", confederation: "UEFA", fifaRanking: 25, eloRating: 1720, flagEmoji: "🇳🇴", primaryColor: "#BA0C2F", isHost: false },
  { id: "IRQ", name: "Iraq", shortName: "IRQ", group: "I", confederation: "AFC", fifaRanking: 46, eloRating: 1530, flagEmoji: "🇮🇶", primaryColor: "#007A3D", isHost: false },

  // === GROUP J ===
  { id: "ARG", name: "Argentina", shortName: "ARG", group: "J", confederation: "CONMEBOL", fifaRanking: 2, eloRating: 2060, flagEmoji: "🇦🇷", primaryColor: "#74ACDF", isHost: false },
  { id: "AUT", name: "Austria", shortName: "AUT", group: "J", confederation: "UEFA", fifaRanking: 19, eloRating: 1770, flagEmoji: "🇦🇹", primaryColor: "#ED2939", isHost: false },
  { id: "ALG", name: "Algeria", shortName: "ALG", group: "J", confederation: "CAF", fifaRanking: 29, eloRating: 1690, flagEmoji: "🇩🇿", primaryColor: "#006233", isHost: false },
  { id: "JOR", name: "Jordan", shortName: "JOR", group: "J", confederation: "AFC", fifaRanking: 52, eloRating: 1500, flagEmoji: "🇯🇴", primaryColor: "#007A3D", isHost: false },

  // === GROUP K ===
  { id: "COL", name: "Colombia", shortName: "COL", group: "K", confederation: "CONMEBOL", fifaRanking: 10, eloRating: 1890, flagEmoji: "🇨🇴", primaryColor: "#FCD116", isHost: false },
  { id: "POR", name: "Portugal", shortName: "POR", group: "K", confederation: "UEFA", fifaRanking: 6, eloRating: 1950, flagEmoji: "🇵🇹", primaryColor: "#006600", isHost: false },
  { id: "UZB", name: "Uzbekistan", shortName: "UZB", group: "K", confederation: "AFC", fifaRanking: 44, eloRating: 1540, flagEmoji: "🇺🇿", primaryColor: "#0099B5", isHost: false },
  { id: "COD", name: "DR Congo", shortName: "COD", group: "K", confederation: "CAF", fifaRanking: 50, eloRating: 1510, flagEmoji: "🇨🇩", primaryColor: "#007FFF", isHost: false },

  // === GROUP L ===
  { id: "ENG", name: "England", shortName: "ENG", group: "L", confederation: "UEFA", fifaRanking: 5, eloRating: 1980, flagEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", primaryColor: "#FFFFFF", isHost: false },
  { id: "CRO", name: "Croatia", shortName: "CRO", group: "L", confederation: "UEFA", fifaRanking: 11, eloRating: 1880, flagEmoji: "🇭🇷", primaryColor: "#FF0000", isHost: false },
  { id: "PAN", name: "Panama", shortName: "PAN", group: "L", confederation: "CONCACAF", fifaRanking: 42, eloRating: 1560, flagEmoji: "🇵🇦", primaryColor: "#DA121A", isHost: false },
  { id: "GHA", name: "Ghana", shortName: "GHA", group: "L", confederation: "CAF", fifaRanking: 38, eloRating: 1600, flagEmoji: "🇬🇭", primaryColor: "#006B3F", isHost: false },
];

/** Quick lookup map */
export function getTeamMap(): Map<string, import("../types").Team> {
  return new Map(teams.map((t) => [t.id, t]));
}

/** Get teams by group */
export function getTeamsByGroup(group: string): Team[] {
  return teams.filter((t) => t.group === group);
}

/** All group names */
export const GROUP_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;
