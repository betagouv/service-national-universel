import { generateCSVStream, getHeaders, readCSVBuffer, streamToBuffer } from "./fileService";
import { ERRORS } from "snu-lib";

describe("readCSVBuffer", () => {
  it("should parse well-formed CSV data with headers into an array of objects", async () => {
    const csvBuffer = Buffer.from("classe,cohort\n1-cl,1-co\n2-cl,2-co");
    const expectedResult = [
      { classe: "1-cl", cohort: "1-co" },
      { classe: "2-cl", cohort: "2-co" },
    ];

    const result = await readCSVBuffer(csvBuffer);
    expect(result).toEqual(expectedResult);
  });

  it("should parse well-formed CSV data without headers into an array of objects", async () => {
    const csvBuffer = Buffer.from("1-cl,1-co\n2-cl,2-co");
    const expectedResult = [
      ["1-cl", "1-co"],
      ["2-cl", "2-co"],
    ];

    const result = await readCSVBuffer(csvBuffer, { headers: false });
    expect(result).toEqual(expectedResult);
  });
  it("should reject on parsing failures", async () => {
    const badCsvBuffer = Buffer.from("header\nJohn,Twenty,55");
    const result = readCSVBuffer(badCsvBuffer);
    await expect(result).rejects.toThrow(ERRORS.CANNOT_PARSE_CSV);
  });
});

describe("getHeaders", () => {
  it("should return an array of unique headers from an array of objects", () => {
    const data = [
      { name: "John", age: 30, city: "New York" },
      { name: "Jane", age: 28, city: "London" },
      { name: "Bob", age: 35, city: "Paris" },
    ];
    const expectedResult = ["name", "age", "city"];

    const result = getHeaders(data);
    expect(result).toEqual(expectedResult);
  });

  it("should return an empty array if the input array is empty", () => {
    const data: any[] = [];
    const expectedResult: string[] = [];

    const result = getHeaders(data);
    expect(result).toEqual(expectedResult);
  });

  it("should return an array with a single header if all objects have the same header", () => {
    const data = [{ name: "John" }, { name: "Jane" }, { name: "Bob" }];
    const expectedResult = ["name"];

    const result = getHeaders(data);
    expect(result).toEqual(expectedResult);
  });

  it("should return an array with unique headers even if some objects have missing headers", () => {
    const data = [{ name: "John", age: 30 }, { name: "Jane" }, { name: "Bob", city: "Paris" }];
    const expectedResult = ["name", "age", "city"];

    const result = getHeaders(data);
    expect(result).toEqual(expectedResult);
  });
});

describe("generateCSVStream", () => {
  it("neutralise les cellules qu'un tableur lirait comme des formules (L36)", async () => {
    const data = [
      { nom: "=1+1", ville: "+33 Brest", note: "-2", contact: "@SUM(A1)", tab: "\tx", cr: "\rx" },
      { nom: "Dupont", ville: "Brest", note: -2, contact: "a@b.fr", tab: "x", cr: "x" },
    ];
    const csv = (await streamToBuffer(generateCSVStream(data))).toString("utf-8");
    const [, dangereuse, saine] = csv.split("\n");
    expect(dangereuse).toBe(`'=1+1,'+33 Brest,'-2,'@SUM(A1),'\tx,"'\rx"`);
    expect(saine).toBe("Dupont,Brest,-2,a@b.fr,x,x");
  });
});
