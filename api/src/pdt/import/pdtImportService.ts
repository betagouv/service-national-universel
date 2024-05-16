import XLSX from "xlsx";
import mongoose from "mongoose";

import { PDT_IMPORT_ERRORS, departmentLookUp } from "snu-lib";

import { CohesionCenterModel, PointDeRassemblementModel, SessionPhase1Model, CleClasseModel } from "../../models";
import { ERRORS } from "../../utils";

import { isValidBoolean, isValidDate, isValidDepartment, isValidNumber, isValidTime } from "./pdtImportUtils";

export interface PdtErrors {
  [key: string]: { line: number; error: string; extra?: string }[];
}

export interface PdtLine {
  [key: string]: string;
}

export const validatePdtFile = async (
  filePath: string,
  cohortName: string,
  isCle: boolean,
): Promise<{
  ok: boolean;
  lines?: PdtLine[];
  code?: string;
  errors?: PdtErrors;
}> => {
  // PARSING DU FICHIER
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets["ALLER-RETOUR"];
  const lines = XLSX.utils.sheet_to_json<{ [key: string]: string }>(worksheet, { raw: false, defval: null });

  if (lines.length < 1) {
    console.log("workbook Sheets 'ALLER-RETOUR' is missing or empty");
    return { ok: false, code: ERRORS.INVALID_BODY };
  }

  // Count columns that start with "ID PDR" to know how many PDRs there are.
  const countPdr = Object.keys(lines[0]).filter((e) => e.startsWith("ID PDR")).length;
  let maxPdrOnLine = 0;

  const errors: PdtErrors = {
    "NUMERO DE LIGNE": [],
    "DATE DE TRANSPORT ALLER": [],
    "DATE DE TRANSPORT RETOUR": [],
    ...Array.from({ length: countPdr }, (_, i) => ({
      [`N° DE DEPARTEMENT PDR ${i + 1}`]: [],
      [`ID PDR ${i + 1}`]: [],
      [`TYPE DE TRANSPORT PDR ${i + 1}`]: [],
      [`NOM + ADRESSE DU PDR ${i + 1}`]: [],
      [`HEURE ALLER ARRIVÉE AU PDR ${i + 1}`]: [],
      [`HEURE DEPART DU PDR ${i + 1}`]: [],
      [`HEURE DE RETOUR ARRIVÉE AU PDR ${i + 1}`]: [],
    })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),
    "N° DU DEPARTEMENT DU CENTRE": [],
    "ID CENTRE": [],
    "NOM + ADRESSE DU CENTRE": [],
    "HEURE D'ARRIVEE AU CENTRE": [],
    "HEURE DE DÉPART DU CENTRE": [],
    "TOTAL ACCOMPAGNATEURS": [],
    "CAPACITÉ VOLONTAIRE TOTALE": [],
    "CAPACITE TOTALE LIGNE": [],
    "PAUSE DÉJEUNER ALLER": [],
    "PAUSE DÉJEUNER RETOUR": [],
    "TEMPS DE ROUTE": [],
    "LIGNES FUSIONNÉES": [],
  };

  if (isCle) {
    errors["ID CLASSE"] = [];
  }

  const FIRST_LINE_NUMBER_IN_EXCEL = 2;

  //Check columns names
  const columns = Object.keys(lines[0]);
  const expectedColumns = Object.keys(errors);
  const missingColumns = expectedColumns.filter((e) => !columns.includes(e));

  if (missingColumns.length) {
    missingColumns.forEach((e) => {
      errors[e].push({ line: 1, error: PDT_IMPORT_ERRORS.MISSING_COLUMN });
    });
    console.log("errors", errors);
    return { ok: false, code: ERRORS.INVALID_BODY, errors };
  }

  // Format errors.
  // Check format, add errors for each line
  for (const [i, line] of lines.entries()) {
    // We need to have the "line number" as of the excel file, so we add 2 to the index.
    const index = i + FIRST_LINE_NUMBER_IN_EXCEL;
    if (!line["NUMERO DE LIGNE"]) {
      errors["NUMERO DE LIGNE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
    }
    if (line["NUMERO DE LIGNE"] && !line["NUMERO DE LIGNE"]?.length) {
      errors["NUMERO DE LIGNE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
    }
    if (!line["DATE DE TRANSPORT ALLER"]) {
      errors["DATE DE TRANSPORT ALLER"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
    }
    if (line["DATE DE TRANSPORT ALLER"] && !isValidDate(line["DATE DE TRANSPORT ALLER"])) {
      errors["DATE DE TRANSPORT ALLER"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
    }
    if (!line["DATE DE TRANSPORT RETOUR"]) {
      errors["DATE DE TRANSPORT RETOUR"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
    }
    if (line["DATE DE TRANSPORT RETOUR"] && !isValidDate(line["DATE DE TRANSPORT RETOUR"])) {
      errors["DATE DE TRANSPORT RETOUR"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
    }

    // Check each PDR
    for (let i = 1; i <= countPdr; i++) {
      // Skip empty PDR
      if (i > 1 && !line[`ID PDR ${i}`]) continue;

      if (!line[`N° DE DEPARTEMENT PDR ${i}`]) {
        errors[`N° DE DEPARTEMENT PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
      }
      if (line[`N° DE DEPARTEMENT PDR ${i}`] && !isValidDepartment(line[`N° DE DEPARTEMENT PDR ${i}`])) {
        errors[`N° DE DEPARTEMENT PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.UNKNOWN_DEPARTMENT, extra: line[`N° DE DEPARTEMENT PDR ${i}`] });
      }
      if (!line[`ID PDR ${i}`]) {
        errors[`ID PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
      }
      if (line[`ID PDR ${i}`]) {
        const isValidObjectId = mongoose.Types.ObjectId.isValid(line[`ID PDR ${i}`]);
        const isValidCorrespondance = i > 1 && ["correspondance aller", "correspondance retour", "correspondance"].includes(line[`ID PDR ${i}`].toLowerCase());
        if (!(isValidObjectId || isValidCorrespondance)) {
          errors[`ID PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
        }
      }
      if (!line[`TYPE DE TRANSPORT PDR ${i}`]) {
        errors[`TYPE DE TRANSPORT PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
      }
      if (line[`TYPE DE TRANSPORT PDR ${i}`] && !["bus", "train", "avion"].includes(line[`TYPE DE TRANSPORT PDR ${i}`].toLowerCase())) {
        errors[`TYPE DE TRANSPORT PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.UNKNOWN_TRANSPORT_TYPE, extra: line[`TYPE DE TRANSPORT PDR ${i}`] });
      }
      if (!line[`NOM + ADRESSE DU PDR ${i}`]) {
        errors[`NOM + ADRESSE DU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
      }
      if (line[`NOM + ADRESSE DU PDR ${i}`] && !line[`NOM + ADRESSE DU PDR ${i}`]?.length) {
        errors[`NOM + ADRESSE DU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
      }
      if (!line[`HEURE ALLER ARRIVÉE AU PDR ${i}`]) {
        errors[`HEURE ALLER ARRIVÉE AU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
      }
      if (line[`HEURE ALLER ARRIVÉE AU PDR ${i}`] && !isValidTime(line[`HEURE ALLER ARRIVÉE AU PDR ${i}`])) {
        errors[`HEURE ALLER ARRIVÉE AU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
      }
      if (!line[`HEURE DEPART DU PDR ${i}`] && (line[`ID PDR ${i}`] || "").toLowerCase() !== "correspondance retour") {
        errors[`HEURE DEPART DU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
      }
      if (line[`HEURE DEPART DU PDR ${i}`] && !isValidTime(line[`HEURE DEPART DU PDR ${i}`])) {
        errors[`HEURE DEPART DU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
      }
      if (!line[`HEURE DE RETOUR ARRIVÉE AU PDR ${i}`] && (line[`ID PDR ${i}`] || "").toLowerCase() !== "correspondance aller") {
        errors[`HEURE DE RETOUR ARRIVÉE AU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
      }
      if (line[`HEURE DE RETOUR ARRIVÉE AU PDR ${i}`] && !isValidTime(line[`HEURE DE RETOUR ARRIVÉE AU PDR ${i}`])) {
        errors[`HEURE DE RETOUR ARRIVÉE AU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
      }
    }
    if (!line["N° DU DEPARTEMENT DU CENTRE"]) {
      errors["N° DU DEPARTEMENT DU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
    }
    if (line["N° DU DEPARTEMENT DU CENTRE"] && !isValidDepartment(line["N° DU DEPARTEMENT DU CENTRE"])) {
      errors["N° DU DEPARTEMENT DU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.UNKNOWN_DEPARTMENT });
    }
    if (!line["ID CENTRE"]) {
      errors["ID CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
    }
    if (line["ID CENTRE"] && !mongoose.Types.ObjectId.isValid(line["ID CENTRE"])) {
      errors["ID CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
    }
    if (!line["NOM + ADRESSE DU CENTRE"]) {
      errors["NOM + ADRESSE DU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
    }
    if (line["NOM + ADRESSE DU CENTRE"] && !line["NOM + ADRESSE DU CENTRE"]?.length) {
      errors["NOM + ADRESSE DU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
    }
    if (!line["HEURE D'ARRIVEE AU CENTRE"]) {
      errors["HEURE D'ARRIVEE AU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
    }
    if (line["HEURE D'ARRIVEE AU CENTRE"] && !isValidTime(line["HEURE D'ARRIVEE AU CENTRE"])) {
      errors["HEURE D'ARRIVEE AU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
    }
    if (!line["HEURE DE DÉPART DU CENTRE"]) {
      errors["HEURE DE DÉPART DU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
    }
    if (line["HEURE DE DÉPART DU CENTRE"] && !isValidTime(line["HEURE DE DÉPART DU CENTRE"])) {
      errors["HEURE DE DÉPART DU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
    }
    if (!line["TOTAL ACCOMPAGNATEURS"]) {
      errors["TOTAL ACCOMPAGNATEURS"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
    }
    if (line["TOTAL ACCOMPAGNATEURS"] && !isValidNumber(line["TOTAL ACCOMPAGNATEURS"])) {
      errors["TOTAL ACCOMPAGNATEURS"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
    }
    if (!line["CAPACITÉ VOLONTAIRE TOTALE"]) {
      errors["CAPACITÉ VOLONTAIRE TOTALE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
    }
    if (line["CAPACITÉ VOLONTAIRE TOTALE"] && !isValidNumber(line["CAPACITÉ VOLONTAIRE TOTALE"])) {
      errors["CAPACITÉ VOLONTAIRE TOTALE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
    }
    if (!line["CAPACITE TOTALE LIGNE"]) {
      errors["CAPACITE TOTALE LIGNE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
    }
    if (line["CAPACITE TOTALE LIGNE"] && !isValidNumber(line["CAPACITE TOTALE LIGNE"])) {
      errors["CAPACITE TOTALE LIGNE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
    }
    if (!line["PAUSE DÉJEUNER ALLER"]) {
      errors["PAUSE DÉJEUNER ALLER"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
    }
    if (line["PAUSE DÉJEUNER ALLER"] && !isValidBoolean(line["PAUSE DÉJEUNER ALLER"])) {
      errors["PAUSE DÉJEUNER ALLER"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
    }
    if (!line["PAUSE DÉJEUNER RETOUR"]) {
      errors["PAUSE DÉJEUNER RETOUR"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
    }
    if (line["PAUSE DÉJEUNER RETOUR"] && !isValidBoolean(line["PAUSE DÉJEUNER RETOUR"])) {
      errors["PAUSE DÉJEUNER RETOUR"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
    }
    if (!line["TEMPS DE ROUTE"]) {
      errors["TEMPS DE ROUTE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
    }
    if (line["TEMPS DE ROUTE"] && !isValidTime(line["TEMPS DE ROUTE"])) {
      errors["TEMPS DE ROUTE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
    }
    if (line["LIGNES FUSIONNÉES"]) {
      const mergedLines = line["LIGNES FUSIONNÉES"].split(",");
      if (mergedLines.length > 5) {
        errors["LIGNES FUSIONNÉES"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
      }
      for (const mergedLine of mergedLines) {
        let found = false;
        for (const [i, line] of lines.entries()) {
          if (line["NUMERO DE LIGNE"] === mergedLine) {
            found = true;
            break;
          }
        }
        if (!found) {
          errors["LIGNES FUSIONNÉES"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_MERGED_LINE_ID, extra: mergedLine });
        }
      }
    }
    if (isCle) {
      if (!line["ID CLASSE"]) {
        errors["ID CLASSE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
      }
      if (line["ID CLASSE"] && !mongoose.Types.ObjectId.isValid(line["ID CLASSE"])) {
        errors["ID CLASSE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
      }
    }
  }

  // Coherence errors.
  // Check "CAPACITE TOTALE LIGNE" = "TOTAL ACCOMPAGNATEURS" + "CAPACITÉ VOLONTAIRE TOTALE"
  for (const [i, line] of lines.entries()) {
    const index = i + FIRST_LINE_NUMBER_IN_EXCEL;
    if (line["TOTAL ACCOMPAGNATEURS"] && line["CAPACITÉ VOLONTAIRE TOTALE"] && line["CAPACITE TOTALE LIGNE"]) {
      const totalAccompagnateurs = parseInt(line["TOTAL ACCOMPAGNATEURS"]);
      const capaciteVolontaireTotale = parseInt(line["CAPACITÉ VOLONTAIRE TOTALE"]);
      const capaciteTotaleLigne = parseInt(line["CAPACITE TOTALE LIGNE"]);
      if (totalAccompagnateurs + capaciteVolontaireTotale !== capaciteTotaleLigne) {
        errors["CAPACITE TOTALE LIGNE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_TOTAL_CAPACITY });
      }
    }
  }
  // Check duplicate "NUMERO DE LIGNE"
  const duplicateLines = lines.reduce(
    (acc, line) => {
      if (line["NUMERO DE LIGNE"]) {
        acc[line["NUMERO DE LIGNE"]] = (acc[line["NUMERO DE LIGNE"]] || 0) + 1;
      }
      return acc;
    },
    {} as { [key: string]: number },
  );
  for (const [i, line] of lines.entries()) {
    const index = i + FIRST_LINE_NUMBER_IN_EXCEL;
    if (line["NUMERO DE LIGNE"] && duplicateLines[line["NUMERO DE LIGNE"]] > 1) {
      errors["NUMERO DE LIGNE"].push({ line: index, error: PDT_IMPORT_ERRORS.DOUBLON_BUSNUM, extra: line["NUMERO DE LIGNE"] });
    }
  }
  // Check duplicates "ID CLASSE"
  const duplicateClasses = lines.reduce(
    (acc, line) => {
      if (line["ID CLASSE"]) {
        acc[line["ID CLASSE"]] = (acc[line["ID CLASSE"]] || 0) + 1;
      }
      return acc;
    },
    {} as { [key: string]: number },
  );

  for (const [i, line] of lines.entries()) {
    const index = i + FIRST_LINE_NUMBER_IN_EXCEL;
    if (line["ID CLASSE"] && duplicateClasses[line["ID CLASSE"]] > 1) {
      errors["ID CLASSE"].push({ line: index, error: PDT_IMPORT_ERRORS.DOUBLON_CLASSE, extra: line["ID CLASSE"] });
    }
  }
  // Check if "ID CENTRE" exists in DB
  for (const [i, line] of lines.entries()) {
    const index = i + FIRST_LINE_NUMBER_IN_EXCEL;
    if (line["ID CENTRE"] && mongoose.Types.ObjectId.isValid(line["ID CENTRE"])) {
      const center = await CohesionCenterModel.findById(line["ID CENTRE"]);
      if (!center) {
        errors["ID CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_CENTER_ID, extra: line["ID CENTRE"] });
      }
      const session = await SessionPhase1Model.findOne({ cohort: cohortName, cohesionCenterId: line["ID CENTRE"] });
      if (!session) {
        errors["ID CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.CENTER_WITHOUT_SESSION, extra: line["ID CENTRE"] });
      }
    }
  }
  // Check if "ID CLASSE" exists in DB
  if (isCle) {
    for (const [i, line] of lines.entries()) {
      const index = i + FIRST_LINE_NUMBER_IN_EXCEL;
      if (line["ID CLASSE"] && mongoose.Types.ObjectId.isValid(line["ID CLASSE"])) {
        const classe = await CleClasseModel.findById(line["ID CLASSE"]);
        if (!classe) {
          errors["ID CLASSE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_CLASSE_ID, extra: line["ID CLASSE"] });
        }
      }
    }
  }
  // Check if `ID PDR ${i}` exists in DB, and if departement is the same as the PDR.
  for (const [i, line] of lines.entries()) {
    const index = i + FIRST_LINE_NUMBER_IN_EXCEL;
    for (let pdrNumber = 1; pdrNumber <= countPdr; pdrNumber++) {
      if (line[`ID PDR ${pdrNumber}`]) {
        if (mongoose.Types.ObjectId.isValid(line[`ID PDR ${pdrNumber}`])) {
          const pdr = await PointDeRassemblementModel.findOne({ _id: line[`ID PDR ${pdrNumber}`], deletedAt: { $exists: false } });
          if (!pdr) {
            errors[`ID PDR ${pdrNumber}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_PDR_ID, extra: line[`ID PDR ${pdrNumber}`] });
          } else if ((pdr?.department || "").toLowerCase() !== departmentLookUp[line[`N° DE DEPARTEMENT PDR ${pdrNumber}`]]?.toLowerCase()) {
            errors[`ID PDR ${pdrNumber}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_PDR_DEPARTEMENT, extra: line[`ID PDR ${pdrNumber}`] });
          }
        } else if (!["correspondance aller", "correspondance retour", "correspondance"].includes(line[`ID PDR ${pdrNumber}`]?.toLowerCase())) {
          errors[`ID PDR ${pdrNumber}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_PDR_ID, extra: line[`ID PDR ${pdrNumber}`] });
        }
      }
    }
  }
  // Check if there is a PDR duplicate in a line
  // and check the max number of PDR on a line
  for (const [i, line] of lines.entries()) {
    const index = i + FIRST_LINE_NUMBER_IN_EXCEL;
    const pdrIds = getLinePdrIds(line);
    if (pdrIds.length > maxPdrOnLine) {
      maxPdrOnLine = pdrIds.length;
    }
    //check and return duplicate pdr
    for (let pdrNumber = 1; pdrNumber <= countPdr; pdrNumber++) {
      if (line[`ID PDR ${pdrNumber}`] && pdrIds.filter((pdrId) => pdrId === line[`ID PDR ${pdrNumber}`]).length > 1) {
        errors[`ID PDR ${pdrNumber}`].push({ line: index, error: PDT_IMPORT_ERRORS.SAME_PDR_ON_LINE, extra: line[`ID PDR ${pdrNumber}`] });
      }
    }
  }
  const hasError = Object.values(errors).some((error) => error.length > 0);
  return { ok: !hasError, lines, errors };
};

export const computeImportSummary = (lines: PdtLine[]) => {
  const countPdr = getLinePdrCount(lines[0]);
  let maxPdrOnLine = 0;
  for (const line of lines.entries()) {
    const currentLinePDRCount = getLinePdrIds(line).length;
    if (currentLinePDRCount > maxPdrOnLine) {
      maxPdrOnLine = currentLinePDRCount;
    }
  }

  // Count total unique centers
  const centers = lines.reduce((acc: { [key: string]: number }, line: PdtLine) => {
    if (line["ID CENTRE"]) {
      acc[line["ID CENTRE"]] = (acc[line["ID CENTRE"]] || 0) + parseInt(line["CAPACITÉ VOLONTAIRE TOTALE"]);
    }
    return acc;
  }, {});

  // Count total unique classes
  const classes = lines.reduce((acc: { [key: string]: number }, line: PdtLine) => {
    if (line["ID CLASSE"]) {
      acc[line["ID CLASSE"]] = (acc[line["ID CLASSE"]] || 0) + parseInt(line["CAPACITÉ VOLONTAIRE TOTALE"]);
    }
    return acc;
  }, {});

  // Count total unique PDR
  const pdrCount = lines.reduce((acc: string[], line: PdtLine) => {
    for (let i = 1; i <= countPdr; i++) {
      if (line[`ID PDR ${i}`] && !acc.includes(line[`ID PDR ${i}`]) && mongoose.Types.ObjectId.isValid(line[`ID PDR ${i}`])) {
        acc.push(line[`ID PDR ${i}`]);
      }
    }
    return acc;
  }, []).length;

  return {
    centerCount: Object.keys(centers).length,
    classeCount: Object.keys(classes).length,
    pdrCount,
    maxPdrOnLine,
  };
};

const getLinePdrCount = (line) => {
  return Object.keys(line).filter((e) => e.startsWith("ID PDR")).length;
};

const getLinePdrIds = (line) => {
  const countPdr = getLinePdrCount(line);
  const pdrIds: string[] = [];
  for (let pdrNumber = 1; pdrNumber <= countPdr; pdrNumber++) {
    if (line[`ID PDR ${pdrNumber}`] && !["correspondance aller", "correspondance retour", "correspondance"].includes(line[`ID PDR ${pdrNumber}`]?.toLowerCase())) {
      pdrIds.push(line[`ID PDR ${pdrNumber}`]);
    }
  }
  return pdrIds;
};
