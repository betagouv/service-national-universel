const fetch = require("node-fetch");
const path = require("path");
const { addYears, addHours } = require("date-fns");
const fileName = path.basename(__filename, ".js");
const { capture } = require("../sentry");
const config = require("config");
const slack = require("../slack");
const { MissionModel } = require("../models");
const { StructureModel } = require("../models");
const { ReferentModel } = require("../models");

const { sendTemplate } = require("../brevo");

const { ROLES, departmentLookUp, department2region, MISSION_DOMAINS, MISSION_STATUS, SENDINBLUE_TEMPLATES } = require("snu-lib");
const { updateApplicationStatus, updateApplicationTutor } = require("../services/application");
const { getTutorName } = require("../services/mission");

let startTime = new Date();

const fromUser = { firstName: `Cron ${fileName}` };

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

const fetchMission = (skip = 0) =>
  fetch(`${config.API_ENGAGEMENT_URL}/v2/mission?snu=true&skip=${skip}&limit=50`, {
    headers: { "x-api-key": config.API_ENGAGEMENT_KEY },
    method: "GET",
  })
    .then((response) => response.json())
    .then((result) => sync(result))
    .then((rest) => (rest ? fetchMission(skip + 50) : cleanData()))
    .catch((error) => capture(error));

const fetchStructure = async (id) => {
  return fetch(`https://www.jeveuxaider.gouv.fr/api/api-engagement/organisations/${id}?apikey=${config.JVA_API_KEY}`, {
    method: "GET",
    redirect: "follow",
  })
    .then((response) => response.json())
    .catch((error) => capture(error));
};

