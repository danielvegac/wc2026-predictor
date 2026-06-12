// ============================================================
// useLiveData — Fetch live data from Vercel API routes
// ============================================================
// On mount: fetches Polymarket odds, Elo ratings, and match results.
// Falls back to static data silently on failure.

import { useState, useCallback, useEffect } from "react";
import { useResultsStore } from "../store/resultsStore";
import type { MatchResult } from "../store/resultsStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

interface PolymarketLiveData {
  outcomes: { teamId: string; probability: number }[];
  source: "live" | "unavailable";
  timestamp: string;
}

interface LiveDataState {
  polymarket: PolymarketLiveData | null;
  lastUpdated: Date | null;
  loading: boolean;
  isLive: boolean;
}

export function useLiveData() {
  const [state, setState] = useState<LiveDataState>({
    polymarket: null,
    lastUpdated: null,
    loading: false,
    isLive: false,
  });
  const setResults = useResultsStore((s) => s.setResults);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    let anyLive = false;

    // Fetch all three in parallel
    const [polyRes, resultsRes] = await Promise.allSettled([
      fetch(`${API_BASE}/api/polymarket`).then((r) => r.json()),
      fetch(`${API_BASE}/api/results`).then((r) => r.json()),
    ]);

    // Polymarket
    if (polyRes.status === "fulfilled") {
      const data = polyRes.value as PolymarketLiveData;
      if (data.source === "live" && data.outcomes.length > 0) {
        anyLive = true;
        setState((prev) => ({ ...prev, polymarket: data }));
      }
    }

    // Match results
    if (resultsRes.status === "fulfilled") {
      const data = resultsRes.value as {
        matches: MatchResult[];
        source: "live" | "unavailable";
      };
      if (data.matches.length > 0) {
        setResults(data.matches, data.source);
        if (data.source === "live") anyLive = true;
      }
    }

    setState((prev) => ({
      ...prev,
      loading: false,
      lastUpdated: new Date(),
      isLive: anyLive,
    }));
  }, [setResults]);

  // Auto-fetch on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
