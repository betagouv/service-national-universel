import { region2zone, SessionPhase1Type } from "snu-lib";
import { logger } from "../../logger";
import { CohesionCenterDocument, CohesionCenterModel, CohortDocument, CohortModel, SessionPhase1Model } from "../../models";
import { SessionCohesionCenterCSV, SessionCohesionCenterImportMapped } from "./sessionPhase1Import";
import { mapSessionCohesionCentersForSept2024 } from "./sessionPhase1ImportMapper";
import { normalizeDepartmentName } from "snu-lib";
import { mapTrigrammeToRegion } from "../../services/regionService";
import { updatePlacesSessionPhase1 } from "../../utils";

export interface SessionCohesionCenterImportReport {
  sessionId?: string;
  sessionFormule?: string;
  sessionSnuId?: string;
  cohesionCenterId: string | undefined;
  cohesionCenterMatricule: string | undefined;
  placesTotal?: number;
  action: string;
  comment: string;
  warning?: string;
}

export const importSessionsPhase1 = async (SessionsFromCSV: SessionCohesionCenterCSV[]) => {
  const mappedSessionCenter = mapSessionCohesionCentersForSept2024(SessionsFromCSV);

  const report: SessionCohesionCenterImportReport[] = [];

  for (const sessionCenter of mappedSessionCenter) {
    let processedSessionReport: SessionCohesionCenterImportReport;
    const foundCenter = await CohesionCenterModel.findOne({ matricule: sessionCenter.cohesionCenterMatricule });
    if (!foundCenter?.id) {
      processedSessionReport = await processCenterNotFound(sessionCenter);
      report.push(processedSessionReport);
      continue;
    }
    const zonedSnuId = getZonedSnuId(sessionCenter);
    const foundCohort = await CohortModel.findOne({ $or: [{ snuId: zonedSnuId }, { snuId: sessionCenter.sessionFormule }] });
    if (!foundCohort?._id) {
      processedSessionReport = await processCohortNotFound(sessionCenter, zonedSnuId);
      report.push(processedSessionReport);
      continue;
    }

    // Somme des effectifs pour une même cohort
    const sessionCenterUpdated = { ...sessionCenter }; // clone to not update other rows
    const multiSessions = mappedSessionCenter.filter(
      (sc) => sc.sessionFormule === sessionCenter.sessionFormule && sc.cohesionCenterMatricule === sessionCenter.cohesionCenterMatricule && getZonedSnuId(sc) === zonedSnuId,
    );
    if (multiSessions.length > 1) {
      const sessionPlaces = multiSessions.reduce((acc, sc) => acc + sc.sessionPlaces, 0);
      logger.warn(
        `Multiple sessions found (${multiSessions.length}) for ${zonedSnuId} (${sessionCenter.cohesionCenterMatricule}): ${sessionPlaces} > ${sessionCenter.sessionPlaces}.`,
      );
      sessionCenterUpdated.sessionPlaces = sessionPlaces;
    }

    processedSessionReport = await createSession(sessionCenterUpdated, foundCenter, foundCohort);
    if (processedSessionReport.action === "created") {
      await addCohortToCohesionCenter(foundCenter, foundCohort);
    }

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

const processCohortNotFound = (sessionCenter: SessionCohesionCenterImportMapped, zonedSnuId: string): SessionCohesionCenterImportReport => {
  logger.warn(`Cohort not found for name ${sessionCenter.sessionFormule}`);
  return {
    sessionId: undefined,
    sessionFormule: sessionCenter.sessionFormule,
    sessionSnuId: zonedSnuId,
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
  let warning = "";
  if (sessionCenter.sessionPlaces > sessionCenter.cohesionCenterPlacesTotal) {
    logger.warn(
      `Session with wrong place number (${sessionCenter.sessionPlaces} > ${sessionCenter.cohesionCenterPlacesTotal}) center ${foundCenter.matricule} and cohort ${foundCohort.snuId}`,
    );
    warning = "session places > center places";
  }

  const foundSession = await SessionPhase1Model.findOne({ cohesionCenterId: foundCenter._id, cohortId: foundCohort.id });
  if (foundSession?._id) {
    // on met à jour les places disponibles si la session existe déjà
    logger.warn(`Session already exists for cohesion center ${foundCenter.matricule} and cohort ${foundCohort.snuId}`);
    foundSession.placesTotal = sessionCenter.sessionPlaces;

    if (sessionCenter.sejourSnuId && !foundSession.sejourSnuIds.includes(sessionCenter.sejourSnuId)) {
      logger.warn(`Add missing sejourSnuId ${sessionCenter.sejourSnuId}`);
      foundSession.sejourSnuIds.push(sessionCenter.sejourSnuId);
    }

    await foundSession.save({ fromUser: { firstName: "IMPORT_SESSION_COHESION_CENTER2" } });
    // on synchronise les places disponibles
    await updatePlacesSessionPhase1(foundSession, { firstName: "IMPORT_SESSION_COHESION_CENTER" });

    return {
      sessionId: foundSession._id,
      sessionFormule: sessionCenter.sessionFormule,
      sessionSnuId: foundSession.sejourSnuIds.join(","),
      cohesionCenterId: foundCenter._id,
      cohesionCenterMatricule: sessionCenter.cohesionCenterMatricule,
      placesTotal: sessionCenter.sessionPlaces,
      action: "update nombre de places",
      comment: "session already exists",
      warning,
    };
  }

  const sessionPhase1: Partial<SessionPhase1Type> = {
    cohesionCenterId: foundCenter._id,
    cohortId: foundCohort._id,
    cohort: foundCohort.name,
    placesTotal: sessionCenter.sessionPlaces,
    placesLeft: sessionCenter.sessionPlaces,
    department: normalizeDepartmentName(foundCenter.department),
    region: foundCenter.region,
    codeCentre: foundCenter.matricule,
    nameCentre: foundCenter.name,
    zipCentre: foundCenter.zip,
    cityCentre: foundCenter.city,
    sejourSnuIds: [sessionCenter.sejourSnuId],
  };

  const createdSessionPhase1 = await SessionPhase1Model.create(sessionPhase1);
  await createdSessionPhase1.save({ fromUser: { firstName: "IMPORT_SESSION_COHESION_CENTER" } });
  logger.info(`Session ${createdSessionPhase1._id} created for cohesion center ${foundCenter.matricule} and cohort ${foundCohort.snuId}`);

  return {
    sessionId: createdSessionPhase1._id,
    sessionFormule: sessionCenter.sessionFormule,
    cohesionCenterId: foundCenter._id,
    cohesionCenterMatricule: sessionCenter.cohesionCenterMatricule,
    placesTotal: sessionCenter.sessionPlaces,
    action: "created",
    comment: "session created",
    warning,
  };
};
const addCohortToCohesionCenter = (foundCenter: CohesionCenterDocument, foundCohort: CohortDocument) => {
  foundCenter.cohorts.push(foundCohort.name);
  foundCenter.cohortIds.push(foundCohort._id.toString());
  return foundCenter.save({ fromUser: { firstName: "IMPORT_SESSION_COHESION_CENTER" } });
};

const getZonedSnuId = (sessionCenter: SessionCohesionCenterImportMapped) => {
  if (sessionCenter.sessionFormule.includes("CLE")) {
    return sessionCenter.sessionFormule;
  }
  let snuId = sessionCenter.sessionFormule;
  const codeRegion = sessionCenter.sejourSnuId.replaceAll(`_${sessionCenter.cohesionCenterMatricule}`, "").replaceAll(`${sessionCenter.sessionFormule}_`, "");
  const region = mapTrigrammeToRegion(codeRegion);
  const zone = region2zone[region!];
  if (zone?.length === 1) {
    snuId += `_${zone}`;
  }
  return snuId;
};
