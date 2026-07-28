/* global describe, it, expect */

const { isDateInRange, weekendRanges } = require("../utils/email");

describe("support delayed periods", () => {
  it("excludes the instant before the summer support period", () => {
    expect(isDateInRange(new Date("2026-07-31T21:59:59.999Z"), weekendRanges)).toBe(false);
  });

  it("includes the start of August 1st in Paris", () => {
    expect(isDateInRange(new Date("2026-07-31T22:00:00.000Z"), weekendRanges)).toBe(true);
  });

  it("includes September 1st", () => {
    expect(isDateInRange(new Date("2026-09-01T12:00:00.000Z"), weekendRanges)).toBe(true);
  });

  it("includes the end of September 1st in Paris", () => {
    expect(isDateInRange(new Date("2026-09-01T21:59:59.999Z"), weekendRanges)).toBe(true);
  });

  it("excludes September 2nd in Paris", () => {
    expect(isDateInRange(new Date("2026-09-01T22:00:00.000Z"), weekendRanges)).toBe(false);
  });
});
