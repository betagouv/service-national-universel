import { config } from "../../config";
import { addHours } from "date-fns";
import { department2region, departmentLookUp, MISSION_STATUS, MissionType, ReferentType, ROLES, SENDINBLUE_TEMPLATES, StructureType } from "snu-lib";
import { getTutorName } from "../../services/mission";
import { MissionDocument, MissionModel, ReferentDocument, ReferentModel, StructureDocument, StructureModel } from "../../models";
import { updateApplicationStatus, updateApplicationTutor } from "../../application/applicationService";
import { sendTemplate } from "../../brevo";
import { fetchMissions, fetchStructureById, JeVeuxAiderMission } from "./JVARepository";
import { logger } from "../../logger";
import { capture } from "../../sentry";
import { jva2SnuDomaines, JvaStructureException, SnuStructureException } from "./JVAUtils";
import slack from "../../slack";

const fromUser = { firstName: "Cron JeVeuxAiderService.js" };

const MISSION_START_DATE_LIMIT = new Date("2026-07-15T23:59:59.999Z");
const MISSION_END_DATE_LIMIT = new Date("2026-11-09T00:00:00.000Z");

function formatStructure(jvaStructure): Partial<StructureType> {
  return {
    name: jvaStructure.name,
    description: jvaStructure.description,
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
    description,
    actions,
    mainDomain: jva2SnuDomaines[mission.domain],
    startAt: addHours(startAt, 2),
    endAt: missionEndDate,
    placesTotal: mission.snuPlaces,
    frequence: mission.schedule,
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
  return await ref.save({ fromUser });
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

async function updateMission(mission: MissionDocument, updatedMission: Partial<MissionType>): Promise<MissionDocument> {
  const oldMissionTutorId = mission.tutorId;
  delete updatedMission.name;
  delete updatedMission.description;
  delete updatedMission.actions;
  delete updatedMission.frequence;
  const placesLeft = mission.placesLeft + updatedMission.placesTotal! - mission.placesTotal;
  mission.set({
    ...updatedMission,
    placesLeft,
  });
  if (mission.status === MISSION_STATUS.CANCEL) {
    mission.set({ status: MISSION_STATUS.WAITING_VALIDATION });
  }
  await mission.save({ fromUser });
  if (oldMissionTutorId !== updatedMission.tutorId) {
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

  const startAt = new Date(mission.startAt);
  if (startAt > MISSION_START_DATE_LIMIT) {
    const oldMission = await MissionModel.findOne({ jvaMissionId: mission.clientId });
    if (oldMission) {
      oldMission.status = MISSION_STATUS.CANCEL;
      await oldMission.save({ fromUser });
      logger.info(`Mission ${mission.clientId} cancelled because start date is after limit.`);
      await slack.info({
        title: "Mission JVA annulée",
        text: `La mission ${mission.title} (${mission.clientId}) a été annulée car sa date de début est après le 15/07/2026.`,
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

  let structure = await StructureModel.findOne({ jvaStructureId: mission.organizationClientId });
  if (!structure) {
    const newStructure = await createStructure(mission);
    if (!newStructure) {
      logger.warn(`No structure created for mission ${mission.clientId} (jvaStructureId: ${mission.organizationClientId})`);
      return;
    }
    structure = newStructure;
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
  if (referentMission) {
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
  if (!referent) return;
  await sendTemplate(SENDINBLUE_TEMPLATES.referent.MISSION_CANCEL, {
    emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
    params: { missionName: mission.name },
  });
}
