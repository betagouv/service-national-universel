import {
  birthdateMatches,
  birthdateQueryRange,
  decideMatch,
  firstNamesMatch,
  lastNamesMatch,
  normalizeName,
  parseBeneficiaryRows,
  parseExcelDate,
  rankCloseCandidates,
  unmatchedCsvLine,
} from "../scripts/importRoadCodeRefund.helpers";

describe("normalizeName", () => {
  it("strip accents, hyphens and extra spaces", () => {
    expect(normalizeName("  Anne-Lucie ")).toBe("ANNE LUCIE");
    expect(normalizeName("LÉOXANDRE")).toBe("LEOXANDRE");
  });
});

describe("lastNamesMatch", () => {
  it("matches accents and case", () => {
    expect(lastNamesMatch("Garcia", "GARCIA")).toBe(true);
    expect(lastNamesMatch("Wehrlé", "WEHRLE")).toBe(true);
  });

  it("rejects a different last name", () => {
    expect(lastNamesMatch("CHERON", "RALAIMAZAVA")).toBe(false);
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

describe("birthdateQueryRange", () => {
  it("covers the calendar day plus timezone slack", () => {
    const range = birthdateQueryRange(new Date(2007, 5, 13, 0, 0, 0));
    expect(range.$gte.toISOString()).toBe("2007-06-12T00:00:00.000Z");
    expect(range.$lt.toISOString()).toBe("2007-06-15T00:00:00.000Z");
  });
});

describe("parseExcelDate", () => {
  it("parses Date, FR string and excel serial", () => {
    expect(parseExcelDate(new Date(2007, 5, 13))?.getFullYear()).toBe(2007);
    const fromFr = parseExcelDate("13/06/2007 00:00:00");
    expect(fromFr && fromFr.getFullYear() === 2007 && fromFr.getMonth() === 5 && fromFr.getDate() === 13).toBe(true);
    const fromSerial = parseExcelDate(39246);
    expect(fromSerial?.toISOString().slice(0, 10)).toBe("2007-06-13");
    expect(fromSerial && fromSerial.getFullYear() === 2007 && fromSerial.getMonth() === 5 && fromSerial.getDate() === 13).toBe(true);
  });
});

describe("parseBeneficiaryRows", () => {
  it("reads the recap header and skips other sheets", () => {
    const parsed = parseBeneficiaryRows([
      [
        ["PRISE EN CHARGE"],
        ["Nom des bénéficiaires", "Prénoms des bénéficiaires", "NEPH", "DATE DE NAISSANCE (jj/mm/année)", "Date de la session (jj/mm/année)"],
        ["RALAIMAZAVA", "Mathieu", "250494102260", new Date(2007, 5, 13), new Date(2026, 2, 2)],
        ["", "", "", "", ""],
      ],
      [["MEBARKIA", "LYNA", "250614200293", new Date(2007, 10, 18)]],
    ]);
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.issues).toHaveLength(0);
    expect(parsed.rows[0].lastName).toBe("RALAIMAZAVA");
    expect(parsed.rows[0].firstName).toBe("Mathieu");
  });

  it("records unreadable birthdates and missing names as issues", () => {
    const parsed = parseBeneficiaryRows([
      [
        ["Nom des bénéficiaires", "Prénoms des bénéficiaires", "NEPH", "DATE DE NAISSANCE (jj/mm/année)"],
        ["CHERON", "Lohan", "251260100979", "pas-une-date"],
        ["", "Lohan", "1", new Date(2009, 4, 26)],
      ],
    ]);
    expect(parsed.rows).toHaveLength(0);
    expect(parsed.issues.map((issue) => issue.reason)).toEqual(["INVALID_BIRTHDATE", "MISSING_NAME"]);
  });
});

describe("decideMatch", () => {
  const row = {
    line: 12,
    lastName: "RALAIMAZAVA",
    firstName: "Mathieu",
    birthdate: new Date(2007, 5, 13),
  };

  it("filters by birthdate then last name + first name", () => {
    expect(
      decideMatch(row, [
        { _id: "other", lastName: "CHERON", firstName: "Mathieu", birthdateAt: new Date("2007-06-13T11:00:00.000Z"), statusPhase2: "VALIDATED" },
        { _id: "a", lastName: "RALAIMAZAVA", firstName: "Mathieu", birthdateAt: new Date("2007-06-13T11:00:00.000Z"), statusPhase2: "VALIDATED" },
      ]).status,
    ).toBe("MATCH");
  });

  it("returns NOT_FOUND, AMBIGUOUS, PHASE2_NOT_VALIDATED, ALREADY and MATCH", () => {
    expect(decideMatch(row, []).status).toBe("NOT_FOUND");
    expect(
      decideMatch(row, [
        { _id: "a", lastName: "RALAIMAZAVA", firstName: "Mathieu", birthdateAt: new Date("2007-06-13T11:00:00.000Z"), statusPhase2: "VALIDATED" },
        { _id: "b", lastName: "RALAIMAZAVA", firstName: "Mathieu", birthdateAt: new Date("2007-06-13T00:00:00.000Z"), statusPhase2: "VALIDATED" },
      ]).status,
    ).toBe("AMBIGUOUS");
    expect(
      decideMatch(row, [
        { _id: "a", lastName: "RALAIMAZAVA", firstName: "Mathieu", birthdateAt: new Date("2007-06-13T11:00:00.000Z"), statusPhase2: "IN_PROGRESS" },
      ]).status,
    ).toBe("PHASE2_NOT_VALIDATED");
    expect(
      decideMatch(row, [
        {
          _id: "a",
          lastName: "RALAIMAZAVA",
          firstName: "Mathieu",
          birthdateAt: new Date("2007-06-13T11:00:00.000Z"),
          statusPhase2: "VALIDATED",
          roadCodeRefund: "true",
        },
      ]).status,
    ).toBe("ALREADY");
    expect(
      decideMatch(row, [
        { _id: "a", lastName: "RALAIMAZAVA", firstName: "Mathieu", birthdateAt: new Date("2007-06-13T11:00:00.000Z"), statusPhase2: "VALIDATED" },
      ]).status,
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
        birthdate: new Date(2009, 4, 26),
      },
      "NOT_FOUND",
    );
    expect(line).toContain("NOT_FOUND");
    expect(line).toContain("CHERON");
  });

  it("allows a missing birthdate for parse errors", () => {
    const line = unmatchedCsvLine({ line: 3, lastName: "X", firstName: "Y" }, "INVALID_BIRTHDATE");
    expect(line).toContain("INVALID_BIRTHDATE");
  });

  it("joins all candidate ids on AMBIGUOUS", () => {
    const line = unmatchedCsvLine(
      {
        line: 12,
        lastName: "RALAIMAZAVA",
        firstName: "Mathieu",
        birthdate: new Date(2007, 5, 13),
      },
      "AMBIGUOUS",
      [
        { _id: "id-a", statusPhase2: "VALIDATED" },
        { _id: "id-b", statusPhase2: "IN_PROGRESS" },
      ],
    );
    expect(line).toContain("AMBIGUOUS");
    expect(line).toContain("id-a;id-b");
  });
});

describe("rankCloseCandidates", () => {
  const row = {
    line: 1,
    lastName: "NDORIMANA-NIZIGAMA",
    firstName: "Dan-Marcus",
    birthdate: new Date(2008, 6, 2),
  };

  it("keeps a hyphenated last name token match with the same first name", () => {
    const ranked = rankCloseCandidates(row, [
      {
        _id: "a",
        lastName: "NDORIMANA",
        firstName: "Dan Marcus",
        birthdateAt: new Date("2008-07-02T00:00:00.000Z"),
        statusPhase2: "VALIDATED",
      },
      { _id: "b", lastName: "DUPONT", firstName: "Paul", birthdateAt: new Date("2001-01-01T00:00:00.000Z") },
    ]);
    expect(ranked.map((item) => item.young._id)).toEqual(["a"]);
    expect(ranked[0].reasons).toEqual(expect.arrayContaining(["LAST_NAME_TOKEN", "FIRST_NAME"]));
  });

  it("keeps a one-typo last name with the same birthdate", () => {
    const ranked = rankCloseCandidates(
      { line: 1, lastName: "MORCRETTE", firstName: "Matthiad", birthdate: new Date(2008, 7, 25) },
      [
        {
          _id: "a",
          lastName: "MORCRETTE",
          firstName: "Matthias",
          birthdateAt: new Date("2008-08-25T00:00:00.000Z"),
          statusPhase2: "VALIDATED",
        },
      ],
    );
    expect(ranked).toHaveLength(1);
    expect(ranked[0].reasons).toEqual(expect.arrayContaining(["LAST_NAME", "FIRST_NAME_CLOSE"]));
  });
});