const sync = async (result) => {
  if (!result.ok) {
    throw new Error("sync with JVA missions : " + result.code);
  }

  for (let i = 0; i < result.data.length; i++) {
    try {
      const mission = result.data[i];

      //stop sync for exception
      if (JvaStructureException.includes(mission.organizationId)) continue;

      let structure = await StructureModel.findOne({ jvaStructureId: mission.organizationId });

      //stop sync for exception
      if (SnuStructureException.includes(structure?._id.toString())) continue;

      if (!structure) {
        //get JVA struture
        let jvaStructure = await fetchStructure(mission.organizationId);

        //Struct without resp skip
        if (!jvaStructure?.responsables.length) {
          continue;
        }

        //Create responsable
        let newResps = [];
        for (const resp of jvaStructure.responsables) {
          //Check unique email
          const exist = await ReferentModel.findOne({ email: resp.email });
          if (exist) {
            continue;
          }

          //Create referent
          const user = await ReferentModel.create({
            firstName: resp.first_name,
            lastName: resp.last_name,
            email: resp.email,
            phone: resp?.phone !== "null" ? resp?.phone : undefined,
            mobile: resp?.mobile !== "null" ? resp?.mobile : undefined,
            role: ROLES.RESPONSIBLE,
          });
          newResps.push(user);
        }

        //Error on referent creation
        if (!newResps.length) {
          continue;
        }

        //Create structure
        const infoStructure = {
          name: jvaStructure.name,
          description: jvaStructure.description,
          website: jvaStructure.website,
          facebook: jvaStructure.facebook,
          twitter: jvaStructure.twitter,
          instagram: jvaStructure.instagram,
          status: "VALIDATED",
          isNetwork: false,
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

        const newStructure = await StructureModel.create(infoStructure);

        //Set structureId to referent
        for (const resp of newResps) {
          resp.set({ structureId: newStructure.id });
          await resp.save({ fromUser });
        }
        structure = newStructure;
      }

      //Get referent mission
      let referentMission = await ReferentModel.findOne({ structureId: structure.id });

      //Create or updade mission
      const startAt = new Date(mission.startAt);
      const endAt = new Date(mission.endAt);
      const [description, actions] = mission.descriptionHtml.split("Objectifs:");

      const infoMission = {
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
        tutorName: getTutorName(referentMission),
        zip: mission.postalCode,
        address: mission.address,
        city: mission.city,
        department: mission.department,
        region: mission.region,
        country: "France",
        location: mission.location,
        isJvaMission: true,
        jvaMissionId: mission.clientId,
        apiEngagementId: mission._id,
        jvaRawData: mission,
        lastSyncAt: Date.now(),

        updatedAt: new Date(mission.updatedAt),
        createdAt: new Date(mission.postedAt),
      };

      //Check if mission exist
      const missionExist = await MissionModel.findOne({ jvaMissionId: mission.clientId });
      if (!missionExist) {
        const data = await MissionModel.create({ ...infoMission, placesLeft: mission.snuPlaces });

        //Send mail to responsable department
        const referentsDepartment = await ReferentModel.find({
          department: data.department,
          subRole: { $in: ["manager_department_phase2", "manager_phase2"] },
        });

        if (referentsDepartment?.length) {
          await sendTemplate(SENDINBLUE_TEMPLATES.referent.NEW_MISSION, {
            emailTo: referentsDepartment?.map((referent) => ({ name: `${referent.firstName} ${referent.lastName}`, email: referent.email })),
            params: {
              cta: `${config.ADMIN_URL}/mission/${data._id}`,
            },
          });
        }

        //Send mail to responsable mission
        if (referentMission) {
          await sendTemplate(SENDINBLUE_TEMPLATES.referent.MISSION_WAITING_VALIDATION, {
            emailTo: [{ name: `${referentMission.firstName} ${referentMission.lastName}`, email: referentMission.email }],
            params: {
              missionName: data.name,
            },
          });
        }
      } else {
        const oldMissionTutorId = missionExist.tutorId;
        delete infoMission.status;
        delete infoMission.name;
        delete infoMission.description;
        delete infoMission.actions;
        delete infoMission.frequence;
        const left = missionExist.placesLeft + infoMission.placesTotal - missionExist.placesTotal;
        missionExist.set({ ...infoMission, placesLeft: left });
        await missionExist.save({ fromUser });
        if (oldMissionTutorId !== infoMission.tutorId) {
          await updateApplicationTutor(missionExist, fromUser);
        }
      }
    } catch (e) {
      capture(e);
    }
  }
  return result.skip < result.total ? true : false;
};

const cleanData = async () => {
  slack.info({ title: "sync with JVA missions", text: "I'm cleaning the outdated JVA missions !" });
  try {
    const missionsTodelete = await MissionModel.find({
      lastSyncAt: { $lte: startTime },
      isJvaMission: "true",
      status: { $nin: [MISSION_STATUS.CANCEL, MISSION_STATUS.ARCHIVED, MISSION_STATUS.REFUSED] },
    });
    //Cancel mission
    for (const mission of missionsTodelete) {
      mission.set({ status: MISSION_STATUS.CANCEL });
      await mission.save({ fromUser });

      //Check and cancel application link to the mission
      await updateApplicationStatus(mission, fromUser);

      //Send mail to referent mission
      const referent = await ReferentModel.findOne({ _id: mission.tutorId });
      await sendTemplate(SENDINBLUE_TEMPLATES.referent.MISSION_CANCEL, {
        emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
        params: {
          missionName: mission.name,
        },
      });
    }
    await slack.success({ title: "sync with JVA missions" });
  } catch (error) {
    capture(error);
    slack.error({ title: "sync with JVA missions", text: "Error while deleting outdated missions !" });
  }
};

exports.handler = async () => {
  slack.info({ title: "sync with JVA missions", text: "I'm starting the synchronization !" });
  if (!config.JVA_API_KEY) {
    slack.error({ title: "sync with JVA missions", text: "I do not have any JVA_API_KEY !" });
    const err = new Error("NO JVA_API_KEY");
    capture(err);
    throw err;
  }
  if (!config.API_ENGAGEMENT_KEY) {
    slack.error({ title: "sync with API-ENGAGEMENT missions", text: "I do not have any API_ENGAGEMENT_KEY !" });
    const err = new Error("NO API_ENGAGEMENT_KEY");
    capture(err);
    throw err;
  }
  try {
    await fetchMission();
  } catch (e) {
    capture(e);
    throw e;
  }
};
