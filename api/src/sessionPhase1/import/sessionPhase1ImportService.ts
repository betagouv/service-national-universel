import { FeatureFlagName, region2zone, RegionsHorsMetropole, SessionPhase1Type, normalizeDepartmentName } from "snu-lib";
import { logger } from "../../logger";
import { ClasseModel, CohesionCenterDocument, CohesionCenterModel, CohortDocument, CohortModel, LigneBusModel, SessionPhase1Model, YoungModel } from "../../models";
import { SessionCohesionCenterCSV, SessionCohesionCenterImportMapped } from "./sessionPhase1Import";
import { mapSessionCohesionCentersForSept2024 } from "./sessionPhase1ImportMapper";
import { mapTrigrammeToRegion } from "../../services/regionService";
import { updatePlacesSessionPhase1 } from "../../utils";
import { isFeatureAvailable } from "../../featureFlag/featureFlagService";

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
  const mappedSessionCenter = await mapSessionCohesionCentersWithZoneSnuId(SessionsFromCSV);

  logger.info(`Importing sessions phase 1, ${mappedSessionCenter.length} lines`);

  const report: SessionCohesionCenterImportReport[] = [];

  for (const sessionCenter of mappedSessionCenter) {
    if (!sessionCenter.cohesionCenterMatricule) {
      continue;
    }
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

    let foundCohort: null | CohortDocument = null;
    if (sessionCenter.isDromCom) {
      foundCohort = await CohortModel.findOne({ snuId: sessionCenter.zonedSnuId });
    } else {
      // check la cohort zoné ou la cohort par defaut
      foundCohort = await CohortModel.findOne({ $or: [{ snuId: sessionCenter.zonedSnuId }, { snuId: sessionCenter.sessionFormule }] });
    }
    if (!foundCohort?._id) {
      processedSessionReport = await processCohortNotFound(sessionCenter, sessionCenter.zonedSnuId);
      report.push(processedSessionReport);
      continue;
    }
    const isDefaultCohort = foundCohort.snuId === sessionCenter.sessionFormule;

    // Somme des effectifs pour une même cohort
    const sessionCenterUpdated = { ...sessionCenter }; // clone to not update other rows
    const multiSessions = mappedSessionCenter.filter(
      (sc) =>
        sc.sessionFormule === sessionCenter.sessionFormule &&
        sc.cohesionCenterMatricule === sessionCenter.cohesionCenterMatricule &&
        (sc.zonedSnuId === sessionCenter.zonedSnuId || (isDefaultCohort && sc.sessionFormule === sessionCenter.sessionFormule)),
    );
    if (multiSessions.length > 1) {
      const sessionPlaces = multiSessions.reduce((acc, sc) => acc + sc.sessionPlaces, 0);
      logger.warn(
        `Multiple sessions found (${multiSessions.length}) for ${sessionCenter.zonedSnuId} (${sessionCenter.cohesionCenterMatricule}): ${sessionPlaces} > ${sessionCenter.sessionPlaces}.`,
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

export const removeDeprecatedSessionsPhase1 = async (SessionsFromCSV: SessionCohesionCenterCSV[]) => {
  const mappedSessionCenter = await mapSessionCohesionCentersWithZoneSnuId(SessionsFromCSV);

  const report: SessionCohesionCenterImportReport[] = [];

  const cohortsList = await CohortModel.find({ name: new RegExp(`${new Date().getFullYear()}`), dateStart: { $gte: new Date() } });
  const sessionPhase1List = await SessionPhase1Model.find({ cohortId: { $in: cohortsList.map((cohort) => cohort._id) } });

  logger.info(`Removing deprecated sessions phase 1, testing ${sessionPhase1List.length} sessions, for ${cohortsList.length} cohorts`);

  for (const sessionPhase1 of sessionPhase1List) {
    const centreSessions = mappedSessionCenter.filter((sessionCenter) => sessionPhase1.sejourSnuIds.includes(sessionCenter.sejourSnuId));
    if (!centreSessions.length) {
      logger.warn(`Session not found (${sessionPhase1._id}) in CSV for sejourSnuId ${sessionPhase1.sejourSnuIds.join(",")}`);
      const nbYoung = await YoungModel.countDocuments({ sessionPhase1Id: sessionPhase1._id });
      const classes = await ClasseModel.find({ sessionId: sessionPhase1._id });
      const lignes = await LigneBusModel.find({ cohort: sessionPhase1.cohort, centerId: sessionPhase1.cohesionCenterId });
      if (nbYoung > 0) {
        logger.warn(`Session ${sessionPhase1._id} has ${nbYoung} youngs, cannot delete it`);
        report.push({
          sessionId: sessionPhase1._id,
          sessionFormule: sessionPhase1.cohort,
          sessionSnuId: sessionPhase1.sejourSnuIds.join(","),
          cohesionCenterId: sessionPhase1.cohesionCenterId,
          cohesionCenterMatricule: undefined,
          action: "nothing",
          comment: `cannot delete session with youngs`,
          warning: `${nbYoung} youngs`,
        });
      } else if (classes.length > 0) {
        logger.warn(`Session ${sessionPhase1._id} has ${classes.length} classes, cannot delete it`);
        report.push({
          sessionId: sessionPhase1._id,
          sessionFormule: sessionPhase1.cohort,
          sessionSnuId: sessionPhase1.sejourSnuIds.join(","),
          cohesionCenterId: sessionPhase1.cohesionCenterId,
          cohesionCenterMatricule: undefined,
          action: "nothing",
          comment: `cannot delete session with classe`,
          warning: `classes: ${classes.map((classe) => classe._id).join(",")}`,
        });
      } else if (lignes.length > 0) {
        logger.warn(`Session ${sessionPhase1._id} has ${lignes.length} lignes, cannot delete it`);
        report.push({
          sessionId: sessionPhase1._id,
          sessionFormule: sessionPhase1.cohort,
          sessionSnuId: sessionPhase1.sejourSnuIds.join(","),
          cohesionCenterId: sessionPhase1.cohesionCenterId,
          cohesionCenterMatricule: undefined,
          action: "nothing",
          comment: `cannot delete session with pdt`,
          warning: `lignes: ${lignes.map((ligne) => ligne._id).join(",")}`,
        });
      } else {
        const isDeleteEnabled = await isFeatureAvailable(FeatureFlagName.IMPORT_SISNU_CENTRESESSIONS_DELETE);
        for (const centreSession of centreSessions) {
          if (isDeleteEnabled) {
            // On supprime la référence de la cohort dans le centre vu qu'il n'y a plus de sejour (cohortIds et cohorts)
            const foundCenter = await CohesionCenterModel.findById(sessionPhase1.cohesionCenterId);
            if (foundCenter) {
              foundCenter.cohortIds = foundCenter.cohortIds.filter((cohortId) => cohortId !== sessionPhase1.cohortId);
              foundCenter.cohorts = foundCenter.cohorts.filter((cohort) => cohort !== sessionPhase1.cohort);
              await foundCenter.save({ fromUser: { firstName: "IMPORT_SESSION_COHESION_CENTER" } });
            } else {
              logger.warn(`Cohesion center not found for session ${sessionPhase1._id}`);
            }
            await sessionPhase1.deleteOne();
          }

          report.push({
            sessionId: sessionPhase1._id,
            sessionFormule: sessionPhase1.cohort,
            sessionSnuId: sessionPhase1.sejourSnuIds.join(","),
            cohesionCenterId: sessionPhase1.cohesionCenterId,
            cohesionCenterMatricule: undefined,
            action: isDeleteEnabled ? "deleted" : "to be deleted (feature flag disabled)",
            comment: "session not found in file",
          });
        }
      }
    }
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
    sessionCenter.sessionPlaces = foundCenter.placesTotal!;
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

const getZonedSnuId = (sessionCenter: SessionCohesionCenterImportMapped, specificCohorts: string[]): { snuId: string; isDromCom?: boolean } => {
  let snuId = sessionCenter.sessionFormule;

  // les cohortes CLE n'ont pas de dates spécifiques pour les DROM COM ou les zones académiques
  if (sessionCenter.sessionFormule.includes("CLE")) {
    // cas particulier (ex: 2025 CLE 18 - Martinique)
    if (specificCohorts.includes(sessionCenter.sejourSnuIdRegion!)) {
      return { snuId: sessionCenter.sejourSnuIdRegion!, isDromCom: true };
    }
    return { snuId };
  }

  // HTS
  const region = mapTrigrammeToRegion(sessionCenter.codeRegion);
  // sans région on ne peux pas faire de distinction
  if (!region) {
    return { snuId };
  }
  // DROM COM et Corse
  if (RegionsHorsMetropole.includes(region)) {
    return { snuId: sessionCenter.sejourSnuIdRegion!, isDromCom: true };
  }
  // Sejours zonés (A, B, C)
  const zone = region2zone[region!];
  if (zone?.length === 1) {
    return { snuId: `${sessionCenter.sessionFormule}_${zone}` };
  }
  return { snuId };
};

const mapSessionCohesionCentersWithZoneSnuId = async (SessionsFromCSV: SessionCohesionCenterCSV[]) => {
  const specificCohortsSnuids = (await CohortModel.find({ specificSnuIdCohort: true })).map((cohort) => cohort.snuId);
  const mappedSessionCenter = mapSessionCohesionCentersForSept2024(SessionsFromCSV).map((sessionCentre) => {
    const { snuId, isDromCom } = getZonedSnuId(sessionCentre, specificCohortsSnuids);
    return {
      ...sessionCentre,
      zonedSnuId: snuId,
      isDromCom,
    };
  });

  return mappedSessionCenter;
};
