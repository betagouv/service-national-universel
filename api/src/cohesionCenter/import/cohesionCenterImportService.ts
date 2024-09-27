import { logger } from "../../logger";
import { CohesionCenterDocument, CohesionCenterModel } from "../../models";
import { readCSVBuffer } from "../../services/fileService";
import { getFile } from "../../utils";
import { CohesionCenterCSV, CohesionCenterImportMapped } from "./cohesionCenterImport";
import { mapCohesionCentersForSept2024 } from "./cohesionCenterImportMapper";

export interface CohesionCenterImportReport {
  _id?: string;
  matricule: string | undefined;
  name: string | undefined;
  action: string;
  comment: string;
}

export const importCohesionCenter = async (centerFilePath: string) => {
  const centerFile = await getFile(centerFilePath);
  const centerToImport: CohesionCenterCSV[] = await readCSVBuffer<CohesionCenterCSV>(Buffer.from(centerFile.Body), true);

  const mappedCenters = mapCohesionCentersForSept2024(centerToImport);
  const filteredCenter = filterCenter(mappedCenters);

  const report: CohesionCenterImportReport[] = [];

  for (const center of filteredCenter) {
    let processedCenter: CohesionCenterImportReport;

    if (center._id) {
      processedCenter = await processCenterWithId(center);
    } else if (center.matricule) {
      processedCenter = await processCenterWithoutId(center);
    } else {
      logger.warn(`importCohesionCenter() - Center ${center.name} has no matricule and no id, skipping`);
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

export const processCenterWithId = async (center: CohesionCenterImportMapped): Promise<CohesionCenterImportReport> => {
  const { _id, ...centerToUpdate } = center;
  const existingCenter = await CohesionCenterModel.findById(_id);
  if (existingCenter) {
    return await updateCenter(centerToUpdate, existingCenter, "Id provided - Center found by Id");
  }
  return {
    _id: _id,
    matricule: "",
    name: "",
    action: "error",
    comment: "Id provided - no center found by Id",
  };
};

export const processCenterWithoutId = async (center: CohesionCenterImportMapped): Promise<CohesionCenterImportReport> => {
  const foundCenters = await CohesionCenterModel.find({ matricule: center.matricule });
  if (foundCenters.length === 1) {
    logger.info(`processCenterWithoutId() - Center with matricule ${center.matricule} already exists`);
    return await updateCenter(center, foundCenters[0], "No Id - Center found by matricule");
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
