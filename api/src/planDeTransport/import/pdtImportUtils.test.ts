import { computeMergedBusIds, getMergedBusIdsFromLigneBus } from "./pdtImportUtils";
import { IBus } from "../../models/PlanDeTransport/ligneBus.type";

describe("pdtImportUtils getMergedBusIdsFromLigneBus", () => {
  it("should return all mergedBusIds for every busId (simple)", () => {
    const lines = [
      { busId: "A", mergedBusIds: ["A", "B"] },
      { busId: "B", mergedBusIds: ["A", "B"] },
      { busId: "C", mergedBusIds: undefined },
    ] as IBus[];

    const result = getMergedBusIdsFromLigneBus(lines);

    expect(result).toEqual({
      A: ["A", "B"],
      B: ["A", "B"],
      C: [],
    });
  });
  it("should return all mergedBusIds for every busId (outdated)", () => {
    const lines = [{ busId: "A", mergedBusIds: ["B"] }, { busId: "B", mergedBusIds: [] }, null] as IBus[];

    const result = getMergedBusIdsFromLigneBus(lines);

    expect(result).toEqual({
      A: ["A", "B"],
      B: ["A", "B"],
    });
  });
});

describe("pdtImportUtils computeMergedBusIds", () => {
  it("should return all mergedBusIds for every busId (simple)", () => {
    const lines = [
      { "NUMERO DE LIGNE": "A", "LIGNES FUSIONNÉES": "B" },
      { "NUMERO DE LIGNE": "B", "LIGNES FUSIONNÉES": "" },
      { "NUMERO DE LIGNE": "C", "LIGNES FUSIONNÉES": "" },
    ];

    const result = computeMergedBusIds(lines);

    expect(result).toEqual({
      A: ["A", "B"],
      B: ["A", "B"],
      C: [],
    });
  });

  it("should return all mergedBusIds for every busId (simple mirrored)", () => {
    const lines = [
      { "NUMERO DE LIGNE": "A", "LIGNES FUSIONNÉES": "B" },
      { "NUMERO DE LIGNE": "B", "LIGNES FUSIONNÉES": "A" },
      { "NUMERO DE LIGNE": "C", "LIGNES FUSIONNÉES": "" },
    ];

    const result = computeMergedBusIds(lines);

    expect(result).toEqual({
      A: ["A", "B"],
      B: ["A", "B"],
      C: [],
    });
  });

  it("should return all mergedBusIds for every busId (double)", () => {
    const lines = [
      { "NUMERO DE LIGNE": "A", "LIGNES FUSIONNÉES": "B" },
      { "NUMERO DE LIGNE": "B", "LIGNES FUSIONNÉES": "C" },
      { "NUMERO DE LIGNE": "C", "LIGNES FUSIONNÉES": "" },
      { "NUMERO DE LIGNE": "D", "LIGNES FUSIONNÉES": "" },
    ];

    const result = computeMergedBusIds(lines);

    expect(result).toEqual({
      A: ["A", "B", "C"],
      B: ["A", "B", "C"],
      C: ["A", "B", "C"],
      D: [],
    });
  });
  it("should return all mergedBusIds for every busId (double-bis)", () => {
    const lines = [
      { "NUMERO DE LIGNE": "A", "LIGNES FUSIONNÉES": "B" },
      { "NUMERO DE LIGNE": "B", "LIGNES FUSIONNÉES": "C,D" },
      { "NUMERO DE LIGNE": "C", "LIGNES FUSIONNÉES": "" },
      { "NUMERO DE LIGNE": "D", "LIGNES FUSIONNÉES": "" },
    ];

    const result = computeMergedBusIds(lines);

    expect(result).toEqual({
      A: ["A", "B", "C", "D"],
      B: ["A", "B", "C", "D"],
      C: ["A", "B", "C", "D"],
      D: ["A", "B", "C", "D"],
    });
  });

  it("should return all mergedBusIds for every busId (triple)", () => {
    const lines = [
      { "NUMERO DE LIGNE": "A", "LIGNES FUSIONNÉES": "B" },
      { "NUMERO DE LIGNE": "B", "LIGNES FUSIONNÉES": "C" },
      { "NUMERO DE LIGNE": "C", "LIGNES FUSIONNÉES": "D" },
      { "NUMERO DE LIGNE": "D", "LIGNES FUSIONNÉES": "" },
    ];

    const result = computeMergedBusIds(lines);

    expect(result).toEqual({
      A: ["A", "B", "C", "D"],
      B: ["A", "B", "C", "D"],
      C: ["A", "B", "C", "D"],
      D: ["A", "B", "C", "D"],
    });
  });

  it("should return all mergedBusIds for every busId (mixed)", () => {
    const lines = [
      { "NUMERO DE LIGNE": "A", "LIGNES FUSIONNÉES": "B" },
      { "NUMERO DE LIGNE": "B", "LIGNES FUSIONNÉES": "" },
      { "NUMERO DE LIGNE": "C", "LIGNES FUSIONNÉES": "B,D" },
      { "NUMERO DE LIGNE": "D", "LIGNES FUSIONNÉES": "" },
    ];

    const result = computeMergedBusIds(lines);

    expect(result).toEqual({
      A: ["A", "B", "C", "D"],
      B: ["A", "B", "C", "D"],
      C: ["A", "B", "C", "D"],
      D: ["A", "B", "C", "D"],
    });
  });

  it("should return all mergedBusIds with old lines", () => {
    const lines = [
      { "NUMERO DE LIGNE": "C", "LIGNES FUSIONNÉES": "B,D" },
      { "NUMERO DE LIGNE": "D", "LIGNES FUSIONNÉES": "" },
    ];

    const oldLines = {
      A: ["A", "B"],
      B: ["A", "B"],
    };
    const result = computeMergedBusIds(lines, oldLines);

    expect(result).toEqual({
      A: ["A", "B", "C", "D"],
      B: ["A", "B", "C", "D"],
      C: ["A", "B", "C", "D"],
      D: ["A", "B", "C", "D"],
    });
  });

  it('should handle empty "LIGNES FUSIONNÉES"', () => {
    const lines = [
      { "NUMERO DE LIGNE": "A", "LIGNES FUSIONNÉES": "" },
      { "NUMERO DE LIGNE": "B", "LIGNES FUSIONNÉES": "" },
    ];

    const result = computeMergedBusIds(lines);

    expect(result).toEqual({ A: [], B: [] });
  });

  it('should handle missing "LIGNES FUSIONNÉES"', () => {
    const lines = [{ "NUMERO DE LIGNE": "A" }];

    const result = computeMergedBusIds(lines);

    expect(result).toEqual({ A: [] });
  });
});
