/**
 * Champs à exporter par modèle — extraits du dictionnaire
 * "Champs_SNU_juillet2026_sans_lignes_jaunes.xlsx" (version sans lignes jaunes).
 * `area` (cityCode) et `importplandetransport` (cohort) exclus : non rattachables à un young.
 * Les champs imbriqués sont notés en chemin ("location.lat") — cf. getByPath.
 */
export const MODEL_FIELDS: Record<"young" | "application" | "missionEquivalence" | "mission" | "etablissement" | "classe" | "missionAPI", string[]> = {
  young: ["birthdateAt", "domains", "email", "employed", "engaged", "engagedDescription", "engagedStructure", "firstName", "gender", "grade", "qpv"],
  application: ["createdAt", "feedBackExperienceFiles", "hidden", "isJvaMission", "missionDepartment", "missionDuration", "missionName", "missionRegion", "priority", "status", "updatedAt", "youngBirthdateAt", "youngCity", "youngCohort", "youngDepartment", "youngEmail", "youngFirstName"],
  missionEquivalence: ["address", "city", "createdAt", "desc", "endDate", "frequency", "missionDuration", "sousType", "startDate", "status", "structureName", "type", "updatedAt", "zip"],
  mission: ["actions", "address", "addressVerified", "apiEngagementId", "applicationStatus", "city", "contraintes", "country", "createdAt", "department", "description", "domains", "duration", "endAt", "format", "frequence", "hebergement", "hebergementPayant", "isJvaMission", "isMilitaryPreparation", "justifications", "jvaMissionId", "jvaRawData", "lastSyncAt", "location.lat", "location.lon", "mainDomain", "name", "pendingApplications", "period", "placesStatus", "region", "remote", "startAt", "status", "structureName", "subPeriod", "updatedAt", "visibility", "zip"],
  etablissement: ["academy", "city", "department", "region", "schoolYears", "type", "zip"],
  classe: ["department", "filiere", "grade", "grades", "schoolYear"],
  missionAPI: ["adresse", "applicationUrl", "city", "country", "createdAt", "departmentCode", "departmentName", "description", "domain", "endAt", "format", "lastSyncAt", "location.lat", "location.lon", "organizationName", "places", "postalCode", "publisherName", "publisherUrl", "region", "remote", "startAt", "status", "structureName", "title", "updatedAt"],
};

export const EXPORT_MODELS = ["young", "application", "missionEquivalence", "mission", "etablissement", "classe", "missionAPI"] as const;
