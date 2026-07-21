// /api/polymarket — Fetch live World Cup Winner odds from Polymarket
// Source: Polymarket CLOB API (public, no auth)
// Cache: 1 hour (markets update frequently)

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { resolveTeamId, WC_TEAM_IDS } from "./_teamMapping.js";
import { handleCorsAndMethod, safeErrorMessage } from "./_http.js";

interface PolymarketOutcome {
  teamId: string;
  probability: number;
}

// Polymarket uses a condition_id / token structure
// The World Cup Winner market can be found via their search API
const POLYMARKET_GAMMA_URL = "https://gamma-api.polymarket.com/events";
const SEARCH_QUERY = "FIFA World Cup 2026 Winner";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCorsAndMethod(req, res)) return;
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");

  try {
    // Search for the World Cup Winner market via Gamma API
    const searchUrl = `${POLYMARKET_GAMMA_URL}?title=${encodeURIComponent(SEARCH_QUERY)}&closed=false&limit=5`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        "User-Agent": "WC2026-Predictor/1.0",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!searchRes.ok) {
      console.error(`[api/polymarket] Gamma API returned ${searchRes.status}`);
      return res.status(200).json({
        outcomes: [],
        source: "unavailable",
        timestamp: new Date().toISOString(),
        error: "upstream data source unavailable",
      });
    }

    const events = await searchRes.json() as Array<{
      markets?: Array<{
        outcomes?: string;
        outcomePrices?: string;
        question?: string;
      }>;
    }>;

    const results: PolymarketOutcome[] = [];

    // Find the World Cup winner market within the event
    for (const event of events) {
      if (!event.markets) continue;

      for (const market of event.markets) {
        // Parse outcomes and prices
        let outcomes: string[] = [];
        let prices: string[] = [];

        try {
          if (market.outcomes) outcomes = JSON.parse(market.outcomes) as string[];
          if (market.outcomePrices) prices = JSON.parse(market.outcomePrices) as string[];
        } catch (parseError) {
          console.warn(
            `[api/polymarket] Skipping market with unparseable outcomes (${market.question ?? "unknown"}):`,
            parseError
          );
          continue;
        }

        for (let i = 0; i < outcomes.length; i++) {
          const teamName = outcomes[i];
          const price = parseFloat(prices[i] ?? "0");
          if (!teamName || isNaN(price)) continue;

          const teamId = resolveTeamId(teamName);
          if (teamId && WC_TEAM_IDS.has(teamId)) {
            results.push({
              teamId,
              probability: Math.round(price * 10000) / 100, // Convert 0.17 → 17.0%
            });
          }
        }
      }

      // Stop after first matching event with results
      if (results.length > 0) break;
    }

    return res.status(200).json({
      outcomes: results.sort((a, b) => b.probability - a.probability),
      source: results.length > 0 ? "live" : "unavailable",
      timestamp: new Date().toISOString(),
      volume: "$1.26B+",
    });
  } catch (error) {
    console.error("[api/polymarket] Failed to fetch odds:", error);
    return res.status(200).json({
      outcomes: [],
      source: "unavailable",
      timestamp: new Date().toISOString(),
      error: safeErrorMessage("api/polymarket", error),
    });
  }
}
