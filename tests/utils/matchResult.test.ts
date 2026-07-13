import { describe, it, expect } from "vitest";
import {
  getMatchResult,
  parseScoreline,
  extractScoreline,
  getResultBorderClass,
} from "../../src/utils/matchResult";

describe("getMatchResult", () => {
  it("classifies home win, away win and draw", () => {
    expect(getMatchResult(2, 1)).toBe("home");
    expect(getMatchResult(0, 3)).toBe("away");
    expect(getMatchResult(1, 1)).toBe("draw");
  });
});

describe("parseScoreline", () => {
  it("parses a plain hyphen scoreline", () => {
    expect(parseScoreline("2-1")).toEqual([2, 1]);
  });

  it("parses an en dash with surrounding text", () => {
    expect(parseScoreline("2 – 0 Spain")).toEqual([2, 0]);
  });

  it("returns null when no scoreline is present", () => {
    expect(parseScoreline("Draw expected")).toBeNull();
  });
});

describe("extractScoreline", () => {
  it("extracts the scoreline substring", () => {
    expect(extractScoreline("2-0 Spain")).toBe("2-0");
  });

  it("falls back to the original text when none is found", () => {
    expect(extractScoreline("TBD")).toBe("TBD");
  });
});

describe("getResultBorderClass", () => {
  it("maps outcome to the expected border color", () => {
    expect(getResultBorderClass(2, 1)).toBe("border-accent-green/40");
    expect(getResultBorderClass(0, 2)).toBe("border-accent-red/40");
    expect(getResultBorderClass(1, 1)).toBe("border-accent-gold/40");
  });
});
