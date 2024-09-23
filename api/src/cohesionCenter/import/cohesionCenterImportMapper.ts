import { departmentLookUp, regionList } from "snu-lib";
import { logger } from "../../logger";
import { CohesionCenterCSV, CohesionCenterImportMapped } from "./cohesionCenterImport";

export const mapCohesionCentersForSept2024 = (cohesionCenters: CohesionCenterCSV[]): CohesionCenterImportMapped[] => {
  return cohesionCenters.map((cohesionCenter) => {
    const cohesionCenterWithouId: CohesionCenterImportMapped = {
      name: cohesionCenter["Désignation du centre"],
      address: cohesionCenter.Adresse,
      city: cohesionCenter.Commune,
      zip: cohesionCenter["Code postal"],
      department: cohesionCenter["Département"],
      region: mapRegion(cohesionCenter["Région académique"]),
      placesTotal: parseInt(cohesionCenter["Capacité d'accueil Maximale"]),
      pmr: cohesionCenter["Acceuil PMR"] === "TRUE" ? "true" : "false",
      academy: cohesionCenter.Académie,
      typology: mapTypology(cohesionCenter["Typologie du centre"]),
      domain: mapDomain(cohesionCenter["Domaine d'activité"]),
      complement: cohesionCenter["Complément adresse"],
      centerDesignation: cohesionCenter["Désignation du centre"],
      observations: cohesionCenter["Commentaire interne sur l'enregistrement"],
      COR: cohesionCenter["Organisme de rattachement"],
      code: cohesionCenter["Matricule du Centre"],
      code2022: cohesionCenter["Matricule du Centre"],
      departmentCode: mapDepartmentCode(cohesionCenter["Département"]),
      matricule: cohesionCenter["Matricule du Centre"],
    };
    if (cohesionCenter["ID temporaire"]) {
      return { _id: cohesionCenter["ID temporaire"].toLowerCase(), ...cohesionCenterWithouId };
    }
    return cohesionCenterWithouId;
  });
};
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// TODO: add AUTRE to front options
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
export const mapTypology = (typologyCsv: string) => {
  let typology: "PUBLIC_ETAT" | "PUBLIC_COLLECTIVITE" | "PRIVE_ASSOCIATION" | "PRIVE_AUTRE" | "AUTRE";
  switch (typologyCsv) {
    case "PUBLIC / ETAT" || "PUBLIC":
      typology = "PUBLIC_ETAT";
      break;
    case "PUBLIC / COLLECTIVITE TERRITORIALE" || "COLLECTIVITE TERRITORIALE":
      typology = "PUBLIC_COLLECTIVITE";
      break;
    case "PRIVE / ASSOCIATION OU FONDATION" || "ASSOCIATIF":
      typology = "PRIVE_ASSOCIATION";
      break;
    case "PRIVE / AUTRE" || "PRIVE":
      typology = "PRIVE_AUTRE";
      break;
    default:
      logger.warn(`mapTypology() - No typology found for : ${typologyCsv}`);
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
    logger.warn(`mapDepartmentCode() - No department code for : ${departmentCsv} was converted to ${department}`);
  }
  return departmentCode || "NO_DEPARTMENT";
};

export const mapDomain = (domainCsv: string): "ETABLISSEMENT" | "VACANCES" | "FORMATION" | "AUTRE" => {
  switch (domainCsv) {
    case "ETABLISSEMENT D’ENSEIGNEMENT":
      return "ETABLISSEMENT";
    case "CENTRE DE VACANCES":
      return "VACANCES";
    case "EN COURS D'IDENTIFICATION" || "AUTRES":
      return "AUTRE";
    case "CENTRE DE FORMATION" || "EDUCATION":
      return "FORMATION";
    default:
      logger.warn(`mapDomain() - No domain found for : ${domainCsv}`);
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
