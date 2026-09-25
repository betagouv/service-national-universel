import { config } from "../../config";
import { addHours } from "date-fns";
import {
  APPLICATION_STATUS,
  department2region,
  departmentLookUp,
  MISSION_STATUS,
  MissionType,
  ReferentType,
  ReferentStatus,
  ROLES,
  SENDINBLUE_TEMPLATES,
  StructureType,
  sanitizeStoredHtml,
} from "snu-lib";
import { getTutorName } from "../../services/mission";
import { ApplicationModel, MissionDocument, MissionModel, ReferentDocument, ReferentModel, StructureDocument, StructureModel } from "../../models";
import { updateApplicationStatus, updateApplicationTutor } from "../../application/applicationService";
import { sendTemplate } from "../../brevo";
import { fetchMissions, fetchStructureById, JeVeuxAiderMission } from "./JVARepository";
import { logger } from "../../logger";
import { capture } from "../../sentry";
import { jva2SnuDomaines, JvaStructureException, SnuStructureException } from "./JVAUtils";
import slack from "../../slack";

const fromUser = { firstName: "Cron JeVeuxAiderService.js" };

const MISSION_SUBMISSION_DEADLINE = new Date("2026-07-15T23:59:59.999Z");
const MISSION_START_DATE_LIMIT = new Date("2026-11-09T23:59:59.999Z");
const MISSION_END_DATE_LIMIT = new Date("2026-11-09T00:00:00.000Z");

function formatStructure(jvaStructure): Partial<StructureType> {
  return {
    name: jvaStructure.name,
    description: sanitizeStoredHtml(jvaStructure.description),
    website: jvaStructure.website,
    facebook: jvaStructure.facebook,
    twitter: jvaStructure.twitter,
    instagram: jvaStructure.instagram,
    status: "VALIDATED",
    isNetwork: "false",
    address: jvaStructure.address.address,
    zip: jvaStructure.address.zip,
    city: jvaStructure.address.city,
    department: departmentLookUp[jvaStructure.address.department],
    region: department2region[departmentLookUp[jvaStructure.address.department]],
    country: jvaStructure.address.country,
    location: {
      lon: Number(jvaStructure.address.longitude),
      lat: Number(jvaStructure.address.latitude),
    },
    isJvaStructure: "true",
    jvaStructureId: jvaStructure.id,
    jvaRawData: jvaStructure,
  };
}
function formatResponsable(resp, structureId: string): Partial<ReferentType> {
  return {
    firstName: resp.first_name,
    lastName: resp.last_name,
    email: resp.email,
    phone: resp?.phone !== "null" ? resp?.phone : undefined,
    mobile: resp?.mobile !== "null" ? resp?.mobile : undefined,
    role: ROLES.RESPONSIBLE,
    // Le compte est cree a partir de donnees externes (les `responsables` d'une organisation
    // moderee cote jeveuxaider.gouv.fr) : il ne doit pas etre utilisable sans validation SNU.
    // Le schema referent vaut `ACTIVE` par defaut, et un compte ACTIVE sans mot de passe
    // s'active en self-service par le titulaire de l'adresse (POST /referent/forgot_password,
    // /forgot_password_reset puis /signin), ce qui contournerait la fermeture de
    // POST /referent/signup. `INACTIVE` bloque ces trois routes ; un agent SNU active le compte
    // depuis la fiche utilisateur de l'espace admin une fois la structure verifiee.
    status: ReferentStatus.INACTIVE,
    structureId,
  };
}
function formatMission(mission: JeVeuxAiderMission, structure: StructureDocument, referentMission: ReferentDocument): Partial<MissionType> {
  const startAt = new Date(mission.startAt);
  const endAt = new Date(mission.endAt);
  const [description, actions] = mission.descriptionHtml.split("Objectifs:");

  let missionEndDate = mission.endAt ? addHours(endAt, 2) : MISSION_END_DATE_LIMIT;
  if (missionEndDate > MISSION_END_DATE_LIMIT) {
    missionEndDate = MISSION_END_DATE_LIMIT;
  }

  return {
    name: mission.title,
    // HTML fourni par JeVeuxAider, rendu tel quel dans les fiches mission de app et admin (GOO-19).
    description: sanitizeStoredHtml(description),
    actions: sanitizeStoredHtml(actions),
    mainDomain: jva2SnuDomaines[mission.domain],
    startAt: addHours(startAt, 2),
    endAt: missionEndDate,
    placesTotal: mission.snuPlaces,
    frequence: sanitizeStoredHtml(mission.schedule),
    structureId: structure.id,
    structureName: structure.name,
    tutorId: referentMission.id,
    tutorName: getTutorName({ firstName: referentMission.firstName, lastName: referentMission.lastName }),
    zip: mission.addresses[0]?.postalCode,
    address: mission.addresses[0]?.street,
    city: mission.addresses[0]?.city,
    department: mission.addresses[0]?.departmentName,
    region: mission.addresses[0]?.region,
    country: mission.addresses[0]?.country == "FR" ? "France" : mission.addresses[0]?.country,
    location: mission.addresses[0]?.location,
    isJvaMission: "true",
    jvaMissionId: parseInt(mission.clientId),
    apiEngagementId: mission._id,
    jvaRawData: mission,
    lastSyncAt: new Date(),

    updatedAt: new Date(mission.updatedAt),
    createdAt: new Date(mission.postedAt),
  };
}

