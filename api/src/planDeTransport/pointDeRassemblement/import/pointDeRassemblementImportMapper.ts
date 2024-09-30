import { departmentList, regionList } from "snu-lib";
import { logger } from "../../../logger";
import { PointDeRassemblementCSV, PointDeRassemblementImportMapped } from "./pointDeRassemblementImport";

export const mapPointDeRassemblements = (rawPdrs: PointDeRassemblementCSV[]): PointDeRassemblementImportMapped[] => {
  return rawPdrs.map((rawPdr) => {
    const rawPdrWithoutId: PointDeRassemblementImportMapped = {
      code: rawPdr["Matricule du point de rassemblement"],
      // attention de garder le caractere spécial à la place de l'espace dans le nom de colonne
      name: rawPdr["Point de Rassemblement : Désignation du Point de Rassemblement"],
      address: rawPdr.Adresse,
      complementAddress: rawPdr["Particularités pour accès"],
      city: rawPdr.Commune,
      zip: rawPdr["Code postal"],
      department: mapDepartment(rawPdr["Département"]),
      region: mapRegion(rawPdr["Région académique"]),
      matricule: rawPdr["Matricule du point de rassemblement"],
    };
    if (!rawPdrWithoutId.name) {
      throw new Error("NO NAME " + rawPdrWithoutId.matricule);
    }
    if (rawPdr["ID temporaire PDR"]) {
      return { _id: rawPdr["ID temporaire PDR"].toLowerCase(), ...rawPdrWithoutId };
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
    logger.warn(`No region found for : ${regionCsv} was converted to ${convertedRegion}`);
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

function normalizeString(s: string | undefined) {
  if (!s) {
    return "";
  }
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
