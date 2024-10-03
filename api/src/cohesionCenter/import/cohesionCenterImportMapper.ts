import { CohesionCenterDomainEnum, CohesionCenterTypologyEnum, departmentLookUp, regionList, departmentList, academyList } from "snu-lib";
import { logger } from "../../logger";
import { CohesionCenterCSV, CohesionCenterImportMapped } from "./cohesionCenterImport";

export const mapCohesionCentersForSept2024 = (cohesionCenters: CohesionCenterCSV[]): CohesionCenterImportMapped[] => {
  return cohesionCenters.map((cohesionCenter) => {
    const cohesionCenterWithouId: CohesionCenterImportMapped = {
      name: cohesionCenter["Désignation du centre"],
      address: cohesionCenter.Adresse,
      city: cohesionCenter.Commune,
      zip: cohesionCenter["Code postal"],
      department: mapDepartment(cohesionCenter["Département"]),
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
export const mapTypology = (typologyCsv: string): CohesionCenterTypologyEnum => {
  switch (typologyCsv) {
    case "PUBLIC / ETAT":
      return CohesionCenterTypologyEnum.PUBLIC_ETAT;
    case "PUBLIC":
      return CohesionCenterTypologyEnum.PUBLIC;
    case "PUBLIC / COLLECTIVITE TERRITORIALE":
    case "COLLECTIVITE TERRITORIALE":
      return CohesionCenterTypologyEnum.PUBLIC_COLLECTIVITE;
    case "PRIVE / ASSOCIATION OU FONDATION":
    case "ASSOCIATIF":
      return CohesionCenterTypologyEnum.PRIVE_ASSOCIATION;
    case "PRIVE / AUTRE":
    case "PRIVE":
      return CohesionCenterTypologyEnum.PRIVE_AUTRE;
    case "ENSEIGNEMENT AGRICOLE":
      return CohesionCenterTypologyEnum.ENSEIGNEMENT_AGRICOLE;
    default:
      logger.warn(`mapTypology() - No typology found for : ${typologyCsv}`);
      return CohesionCenterTypologyEnum.AUTRE;
  }
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

export const mapDepartment = (departmentCsv: string) => {
  let convertedDepartment = departmentCsv;

  if (departmentCsv === "COTE D'OR") {
    convertedDepartment = "COTE-D'OR";
  }
  if (departmentCsv === "COTES D'ARMOR") {
    convertedDepartment = "COTES-D'ARMOR";
  }
  if (departmentCsv === "NOUVELLE CALEDONIE") {
    convertedDepartment = "NOUVELLE-CALEDONIE";
  }

  const foundDepartment = departmentList.find((dep) => normalizeString(dep) === normalizeString(convertedDepartment));
  if (!foundDepartment) {
    logger.warn(`No department found for : ${departmentCsv} was converted to ${convertedDepartment}`);
  }
  return foundDepartment || "NO_DEPARTMENT";
};

export const mapAcademy = (academyCsv: string) => {
  let convertedAcademy = academyCsv;

  if (academyCsv === "NOUVELLE CALEDONIE") {
    convertedAcademy = "NOUVELLE-CALEDONIE";
  }

  const foundAcademy = academyList.find((academy) => normalizeString(academy) === normalizeString(convertedAcademy));
  if (!foundAcademy) {
    logger.warn(`No academy found for : ${academyCsv} was converted to ${convertedAcademy}`);
  }
  return foundAcademy || "NO_ACADEMY";
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

export const mapDomain = (domainCsv: string): CohesionCenterDomainEnum => {
  switch (domainCsv) {
    case "ETABLISSEMENT D’ENSEIGNEMENT":
      return CohesionCenterDomainEnum.ETABLISSEMENT;
    case "CENTRE DE VACANCES":
      return CohesionCenterDomainEnum.VACANCES;
    case "CENTRE DE FORMATION":
      return CohesionCenterDomainEnum.FORMATION;
    case "EDUCATION":
      return CohesionCenterDomainEnum.EDUCATION;
    case "ADMINISTRATIF":
      return CohesionCenterDomainEnum.ADMINISTRATIF;
    default:
      logger.warn(`mapDomain() - No domain found for : ${domainCsv}`);
      return CohesionCenterDomainEnum.AUTRE;
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
