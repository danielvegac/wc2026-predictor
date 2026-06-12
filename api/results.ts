// /api/results — Fetch completed WC 2026 match results
// Source: Fotmob API (unofficial, public)
// Cache: 30 minutes
//
// Returns completed matches with scores for scoring user predictions.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { resolveTeamId, WC_TEAM_IDS } from "./_teamMapping";

interface MatchResult {
  matchId: string | null;  // We'll try to map to our GS-X-Y IDs
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: string;
  stage: string;
  completed: boolean;
}

// Fotmob league ID for FIFA World Cup
const FOTMOB_WC_ID = 76;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=300");

  try {
    const fotmobRes = await fetch(
      `https://www.fotmob.com/api/leagues?id=${FOTMOB_WC_ID}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
          Accept: "application/json",
          Referer: "https://www.fotmob.com/",
        },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!fotmobRes.ok) {
      return res.status(200).json({
        matches: [],
        source: "unavailable",
        timestamp: new Date().toISOString(),
        error: `Fotmob returned ${fotmobRes.status}`,
      });
    }

    const data = await fotmobRes.json() as {
      matches?: {
        allMatches?: Array<{
          home?: { name?: string; score?: number };
          away?: { name?: string; score?: number };
          status?: { finished?: boolean; started?: boolean };
          timeTS?: number;
          round?: number;
          stage?: string;
        }>;
      };
    };

    const results: MatchResult[] = [];
    const allMatches = data?.matches?.allMatches ?? [];

    for (const match of allMatches) {
      const homeName = match.home?.name;
      const awayName = match.away?.name;
      if (!homeName || !awayName) continue;

      const homeTeamId = resolveTeamId(homeName);
      const awayTeamId = resolveTeamId(awayName);
      if (!homeTeamId || !awayTeamId) continue;
      if (!WC_TEAM_IDS.has(homeTeamId) || !WC_TEAM_IDS.has(awayTeamId)) continue;

      const completed = match.status?.finished === true;
      const homeScore = match.home?.score ?? 0;
      const awayScore = match.away?.score ?? 0;
      const date = match.timeTS
        ? new Date(match.timeTS).toISOString()
        : "";
      const stage = match.stage ?? (match.round ? `Round ${match.round}` : "group");

      results.push({
        matchId: null, // Frontend will match by team IDs
        homeTeamId,
        awayTeamId,
        homeScore: completed ? homeScore : 0,
        awayScore: completed ? awayScore : 0,
        date,
        stage,
        completed,
      });
    }

    return res.status(200).json({
      matches: results,
      source: results.length > 0 ? "live" : "unavailable",
      timestamp: new Date().toISOString(),
      totalCompleted: results.filter((m) => m.completed).length,
    });
  } catch (error) {
    return res.status(200).json({
      matches: [],
      source: "unavailable",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
