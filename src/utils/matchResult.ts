// ============================================================
// Match result helpers
// ============================================================
// Shared logic for interpreting scorelines: win/draw/loss outcome,
// parsing/extracting scoreline strings, and the result-based border
// color used by match cards.

export type MatchResult = "home" | "draw" | "away";

/** Outcome of a match from the home team's perspective. */
export function getMatchResult(homeGoals: number, awayGoals: number): MatchResult {
  if (homeGoals > awayGoals) return "home";
  if (homeGoals < awayGoals) return "away";
  return "draw";
}

// Matches a "2-1" / "2 – 1" style scoreline (hyphen or en dash).
const SCORELINE_RE = /(\d+)\s*[-–]\s*(\d+)/;

/**
 * Parse the first "H-A" scoreline found in a string.
 * Returns `[home, away]` goals, or `null` if none is present.
 */
export function parseScoreline(text: string): [number, number] | null {
  const match = text.match(SCORELINE_RE);
  if (!match) return null;
  return [parseInt(match[1], 10), parseInt(match[2], 10)];
}

/**
 * Extract the "H-A" scoreline substring from a string, falling back to
 * the original text when no scoreline is present.
 */
export function extractScoreline(text: string): string {
  return text.match(SCORELINE_RE)?.[0] ?? text;
}

/**
 * Tailwind border class reflecting a predicted scoreline:
 * green for a home win, red for an away win, gold for a draw.
 */
export function getResultBorderClass(homeGoals: number, awayGoals: number): string {
  const result = getMatchResult(homeGoals, awayGoals);
  if (result === "home") return "border-accent-green/40";
  if (result === "away") return "border-accent-red/40";
  return "border-accent-gold/40";
}
