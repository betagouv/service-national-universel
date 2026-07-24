import { tmpdir } from "os";
import { join } from "path";
import * as fs from "fs";
import * as XLSX from "xlsx";
import { MODEL_FIELDS, YOUNG_REPRESENTATIVE_FIELDS, EXPORT_MODELS } from "../scripts/exportOptoutVolontaires.fields";
import { normalizeEmail, chunk, getByPath, toCell, buildProjection, youngColumns, modelColumns, buildRow, isObjectIdString, buildRepresentantRows } from "../scripts/exportOptoutVolontaires.helpers";
import { createExportWorkbook } from "../scripts/exportOptoutVolontaires.workbook";

describe("exportOptoutVolontaires.fields", () => {
  it("couvre exactement les 7 modèles liés, sans area ni importplandetransport", () => {
    expect(EXPORT_MODELS).toEqual(["young", "application", "missionEquivalence", "mission", "etablissement", "classe", "missionAPI"]);
    expect(Object.keys(MODEL_FIELDS).sort()).toEqual([...EXPORT_MODELS].sort());
    expect(EXPORT_MODELS).not.toContain("area");
    expect(EXPORT_MODELS).not.toContain("importplandetransport");
  });

  it("verrouille les champs exacts par modèle (lock dico)", () => {
    expect(MODEL_FIELDS.young).toEqual(["birthdateAt", "domains", "email", "employed", "engaged", "engagedDescription", "engagedStructure", "firstName", "gender", "grade", "qpv"]);
    expect(MODEL_FIELDS.application).toEqual(["createdAt", "feedBackExperienceFiles", "hidden", "isJvaMission", "missionDepartment", "missionDuration", "missionName", "missionRegion", "priority", "status", "updatedAt", "youngBirthdateAt", "youngCity", "youngCohort", "youngDepartment", "youngEmail", "youngFirstName"]);
    expect(MODEL_FIELDS.missionEquivalence).toEqual(["address", "city", "createdAt", "desc", "endDate", "frequency", "missionDuration", "sousType", "startDate", "status", "structureName", "type", "updatedAt", "zip"]);
    expect(MODEL_FIELDS.mission).toEqual(["actions", "address", "addressVerified", "apiEngagementId", "applicationStatus", "city", "contraintes", "country", "createdAt", "department", "description", "domains", "duration", "endAt", "format", "frequence", "hebergement", "hebergementPayant", "isJvaMission", "isMilitaryPreparation", "justifications", "jvaMissionId", "jvaRawData", "lastSyncAt", "location.lat", "location.lon", "mainDomain", "name", "pendingApplications", "period", "placesStatus", "region", "remote", "startAt", "status", "structureName", "subPeriod", "updatedAt", "visibility", "zip"]);
    expect(MODEL_FIELDS.etablissement).toEqual(["academy", "city", "department", "region", "schoolYears", "type", "zip"]);
    expect(MODEL_FIELDS.classe).toEqual(["department", "filiere", "grade", "grades", "schoolYear"]);
    expect(MODEL_FIELDS.missionAPI).toEqual(["adresse", "applicationUrl", "city", "country", "createdAt", "departmentCode", "departmentName", "description", "domain", "endAt", "format", "lastSyncAt", "location.lat", "location.lon", "organizationName", "places", "postalCode", "publisherName", "publisherUrl", "region", "remote", "startAt", "status", "structureName", "title", "updatedAt"]);
  });

  it("expose les 4 champs représentants légaux", () => {
    expect(YOUNG_REPRESENTATIVE_FIELDS).toEqual(["parent1Email", "parent1FirstName", "parent2Email", "parent2FirstName"]);
  });
});

describe("normalizeEmail", () => {
  it("trim + lowercase", () => expect(normalizeEmail("  Foo@Bar.FR ")).toBe("foo@bar.fr"));
  it("non-string -> ''", () => expect(normalizeEmail(undefined)).toBe(""));
});

describe("chunk", () => {
  it("découpe par taille", () => expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]));
  it("tableau vide -> []", () => expect(chunk([], 3)).toEqual([]));
});

describe("getByPath", () => {
  it("chemin simple", () => expect(getByPath({ a: 1 }, "a")).toBe(1));
  it("chemin imbriqué", () => expect(getByPath({ location: { lat: 48.8 } }, "location.lat")).toBe(48.8));
  it("segment manquant -> undefined", () => expect(getByPath({}, "location.lat")).toBeUndefined());
});

describe("toCell", () => {
  it("passe les primitives", () => {
    expect(toCell("x")).toBe("x");
    expect(toCell(3)).toBe(3);
    expect(toCell(true)).toBe(true);
    const d = new Date("2024-01-01"); expect(toCell(d)).toBe(d);
  });
  it("null/undefined -> null", () => { expect(toCell(null)).toBeNull(); expect(toCell(undefined)).toBeNull(); });
  it("tableau/objet -> JSON", () => {
    expect(toCell(["a", "b"])).toBe('["a","b"]');
    expect(toCell({ k: 1 })).toBe('{"k":1}');
  });
  it("plafonne à 32767 caractères", () => {
    const big = "a".repeat(40000);
    const out = toCell(big) as string;
    expect(out.length).toBe(32767);
  });
});

describe("buildProjection", () => {
  it("réduit les chemins au 1er segment", () => {
    expect(buildProjection(["email", "location.lat", "location.lon"])).toEqual({ email: 1, location: 1 });
  });
});

