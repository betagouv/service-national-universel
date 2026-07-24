import { MODEL_FIELDS, YOUNG_REPRESENTATIVE_FIELDS, EXPORT_MODELS } from "../scripts/exportOptoutVolontaires.fields";
import { normalizeEmail, chunk, getByPath, toCell, buildProjection } from "../scripts/exportOptoutVolontaires.helpers";

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
