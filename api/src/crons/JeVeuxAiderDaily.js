require("dotenv").config({ path: "./../../.env-staging" });

const fetch = require("node-fetch");
require("../mongo");
const { capture } = require("../sentry");
const { JVA_API_KEY } = require("../config");
const slack = require("../slack");
const MissionModel = require("../models/mission");
const StructureModel = require("../models/structure");
const ReferentModel = require("../models/referent");

const { sendTemplate } = require("../sendinblue");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ADMIN_URL } = require("../config");

const { ROLES, departmentLookUp, department2region, MISSION_DOMAINS } = require("snu-lib");
const { updateApplication } = require("../utils/index.js");

let startTime = new Date();

const jva2SnuDomaines = {
  "Mobilisation Covid19": MISSION_DOMAINS.SOLIDARITY,
  "Éducation pour tous": MISSION_DOMAINS.EDUCATION,
  "Santé pour tous": MISSION_DOMAINS.HEALTH,
  "Protection de la nature": MISSION_DOMAINS.ENVIRONMENT,
  "Solidarité et insertion": MISSION_DOMAINS.SOLIDARITY,
  "Solidarité & Insertion": MISSION_DOMAINS.SOLIDARITY,
  "Sport pour tous": MISSION_DOMAINS.SPORT,
  "Prévention et protection": MISSION_DOMAINS.SECURITY,
  "Mémoire et citoyenneté": MISSION_DOMAINS.CITIZENSHIP,
  "Coopération internationale": MISSION_DOMAINS.CITIZENSHIP,
  "Art et culture pour tous": MISSION_DOMAINS.CULTURE,
  "Art & Culture pour tous": MISSION_DOMAINS.CULTURE,
};

const jva2SnuTimePeriod = {
  week: "semaine",
  month: "mois",
  year: "an",
};

const jva2SnuDuration = {
  "1_hour": "1 heure",
  "2_hours": "2 heures",
  half_day: "Une demi-journée",
  day: "1 jour",
  "3_days": "3 jours",
  "5_days": "5 jours",
};

function addOneYear(date) {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + 1);
  return newDate;
}

const fetchMission = (page = 1) => {
  //preoprod : https://jeveuxaider-preprod-router.osc-secnum-fr1.scalingo.io/
  //prod : https://www.jeveuxaider.gouv.fr/
  fetch(`https://www.jeveuxaider.gouv.fr/api/api-engagement/missions?filter[is_snu_mig_compatible]=1&apikey=${JVA_API_KEY}&page=${page}`, {
    method: "GET",
    redirect: "follow",
  })
    .then((response) => response.json())
    .then((result) => sync(result))
    .then((rest) => (rest ? fetchMission(++page) : cleanData()))
    .catch((error) => console.log("error fetch mission :", error));
};

const fetchStructure = async (id) => {
  return fetch(`https://www.jeveuxaider.gouv.fr/api/api-engagement/organisations/${id}?apikey=${JVA_API_KEY}`, {
    method: "GET",
    redirect: "follow",
  })
    .then((response) => response.json())
    .catch((error) => console.log("error fetch struture :", error));
};

