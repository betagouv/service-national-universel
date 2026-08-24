import {
  birthdateMatches,
  decideMatch,
  firstNamesMatch,
  normalizeName,
  parseBeneficiaryRows,
  parseExcelDate,
  unmatchedCsvLine,
} from "../scripts/importRoadCodeRefund.helpers";

describe("normalizeName", () => {
  it("strip accents, hyphens and extra spaces", () => {
    expect(normalizeName("  Anne-Lucie ")).toBe("ANNE LUCIE");
    expect(normalizeName("LÉOXANDRE")).toBe("LEOXANDRE");
  });
});

describe("firstNamesMatch", () => {
  it("matches case and accents", () => {
    expect(firstNamesMatch("Mathieu", "MATHIEU")).toBe(true);
    expect(firstNamesMatch("LÉOXANDRE", "Léoxandre")).toBe(true);
  });

  it("matches extra given names as a prefix", () => {
    expect(firstNamesMatch("KHADIDIATOU DELFINA", "Khadidiatou")).toBe(true);
    expect(firstNamesMatch("Anne-Lucie", "Anne Lucie")).toBe(true);
  });

  it("does not match a shared prefix of a different first name", () => {
    expect(firstNamesMatch("Luc", "Lucas")).toBe(false);
  });
});

describe("birthdateMatches", () => {
  it("matches excel local midnight with a db date stored at UTC noon-ish", () => {
    const excel = new Date(2007, 5, 13, 0, 0, 0);
    const db = new Date("2007-06-13T11:00:00.000Z");
    expect(birthdateMatches(excel, db)).toBe(true);
  });

  it("matches a db date stored as UTC midnight", () => {
    const excel = new Date(2008, 8, 5, 0, 0, 0);
    const db = new Date("2008-09-05T00:00:00.000Z");
    expect(birthdateMatches(excel, db)).toBe(true);
  });

  it("rejects another day", () => {
    const excel = new Date(2007, 5, 13, 0, 0, 0);
    const db = new Date("2007-06-14T11:00:00.000Z");
    expect(birthdateMatches(excel, db)).toBe(false);
  });
});

describe("parseExcelDate", () => {
  it("parses Date, FR string and excel serial", () => {
    expect(parseExcelDate(new Date(2007, 5, 13))?.getFullYear()).toBe(2007);
    const fromFr = parseExcelDate("13/06/2007 00:00:00");
    expect(fromFr && fromFr.getFullYear() === 2007 && fromFr.getMonth() === 5 && fromFr.getDate() === 13).toBe(true);
    const fromSerial = parseExcelDate(39246);
    expect(fromSerial?.toISOString().slice(0, 10)).toBe("2007-06-13");
  });
});

describe("parseBeneficiaryRows", () => {
  it("reads the recap header and skips other sheets", () => {
    const rows = parseBeneficiaryRows([
      [
        ["PRISE EN CHARGE"],
        ["Nom des bénéficiaires", "Prénoms des bénéficiaires", "NEPH", "DATE DE NAISSANCE (jj/mm/année)", "Date de la session (jj/mm/année)"],
        ["RALAIMAZAVA", "Mathieu", "250494102260", new Date(2007, 5, 13), new Date(2026, 2, 2)],
        ["", "", "", "", ""],
      ],
      [["MEBARKIA", "LYNA", "250614200293", new Date(2007, 10, 18)]],
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].lastName).toBe("RALAIMAZAVA");
    expect(rows[0].firstName).toBe("Mathieu");
    expect(rows[0].neph).toBe("250494102260");
  });
});

describe("decideMatch", () => {
  const row = {
    line: 12,
    lastName: "RALAIMAZAVA",
    firstName: "Mathieu",
    neph: "1",
    birthdate: new Date(2007, 5, 13),
    examCenter: "La Poste",
    sessionDate: "",
  };

  it("returns NOT_FOUND, AMBIGUOUS, PHASE2_NOT_VALIDATED, ALREADY and MATCH", () => {
    expect(decideMatch(row, []).status).toBe("NOT_FOUND");
    expect(
      decideMatch(row, [
        { _id: "a", firstName: "Mathieu", birthdateAt: new Date("2007-06-13T11:00:00.000Z"), statusPhase2: "VALIDATED" },
        { _id: "b", firstName: "Mathieu", birthdateAt: new Date("2007-06-13T00:00:00.000Z"), statusPhase2: "VALIDATED" },
      ]).status,
    ).toBe("AMBIGUOUS");
    expect(
      decideMatch(row, [{ _id: "a", firstName: "Mathieu", birthdateAt: new Date("2007-06-13T11:00:00.000Z"), statusPhase2: "IN_PROGRESS" }]).status,
    ).toBe("PHASE2_NOT_VALIDATED");
    expect(
      decideMatch(row, [
        { _id: "a", firstName: "Mathieu", birthdateAt: new Date("2007-06-13T11:00:00.000Z"), statusPhase2: "VALIDATED", roadCodeRefund: "true" },
      ]).status,
    ).toBe("ALREADY");
    expect(
      decideMatch(row, [{ _id: "a", firstName: "Mathieu", birthdateAt: new Date("2007-06-13T11:00:00.000Z"), statusPhase2: "VALIDATED" }]).status,
    ).toBe("MATCH");
  });
});

describe("unmatchedCsvLine", () => {
  it("keeps the reason and ids", () => {
    const line = unmatchedCsvLine(
      {
        line: 12,
        lastName: "CHERON",
        firstName: "Lohan",
        neph: "251260100979",
        birthdate: new Date(2009, 4, 26),
        examCenter: "PONT STE MAXENCE",
        sessionDate: "2026-03-02",
      },
      "NOT_FOUND",
    );
    expect(line).toContain("NOT_FOUND");
    expect(line).toContain("CHERON");
  });
});
