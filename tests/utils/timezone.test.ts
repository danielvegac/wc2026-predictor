import { describe, it, expect } from "vitest";
import { formatDateLabelCOT, parseKickoffMinutesCOT } from "../../src/utils/timezone";
import { knockoutMatches } from "../../src/data/knockoutMatches";

describe("formatDateLabelCOT", () => {
  it("labels a date string with its own calendar day regardless of browser tz", () => {
    expect(formatDateLabelCOT("2026-06-30")).toBe("Tuesday, June 30");
    expect(formatDateLabelCOT("2026-06-29")).toBe("Monday, June 29");
    expect(formatDateLabelCOT("2026-07-01")).toBe("Wednesday, July 1");
  });
});

describe("parseKickoffMinutesCOT", () => {
  it("parses 12-hour COT kickoff strings to minutes since midnight", () => {
    expect(parseKickoffMinutesCOT("12:00 AM")).toBe(0);
    expect(parseKickoffMinutesCOT("2:00 PM")).toBe(14 * 60);
    expect(parseKickoffMinutesCOT("12:00 PM")).toBe(12 * 60);
  });
});

describe("knockout R32 schedule — Colombia time fixtures", () => {
  function find(matchId: string) {
    const m = knockoutMatches.find((k) => k.matchId === matchId);
    if (!m) throw new Error(`missing ${matchId}`);
    return m;
  }

  it("Ivory Coast vs Norway kicks off at 2:00 PM COT on June 30", () => {
    const m = find("R32-05");
    expect(m.date).toBe("2026-06-30");
    expect(m.kickoffCOT).toBe("2:00 PM");
  });

  it("France vs Sweden kicks off at 4:00 PM COT on June 30", () => {
    const m = find("R32-06");
    expect(m.date).toBe("2026-06-30");
    expect(m.kickoffCOT).toBe("4:00 PM");
  });

  it("Netherlands vs Morocco is on June 29, not June 30", () => {
    const m = find("R32-04");
    expect(m.date).toBe("2026-06-29");
    expect(m.kickoffCOT).toBe("8:00 PM");
  });

  it("Mexico vs Ecuador is on June 30, not July 1", () => {
    const m = find("R32-07");
    expect(m.date).toBe("2026-06-30");
    expect(m.kickoffCOT).toBe("8:00 PM");
  });
});
