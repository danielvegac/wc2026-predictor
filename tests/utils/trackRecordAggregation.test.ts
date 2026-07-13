// ============================================================
// Track Record Aggregation Tests
// ============================================================

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  STAGE_ORDER,
  STAGE_LABELS,
  getMatchDateStageMap,
  formatShortDate,
  aggregateByMatchday,
  aggregateByStage,
  type MatchDateStage,
  type ScoredMatchRow,
} from "../../src/utils/trackRecordAggregation";
import type { Stage } from "../../src/types";

describe("stage metadata", () => {
  it("has a label for every stage in STAGE_ORDER", () => {
    for (const stage of STAGE_ORDER) {
      expect(STAGE_LABELS[stage]).toBeTruthy();
    }
  });

  it("orders group before the final", () => {
    expect(STAGE_ORDER.indexOf("group")).toBeLessThan(STAGE_ORDER.indexOf("final"));
  });
});

describe("getMatchDateStageMap", () => {
  it("builds a non-empty lookup covering group and knockout matches", () => {
    const map = getMatchDateStageMap();
    expect(map.size).toBeGreaterThan(0);
    const stages = new Set([...map.values()].map((v) => v.stage));
    expect(stages.has("group")).toBe(true);
  });

  it("returns entries with a date string and a valid stage", () => {
    const map = getMatchDateStageMap();
    for (const { date, stage } of map.values()) {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(STAGE_ORDER).toContain(stage);
    }
  });
});

describe("formatShortDate", () => {
  it("formats an ISO date as 'Mon D'", () => {
    expect(formatShortDate("2026-06-11")).toBe("Jun 11");
    expect(formatShortDate("2026-07-19")).toBe("Jul 19");
  });
});

describe("aggregateByMatchday", () => {
  const map = new Map<string, MatchDateStage>([
    ["m1", { date: "2026-06-11", stage: "group" }],
    ["m2", { date: "2026-06-11", stage: "group" }],
    ["m3", { date: "2026-06-12", stage: "group" }],
  ]);

  const rows: ScoredMatchRow[] = [
    { matchId: "m1", userPts: 5, modelPts: 3 },
    { matchId: "m2", userPts: 2, modelPts: 4 },
    { matchId: "m3", userPts: 6, modelPts: 6 },
  ];

  it("buckets rows by date and computes per-bucket + cumulative totals", () => {
    const { chartData, tableRows, userGrandTotal, modelGrandTotal } =
      aggregateByMatchday(rows, map);

    expect(chartData).toHaveLength(2);
    expect(chartData[0]).toMatchObject({
      label: "Jun 11",
      userPts: 7,
      modelPts: 7,
      cumUser: 7,
      cumModel: 7,
    });
    expect(chartData[1]).toMatchObject({
      label: "Jun 12",
      userPts: 6,
      modelPts: 6,
      cumUser: 13,
      cumModel: 13,
    });

    expect(tableRows[0].matches).toBe(2);
    expect(userGrandTotal).toBe(13);
    expect(modelGrandTotal).toBe(13);
  });

  it("labels the bucket leader correctly", () => {
    const { tableRows } = aggregateByMatchday(rows, map);
    // Jun 11: user 7 vs model 7 -> Tie
    expect(tableRows[0].leader).toBe("Tie");
  });

  it("assigns the leader to the higher scorer", () => {
    const uneven = new Map<string, MatchDateStage>([
      ["a", { date: "2026-06-11", stage: "group" }],
      ["b", { date: "2026-06-12", stage: "group" }],
    ]);
    const { tableRows } = aggregateByMatchday(
      [
        { matchId: "a", userPts: 9, modelPts: 1 },
        { matchId: "b", userPts: 0, modelPts: 5 },
      ],
      uneven
    );
    expect(tableRows.find((r) => r.label === "Jun 11")!.leader).toBe("You");
    expect(tableRows.find((r) => r.label === "Jun 12")!.leader).toBe("Model");
  });

  it("skips rows with no date/stage entry and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { chartData, userGrandTotal } = aggregateByMatchday(
      [{ matchId: "missing", userPts: 5, modelPts: 5 }],
      map
    );
    expect(chartData).toHaveLength(0);
    expect(userGrandTotal).toBe(0);
    expect(warn).toHaveBeenCalled();
  });

  afterEach(() => vi.restoreAllMocks());
});

describe("aggregateByStage", () => {
  const map = new Map<string, MatchDateStage>([
    ["kf", { date: "2026-07-19", stage: "final" }],
    ["mg", { date: "2026-06-11", stage: "group" }],
  ]);

  it("orders buckets by STAGE_ORDER, not by insertion or date", () => {
    const { tableRows } = aggregateByStage(
      [
        { matchId: "kf", userPts: 3, modelPts: 1 },
        { matchId: "mg", userPts: 2, modelPts: 2 },
      ],
      map
    );
    expect(tableRows.map((r) => r.key)).toEqual<Stage[]>(["group", "final"]);
    expect(tableRows[0].label).toBe(STAGE_LABELS.group);
  });
});
