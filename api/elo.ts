// /api/elo — Fetch current Elo ratings for all 48 WC teams
// Source: clubelo.com (public CSV endpoint)
// Cache: 24 hours (ratings update daily)

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { WC_TEAM_IDS, resolveTeamId } from "./_teamMapping.js";
import { handleCorsAndMethod, safeErrorMessage } from "./_http.js";

interface EloEntry {
  teamId: string;
  elo: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCorsAndMethod(req, res)) return;
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");

  try {
    // Try eloratings.net-style API first, fall back to clubelo.com
    const results: EloEntry[] = [];

    // ClubElo provides a CSV dump at http://api.clubelo.com/{date}
    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(`http://api.clubelo.com/${today}`, {
      headers: { "User-Agent": "WC2026-Predictor/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const csv = await response.text();
      const lines = csv.split("\n");

      // ClubElo is club-level, not national teams
      // Fall back to our mapping approach
      for (const line of lines) {
        const parts = line.split(",");
        if (parts.length < 4) continue;
        const country = parts[1]?.trim();
        const elo = parseFloat(parts[3]);
        if (!country || isNaN(elo)) continue;

        const teamId = resolveTeamId(country);
        if (teamId && WC_TEAM_IDS.has(teamId)) {
          // Only add if we don't already have this team (take first/highest)
          if (!results.find((r) => r.teamId === teamId)) {
            results.push({ teamId, elo: Math.round(elo) });
          }
        }
      }
    }

    // If we got fewer than 20 teams from ClubElo (it's club-level),
    // return whatever we got — frontend falls back to static data
    if (results.length === 0) {
      // Fallback: try eloratings.net (national team Elo)
      const fallbackRes = await fetch("https://www.eloratings.net/latest.tsv", {
        headers: { "User-Agent": "WC2026-Predictor/1.0" },
        signal: AbortSignal.timeout(10000),
      }).catch(() => null);

      if (fallbackRes?.ok) {
        const tsv = await fallbackRes.text();
        for (const line of tsv.split("\n")) {
          const parts = line.split("\t");
          if (parts.length < 3) continue;
          const name = parts[1]?.trim();
          const elo = parseFloat(parts[2]);
          if (!name || isNaN(elo)) continue;

          const teamId = resolveTeamId(name);
          if (teamId && WC_TEAM_IDS.has(teamId)) {
            results.push({ teamId, elo: Math.round(elo) });
          }
        }
      }
    }

    return res.status(200).json({
      teams: results,
      source: results.length > 0 ? "live" : "unavailable",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(200).json({
      teams: [],
      source: "unavailable",
      timestamp: new Date().toISOString(),
      error: safeErrorMessage("api/elo", error),
    });
  }
}
