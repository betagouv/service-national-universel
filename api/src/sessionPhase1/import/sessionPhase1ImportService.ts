import { SessionPhase1Type } from "snu-lib";
import { logger } from "../../logger";
import { CohesionCenterDocument, CohesionCenterModel, CohortDocument, CohortModel, SessionPhase1Model } from "../../models";
import { readCSVBuffer } from "../../services/fileService";
import { getFile } from "../../utils";
import { SessionCohesionCenterCSV, SessionCohesionCenterImportMapped } from "./sessionPhase1Import";
import { mapSessionCohesionCentersForSept2024 } from "./sessionPhase1ImportMapper";

export interface SessionCohesionCenterImportReport {
  sessionId?: string;
  sessionFormule?: string;
  cohesionCenterId: string | undefined;
  cohesionCenterMatricule: string | undefined;
  action: string;
  comment: string;
}

export const importCohesionCenter = async (sessionCenterFilePath: string) => {
  const sessionCenterFile = await getFile(sessionCenterFilePath);
  const sessionCenterToImport: SessionCohesionCenterCSV[] = await readCSVBuffer<SessionCohesionCenterCSV>(Buffer.from(sessionCenterFile.Body), true);

  const mappedSessionCenter = mapSessionCohesionCentersForSept2024(sessionCenterToImport);

  const report: SessionCohesionCenterImportReport[] = [];

  for (const sessionCenter of mappedSessionCenter) {
    let processedSessionReport: SessionCohesionCenterImportReport;
    const foundCenter = await CohesionCenterModel.findOne({ matricule: sessionCenter.cohesionCenterMatricule });
    if (!foundCenter?.id) {
      processedSessionReport = await processCenterNotFound(sessionCenter);
      report.push(processedSessionReport);
      continue;
    }
    const foundCohort = await CohortModel.findOne({ snuId: sessionCenter.sessionFormule });
    if (!foundCohort?._id) {
      processedSessionReport = await processCohortNotFound(sessionCenter);
      report.push(processedSessionReport);
      continue;
    }

    processedSessionReport = await createSession(sessionCenter, foundCenter, foundCohort);

    report.push(processedSessionReport);
  }
  return report;
};

const processCenterNotFound = (sessionCenter: SessionCohesionCenterImportMapped): SessionCohesionCenterImportReport => {
  logger.warn(`Cohesion center not found for matricule ${sessionCenter.cohesionCenterMatricule}`);
  return {
    sessionId: undefined,
    sessionFormule: sessionCenter.sessionFormule,
    cohesionCenterId: undefined,
    cohesionCenterMatricule: sessionCenter.cohesionCenterMatricule,
    action: "nothing",
    comment: "cohesion center not found",
  };
};

const processCohortNotFound = (sessionCenter: SessionCohesionCenterImportMapped): SessionCohesionCenterImportReport => {
  logger.warn(`Cohort not found for name ${sessionCenter.sessionFormule}`);
  return {
    sessionId: undefined,
    sessionFormule: sessionCenter.sessionFormule,
    cohesionCenterId: undefined,
    cohesionCenterMatricule: sessionCenter.cohesionCenterMatricule,
    action: "nothing",
    comment: "cohort not found",
  };
};

const createSession = async (
  sessionCenter: SessionCohesionCenterImportMapped,
  foundCenter: CohesionCenterDocument,
  foundCohort: CohortDocument,
): Promise<SessionCohesionCenterImportReport> => {
  const foundSession = await SessionPhase1Model.findOne({ cohesionCenterId: foundCenter._id, cohortId: foundCohort.id });
  if (foundSession?._id) {
    logger.warn(`Session already exists for cohesion center ${foundCenter.matricule} and cohort ${foundCohort.snuId}`);
    return {
      sessionId: foundSession._id,
      sessionFormule: sessionCenter.sessionFormule,
      cohesionCenterId: foundCenter._id,
      cohesionCenterMatricule: sessionCenter.cohesionCenterMatricule,
      action: "nothing",
      comment: "session already exists",
    };
  }

  const sessionPhase1: Partial<SessionPhase1Type> = {
    cohesionCenterId: foundCenter._id,
    cohortId: foundCohort._id,
    placesTotal: sessionCenter.sessionPlaces,
    department: foundCenter.department,
    region: foundCenter.region,
    codeCentre: foundCenter.matricule,
    nameCentre: foundCenter.name,
    zipCentre: foundCenter.zip,
    cityCentre: foundCenter.city,
    sejourSnuId: sessionCenter.sejourSnuId,
  };

  const createdSessionPhase1 = await SessionPhase1Model.create(sessionPhase1);
  await createdSessionPhase1.save({ fromUser: { firstName: "IMPORT_SESSION_COHESION_CENTER" } });
  logger.info(`Session ${createdSessionPhase1._id} created for cohesion center ${foundCenter.matricule} and cohort ${foundCohort.snuId}`);

  return {
    sessionId: createdSessionPhase1._id,
    sessionFormule: sessionCenter.sessionFormule,
    cohesionCenterId: foundCenter._id,
    cohesionCenterMatricule: sessionCenter.cohesionCenterMatricule,
    action: "created",
    comment: "session created",
  };
};