async function createReferentIfNotExists(resp, structureId: string): Promise<ReferentDocument | null> {
  if (await ReferentModel.exists({ email: resp.email })) return null;
  const ref = new ReferentModel(formatResponsable(resp, structureId));
  const referent = await ref.save({ fromUser });
  await slack.info({
    channel: config.SLACK_JVA_CHANNEL,
    title: "Compte responsable JVA a activer",
    text: `Le compte ${referent.email} (structure ${structureId}) a ete cree depuis JeVeuxAider et laisse INACTIF. Il doit etre active manuellement apres verification de la structure.`,
  });
  return referent;
}

async function createStructure(mission: JeVeuxAiderMission): Promise<StructureDocument | undefined> {
  const jvaStructure = await fetchStructureById(mission.organizationClientId);
  if (!jvaStructure) {
    return;
  }
  if (!jvaStructure?.responsables?.length) {
    return;
  }

  const newStructure = new StructureModel(formatStructure(jvaStructure));
  const structure = await newStructure.save({ fromUser });
  logger.info(`Structure ${structure.id} created`);

  //Create responsable
  logger.info(`Creating responsables for structure ${structure.id}`);
  const referentPromises = jvaStructure.responsables.map((resp) => createReferentIfNotExists(resp, structure.id));
  await Promise.all(referentPromises);

  return structure;
}

async function createResponsablesForStructure(structure: StructureDocument, jvaStructureId: number): Promise<void> {
  const jvaStructure = await fetchStructureById(jvaStructureId);
  if (!jvaStructure?.responsables?.length) {
    return;
  }
  logger.info(`Creating responsables for existing structure ${structure.id}`);
  const referentPromises = jvaStructure.responsables.map((resp) => createReferentIfNotExists(resp, structure.id));
  await Promise.all(referentPromises);
}

async function getOrCreateStructure(mission: JeVeuxAiderMission): Promise<StructureDocument | undefined> {
  const existingStructure = await StructureModel.findOne({ jvaStructureId: mission.organizationClientId });
  if (existingStructure) {
    const hasReferent = await ReferentModel.exists({ structureId: existingStructure.id });
    if (!hasReferent) {
      await createResponsablesForStructure(existingStructure, mission.organizationClientId);
    }
    return existingStructure;
  }

  try {
    return await createStructure(mission);
  } catch (error: unknown) {
    // Erreur E11000 = duplicate key (race condition)
    if (error instanceof Error && "code" in error && (error as { code: number }).code === 11000) {
      logger.info(`Structure ${mission.organizationClientId} already created by concurrent process, fetching...`);
      return (await StructureModel.findOne({ jvaStructureId: mission.organizationClientId })) ?? undefined;
    }
    throw error;
  }
}

// Statuts décidés côté SNU (refus, archivage) ou annulation : la synchro JVA ne les rouvre jamais.
const CLOSED_MISSION_STATUSES: string[] = [MISSION_STATUS.CANCEL, MISSION_STATUS.REFUSED, MISSION_STATUS.ARCHIVED];
// Candidatures qui occupent une place, comme dans applicationService.updateMission.
const APPLICATION_STATUSES_TAKING_PLACE = [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE];

