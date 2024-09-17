import { getFile } from "../../utils";
import { readCSVBuffer } from "../../services/fileService";
import { mapCohesionCentersForSept2024 } from "./cohesionCenterImportMapper";
import { CohesionCenterCSV, CohesionCenterImportMapped } from "./cohesionCenterImport";
import { CohesionCenterDocument, CohesionCenterModel } from "../../models";
import { logger } from "../../logger";
import { CohesionCenterType } from "snu-lib";

export interface CohesionCenterImportReport {
  _id?: string;
  matricule: string | undefined;
  name: string | undefined;
  action: string;
  comment: string;
}

export const importCohesionCenter = async (centerFilePath: string, sessionCenterFilePath: string) => {
  const centerFile = await getFile(centerFilePath);
  const sessionCenterFile = await getFile(sessionCenterFilePath);
  const centerToImport: CohesionCenterCSV[] = await readCSVBuffer<CohesionCenterCSV>(Buffer.from(centerFile.Body), true);
  const sessionCenterToImport: CohesionCenterCSV[] = await readCSVBuffer<CohesionCenterCSV>(Buffer.from(sessionCenterFile.Body), true);

  const centerMapped = mapCohesionCentersForSept2024(centerToImport);

  const report: CohesionCenterImportReport[] = [];

  for (const center of centerMapped) {
    let processedCenter: CohesionCenterImportReport;

    if (center._id) {
      processedCenter = await processCenterWithId(center);
    } else if (center.matricule) {
      processedCenter = await processCenterWithoutId(center);
    } else {
      logger.warn(`Center ${center.name} has no matricule and no id, skipping`);
      continue;
    }

    report.push(processedCenter);
  }
  return report;
};

export const processCenterWithId = async (center: CohesionCenterImportMapped): Promise<CohesionCenterImportReport> => {
  const { _id, ...centerToUpdate } = center;
  const existingCenter = await CohesionCenterModel.findById(_id);
  if (existingCenter) {
    existingCenter.set({ ...centerToUpdate });
    await existingCenter.save({ fromUser: { firstName: "IMPORT_COHESION_CENTER" } });
    return {
      _id: _id,
      matricule: existingCenter.matricule,
      name: existingCenter.name,
      action: "updated",
      comment: "Center updated",
    };
  }
  return {
    _id: _id,
    matricule: "",
    name: "",
    action: "error",
    comment: "Center not found",
  };
};

export const processCenterWithoutId = async (center: CohesionCenterImportMapped): Promise<CohesionCenterImportReport> => {
  const foundCenters = await CohesionCenterModel.find({ matricule: center.matricule });
  if (foundCenters.length === 1) {
    return await updateCenter(center, foundCenters[0]);
  } else if (foundCenters.length > 1) {
    return await processCentersByMatriculeFound(center, foundCenters);
  } else {
    return await createCenter(center);
  }
};

export const updateCenter = async (center: CohesionCenterImportMapped, foundCenter: CohesionCenterDocument): Promise<CohesionCenterImportReport> => {
  logger.info(`updateCenter() - Center with matricule ${center.matricule} already exists`);
  foundCenter.set({ ...center });
  await foundCenter.save({ fromUser: { firstName: "IMPORT_COHESION_CENTER" } });
  return {
    _id: foundCenter._id,
    matricule: foundCenter.matricule,
    name: foundCenter.name,
    action: "updated",
    comment: "No Id - Updated center found by matricule",
  };
};

export const processCentersByMatriculeFound = async (center: CohesionCenterImportMapped, foundCenters: CohesionCenterDocument[]): Promise<CohesionCenterImportReport> => {
  logger.info(`processCentersByMatriculeFound() - Center with matricule ${center.matricule} already exists`);
  return {
    _id: foundCenters.map((center) => center._id).join("/"),
    matricule: foundCenters.map((center) => center.matricule).join("/"),
    name: foundCenters.map((center) => center.name).join("/"),
    action: "nothing",
    comment: "No Id provided in CSV, several centers found by matricule",
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
