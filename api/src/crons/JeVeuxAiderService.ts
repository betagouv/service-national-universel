import { config } from "../config";
import { addHours, addYears } from "date-fns";
import { department2region, departmentLookUp, MISSION_DOMAINS, MISSION_STATUS, MissionType, ReferentType, ROLES, SENDINBLUE_TEMPLATES, StructureType } from "snu-lib";
import { getTutorName } from "../services/mission";
import { MissionDocument, MissionModel, ReferentDocument, ReferentModel, StructureDocument, StructureModel } from "../models";
import { updateApplicationStatus, updateApplicationTutor } from "../services/application";
import { sendTemplate } from "../brevo";
import { fetchStructureById, JeVeuxAiderMission } from "./JeVeuxAiderRepository";

const fromUser = { firstName: "Cron JeVeuxAiderService.js" };

const jva2SnuDomaines = {
  education: MISSION_DOMAINS.EDUCATION,
  environnement: MISSION_DOMAINS.ENVIRONMENT,
  sport: MISSION_DOMAINS.SPORT,
  sante: MISSION_DOMAINS.HEALTH,
  "solidarite-insertion": MISSION_DOMAINS.SOLIDARITY,
  "prevention-protection": MISSION_DOMAINS.SECURITY,
  "culture-loisirs": MISSION_DOMAINS.CULTURE,
  "benevolat-competences": MISSION_DOMAINS.SOLIDARITY,
  "vivre-ensemble": MISSION_DOMAINS.CITIZENSHIP,
};
const JvaStructureException = [
  "6890", //Fédération Médico-psychosociale à la Personne-Initiative
  "14392", //Autisme espoir
  "13419", //AUTISME ESPOIR VERS L'ÉCOLE
];
const SnuStructureException = [
  "62b9f02788469607439b733a", //Fédération Médico-psychosociale à la Personne-Initiative
  "63762279c6ccb008d446f6bc", //Autisme espoir
  "62de85c299f28207ac826fc5", //AUTISME ESPOIR VERS L'ÉCOLE
];

export async function fetchMissionsToCancel(startTime: Date) {
  return await MissionModel.find({
    isJvaMission: "true",
    lastSyncAt: { $lte: startTime },
    status: { $nin: [MISSION_STATUS.CANCEL, MISSION_STATUS.ARCHIVED, MISSION_STATUS.REFUSED] },
  });
}

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

  return {
    name: mission.title,
    description,
    actions,
    mainDomain: jva2SnuDomaines[mission.domain],
    startAt: addHours(startAt, 2),
    endAt: mission.endAt ? addHours(endAt, 2) : addYears(startAt, 1),
    placesTotal: mission.snuPlaces,
    frequence: mission.schedule,
    structureId: structure.id,
    structureName: structure.name,
    status: MISSION_STATUS.WAITING_VALIDATION,
    tutorId: referentMission.id,
    tutorName: getTutorName({ firstName: referentMission.firstName, lastName: referentMission.lastName }),
    zip: mission.postalCode,
    address: mission.address,
    city: mission.city,
    department: mission.departmentName,
    region: mission.region,
    country: "France",
    location: mission.location,
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
  let jvaStructure = await fetchStructureById(mission.organizationId);
  if (!jvaStructure?.responsables.length) return;

  const structure = await StructureModel.create(formatStructure(jvaStructure));

  //Create responsable
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
  mission.set({ ...updatedMission, placesLeft, status: MISSION_STATUS.WAITING_VALIDATION });
  await mission.save({ fromUser });
  if (oldMissionTutorId !== updatedMission.tutorId) {
    await updateApplicationTutor(mission, fromUser);
  }
  return mission;
}

export async function syncMission(mission: JeVeuxAiderMission): Promise<MissionDocument | undefined> {
  if (JvaStructureException.includes(mission.organizationId)) return;

  let structure = await StructureModel.findOne({ jvaStructureId: mission.organizationId });
  if (!structure) {
    const newStructure = await createStructure(mission);
    if (!newStructure) throw new Error("No structure created");
    structure = newStructure;
  }

  if (SnuStructureException.includes(structure?._id.toString())) return;

  //Get referent mission
  let referent = await ReferentModel.findOne({ structureId: structure.id });
  if (!referent) throw new Error("No referent found");

  //Create or update mission
  const infoMission = formatMission(mission, structure, referent);

  const missionExist = await MissionModel.findOne({ jvaMissionId: mission.clientId });
  if (!missionExist) {
    const data = await MissionModel.create({ ...infoMission, placesLeft: mission.snuPlaces });
    if (!data) throw new Error("No mission created");
    if (referent) {
      await notifyReferentsNewMission(data, referent);
    }
    return data;
  }

  const data = await updateMission(missionExist, infoMission);
  if (!data) throw new Error("No mission updated");
  return data;
}

export async function cancelMission(mission: MissionDocument): Promise<MissionDocument> {
  mission.set({ status: MISSION_STATUS.CANCEL });
  const data = await mission.save({ fromUser });
  if (!data) throw new Error("Mission not updated");
  await updateApplicationStatus(mission, fromUser);
  await notifyReferentCancelMission(mission);
  return data;
}

async function notifyReferentsNewMission(mission: MissionDocument, referentMission: ReferentDocument) {
  //Send mail to responsable department
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

  //Send mail to responsable mission
  if (referentMission) {
    await sendTemplate(SENDINBLUE_TEMPLATES.referent.MISSION_WAITING_VALIDATION, {
      emailTo: [{ name: `${referentMission.firstName} ${referentMission.lastName}`, email: referentMission.email }],
      params: {
        missionName: mission.name,
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
