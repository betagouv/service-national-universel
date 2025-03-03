import { academyList, departmentList, regionList } from "snu-lib";
const { parse: parseDate } = require("date-fns");
import { logger } from "../../../logger";
import { PointDeRassemblementCSV, PointDeRassemblementImportMapped } from "./pointDeRassemblementImport";

export const mapPointDeRassemblements = (rawPdrs: PointDeRassemblementCSV[]): PointDeRassemblementImportMapped[] => {
  return rawPdrs.map((rawPdr, index) => {
    let rawPdrWithoutId: PointDeRassemblementImportMapped;
    try {
      rawPdrWithoutId = {
        // attention de garder le caractere spécial à la place de l'espace dans le nom de colonne
        name: rawPdr["Point de Rassemblement : Désignation"],
        address: rawPdr.Adresse,
        complementAddress: rawPdr["Particularités pour accès"],
        particularitesAcces: rawPdr["Particularités pour accès"],
        city: rawPdr.Commune,
        zip: rawPdr["Code postal"],
        department: mapDepartment(rawPdr["Département"]),
        region: mapRegion(rawPdr["Région académique"]),
        academie: mapAcademy(rawPdr["Académie"]),
        matricule: rawPdr["Matricule du point de rassemblement"],
        uai: rawPdr["UAI"],
        numeroOrdre: rawPdr["Numéro d'ordre"],
        dateCreation: parseDate(rawPdr["Point de Rassemblement : Date de création"], "dd/MM/yyyy", new Date()),
        dateDebutValidite: parseDate(rawPdr["Date  début validité de l'enregistrement"], "dd/MM/yyyy", new Date()),
        dateDerniereModification: parseDate(rawPdr["Point de Rassemblement : Date de dernière modification"], "dd/MM/yyyy", new Date()),
        // code: rawPdr["Matricule du point de rassemblement"],
      };
    } catch (e) {
      logger.error(`Error line  ${index + 1} while mapping PDR ${rawPdr["Matricule du point de rassemblement"]}`, e);
      logger.error("Date de création: " + rawPdr["Point de Rassemblement : Date de création"]);
      throw e;
    }
    if (!rawPdrWithoutId.name) {
      throw new Error("NO NAME " + rawPdrWithoutId.matricule);
    }
    return rawPdrWithoutId;
  });
};

export const mapRegion = (regionCsv: string) => {
  let convertedRegion = regionCsv;

  if (regionCsv === "NOUVELLE CALEDONIE") {
    convertedRegion = "NOUVELLE-CALEDONIE";
  }
  const foundRegion = regionList.find((region) => normalizeString(region) === normalizeString(convertedRegion));
  if (!foundRegion) {
    logger.warn(`No region found for "${regionCsv}" was converted to "${convertedRegion}"`);
  }
  return foundRegion || "NO_REGION";
};

const mapDepartment = (departmentCsv: string) => {
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
  const departmentName = departmentList.find((name) => normalizeString(department) === normalizeString(name));
  if (!departmentName) {
    logger.warn(`mapDepartment() - No department code for : ${department} (${departmentCsv})`);
  }
  return departmentName || "NO_DEPARTMENT";
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

function normalizeString(s: string | undefined) {
  if (!s) {
    return "";
  }
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