async function updateMission(mission: MissionDocument, updatedMission: Partial<MissionType>): Promise<MissionDocument> {
  const oldMissionTutorId = mission.tutorId;
  delete updatedMission.name;
  delete updatedMission.description;
  delete updatedMission.actions;
  delete updatedMission.frequence;
  // Une mission déjà rattachée garde son tuteur et sa structure : une réaffectation se fait côté SNU,
  // pas depuis des données externes (L29 de l'audit du 21/09/2026).
  if (mission.tutorId) {
    delete updatedMission.tutorId;
    delete updatedMission.tutorName;
  }
  if (mission.structureId) {
    delete updatedMission.structureId;
    delete updatedMission.structureName;
  }
  // Recalculées depuis les candidatures : l'ancien calcul incrémental dérivait et pouvait devenir négatif.
  const placesTotal = updatedMission.placesTotal ?? mission.placesTotal;
  const placesTaken = await ApplicationModel.countDocuments({ missionId: mission._id, status: { $in: APPLICATION_STATUSES_TAKING_PLACE } });
  const placesLeft = Math.max(0, placesTotal - placesTaken);
  const placesStatus = placesLeft === 0 ? "FULL" : placesLeft === placesTotal ? "EMPTY" : "ONE_OR_MORE";
  mission.set({
    ...updatedMission,
    placesLeft,
    placesStatus,
  });
  if (CLOSED_MISSION_STATUSES.includes(mission.status)) {
    logger.info(`Mission ${mission.jvaMissionId} is ${mission.status} on SNU side, status kept.`);
  }
  await mission.save({ fromUser });
  if (updatedMission.tutorId && oldMissionTutorId !== updatedMission.tutorId) {
    await updateApplicationTutor(mission, fromUser);
  }
  return mission;
}

export async function syncMissions() {
  const limit = 50;

  for (let skip = 0; ; skip += limit) {
    logger.info(`Fetching missions from ${skip} to ${skip + limit}`);
    const result = await fetchMissions(skip);
    if (!result || !result.ok) throw new Error("sync with JVA missions : " + (result?.code || "unknown error"));

    if (!result.data || result.data.length === 0) {
      logger.info(`No more missions to fetch. Total synced: ${skip}`);
      break;
    }

    // Do not parallelize because of shared structures and referents.
    for (const mission of result.data) {
      try {
        await syncMission(mission);
      } catch (e) {
        capture(e);
      }
    }

    if (result.data.length < limit) {
      logger.info(`Last page reached. Total synced: ${skip + result.data.length}`);
      break;
    }
  }
}

