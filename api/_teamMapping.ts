// Shared mapping: external team names → our ISO alpha-3 team IDs
// Used by API routes to normalize external data sources

export const teamNameToId: Record<string, string> = {
  // Standard names
  "Mexico": "MEX", "South Korea": "KOR", "Korea Republic": "KOR",
  "South Africa": "RSA", "Czech Republic": "CZE", "Czechia": "CZE",
  "Switzerland": "SUI", "Canada": "CAN", "Qatar": "QAT",
  "Bosnia and Herzegovina": "BIH", "Bosnia-Herzegovina": "BIH", "Bosnia": "BIH",
  "Brazil": "BRA", "Morocco": "MAR", "Scotland": "SCO", "Haiti": "HAI",
  "United States": "USA", "USA": "USA", "US": "USA",
  "Turkey": "TUR", "Türkiye": "TUR", "Australia": "AUS", "Paraguay": "PAR",
  "Germany": "GER", "Ecuador": "ECU", "Ivory Coast": "CIV", "Côte d'Ivoire": "CIV",
  "Cote d'Ivoire": "CIV", "Curacao": "CUW", "Curaçao": "CUW",
  "Netherlands": "NED", "Holland": "NED", "Japan": "JPN", "Sweden": "SWE",
  "Tunisia": "TUN", "Belgium": "BEL", "Egypt": "EGY", "Iran": "IRN",
  "New Zealand": "NZL", "Spain": "ESP", "Uruguay": "URU",
  "Saudi Arabia": "KSA", "Cape Verde": "CPV", "Cabo Verde": "CPV",
  "France": "FRA", "Senegal": "SEN", "Norway": "NOR", "Iraq": "IRQ",
  "Argentina": "ARG", "Austria": "AUT", "Algeria": "ALG", "Jordan": "JOR",
  "Portugal": "POR", "Colombia": "COL", "Uzbekistan": "UZB",
  "DR Congo": "COD", "Congo DR": "COD", "Dem. Rep. Congo": "COD",
  "Democratic Republic of the Congo": "COD",
  "England": "ENG", "Croatia": "CRO", "Ghana": "GHA", "Panama": "PAN",
  // Club Elo / EloRatings short names
  "MEX": "MEX", "KOR": "KOR", "RSA": "RSA", "CZE": "CZE",
  "SUI": "SUI", "CAN": "CAN", "QAT": "QAT", "BIH": "BIH",
  "BRA": "BRA", "MAR": "MAR", "SCO": "SCO", "HAI": "HAI",
  "TUR": "TUR", "AUS": "AUS", "PAR": "PAR",
  "GER": "GER", "ECU": "ECU", "CIV": "CIV", "CUW": "CUW",
  "NED": "NED", "JPN": "JPN", "SWE": "SWE",
  "TUN": "TUN", "BEL": "BEL", "EGY": "EGY", "IRN": "IRN",
  "NZL": "NZL", "ESP": "ESP", "URU": "URU",
  "KSA": "KSA", "CPV": "CPV",
  "FRA": "FRA", "SEN": "SEN", "NOR": "NOR", "IRQ": "IRQ",
  "ARG": "ARG", "AUT": "AUT", "ALG": "ALG", "JOR": "JOR",
  "POR": "POR", "COL": "COL", "UZB": "UZB", "COD": "COD",
  "ENG": "ENG", "CRO": "CRO", "GHA": "GHA", "PAN": "PAN",
};

export const WC_TEAM_IDS = new Set([
  "MEX", "KOR", "RSA", "CZE", "SUI", "CAN", "QAT", "BIH",
  "BRA", "MAR", "SCO", "HAI", "USA", "TUR", "AUS", "PAR",
  "GER", "ECU", "CIV", "CUW", "NED", "JPN", "SWE", "TUN",
  "BEL", "EGY", "IRN", "NZL", "ESP", "URU", "KSA", "CPV",
  "FRA", "SEN", "NOR", "IRQ", "ARG", "AUT", "ALG", "JOR",
  "POR", "COL", "UZB", "COD", "ENG", "CRO", "GHA", "PAN",
]);

export function resolveTeamId(name: string): string | null {
  return teamNameToId[name] ?? teamNameToId[name.trim()] ?? null;
}
