import { logger } from "../../../logger";
import { CohortModel, PointDeRassemblementDocument, PointDeRassemblementModel } from "../../../models";
import { readCSVBuffer } from "../../../services/fileService";
import { getUniqueAdressLocation } from "../../../services/gouv.fr/api-adresse";
import { getFile } from "../../../utils";
import { PointDeRassemblementCSV, PointDeRassemblementImportMapped } from "./pointDeRassemblementImport";
import { mapPointDeRassemblements } from "./pointDeRassemblementImportMapper";

export interface PointDeRassemblementImportReport {
  _id?: string;
  matricule: string | undefined;
  name: string | undefined;
  action: "nothing" | "updated" | "created" | "error";
  comment: string;
}

export const importPointDeRassemblement = async (pdrFilePath: string) => {
  const pdrFile = await getFile(pdrFilePath);
  const pdrToImport: PointDeRassemblementCSV[] = await readCSVBuffer<PointDeRassemblementCSV>(Buffer.from(pdrFile.Body), { headers: true, delimiter: ";" });

  // import des nouveaux PDR (création / modification)
  const mappedPdrs = mapPointDeRassemblements(pdrToImport);

  const report: PointDeRassemblementImportReport[] = [];

  for (const pdr of mappedPdrs) {
    let processedPdr: PointDeRassemblementImportReport;

    try {
      if (pdr._id) {
        processedPdr = await processPdrWithId(pdr);
      } else if (pdr.matricule) {
        processedPdr = await processPdrWithoutId(pdr);
      } else {
        logger.warn(`importPointDeRassemblement() - Pdr ${pdr.name} has no matricule and no id, skipping`);
        report.push({
          name: pdr.name,
          action: "nothing",
          comment: "No Id provided and No matricule in CSV",
          matricule: pdr.matricule,
        });
        continue;
      }
      report.push(processedPdr);
    } catch (e) {
      report.push({
        name: pdr.name,
        action: "error",
        comment: e.message,
        matricule: pdr.matricule,
      });
    }
  }

  // suppression logique de tous les PDR sans matricule (legacy)
  await PointDeRassemblementModel.updateMany({ matricule: { $exists: false } }, { $set: { deletedAt: new Date() } });

  return report;
};

export const processPdrWithId = async (pdr: PointDeRassemblementImportMapped): Promise<PointDeRassemblementImportReport> => {
  const { _id, ...pdrToUpdate } = pdr;
  const existingPdr = await PointDeRassemblementModel.findById(_id);
  if (existingPdr) {
    return await updatePdr(pdrToUpdate, existingPdr, "Id provided - Pdr found by Id");
  }
  return {
    _id: _id,
    matricule: "",
    name: "",
    action: "error",
    comment: "Id provided - no pdr found by Id",
  };
};

export const processPdrWithoutId = async (pdr: PointDeRassemblementImportMapped): Promise<PointDeRassemblementImportReport> => {
  const foundPdrs = await PointDeRassemblementModel.find({ matricule: pdr.matricule });
  if (foundPdrs.length === 1) {
    logger.info(`processPdrWithoutId() - Pdr with matricule ${pdr.matricule} already exists`);
    return await updatePdr(pdr, foundPdrs[0], "No Id - Pdr found by matricule");
  } else if (foundPdrs.length > 1) {
    return await processPdrsByMatriculeFound(pdr, foundPdrs);
  } else {
    return await createPdr(pdr);
  }
};

export const updatePdr = async (pdr: PointDeRassemblementImportMapped, foundPdr: PointDeRassemblementDocument, comment: string): Promise<PointDeRassemblementImportReport> => {
  const extraInfos = await getPdrExtraInfos(pdr, foundPdr);
  foundPdr.set({ ...pdr, ...extraInfos });
  await foundPdr.save({ fromUser: { firstName: "IMPORT_POINT_DE_RASSEMBLEMENT" } });
  return {
    _id: foundPdr._id,
    matricule: foundPdr.matricule,
    name: foundPdr.name,
    action: "updated",
    comment: comment,
  };
};

export const processPdrsByMatriculeFound = async (pdr: PointDeRassemblementImportMapped, foundPdrs: PointDeRassemblementDocument[]): Promise<PointDeRassemblementImportReport> => {
  logger.info(`processPdrsByMatriculeFound() - Pdr with matricule ${pdr.matricule} already exists`);
  return {
    _id: foundPdrs.map((pdr) => pdr._id).join("/"),
    matricule: foundPdrs.map((pdr) => pdr.matricule).join("/"),
    name: foundPdrs.map((pdr) => pdr.name).join("/"),
    action: "nothing",
    comment: "No Id provided in CSV, several pdrs found by matricule",
  };
};

export const createPdr = async (pdr: PointDeRassemblementImportMapped): Promise<PointDeRassemblementImportReport> => {
  const extraInfos = await getPdrExtraInfos(pdr);
  const createdPdr = await PointDeRassemblementModel.create({ ...pdr, ...extraInfos });
  await createdPdr.save({ fromUser: { firstName: "IMPORT_POINT_DE_RASSEMBLEMENT" } });
  return {
    _id: createdPdr._id,
    matricule: createdPdr.matricule,
    name: createdPdr.name,
    action: "created",
    comment: "Pdr created",
  };
};

const getPdrExtraInfos = async (pdr: PointDeRassemblementImportMapped, foundPdr?: PointDeRassemblementDocument) => {
  const cohorts = await CohortModel.find({ name: { $regex: "CLE 0[56]" } });
  if (cohorts.length !== 4) {
    throw Error("importPointDeRassemblement() - Cohortes CLE 05 et CLE 06 non trouvées");
  }
  let cohortNames = foundPdr?.cohorts || [];
  cohortNames = [...new Set([...cohortNames, ...cohorts.map(({ name }) => name)])];

  let cohortIds = foundPdr?.cohortIds || [];
  cohortIds = [...new Set([...cohortIds, ...cohorts.map(({ _id }) => _id)])];

  let complementAddress = foundPdr?.complementAddress || [];
  if (pdr.complementAddress) {
    complementAddress = [
      ...new Set([
        ...complementAddress,
        ...cohorts.map(({ name: cohort, _id: cohortId }) => ({
          cohort,
          cohortId,
          complement: pdr.complementAddress,
        })),
      ]),
    ];
  }

  if (!pdr.name) {
    throw new Error("pdr without name" + pdr.matricule);
  }

  // handle geocoding
  const location = await getUniqueAdressLocation({ label: pdr.name, address: pdr.address, city: pdr.city, zip: pdr.zip });

  return {
    cohors: cohortNames,
    cohortIds,
    complementAddress,
    location,
  };
};
