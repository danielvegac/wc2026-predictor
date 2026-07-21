// /api/results — Fetch completed WC 2026 match results
// Source: ESPN API (public, no auth)
// Cache: 30 minutes
//
// Returns completed matches with scores for scoring user predictions.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { resolveTeamId, WC_TEAM_IDS } from "./_teamMapping.js";
import { handleCorsAndMethod, safeErrorMessage } from "./_http.js";

interface MatchResult {
  matchId: string | null;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: string;
  stage: string;
  completed: boolean;
}

// WC 2026 date range — scan each day for results
function getWC2026Dates(): string[] {
  const dates: string[] = [];
  const start = new Date("2026-06-11");
  const today = new Date();
  const limit = new Date("2026-07-20"); // WC final ~July 19

  const stop = today < limit ? today : limit;
  for (let d = new Date(start); d <= stop; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(`${y}${m}${dd}`);
  }
  return dates;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCorsAndMethod(req, res)) return;
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=300");

  try {
    const results: MatchResult[] = [];
    const dates = getWC2026Dates();

    // Fetch each day's scoreboard from ESPN.
    // A single day's failure (network/timeout/parse) must not discard the
    // results already gathered from other days, so each day is isolated.
    for (const date of dates) {
      let data: {
        events?: Array<{
          competitions?: Array<{
            competitors?: Array<{
              homeAway?: string;
              score?: string;
              team?: { displayName?: string; shortDisplayName?: string; abbreviation?: string };
            }>;
            status?: { type?: { name?: string; completed?: boolean } };
            date?: string;
            type?: { text?: string };
          }>;
        }>;
      };

      try {
        const espnRes = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${date}`,
          {
            headers: {
              "User-Agent": "WC2026-Predictor/1.0",
              Accept: "application/json",
            },
            signal: AbortSignal.timeout(10000),
          }
        );

        if (!espnRes.ok) {
          console.warn(`[api/results] ESPN scoreboard for ${date} returned ${espnRes.status}`);
          continue;
        }

        data = await espnRes.json();
      } catch (dayError) {
        console.warn(`[api/results] Failed to fetch/parse ESPN scoreboard for ${date}:`, dayError);
        continue;
      }

      const events = data?.events ?? [];
      for (const event of events) {
        const comp = event.competitions?.[0];
        if (!comp) continue;

        const homeComp = comp.competitors?.find((c) => c.homeAway === "home");
        const awayComp = comp.competitors?.find((c) => c.homeAway === "away");
        if (!homeComp || !awayComp) continue;

        const homeName = homeComp.team?.displayName ?? homeComp.team?.shortDisplayName ?? "";
        const awayName = awayComp.team?.displayName ?? awayComp.team?.shortDisplayName ?? "";
        if (!homeName || !awayName) continue;

        const homeTeamId = resolveTeamId(homeName) ?? resolveTeamId(homeComp.team?.abbreviation ?? "");
        const awayTeamId = resolveTeamId(awayName) ?? resolveTeamId(awayComp.team?.abbreviation ?? "");
        if (!homeTeamId || !awayTeamId) continue;
        if (!WC_TEAM_IDS.has(homeTeamId) || !WC_TEAM_IDS.has(awayTeamId)) continue;

        const completed = comp.status?.type?.completed === true
          || comp.status?.type?.name === "STATUS_FULL_TIME";
        const homeScore = parseInt(homeComp.score ?? "0", 10) || 0;
        const awayScore = parseInt(awayComp.score ?? "0", 10) || 0;
        const eventDate = comp.date ?? "";
        const stage = comp.type?.text ?? "group";

        results.push({
          matchId: null,
          homeTeamId,
          awayTeamId,
          homeScore: completed ? homeScore : 0,
          awayScore: completed ? awayScore : 0,
          date: eventDate,
          stage,
          completed,
        });
      }
    }

    return res.status(200).json({
      matches: results,
      source: results.length > 0 ? "live" : "unavailable",
      timestamp: new Date().toISOString(),
      totalCompleted: results.filter((m) => m.completed).length,
    });
  } catch (error) {
    console.error("[api/results] Failed to fetch match results:", error);
    return res.status(200).json({
      matches: [],
      source: "unavailable",
      timestamp: new Date().toISOString(),
      error: safeErrorMessage("api/results", error),
    });
  }
}
