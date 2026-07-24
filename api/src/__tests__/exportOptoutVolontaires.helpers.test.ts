import { MODEL_FIELDS, YOUNG_REPRESENTATIVE_FIELDS, EXPORT_MODELS } from "../scripts/exportOptoutVolontaires.fields";

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