describe("colonnes", () => {
  it("young = uniquement les 11 champs du dico (représentants dans un onglet à part)", () => {
    expect(youngColumns()).toEqual(["birthdateAt", "domains", "email", "employed", "engaged", "engagedDescription", "engagedStructure", "firstName", "gender", "grade", "qpv"]);
  });
  it("modèle lié = youngEmail en tête puis champs", () => {
    expect(modelColumns("classe")).toEqual(["youngEmail", "department", "filiere", "grade", "grades", "schoolYear"]);
  });
  it("modelColumns('application') : youngEmail unique et en tête (déduplication)", () => {
    const cols = modelColumns("application");
    expect(cols[0]).toBe("youngEmail");
    expect(cols.filter((c) => c === "youngEmail")).toHaveLength(1);
    expect(new Set(cols).size).toBe(cols.length); // aucune colonne dupliquée
    expect(cols).toEqual([
      "youngEmail", "createdAt", "feedBackExperienceFiles", "hidden", "isJvaMission",
      "missionDepartment", "missionDuration", "missionName", "missionRegion", "priority",
      "status", "updatedAt", "youngBirthdateAt", "youngCity", "youngCohort",
      "youngDepartment", "youngFirstName",
    ]);
  });
});

describe("buildRow", () => {
  it("young : champs plats, tableau -> JSON, absent -> null", () => {
    const doc = { email: "a@b.fr", firstName: "Léa", domains: ["Défense", "Santé"] };
    const row = buildRow(doc, youngColumns());
    expect(row.email).toBe("a@b.fr");
    expect(row.domains).toBe('["Défense","Santé"]');
    expect(row.gender).toBeNull(); // absent -> null
  });
  it("modèle : injecte youngEmail + chemin imbriqué location.lat", () => {
    const doc = { youngEmail: "a@b.fr", name: "Mission X", location: { lat: 48.8, lon: 2.3 } };
    const row = buildRow(doc, modelColumns("mission"));
    expect(row.youngEmail).toBe("a@b.fr");
    expect(row.name).toBe("Mission X");
    expect(row["location.lat"]).toBe(48.8);
  });
});

describe("buildRepresentantRows", () => {
  it("une ligne par représentant renseigné : rôle + prénom + email + email du jeune", () => {
    const y = { parent1FirstName: "Papa", parent1Email: "p1@b.fr", parent2FirstName: "Maman", parent2Email: "p2@b.fr" };
    expect(buildRepresentantRows(y, "jeune@b.fr")).toEqual([
      { youngEmail: "jeune@b.fr", role: "Représentant légal 1", firstName: "Papa", email: "p1@b.fr" },
      { youngEmail: "jeune@b.fr", role: "Représentant légal 2", firstName: "Maman", email: "p2@b.fr" },
    ]);
  });
  it("ignore un représentant sans prénom ni email, garde l'autre (email manquant -> null)", () => {
    const y = { parent1FirstName: "Papa", parent1Email: "" }; // pas de parent2
    expect(buildRepresentantRows(y, "jeune@b.fr")).toEqual([
      { youngEmail: "jeune@b.fr", role: "Représentant légal 1", firstName: "Papa", email: null },
    ]);
  });
  it("young sans aucun représentant -> []", () => {
    expect(buildRepresentantRows({}, "jeune@b.fr")).toEqual([]);
  });
});

describe("createExportWorkbook (streaming round-trip)", () => {
  it("écrit des onglets relisibles avec les bonnes valeurs", async () => {
    const out = join(tmpdir(), `export-test-${process.pid}.xlsx`);
    const wb = createExportWorkbook(out);
    wb.openSheet("Young", ["email", "firstName"]);
    wb.openSheet("Classe", ["youngEmail", "department"]);
    wb.writeRow("Young", { email: "a@b.fr", firstName: "Léa" });
    wb.writeRow("Classe", { youngEmail: "a@b.fr", department: "75" });
    await wb.commitSheet("Young");
    await wb.commitSheet("Classe");
    await wb.commit();

    const read = XLSX.readFile(out);
    expect(read.SheetNames).toEqual(["Young", "Classe"]);
    const young = XLSX.utils.sheet_to_json(read.Sheets.Young);
    expect(young).toEqual([{ email: "a@b.fr", firstName: "Léa" }]);
    const classe = XLSX.utils.sheet_to_json(read.Sheets.Classe);
    expect(classe).toEqual([{ youngEmail: "a@b.fr", department: "75" }]);
    fs.unlinkSync(out);
  });
});

describe("isObjectIdString", () => {
  it("accepte une chaîne hex 24 caractères (forme ObjectId)", () => {
    expect(isObjectIdString("507f1f77bcf86cd799439011")).toBe(true);
    expect(isObjectIdString("AAAAAAAAAAAAAAAAAAAAAAAA")).toBe(true);
  });
  it("rejette les valeurs non-ObjectId (legacy/JVA/vide/mauvaise longueur/non-string)", () => {
    expect(isObjectIdString("MID1")).toBe(false);
    expect(isObjectIdString("")).toBe(false);
    expect(isObjectIdString("507f1f77bcf86cd79943901")).toBe(false); // 23 car.
    expect(isObjectIdString("507f1f77bcf86cd799439011x")).toBe(false); // 25 car.
    expect(isObjectIdString("zzzzzzzzzzzzzzzzzzzzzzzz")).toBe(false); // non-hex
    expect(isObjectIdString(null)).toBe(false);
    expect(isObjectIdString(undefined)).toBe(false);
    expect(isObjectIdString(123)).toBe(false);
  });
});
