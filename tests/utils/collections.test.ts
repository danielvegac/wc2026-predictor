import { describe, it, expect } from "vitest";
import { indexBy, toMap, sortByDesc } from "../../src/utils/collections";

describe("indexBy", () => {
  it("keys each item by the derived key", () => {
    const items = [
      { id: "a", n: 1 },
      { id: "b", n: 2 },
    ];
    const map = indexBy(items, (x) => x.id);
    expect(map.get("a")).toEqual({ id: "a", n: 1 });
    expect(map.get("b")).toEqual({ id: "b", n: 2 });
    expect(map.size).toBe(2);
  });

  it("keeps the last item when keys collide", () => {
    const map = indexBy(
      [
        { id: "a", n: 1 },
        { id: "a", n: 2 },
      ],
      (x) => x.id
    );
    expect(map.get("a")).toEqual({ id: "a", n: 2 });
  });
});

describe("toMap", () => {
  it("derives both key and value", () => {
    const map = toMap(
      [{ id: "a", prob: 10 }, { id: "b", prob: 20 }],
      (x) => x.id,
      (x) => x.prob
    );
    expect(map.get("a")).toBe(10);
    expect(map.get("b")).toBe(20);
  });
});

describe("sortByDesc", () => {
  it("returns a new array sorted descending by the selector", () => {
    const input = [{ p: 1 }, { p: 3 }, { p: 2 }];
    const out = sortByDesc(input, (x) => x.p);
    expect(out.map((x) => x.p)).toEqual([3, 2, 1]);
  });

  it("does not mutate the input", () => {
    const input = [{ p: 1 }, { p: 3 }, { p: 2 }];
    sortByDesc(input, (x) => x.p);
    expect(input.map((x) => x.p)).toEqual([1, 3, 2]);
  });
});