const sync = async (result) => {
  //console.log("Nombre de missions traitées (current iteration)", result.data.length);
  //console.log("API page", result.current_page);

  for (let i = 0; i < result.data.length; i++) {
    try {
      const mission = result.data[i];
      let structure = await StructureModel.findOne({ jvaStructureId: mission.structure.id });
      if (!structure) {
        // console.log("Create new struct");
        //get JVA struture
        let jvaStructure = await fetchStructure(mission.structure.id);

        //Struct without resp skip
        if (!jvaStructure?.responsables.length) {
          // console.log("Skip structure : no resp");
          continue;
        }

        //Create responsable
        let newResps = [];
        for (const resp of jvaStructure.responsables) {
          //Check unique email
          const exist = await ReferentModel.findOne({ email: resp.email });
          if (exist) {
            // console.log("Skip referent : email already registered");
            continue;
          }

          //Create referent
          const user = await ReferentModel.create({
            firstName: resp.first_name,
            lastName: resp.last_name,
            email: resp.email,
            role: ROLES.RESPONSIBLE,
          });
          newResps.push(user);
        }

        //Error on referent creation
        if (!newResps.length) {
          // console.log("Skip structure : error creation referent");
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
        if (!newStructure) {
          // console.log("Skip structure : error creation structure");
        }

        //Set structureId to referent
        for (const resp of newResps) {
          resp.set({ structureId: newStructure.id });
          await resp.save();
        }
        structure = newStructure;
      }

      //Get referent mission
      let referentMission = await ReferentModel.findOne({ email: mission.responsable.email });
      if (!referentMission) {
        //Create referent
        referentMission = await ReferentModel.create({
          firstName: mission.responsable.first_name,
          lastName: mission.responsable.last_name,
          email: mission.responsable.email,
          role: ROLES.RESPONSIBLE,
          structureId: structure.id,
        });
      } else if (referentMission.structureId !== structure.id) {
        // console.log("Skip mission : error referent links to another structure");
        continue;
      }

      //Create or updade mission
      const frequence = mission.commitment.time_period
        ? mission.commitment.duration
          ? jva2SnuDuration[mission.commitment.duration] + " par " + jva2SnuTimePeriod[mission.commitment.time_period]
          : ""
        : "";

      const infoMission = {
        name: mission.name,
        mainDomain: jva2SnuDomaines[mission.domaine.name],
        startAt: new Date(mission.start_date),
        endAt: mission.end_date ? new Date(mission.end_date) : addOneYear(mission.start_date),
        placesTotal: mission.snu_mig_places,
        description: mission.objectifs,
        frequence: frequence,
        actions: mission.description,
        structureId: structure.id,
        structureName: structure.name,
        status: "WAITING_VALIDATION",
        tutorId: referentMission.id,
        tutorName: `${referentMission.firstName} ${referentMission.lastName}`,
        zip: mission.address.zip,
        address: mission.address.address,
        city: mission.address.city,
        department: departmentLookUp[mission.address.department],
        region: department2region[departmentLookUp[mission.address.department]],
        country: "France",
        location: {
          lat: Number(mission.address.latitude),
          lon: Number(mission.address.longitude),
        },
        isJvaMission: true,
        jvaMissionId: mission.id,
        jvaRawData: mission,
        lastSyncAt: Date.now(),

        updatedAt: new Date(mission.updated_at),
        createdAt: new Date(mission.created_at),
      };

      //Check if mission exist
      const missionExist = await MissionModel.findOne({ jvaMissionId: mission.id });
      if (!missionExist) {
        // console.log("Create new mission");
        const data = await MissionModel.create({ ...infoMission, placesLeft: mission.snu_mig_places });

        //Send mail to responsable department
        const referentsDepartment = await ReferentModel.find({
          department: data.department,
          subRole: { $in: ["manager_department_phase2", "manager_phase2"] },
        });

        if (referentsDepartment?.length) {
          await sendTemplate(SENDINBLUE_TEMPLATES.referent.NEW_MISSION, {
            emailTo: referentsDepartment?.map((referent) => ({ name: `${referent.firstName} ${referent.lastName}`, email: referent.email })),
            params: {
              cta: `${ADMIN_URL}/mission/${data._id}`,
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
        //ToRemove
        if (missionExist.status === "CANCEL" || missionExist.status === "ARCHIVED") {
          missionExist.set({ status: "WAITING_VALIDATION" });
        }
        // console.log("Update mission");
        delete infoMission.status;
        delete infoMission.name;
        delete infoMission.description;
        delete infoMission.actions;
        delete infoMission.frequence;
        const left = missionExist.placesLeft + infoMission.placesTotal - missionExist.placesTotal;
        missionExist.set({ ...infoMission, placesLeft: left });
        await missionExist.save();
      }
    } catch (e) {
      capture(e);
      console.log("ERROR 🚫", e);
    }
  }
  return result.next_page_url ? true : false;
};

const cleanData = async () => {
  slack.info({ title: "sync with JVA missions", text: "I'm cleaning the outdated JVA missions !" });
  try {
    const missionsTodelete = await MissionModel.find({ lastSyncAt: { $lte: startTime }, isJvaMission: "true" });
    //Cancel mission
    for (const mission of missionsTodelete) {
      mission.set({ status: "CANCEL" });
      await mission.save();

      //Check and cancel application link to the mission
      await updateApplication(mission);

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
    slack.error({ title: "sync with JVA missions", text: "Error while deleting outdated missions !" });
    capture("ERROR WHILE DELETING OUTDATED", error);
  }
};

exports.handler = async () => {
  slack.info({ title: "sync with JVA missions", text: "I'm starting the synchronization !" });
  if (!JVA_API_KEY) {
    slack.error({ title: "sync with JVA missions", text: "I do not have any JVA_API_KEY !" });
    capture("NO JVA_API_KEY");
    return;
  }
  try {
    fetchMission();
  } catch (e) {
    capture(`ERROR`, JSON.stringify(e));
    capture(e);
  }
};
