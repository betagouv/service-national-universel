import { PointDeRassemblementType } from "snu-lib";
import { logger } from "../../../logger";
import { CohortModel, PointDeRassemblementDocument, PointDeRassemblementModel } from "../../../models";
import { parseXLS } from "../../../services/fileService";
import { getNearestLocation, getSpecificAdressLocation } from "../../../services/gouv.fr/api-adresse";
import { PDR_HEADERS, PointDeRassemblementCSV, PointDeRassemblementImportMapped } from "./pointDeRassemblementImport";
import { mapPointDeRassemblements } from "./pointDeRassemblementImportMapper";

export interface PointDeRassemblementImportReport {
  _id?: string;
  matricule: string | undefined;
  name: string | undefined;
  action: "nothing" | "updated" | "updated_with_warning" | "created" | "created_with_warning" | "error";
  comment: string;
}

export const importPointDeRassemblement = async (pdrFileBuffer: Buffer) => {
  const pdrToImport: PointDeRassemblementCSV[] = await parseXLS(pdrFileBuffer, { defval: "" });

  checkColumnHeaders(Object.keys(pdrToImport[0]));

  // import des nouveaux PDR (création / modification)
  const mappedPdrs = mapPointDeRassemblements(pdrToImport);
  const filteredPdrs = filterPdrs(mappedPdrs);

  const report: PointDeRassemblementImportReport[] = [];

  for (const pdr of filteredPdrs) {
    let processedPdr: PointDeRassemblementImportReport;

    try {
      if (!pdr.matricule) {
        logger.warn(`importPointDeRassemblement() - Pdr ${pdr.name} has no matricule, skipping`);
        report.push({
          name: pdr.name,
          action: "nothing",
          comment: "No matricule in CSV",
          matricule: pdr.matricule,
        });
        continue;
      } else if (!pdr.name) {
        logger.warn(`importPointDeRassemblement() - Pdr ${pdr.matricule} has no name, skipping`);
        report.push({
          name: pdr.name,
          action: "nothing",
          comment: "No name in CSV",
          matricule: pdr.matricule,
        });
        continue;
      } else {
        processedPdr = await processPdrWitMatricule(pdr);
      }
      report.push(processedPdr);
    } catch (e) {
      logger.error(e);
      report.push({
        name: pdr.name,
        action: "error",
        comment: e.message,
        matricule: pdr.matricule,
      });
    }
  }

  // suppression logique de tous les PDR sans matricule (legacy)
  await PointDeRassemblementModel.updateMany({ matricule: { $exists: false }, deletedAt: { $exists: false } }, { $set: { deletedAt: new Date() } });

  return report;
};

const filterPdrs = (mappedPdrs: PointDeRassemblementImportMapped[]) => {
  return mappedPdrs;
};

export const processPdrWitMatricule = async (pdr: PointDeRassemblementImportMapped): Promise<PointDeRassemblementImportReport> => {
  const foundPdrs = await PointDeRassemblementModel.find({ matricule: pdr.matricule, deletedAt: { $exists: false } });
  if (foundPdrs.length === 1) {
    logger.info(`processPdrWitMatricule() - Pdr with matricule ${pdr.matricule} already exists`);
    return await updatePdr(pdr, foundPdrs[0], "No Id - Pdr found by matricule");
  } else if (foundPdrs.length > 1) {
    // return await processPdrsByMatriculeFound(pdr, foundPdrs);
    throw new Error("Multiple PDR found with same matricule");
  } else {
    return await createPdr(pdr);
  }
};

export const updatePdr = async (pdr: PointDeRassemblementImportMapped, foundPdr: PointDeRassemblementDocument, comment: string): Promise<PointDeRassemblementImportReport> => {
  const { extraInfos, report } = await getPdrExtraInfos(pdr, foundPdr);
  foundPdr.set({ ...pdr, ...extraInfos });
  await foundPdr.save({ fromUser: { firstName: "IMPORT_POINT_DE_RASSEMBLEMENT" } });
  return {
    _id: foundPdr._id,
    matricule: foundPdr.matricule,
    name: foundPdr.name,
    action: report ? "updated_with_warning" : "updated",
    comment: `${comment} ${report?.comment || ""}`,
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
  const { extraInfos, report } = await getPdrExtraInfos(pdr);
  const createdPdr = await PointDeRassemblementModel.create({ ...pdr, ...extraInfos });
  await createdPdr.save({ fromUser: { firstName: "IMPORT_POINT_DE_RASSEMBLEMENT" } });
  return {
    _id: createdPdr._id,
    matricule: createdPdr.matricule,
    name: createdPdr.name,
    action: report ? "created_with_warning" : "created",
    comment: `Pdr created ${report?.comment || ""}`,
  };
};

const getPdrExtraInfos = async (pdr: PointDeRassemblementImportMapped, foundPdr?: PointDeRassemblementDocument) => {
  let cohortNames = foundPdr?.cohorts || [];
  let cohortIds = foundPdr?.cohortIds || [];
  let complementAddress = foundPdr?.complementAddress || [];

  const code = foundPdr?.code || pdr.matricule;

  // handle geocoding
  let report: Partial<PointDeRassemblementImportReport> | null = null;
  let location: PointDeRassemblementType["location"] | null = null;
  try {
    location = await getSpecificAdressLocation({ label: pdr.name, address: pdr.address, city: pdr.city, zip: pdr.zip });
  } catch (e) {
    logger.warn(`importPointDeRassemblement() - geocoding pdr ${pdr.matricule}: ${e.message}`);
    location = await getNearestLocation(pdr.city, pdr.zip);
    report = {
      comment: `(using nearest location ${location?.lat} ${location?.lon}, details: ${e.message})`,
    };
  }
  if (!location?.lat || !location.lon) {
    throw Error(`importPointDeRassemblement() - No suitable location found`);
  }

  return {
    report,
    extraInfos: {
      code,
      cohorts: cohortNames,
      cohortIds,
      complementAddress,
      location,
    },
  };
};

export const checkColumnHeaders = (fileHeaders: string[]) => {
  const missingHeaders = PDR_HEADERS.filter((header) => !fileHeaders.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`Un fichier d'import de PDR doit contenir les colonnes suivantes: ${missingHeaders.join(", ")}`);
  }
};
