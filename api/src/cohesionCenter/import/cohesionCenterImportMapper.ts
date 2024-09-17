import { CohesionCenterCSV, CohesionCenterImportMapped } from "./cohesionCenterImport";
import { CohesionCenterType, departmentLookUp, regionList } from "snu-lib";
import { logger } from "../../logger";

export const mapCohesionCentersForSept2024 = (cohesionCenters: CohesionCenterCSV[]): CohesionCenterImportMapped[] => {
  return cohesionCenters.map((cohesionCenter) => {
    const cohesionCenterWithouId: CohesionCenterImportMapped = {
      name: cohesionCenter["Désignation"],
      address: cohesionCenter.Adresse,
      city: cohesionCenter.Commune,
      zip: cohesionCenter.CP,
      department: cohesionCenter["Département"],
      region: mapRegion(cohesionCenter["Région académique"]),
      placesTotal: parseInt(cohesionCenter["Capacité"]),
      pmr: cohesionCenter.PMR === "1" ? "true" : "false",
      academy: cohesionCenter["Académie"],
      typology: mapTypology(cohesionCenter["Typologie du centre"]),
      domain: mapDomain(cohesionCenter["Domaine d'activité"]),
      complement: cohesionCenter["Complément"],
      centerDesignation: cohesionCenter["Désignation"],
      observations: cohesionCenter["Commentaire interne"],
      COR: cohesionCenter["Organisme de rattachement"],
      code: cohesionCenter.Matricule,
      code2022: cohesionCenter.Matricule,
      departmentCode: mapDepartmentCode(cohesionCenter["Département"]),
      matricule: cohesionCenter.Matricule,
    };
    if (cohesionCenter["ID temporaire"]) {
      return { _id: cohesionCenter["ID temporaire"], ...cohesionCenterWithouId };
    }
    return cohesionCenterWithouId;
  });
};

export const mapTypology = (typologyCsv: string) => {
  let typology: "PUBLIC_ETAT" | "PUBLIC_COLLECTIVITE" | "PRIVE_ASSOCIATION" | "PRIVE_AUTRE" | "AUTRE";
  switch (typologyCsv) {
    case "PUBLIC / ETAT":
      typology = "PUBLIC_ETAT";
      break;
    case "PUBLIC / COLLECTIVITE TERRITORIALE":
      typology = "PUBLIC_COLLECTIVITE";
      break;
    case "PRIVE / ASSOCIATION OU FONDATION":
      typology = "PRIVE_ASSOCIATION";
      break;
    case "PRIVE / AUTRE":
      typology = "PRIVE_AUTRE";
      break;
    default:
      typology = "AUTRE";
      break;
  }
  return typology;
};

export const mapRegion = (regionCsv: string) => {
  let convertedRegion = regionCsv;

  if (regionCsv === "NOUVELLE CALEDONIE") {
    convertedRegion = "NOUVELLE-CALEDONIE";
  }
  const foundRegion = regionList.find((region) => normalizeString(region) === normalizeString(convertedRegion));
  if (!foundRegion) {
    logger.warn(`No region found for : ${regionCsv} was converted to ${convertedRegion}`);
  }
  return foundRegion || "NO_REGION";
};

export const mapDepartmentCode = (departmentCsv: string) => {
  let department = departmentCsv;
  if (departmentCsv === "COTE D'OR") {
    department = "COTE-D'OR";
  }
  if (departmentCsv === "COTES D'ARMOR") {
    department = "COTES-D'ARMOR";
  }
  if (departmentCsv === "NOUVELLE CALEDONIE") {
    department = "NOUVELLE-CALEDONIE";
  }
  let departmentCode = Object.keys(departmentLookUp).find((key) => normalizeString(departmentLookUp[key]) === normalizeString(department));
  if (!departmentCode) {
    logger.warn(`No department code for : ${departmentCsv} was converted to ${department}`);
  }
  return departmentCode || "NO_DEPARTMENT";
};

export const mapDomain = (domainCsv: string): "ETABLISSEMENT" | "VACANCES" | "FORMATION" | "AUTRE" => {
  switch (domainCsv) {
    case "ETABLISSEMENT?D'ENSEIGNEMENT":
      return "ETABLISSEMENT";
    case "CENTRE DE VACANCES":
      return "VACANCES";
    case "EN COURS D'IDENTIFICATION":
      return "AUTRE";
    case "CENTRE DE FORMATION":
      return "FORMATION";
    default:
      return "AUTRE";
  }
};

function normalizeString(s: string | undefined) {
  if (!s) {
    return "";
  }
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
