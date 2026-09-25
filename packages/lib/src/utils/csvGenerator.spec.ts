import { neutralizeSpreadsheetFormula, neutralizeSpreadsheetRow } from "./csvGenerator";

describe("neutralizeSpreadsheetFormula", () => {
  it.each(["=1+1", "+33 6 00", "-2", "@SUM(A1)", "\tx", "\rx"])("préfixe %j d'une apostrophe", (value) => {
    expect(neutralizeSpreadsheetFormula(value)).toBe(`'${value}`);
  });

  it.each(["Dupont", "", "a=b", "06 00 00 00 00"])("laisse %j intact", (value) => {
    expect(neutralizeSpreadsheetFormula(value)).toBe(value);
  });

  it("ne touche pas aux valeurs non textuelles", () => {
    expect(neutralizeSpreadsheetFormula(-2)).toBe(-2);
    expect(neutralizeSpreadsheetFormula(null)).toBe(null);
    expect(neutralizeSpreadsheetFormula(undefined)).toBe(undefined);
  });
});

describe("neutralizeSpreadsheetRow", () => {
  it("traite les lignes objet et tableau", () => {
    expect(neutralizeSpreadsheetRow({ a: "=1", b: 2 })).toEqual({ a: "'=1", b: 2 });
    expect(neutralizeSpreadsheetRow(["=1", "x"])).toEqual(["'=1", "x"]);
  });
});
