import fs from "fs";
import { logger } from "../../logger";
import { CohesionCenterDocument, CohesionCenterModel } from "../../models";
import { XLSXToCSVBuffer, readCSVBuffer } from "../../services/fileService";
import { uploadFile } from "../../utils";
import { CohesionCenterCSV, CohesionCenterImportMapped } from "./cohesionCenterImport";
import { mapCohesionCentersForSept2024 } from "./cohesionCenterImportMapper";

export const xlsxMimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export const buildPathOnBucket = (timestamp: string) => `file/si-snu/centres/export-${timestamp}`;
export interface CohesionCenterImportReport {
  _id?: string;
  matricule: string | undefined;
  name: string | undefined;
  action: string;
  comment: string;
}

export const importCohesionCenter = async (centerToImport: CohesionCenterCSV[]) => {
  const mappedCenters = mapCohesionCentersForSept2024(centerToImport);
  const filteredCenter = filterCenter(mappedCenters);

  const report: CohesionCenterImportReport[] = [];

  for (const center of filteredCenter) {
    let processedCenter: CohesionCenterImportReport;

    if (center.matricule) {
      processedCenter = await processCenterWithoutId(center);
    } else {
      logger.warn(`importCohesionCenter() - Center ${center.name} has no matricule, skipping`);
      continue;
    }

    report.push(processedCenter);
  }
  return report;
};

const filterCenter = (mappedCenters: CohesionCenterImportMapped[]) => {
  return mappedCenters.filter((center) => {
    const isKept = center.observations !== "CENTRE EN COURS D'IDENTIFICATION";
    if (!isKept) {
      logger.info(`importCohesionCenter() - Center ${center.name} is not kept because comment : "CENTRE EN COURS D'IDENTIFICATION"`);
    }

    return isKept;
  });
};

export const processCenterWithoutId = async (center: CohesionCenterImportMapped): Promise<CohesionCenterImportReport> => {
  const foundCenters = await CohesionCenterModel.find({ matricule: center.matricule, deletedAt: { $exists: false } });
  if (foundCenters.length === 1) {
    logger.info(`processCenterWithoutId() - Center with matricule ${center.matricule} already exists`);
    return await updateCenter(center, foundCenters[0], "Center found by matricule");
  } else if (foundCenters.length > 1) {
    return await processCentersByMatriculeFound(center, foundCenters);
  } else {
    return await createCenter(center);
  }
};

export const updateCenter = async (center: CohesionCenterImportMapped, foundCenter: CohesionCenterDocument, comment: string): Promise<CohesionCenterImportReport> => {
  foundCenter.set({ ...center });
  await foundCenter.save({ fromUser: { firstName: "IMPORT_COHESION_CENTER" } });
  return {
    _id: foundCenter._id,
    matricule: foundCenter.matricule,
    name: foundCenter.name,
    action: "updated",
    comment: comment,
  };
};

export const processCentersByMatriculeFound = async (center: CohesionCenterImportMapped, foundCenters: CohesionCenterDocument[]): Promise<CohesionCenterImportReport> => {
  logger.info(`processCentersByMatriculeFound() - Center with matricule ${center.matricule} already exists`);
  return {
    _id: foundCenters.map((center) => center._id).join("/"),
    matricule: foundCenters.map((center) => center.matricule).join("/"),
    name: foundCenters.map((center) => center.name).join("/"),
    action: "nothing",
    comment: "Several centers found by matricule",
  };
};

export const createCenter = async (center: CohesionCenterImportMapped): Promise<CohesionCenterImportReport> => {
  const createdCenter = await CohesionCenterModel.create({ ...center });
  await createdCenter.save({ fromUser: { firstName: "IMPORT_COHESION_CENTER" } });
  return {
    _id: createdCenter._id,
    matricule: createdCenter.matricule,
    name: createdCenter.name,
    action: "created",
    comment: "Center created",
  };
};

export const uploadAndConvertFile = async (filePath: string, timestamp: string) => {
  const data = fs.readFileSync(filePath);
  uploadFile(`${buildPathOnBucket(timestamp)}/export-si-snu-centres-${timestamp}.xlsx`, {
    data: data,
    encoding: "",
    mimetype: xlsxMimetype,
  });
  const csvBuffer = XLSXToCSVBuffer(filePath);
  return readCSVBuffer<any>(csvBuffer);
};

export const COHESION_CENTER_HEADERS = [
  "Matricule du Centre",
  "Désignation du centre",
  "Adresse",
  "Complément adresse",
  "Code postal",
  "Commune",
  "Commentaire interne sur l'enregistrement",
  "Capacité d'accueil Maximale",
  "Acceuil PMR",
  "Avis conforme",
  "Date avis commission hygiène & sécurité",
  "Région académique",
  "Académie",
  "Département",
  "Typologie du centre",
  "Domaine d'activité",
  "Organisme de rattachement",
  "Date début validité de l'enregistrement",
  "Date fin de validité de l'enregistrement",
  "ID temporaire",
];

export const checkColumnHeaders = (fileHeaders: string[]) => {
  const missingHeaders = COHESION_CENTER_HEADERS.filter((header) => !fileHeaders.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`Un fichier d'import de centre doit contenir les colonnes suivantes: ${missingHeaders.join(", ")}`);
  }
};
