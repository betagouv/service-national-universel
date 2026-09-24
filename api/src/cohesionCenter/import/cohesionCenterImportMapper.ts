import { departmentList, academyList } from "snu-lib";
import { logger } from "../../logger";

// Seuls `mapAcademy` et `mapDepartment` subsistent : la migration `20241003102056-mapper_department.js` les
// importe. L'import des centres (`POST /cohesion-center/import`) a été supprimé le 2026-09-24.

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

function normalizeString(s: string | undefined) {
  if (!s) {
    return "";
  }
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