export async function syncMission(mission: JeVeuxAiderMission): Promise<MissionDocument | undefined> {
  logger.info(`Syncing mission ${mission.clientId}: ${mission.title}`);

  const now = new Date();
  if (now > MISSION_SUBMISSION_DEADLINE) {
    const existingMission = await MissionModel.findOne({ jvaMissionId: mission.clientId });
    if (!existingMission) {
      logger.info(`Mission ${mission.clientId} not created because submission deadline is passed.`);
      await slack.info({
        title: "Mission JVA non creee",
        text: `La mission ${mission.title} (${mission.clientId}) n'a pas ete creee car la date limite de depot est depassee depuis le 15/07/2026.`,
      });
      return;
    }
  }

  const startAt = new Date(mission.startAt);
  if (startAt > MISSION_START_DATE_LIMIT) {
    const oldMission = await MissionModel.findOne({ jvaMissionId: mission.clientId });
    if (oldMission) {
      oldMission.status = MISSION_STATUS.CANCEL;
      await oldMission.save({ fromUser });
      logger.info(`Mission ${mission.clientId} cancelled because start date is after limit.`);
      await slack.info({
        title: "Mission JVA annulée",
        text: `La mission ${mission.title} (${mission.clientId}) a été annulée car sa date de début est après le 09/11/2026.`,
      });
    } else {
      logger.info(`Mission ${mission.clientId} not created because start date is after limit.`);
    }
    return;
  }

  if (JvaStructureException.includes(mission.organizationClientId.toString())) {
    logger.info(`Structure ${mission.organizationClientId} is in JVA exception list, skipping mission ${mission.clientId}`);
    return;
  }

  let structure = await getOrCreateStructure(mission);
  if (!structure) {
    logger.warn(`No structure created for mission ${mission.clientId} (jvaStructureId: ${mission.organizationClientId})`);
    return;
  }

  if (SnuStructureException.includes(structure?.id)) {
    logger.info(`Structure ${structure.id} is in SNU exception list, skipping mission ${mission.clientId}`);
    return;
  }

  const referent = await ReferentModel.findOne({ structureId: structure.id });
  if (!referent) {
    logger.warn(`No referent found for structure ${structure.id} (jvaStructureId: ${structure.jvaStructureId}), skipping mission ${mission.clientId}`);
    return;
  }

  //Create or update mission
  const formattedMission = formatMission(mission, structure, referent);

  const oldMission = await MissionModel.findOne({ jvaMissionId: mission.clientId });
  if (!oldMission) {
    logger.info(`Creating mission ${mission.clientId}`);
    const data = await MissionModel.create({
      ...formattedMission,
      placesLeft: mission.snuPlaces,
      status: MISSION_STATUS.WAITING_VALIDATION,
    });
    await notifyReferentsNewMission(data, referent);
    return data;
  }

  logger.info(`Updating mission ${mission.clientId}`);
  return updateMission(oldMission, formattedMission);
}

export async function cancelOldMissions(startTime: Date) {
  // TODO: Trouver un moyen de distinguer les missions non trouvées (= celles annulées par JVA) de celles qui n'ont pas été synchronisées à cause d'une erreur.
  // Actuellement, on annule toutes les missions non synchronisées, qu'elles soient fournies par JVA ou non.
  const missionsToCancel = await MissionModel.find({
    isJvaMission: "true",
    lastSyncAt: { $lte: startTime },
    status: { $nin: [MISSION_STATUS.CANCEL, MISSION_STATUS.ARCHIVED, MISSION_STATUS.REFUSED] },
  });
  const cancelMissionPromises = missionsToCancel.map((mission) => cancelMission(mission));
  await Promise.all(cancelMissionPromises);
}

async function cancelMission(mission: MissionDocument): Promise<MissionDocument> {
  logger.info(`Cancelling mission ${mission.jvaMissionId}`);
  mission.set({ status: MISSION_STATUS.CANCEL });
  await mission.save({ fromUser });
  await updateApplicationStatus(mission, fromUser);
  await notifyReferentCancelMission(mission);
  return mission;
}

async function notifyReferentsNewMission(mission: MissionDocument, referentMission: ReferentDocument) {
  //Send mail to responsable mission
  if (referentMission && referentMission.status !== ReferentStatus.INACTIVE) {
    await sendTemplate(SENDINBLUE_TEMPLATES.referent.MISSION_WAITING_VALIDATION, {
      emailTo: [{ name: `${referentMission.firstName} ${referentMission.lastName}`, email: referentMission.email }],
      params: {
        missionName: mission.name,
      },
    });
  }

  //Send mail to responsable department
  if (!mission.department) return;

  const referentsDepartment = await ReferentModel.find({
    department: mission.department,
    subRole: { $in: ["manager_department_phase2", "manager_phase2"] },
    status: ReferentStatus.ACTIVE,
  });

  if (referentsDepartment?.length) {
    await sendTemplate(SENDINBLUE_TEMPLATES.referent.NEW_MISSION, {
      emailTo: referentsDepartment?.map((referent) => ({ name: `${referent.firstName} ${referent.lastName}`, email: referent.email })),
      params: {
        cta: `${config.ADMIN_URL}/mission/${mission._id}`,
      },
    });
  }
}

async function notifyReferentCancelMission(mission: MissionDocument) {
  const referent = await ReferentModel.findOne({ _id: mission.tutorId });
  if (!referent || referent.status === ReferentStatus.INACTIVE) return;
  await sendTemplate(SENDINBLUE_TEMPLATES.referent.MISSION_CANCEL, {
    emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
    params: { missionName: mission.name },
  });
}
