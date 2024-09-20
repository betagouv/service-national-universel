import { getFile } from "../../utils";
import { readCSVBuffer } from "../../services/fileService";
import { mapSessionCohesionCentersForSept2024 } from "./sessionPhase1ImportMapper";
import { CohesionCenterCSV, CohesionCenterImportMapped, SessionCohesionCenterCSV } from "./sessionPhase1Import";
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

export const importCohesionCenter = async (sessionCenterFilePath: string) => {
  const sessionCenterFile = await getFile(sessionCenterFilePath);
  const sessionCenterToImport: SessionCohesionCenterCSV[] = await readCSVBuffer<SessionCohesionCenterCSV>(Buffer.from(sessionCenterFile.Body), true);

  const sessionCenterMapped = mapSessionCohesionCentersForSept2024(sessionCenterToImport);

  const report: CohesionCenterImportReport[] = [];

  for (const center of sessionCenterMapped) {
    let processedCenter: CohesionCenterImportReport;

    if (center._id) {
      // processedCenter = await processCenterWithId(center);
    } else if (center.matricule) {
      // processedCenter = await processCenterWithoutId(center);
    } else {
      logger.warn(`Center ${center.name} has no matricule and no id, skipping`);
      continue;
    }

    report.push(processedCenter);
  }
  return report;
};
