import { describe, it, expect } from "vitest";
import { pad, formatDateBR, weekdayOf, datasDoMes } from "./dates.js";

describe("pad", () => {
  it("pads single digits with a leading zero", () => {
    expect(pad(5)).toBe("05");
    expect(pad(12)).toBe("12");
  });
});

describe("formatDateBR", () => {
  it("formats an ISO date as DD/MM", () => {
    expect(formatDateBR("2026-03-05")).toBe("05/03");
  });
});

describe("weekdayOf", () => {
  it("returns the JS getDay() index for an ISO date", () => {
    expect(weekdayOf("2026-03-01")).toBe(0); // Sunday
  });
});

describe("datasDoMes", () => {
  it("returns every date in the month matching the selected weekdays", () => {
    // March 2026: Sundays fall on 1, 8, 15, 22, 29
    const datas = datasDoMes(2026, 2, new Set([0]));
    expect(datas).toEqual([
      "2026-03-01", "2026-03-08", "2026-03-15", "2026-03-22", "2026-03-29",
    ]);
  });

  it("returns an empty array when no weekday is selected", () => {
    expect(datasDoMes(2026, 2, new Set())).toEqual([]);
  });

  it("returns 4 dates for a 4-Sunday month instead of assuming a fixed count", () => {
    // February 2026 (month index 1): Sundays fall on 1, 8, 15, 22 — only 4, unlike March's 5.
    expect(datasDoMes(2026, 1, new Set([0]))).toEqual([
      "2026-02-01", "2026-02-08", "2026-02-15", "2026-02-22",
    ]);
  });

  it("combines multiple selected weekdays in date order", () => {
    // March 2026: Sundays (0) on 1,8,15,22,29; Wednesdays (3) on 4,11,18,25.
    expect(datasDoMes(2026, 2, new Set([0, 3]))).toEqual([
      "2026-03-01", "2026-03-04", "2026-03-08", "2026-03-11",
      "2026-03-15", "2026-03-18", "2026-03-22", "2026-03-25", "2026-03-29",
    ]);
  });
});
