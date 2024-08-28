import { readCSVBuffer } from "./fileService";
import { ERRORS } from "snu-lib";

describe("readCSVBuffer", () => {
  it("should parse well-formed CSV data with headers into an array of objects", async () => {
    const csvBuffer = Buffer.from("classe,cohort\n1-cl,1-co\n2-cl,2-co");
    const expectedResult = [
      { classe: "1-cl", cohort: "1-co" },
      { classe: "2-cl", cohort: "2-co" },
    ];

    const result = await readCSVBuffer(csvBuffer, true);
    expect(result).toEqual(expectedResult);
  });

  it("should parse well-formed CSV data without headers into an array of objects", async () => {
    const csvBuffer = Buffer.from("1-cl,1-co\n2-cl,2-co");
    const expectedResult = [
      ["1-cl", "1-co"],
      ["2-cl", "2-co"],
    ];

    const result = await readCSVBuffer(csvBuffer, false);
    expect(result).toEqual(expectedResult);
  });
  it("should reject on parsing failures", async () => {
    const badCsvBuffer = Buffer.from("header\nJohn,Twenty,55");
    const result = readCSVBuffer(badCsvBuffer, true);
    await expect(result).rejects.toThrow(ERRORS.CANNOT_PARSE_CSV);
  });
});
