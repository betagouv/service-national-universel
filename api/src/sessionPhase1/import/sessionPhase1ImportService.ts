import { region2zone, RegionsHorsMetropole, SessionPhase1Type, normalizeDepartmentName } from "snu-lib";
import { logger } from "../../logger";
import { CohesionCenterDocument, CohesionCenterModel, CohortDocument, CohortModel, SessionPhase1Model } from "../../models";
import { SessionCohesionCenterCSV, SessionCohesionCenterImportMapped } from "./sessionPhase1Import";
import { mapSessionCohesionCentersForSept2024 } from "./sessionPhase1ImportMapper";
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

  const specificCohortsSnuids = (await CohortModel.find({ specificSnuIdCohort: true })).map((cohort) => cohort.snuId);

  for (const sessionCenter of mappedSessionCenter) {
    let processedSessionReport: SessionCohesionCenterImportReport;
    const foundCenter = await CohesionCenterModel.findOne({ matricule: sessionCenter.cohesionCenterMatricule });
    if (!foundCenter?._id) {
      processedSessionReport = await processCenterNotFound(sessionCenter);
      report.push(processedSessionReport);
      continue;
    } else if (!foundCenter?.placesTotal) {
      processedSessionReport = await processCenterWithoutMaxCapacity(sessionCenter, foundCenter);
      report.push(processedSessionReport);
      continue;
    }
    const { snuId: zonedSnuId, isDromCom } = getZonedSnuId(sessionCenter, specificCohortsSnuids);
    let foundCohort: null | CohortDocument = null;
    if (isDromCom) {
      foundCohort = await CohortModel.findOne({ snuId: zonedSnuId });
    } else {
      // check la cohort zoné ou la cohort par defaut
      foundCohort = await CohortModel.findOne({ $or: [{ snuId: zonedSnuId }, { snuId: sessionCenter.sessionFormule }] });
    }
    if (!foundCohort?._id) {
      processedSessionReport = await processCohortNotFound(sessionCenter, zonedSnuId);
      report.push(processedSessionReport);
      continue;
    }

    // Somme des effectifs pour une même cohort
    const sessionCenterUpdated = { ...sessionCenter }; // clone to not update other rows
    const multiSessions = mappedSessionCenter.filter(
      (sc) =>
        sc.sessionFormule === sessionCenter.sessionFormule &&
        sc.cohesionCenterMatricule === sessionCenter.cohesionCenterMatricule &&
        getZonedSnuId(sc, specificCohortsSnuids).snuId === zonedSnuId,
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

const processCenterWithoutMaxCapacity = (sessionCenter: SessionCohesionCenterImportMapped, foundCenter: CohesionCenterDocument): SessionCohesionCenterImportReport => {
  logger.warn(`Capacity max not found for matricule ${sessionCenter.cohesionCenterMatricule}`);
  return {
    sessionId: undefined,
    sessionFormule: sessionCenter.sessionFormule,
    cohesionCenterId: foundCenter._id,
    cohesionCenterMatricule: sessionCenter.cohesionCenterMatricule,
    placesTotal: undefined,
    action: "nothing",
    comment: "capacity max not found",
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
  if (sessionCenter.sessionPlaces > foundCenter.placesTotal!) {
    logger.warn(`Session with wrong place number (${sessionCenter.sessionPlaces} > ${foundCenter.placesTotal}) center ${foundCenter.matricule} and cohort ${foundCohort.snuId}`);
    sessionCenter.sessionPlaces = foundCenter.placesTotal as number;
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

    await foundSession.save({ fromUser: { firstName: "IMPORT_SESSION_COHESION_CENTER" } });
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

const getZonedSnuId = (sessionCenter: SessionCohesionCenterImportMapped, specificCohorts: string[]) => {
  let snuId = sessionCenter.sessionFormule;
  const codeRegion = sessionCenter.sejourSnuId.replaceAll(`_${sessionCenter.cohesionCenterMatricule}`, "").replaceAll(`${sessionCenter.sessionFormule}_`, "");
  const snuIdRegion = `${snuId}_${codeRegion}`;

  // les cohortes CLE n'ont pas de dates spécifiques pour les DROM COM ou les zones académiques
  if (sessionCenter.sessionFormule.includes("CLE")) {
    // cas particulier (ex: 2025 CLE 18 - Martinique)
    if (specificCohorts.includes(snuIdRegion)) {
      return { snuId: snuIdRegion, isDromCom: true };
    }
    return { snuId };
  }

  // HTS
  const region = mapTrigrammeToRegion(codeRegion);
  // sans région on ne peux pas faire de distinction
  if (!region) {
    return { snuId };
  }
  // DROM COM et Corse
  if (RegionsHorsMetropole.includes(region)) {
    return { snuId: snuIdRegion, isDromCom: true };
  }
  // Sejours zonés (A, B, C)
  const zone = region2zone[region!];
  if (zone?.length === 1) {
    return { snuId: `${snuId}_${zone}` };
  }
  return { snuId };
};
