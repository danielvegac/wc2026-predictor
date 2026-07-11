// ============================================================
// Track Record Aggregation — shared date/stage lookups and
// matchday/stage aggregation logic for the Model Track Record
// table and the Points Comparison chart.
// ============================================================

import { groupStageSchedule } from "../data/schedule";
import { knockoutMatches, type KnockoutMatch } from "../data/knockoutMatches";
import type { Stage } from "../types";

export const STAGE_ORDER: Stage[] = [
  "group",
  "round32",
  "round16",
  "quarterfinal",
  "semifinal",
  "third_place",
  "final",
];

export const STAGE_LABELS: Record<Stage, string> = {
  group: "Group Stage",
  round32: "Round of 32",
  round16: "Round of 16",
  quarterfinal: "Quarterfinal",
  semifinal: "Semifinal",
  third_place: "Third Place",
  final: "Final",
};

const ROUND_TO_STAGE: Record<KnockoutMatch["round"], Stage> = {
  R32: "round32",
  R16: "round16",
  QF: "quarterfinal",
  SF: "semifinal",
  "3P": "third_place",
  F: "final",
};

export interface MatchDateStage {
  date: string;
  stage: Stage;
}

/** Lookup of matchId → { date, stage } across group stage + knockout matches */
export function getMatchDateStageMap(): Map<string, MatchDateStage> {
  const map = new Map<string, MatchDateStage>();
  for (const m of groupStageSchedule) {
    map.set(m.id, { date: m.date, stage: m.stage });
  }
  for (const ko of knockoutMatches) {
    map.set(ko.matchId, { date: ko.date, stage: ROUND_TO_STAGE[ko.round] });
  }
  return map;
}

/** Format a "YYYY-MM-DD" date as "Jun 11" */
export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export interface ScoredMatchRow {
  matchId: string;
  userPts: number;
  modelPts: number;
}

export interface AggregatedChartPoint {
  label: string;
  userPts: number;
  modelPts: number;
  cumUser: number;
  cumModel: number;
}

export interface AggregatedTableRow {
  key: string;
  label: string;
  matches: number;
  userPts: number;
  modelPts: number;
  leader: "You" | "Model" | "Tie";
}

export interface Aggregation {
  chartData: AggregatedChartPoint[];
  tableRows: AggregatedTableRow[];
  userGrandTotal: number;
  modelGrandTotal: number;
}

function buildAggregation<T extends ScoredMatchRow>(
  rows: T[],
  keyFn: (matchId: string) => { key: string; label: string; sortValue: string | number } | null
): Aggregation {
  const byKey = new Map<string, { label: string; sortValue: string | number; rows: T[] }>();
  for (const r of rows) {
    const info = keyFn(r.matchId);
    if (!info) continue;
    if (!byKey.has(info.key)) {
      byKey.set(info.key, { label: info.label, sortValue: info.sortValue, rows: [] });
    }
    byKey.get(info.key)!.rows.push(r);
  }

  const sortedEntries = [...byKey.entries()].sort((a, b) => {
    const av = a[1].sortValue;
    const bv = b[1].sortValue;
    return av < bv ? -1 : av > bv ? 1 : 0;
  });

  let cumUser = 0;
  let cumModel = 0;
  const chartData: AggregatedChartPoint[] = [];
  const tableRows: AggregatedTableRow[] = [];

  for (const [key, bucket] of sortedEntries) {
    const bucketUser = bucket.rows.reduce((s, r) => s + r.userPts, 0);
    const bucketModel = bucket.rows.reduce((s, r) => s + r.modelPts, 0);
    cumUser += bucketUser;
    cumModel += bucketModel;

    chartData.push({
      label: bucket.label,
      userPts: bucketUser,
      modelPts: bucketModel,
      cumUser,
      cumModel,
    });
    tableRows.push({
      key,
      label: bucket.label,
      matches: bucket.rows.length,
      userPts: bucketUser,
      modelPts: bucketModel,
      leader: bucketUser > bucketModel ? "You" : bucketModel > bucketUser ? "Model" : "Tie",
    });
  }

  return { chartData, tableRows, userGrandTotal: cumUser, modelGrandTotal: cumModel };
}

export function aggregateByMatchday<T extends ScoredMatchRow>(
  rows: T[],
  dateStageMap: Map<string, MatchDateStage>
): Aggregation {
  return buildAggregation(rows, (matchId) => {
    const info = dateStageMap.get(matchId);
    if (!info) {
      console.warn(`[trackRecordAggregation] missing date/stage for match ${matchId}`);
      return null;
    }
    return { key: info.date, label: formatShortDate(info.date), sortValue: info.date };
  });
}

export function aggregateByStage<T extends ScoredMatchRow>(
  rows: T[],
  dateStageMap: Map<string, MatchDateStage>
): Aggregation {
  return buildAggregation(rows, (matchId) => {
    const info = dateStageMap.get(matchId);
    if (!info) {
      console.warn(`[trackRecordAggregation] missing date/stage for match ${matchId}`);
      return null;
    }
    return { key: info.stage, label: STAGE_LABELS[info.stage], sortValue: STAGE_ORDER.indexOf(info.stage) };
  });
}
