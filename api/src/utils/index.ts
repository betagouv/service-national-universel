import AWS from "aws-sdk";
import https from "https";
import http from "http";
import passwordValidator from "password-validator";
import sanitizeHtml from "sanitize-html";
import {
  YoungModel,
  ReferentModel,
  ContractModel,
  PlanTransportModel,
  LigneBusModel,
  MeetingPointModel,
  ApplicationModel,
  SessionPhase1Model,
  CohortModel,
  MissionEquivalenceModel,
} from "../models";

import { sendEmail, sendTemplate } from "../brevo";
import path from "path";
import fs from "fs";
import { addDays } from "date-fns";
import { config } from "../config";
import { logger } from "../logger";
import {
  getDepartureDate,
  YOUNG_STATUS_PHASE2,
  SENDINBLUE_TEMPLATES,
  YOUNG_STATUS,
  APPLICATION_STATUS,
  ROLES,
  SUB_ROLES,
  EQUIVALENCE_STATUS,
  DEPART_SEJOUR_MOTIFS_NOT_DONE,
} from "snu-lib";
import { capture, captureMessage } from "../sentry";
import { getCohortDateInfo } from "./cohort";
import dayjs from "dayjs";
import { getCohortIdsFromCohortName } from "../cohort/cohortService";
import { updateStatusPhase1WithOldRules, updateStatusPhase1WithSpecificCase } from "./old_cohorts_logic";

// Timeout a promise in ms
export const timeout = (prom, time) => {
  let timer;
  return Promise.race([prom, new Promise((_r, rej) => (timer = setTimeout(rej, time)))]).finally(() => clearTimeout(timer));
};

export function sanitizeAll(text) {
  return sanitizeHtml(text || "", { allowedTags: ["li", "br", "b"], allowedAttributes: {} });
}

export function getReq(url, cb) {
  if (url.toString().indexOf("https") === 0) return https.get(url, cb);
  return http.get(url, cb);
}

export const SUPPORT_BUCKET_CONFIG = {
  bucket: config.PUBLIC_BUCKET_NAME_SUPPORT,
  endpoint: config.CELLAR_ENDPOINT_SUPPORT,
  accessKeyId: config.CELLAR_KEYID_SUPPORT,
  secretAccessKey: config.CELLAR_KEYSECRET_SUPPORT,
};

export const DEFAULT_BUCKET_CONFIG = {
  bucket: config.BUCKET_NAME,
  endpoint: config.CELLAR_ENDPOINT,
  accessKeyId: config.CELLAR_KEYID,
  secretAccessKey: config.CELLAR_KEYSECRET,
};

export function uploadFile(path, file, config = DEFAULT_BUCKET_CONFIG) {
  const { bucket, endpoint, accessKeyId, secretAccessKey } = config;
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint, accessKeyId, secretAccessKey });
    const params = {
      Bucket: bucket,
      Key: path,
      Body: file.data,
      ContentEncoding: file.encoding,
      ContentType: file.mimetype,
      Metadata: { "Cache-Control": "max-age=31536000" },
    };

    s3bucket.upload(params, function (err, data) {
      if (err) return reject(`error in callback:${err}`);
      resolve(data);
    });
  });
}

export const getFile = (name, config = DEFAULT_BUCKET_CONFIG): Promise<{ Body: Buffer; ContentLength?: number; ContentType?: string; FileName?: string }> => {
  const { bucket, endpoint, accessKeyId, secretAccessKey } = config;
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint, accessKeyId, secretAccessKey });
    const params = { Bucket: bucket, Key: name };
    s3bucket.getObject(params, (err, data) => {
      if (err) {
        captureMessage(`Error getting file : ${name}`, { extra: { error: err } });
        reject(err);
      } else {
        resolve(data as any);
      }
    });
  });
};

export function uploadPublicPicture(path, file) {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: config.CELLAR_ENDPOINT, accessKeyId: config.CELLAR_KEYID, secretAccessKey: config.CELLAR_KEYSECRET });
    const params = {
      Bucket: config.PUBLIC_BUCKET_NAME,
      Key: path,
      Body: file.data,
      ContentType: file.mimetype,
      ACL: "public-read",
      Metadata: { "Cache-Control": "max-age=31536000" },
    };
    s3bucket.upload(params, function (err, data) {
      if (err) return reject(`error in callback:${err}`);
      resolve(data);
    });
  });
}

export function deleteFile(path) {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: config.CELLAR_ENDPOINT, accessKeyId: config.CELLAR_KEYID, secretAccessKey: config.CELLAR_KEYSECRET });
    const params = { Bucket: config.BUCKET_NAME, Key: path };
    s3bucket.deleteObject(params, (err, data) => {
      if (err) return reject(`error in callback:${err}`);
      resolve(data);
    });
  });
}

export function listFiles(path): any {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: config.CELLAR_ENDPOINT, accessKeyId: config.CELLAR_KEYID, secretAccessKey: config.CELLAR_KEYSECRET });
    const params = { Bucket: config.BUCKET_NAME, Prefix: path };
    s3bucket.listObjects(params, (err, data) => {
      if (err) return reject(`error in callback:${err}`);
      resolve(data.Contents);
    });
  });
}

export function deleteFilesByList(filesList) {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: config.CELLAR_ENDPOINT, accessKeyId: config.CELLAR_KEYID, secretAccessKey: config.CELLAR_KEYSECRET });
    const params = { Bucket: config.BUCKET_NAME, Delete: { Objects: filesList } };
    s3bucket.deleteObjects(params, (err, data) => {
      if (err) return reject(`error in callback:${err}`);
      resolve(data);
    });
  });
}

export function getMetaDataFile(path) {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: config.CELLAR_ENDPOINT, accessKeyId: config.CELLAR_KEYID, secretAccessKey: config.CELLAR_KEYSECRET });
    const params = { Bucket: config.BUCKET_NAME, Key: path };
    s3bucket.headObject(params, (err, data) => {
      if (err) return reject(`error in callback:${err}`);
      resolve(data);
    });
  });
}

export function getSignedUrl(path) {
  const s3bucket = new AWS.S3({ endpoint: config.CELLAR_ENDPOINT, accessKeyId: config.CELLAR_KEYID, secretAccessKey: config.CELLAR_KEYSECRET });
  return s3bucket.getSignedUrl("getObject", {
    Bucket: config.BUCKET_NAME,
    Key: path,
  });
}

export function getSignedUrlForApiAssociation(path) {
  const s3bucket = new AWS.S3({
    endpoint: config.API_ASSOCIATION_CELLAR_ENDPOINT,
    accessKeyId: config.API_ASSOCIATION_CELLAR_KEYID,
    secretAccessKey: config.API_ASSOCIATION_CELLAR_KEYSECRET,
  });
  return s3bucket.getSignedUrl("getObject", {
    Bucket: "association",
    Key: path,
  });
}

export function fileExist(url) {
  return new Promise((resolve) => {
    getReq(url, (resp) => {
      if (resp.statusCode === 200) return resolve(true);
      return resolve(false);
    }).on("error", (err) => {
      resolve(false);
      capture(err);
    });
  });
}

export function validatePassword(password) {
  const schema = new passwordValidator();
  schema
    .is()
    .min(12) // Minimum length 12
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .symbols(); // Must have symbols

  return schema.validate(password);
}

export const updatePlacesCenter = async (center, fromUser) => {
  try {
    const youngs = await YoungModel.find({ cohesionCenterId: center._id });
    const placesTaken = youngs.filter((young) => ["AFFECTED", "WAITING_ACCEPTATION", "DONE"].includes(young.statusPhase1) && young.status === "VALIDATED").length;
    const placesLeft = Math.max(0, center.placesTotal - placesTaken);
    if (center.placesLeft !== placesLeft) {
      logger.debug(`Center ${center.id}: total ${center.placesTotal}, left from ${center.placesLeft} to ${placesLeft}`);
      center.set({ placesLeft });
      await center.save({ fromUser });
    }
  } catch (e) {
    capture(e);
  }
  return center;
};

// first iteration
// duplicate of updatePlacesCenter
// we'll remove the updatePlacesCenter function once the migration is done
export const updatePlacesSessionPhase1 = async (sessionPhase1, fromUser) => {
  try {
    const youngs = await YoungModel.find({ sessionPhase1Id: sessionPhase1._id });
    const placesTaken = youngs.filter(
      (young) => ["AFFECTED", "DONE"].includes(young.statusPhase1) && young.cohesionStayPresence !== "false" && young.status === "VALIDATED",
    ).length;
    const placesLeft = Math.max(0, sessionPhase1.placesTotal - placesTaken);
    if (sessionPhase1.placesLeft !== placesLeft) {
      logger.debug(`sessionPhase1 ${sessionPhase1.id}: total ${sessionPhase1.placesTotal}, left from ${sessionPhase1.placesLeft} to ${placesLeft}`);
      sessionPhase1.set({ placesLeft });
      await sessionPhase1.save({ fromUser });
    }
  } catch (e) {
    capture(e);
  }
  return sessionPhase1;
};

export const placesTakenSessionPhase1 = async (sessionPhase1) => {
  const placesTaken = await YoungModel.countDocuments({
    sessionPhase1Id: sessionPhase1._id,
    status: "VALIDATED",
    statusPhase1: { $in: ["AFFECTED", "DONE"] },
    cohesionStayPresence: { $ne: "false" },
  });
  return placesTaken;
};

export const updateCenterDependencies = async (center, fromUser) => {
  const youngs = await YoungModel.find({ cohesionCenterId: center._id });
  youngs.forEach(async (young) => {
    young.set({
      cohesionCenterName: center.name,
      cohesionCenterZip: center.zip,
      cohesionCenterCity: center.city,
    });
    await young.save({ fromUser });
  });
  const referents = await ReferentModel.find({ cohesionCenterId: center._id });
  referents.forEach(async (referent) => {
    referent.set({ cohesionCenterName: center.name });
    await referent.save({ fromUser });
  });
  const sessions = await SessionPhase1Model.find({ cohesionCenterId: center._id });
  for (let i = 0; i < sessions.length; i++) {
    sessions[i].set({
      department: center.department,
      region: center.region,
      codeCentre: center.code2022,
      nameCentre: center.name,
      zipCentre: center.zip,
      cityCentre: center.city,
    });
    await sessions[i].save({ fromUser });
  }
  const plansDeTransport = await PlanTransportModel.find({ centerId: center._id });
  plansDeTransport.forEach(async (planDeTransport) => {
    planDeTransport.set({
      centerDepartment: center.department,
      centerRegion: center.region,
      centerZip: center?.zip,
      centerAddress: center?.address,
      centerCode: center.code2022,
      centerName: center.name,
    });
    await planDeTransport.save({ fromUser });
  });
};

export const deleteCenterDependencies = async (center, fromUser) => {
  const youngs = await YoungModel.find({ cohesionCenterId: center._id });
  youngs.forEach(async (young) => {
    young.set({
      cohesionCenterId: undefined,
      cohesionCenterName: undefined,
      cohesionCenterZip: undefined,
      cohesionCenterCity: undefined,
    });
    await young.save({ fromUser });
  });
  const referents = await ReferentModel.find({ cohesionCenterId: center._id });
  referents.forEach(async (referent) => {
    referent.set({ cohesionCenterId: undefined, cohesionCenterName: undefined });
    await referent.save({ fromUser });
  });
  const meetingPoints = await MeetingPointModel.find({ centerId: center._id });
  meetingPoints.forEach(async (meetingPoint) => {
    meetingPoint.set({ centerId: undefined, centerCode: undefined });
    await meetingPoint.save({ fromUser });
  });
};

export const updatePlacesBus = async (bus) => {
  try {
    const meetingPoints = await MeetingPointModel.find({ busId: bus.id, cohort: bus.cohort });
    if (!meetingPoints?.length) {
      logger.warn("meetingPoints not found");
      return;
    }
    const idsMeetingPoints = meetingPoints.map((e) => e._id);
    const youngs = await YoungModel.find({
      status: "VALIDATED",
      meetingPointId: {
        $in: idsMeetingPoints,
      },
    });
    const placesTaken = youngs.filter(
      (young) => (["AFFECTED", "DONE"].includes(young.statusPhase1) || ["AFFECTED", "DONE"].includes(young.statusPhase1Tmp!)) && young.status === "VALIDATED",
    ).length;
    const placesLeft = Math.max(0, bus.capacity - placesTaken);
    if (bus.placesLeft !== placesLeft) {
      logger.debug(`Bus ${bus.id}: total ${bus.capacity}, left from ${bus.placesLeft} to ${placesLeft}`);
      bus.set({ placesLeft });
      await bus.save();
    }
  } catch (e) {
    capture(e);
  }
  return bus;
};

export async function updateSeatsTakenInBusLine(busline) {
  try {
    const seatsTaken = await YoungModel.countDocuments({
      $and: [
        {
          status: "VALIDATED",
          ligneId: busline._id.toString(),
        },
        {
          $or: [{ statusPhase1: { $in: ["AFFECTED", "DONE"] } }, { statusPhase1Tmp: { $in: ["AFFECTED", "DONE"] } }],
        },
      ],
    });
    if (busline.youngSeatsTaken !== seatsTaken) {
      busline.set({ youngSeatsTaken: seatsTaken });
      await busline.save();

      // Do the same update with planTransport
      const planTransport = await PlanTransportModel.findById(busline._id);
      if (!planTransport) throw new Error("PlanTransport not found");
      planTransport.set({ youngSeatsTaken: seatsTaken, lineFillingRate: planTransport.youngCapacity && Math.floor((seatsTaken / planTransport.youngCapacity) * 100) });
      await planTransport.save();
    }
  } catch (e) {
    capture(e);
  }
  return busline;
}

export const sendAutoCancelMeetingPoint = async (young) => {
  const cc: { email: string }[] = [];
  if (young.parent1Email) cc.push({ email: young.parent1Email });
  if (young.parent2Email) cc.push({ email: young.parent2Email });
  await sendEmail(
    {
      name: `${young.firstName} ${young.lastName}`,
      email: young.email,
    } as any,
    "Sélection de votre point de rassemblement - Action à faire",
    fs
      .readFileSync(path.resolve(__dirname, "../templates/autoCancelMeetingPoint.html"))
      .toString()
      .replace(/{{firstName}}/, sanitizeAll(young.firstName))
      .replace(/{{lastName}}/, sanitizeAll(young.lastName))
      .replace(/{{cta}}/g, sanitizeAll(`${config.APP_URL}/auth/login?redirect=phase1`)),
    { cc },
  );
};

export async function updateYoungPhase2StatusAndHours(young, fromUser) {
  try {
    // Récupération des applications et équivalences pertinentes
    const applications = await ApplicationModel.find({ youngId: young._id });
    const equivalences = await MissionEquivalenceModel.find({
      youngId: young._id,
      status: { $in: ["VALIDATED", "WAITING_VERIFICATION", "DONE", "WAITING_CORRECTION"] },
    });

    // Calcul des heures effectuées
    const totalHoursDone =
      applications.reduce((acc, application) => {
        if (application.status === "DONE") {
          return acc + Number(application.missionDuration || 0);
        }
        return acc;
      }, 0) +
      equivalences.reduce((acc, equivalence) => {
        if (equivalence.status === "VALIDATED") {
          return acc + (equivalence.missionDuration || 0);
        }
        return acc;
      }, 0);

    // Calcul des heures estimées
    const totalHoursEstimated =
      applications.reduce((acc, application) => {
        if (["VALIDATED", "IN_PROGRESS"].includes(application.status)) {
          return acc + Number(application.missionDuration || 0);
        }
        return acc;
      }, 0) +
      equivalences.reduce((acc, equivalence) => {
        if (["VALIDATED", "WAITING_VERIFICATION", "WAITING_CORRECTION"].includes(equivalence.status!)) {
          return acc + (equivalence.missionDuration || 0);
        }
        return acc;
      }, 0);

    // Mise à jour des heures dans le modèle young
    young.set({
      phase2NumberHoursDone: String(totalHoursDone),
      phase2NumberHoursEstimated: String(totalHoursEstimated),
      statusPhase2UpdatedAt: Date.now(),
    });

    // Mise à jour du statut de la phase 2
    const activeApplication = applications.filter((a) => ["WAITING_VALIDATION", "VALIDATED", "IN_PROGRESS", "WAITING_VERIFICATION"].includes(a.status));
    const pendingApplication = applications.filter((a) => ["WAITING_VALIDATION", "WAITING_VERIFICATION"].includes(a.status));

    if (young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED || young.status === YOUNG_STATUS.WITHDRAWN) {
      // Ne pas changer le statut si déjà VALIDATED ou WITHDRAWN
      young.set({ statusPhase2ValidatedAt: Date.now() });
      await cancelPendingApplications(pendingApplication, fromUser);
    } else if (Number(young.phase2NumberHoursDone) >= 84) {
      // Valider la phase 2 si 84 heures effectuées
      young.set({
        statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
        statusPhase2ValidatedAt: Date.now(),
        "files.militaryPreparationFilesIdentity": [],
        "files.militaryPreparationFilesCensus": [],
        "files.militaryPreparationFilesAuthorization": [],
        "files.militaryPreparationFilesCertificate": [],
        statusMilitaryPreparationFiles: undefined,
      });
      await cancelPendingApplications(pendingApplication, fromUser);
      let template = SENDINBLUE_TEMPLATES.young.PHASE_2_VALIDATED;
      let cc = getCcOfYoung({ template, young });
      await sendTemplate(template, {
        emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
        params: {
          cta: `${config.APP_URL}/phase2?utm_campaign=transactionnel+nouvelles+mig+proposees&utm_source=notifauto&utm_medium=mail+154+telecharger`,
        },
        cc,
      });
    } else if (activeApplication.length) {
      // Mettre le statut en IN_PROGRESS si une application est active
      young.set({ statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS, statusPhase2ValidatedAt: undefined });
    } else {
      // Sinon, attendre la réalisation
      young.set({ statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION });
    }

    // Mise à jour des statuts des applications
    young.set({ phase2ApplicationStatus: applications.map((e) => e.status) });
    // Sauvegarde du modèle young
    await young.save({ fromUser });
  } catch (e) {
    capture(e);
  }
}

export async function updateYoungPhase2Hours(young, fromUser) {
  try {
    const applications = await ApplicationModel.find({
      youngId: young._id,
      status: { $in: ["VALIDATED", "IN_PROGRESS", "DONE"] },
    });
    const equivalences = await MissionEquivalenceModel.find({
      youngId: young._id,
      status: { $in: ["VALIDATED", "WAITING_VERIFICATION", "DONE", "WAITING_CORRECTION"] },
    });
    const totalHoursDone =
      applications.reduce((acc, application) => {
        if (application.status === "DONE") {
          return acc + Number(application.missionDuration || 0);
        }
        return acc;
      }, 0) +
      equivalences.reduce((acc, equivalence) => {
        if (equivalence.status === "VALIDATED") {
          return acc + (equivalence.missionDuration || 0);
        }
        return acc;
      }, 0);
    const totalHoursEstimated =
      applications.reduce((acc, application) => {
        if (["VALIDATED", "IN_PROGRESS"].includes(application.status)) {
          return acc + Number(application.missionDuration || 0);
        }
        return acc;
      }, 0) +
      equivalences.reduce((acc, equivalence) => {
        if (["VALIDATED", "WAITING_VERIFICATION", "WAITING_CORRECTION"].includes(equivalence.status!)) {
          return acc + (equivalence.missionDuration || 0);
        }
        return acc;
      }, 0);

    young.set({
      phase2NumberHoursDone: String(totalHoursDone),
      phase2NumberHoursEstimated: String(totalHoursEstimated),
    });

    await young.save({ fromUser });
  } catch (e) {
    capture(e);
  }
}

// This function should always be called after updateYoungPhase2Hours.
// This could be refactored in one function.
export const updateStatusPhase2 = async (young, fromUser) => {
  try {
    const applications = await ApplicationModel.find({ youngId: young._id });

    const activeApplication = applications.filter(
      (a) =>
        a.status === APPLICATION_STATUS.WAITING_VALIDATION ||
        a.status === APPLICATION_STATUS.VALIDATED ||
        a.status === APPLICATION_STATUS.IN_PROGRESS ||
        a.status === APPLICATION_STATUS.WAITING_VERIFICATION,
    );

    const pendingApplication = applications.filter((a) => a.status === APPLICATION_STATUS.WAITING_VALIDATION || a.status === APPLICATION_STATUS.WAITING_VERIFICATION);

    young.set({ statusPhase2UpdatedAt: Date.now() });

    if (young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED || young.status === YOUNG_STATUS.WITHDRAWN) {
      // We do not change young status if phase 2 is already VALIDATED (2020 cohort or manual change) or WITHDRAWN.
      young.set({ statusPhase2ValidatedAt: Date.now() });
      await cancelPendingApplications(pendingApplication, fromUser);
    } else if (Number(young.phase2NumberHoursDone) >= 84) {
      // We change young status to DONE if he has 84 hours of phase 2 done.
      young.set({
        statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
        statusPhase2ValidatedAt: Date.now(),
        "files.militaryPreparationFilesIdentity": [],
        "files.militaryPreparationFilesCensus": [],
        "files.militaryPreparationFilesAuthorization": [],
        "files.militaryPreparationFilesCertificate": [],
        statusMilitaryPreparationFiles: undefined,
      });
      await cancelPendingApplications(pendingApplication, fromUser);
      let template = SENDINBLUE_TEMPLATES.young.PHASE_2_VALIDATED;
      let cc = getCcOfYoung({ template, young });
      await sendTemplate(template, {
        emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
        params: {
          cta: `${config.APP_URL}/phase2?utm_campaign=transactionnel+nouvelles+mig+proposees&utm_source=notifauto&utm_medium=mail+154+telecharger`,
        },
        cc,
      });
    } else if (activeApplication.length) {
      // We change young status to IN_PROGRESS if he has an 'active' application.
      young.set({ statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS, statusPhase2ValidatedAt: undefined });
    } else {
      young.set({ statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION });
    }

    const applications_v2 = await ApplicationModel.find({ youngId: young._id });
    young.set({ phase2ApplicationStatus: applications_v2.map((e) => e.status) });

    await young.save({ fromUser });
  } catch (e) {
    capture(e);
  }
};

export const checkStatusContract = (contract) => {
  if (!contract.invitationSent || contract.invitationSent === "false") return "DRAFT";
  // To find if everybody has validated we count actual tokens and number of validated. It should be improved later.
  const tokenKeys = ["projectManagerToken", "structureManagerToken"];
  const validateKeys = ["projectManagerStatus", "structureManagerStatus"];

  const isYoungAdult = contract.isYoungAdult === "true";
  if (isYoungAdult) {
    tokenKeys.push("youngContractToken");
    validateKeys.push("youngContractStatus");
  } else {
    tokenKeys.push("parent1Token");
    validateKeys.push("parent1Status");
    if (contract.parent2Email) {
      tokenKeys.push("parent2Token");
      validateKeys.push("parent2Status");
    }
  }

  const tokenCount = tokenKeys.reduce((acc, current) => (contract[current] ? acc + 1 : acc), 0);
  const validatedCount = validateKeys.reduce((acc, current) => (contract[current] === "VALIDATED" ? acc + 1 : acc), 0);

  if (validatedCount >= tokenCount) {
    return "VALIDATED";
  } else {
    return "SENT";
  }
};

export const updateYoungStatusPhase2Contract = async (young, fromUser) => {
  try {
    const contracts = await ContractModel.find({ youngId: young._id });

    // on récupère toutes les candidatures du volontaire
    const applications = await ApplicationModel.find({ _id: { $in: contracts?.map((c) => c.applicationId) } });

    // on filtre sur les candidatures pour lesquelles le contrat est "actif"
    const applicationsThatContractIsActive = applications.filter((application) => ["VALIDATED", "IN_PROGRESS", "DONE", "ABANDON"].includes(application.status));

    //on filtre les contrats liés à ces candidatures filtrée précédement
    const activeContracts = contracts.filter((contract) => applicationsThatContractIsActive.map((application) => application._id.toString()).includes(contract.applicationId));

    const arrayContract: string[] = [];
    for (const contract of activeContracts) {
      const status = checkStatusContract(contract);
      const application = await ApplicationModel.findById(contract.applicationId);
      application!.contractStatus = status;
      await application!.save({ fromUser });
      arrayContract.push(status);
    }

    young.set({
      statusPhase2Contract: arrayContract,
    });

    await young.save({ fromUser });
  } catch (e) {
    capture(e);
  }
};

export async function cancelPendingApplications(pendingApplication, fromUser) {
  for (const application of pendingApplication) {
    application.set({ status: APPLICATION_STATUS.CANCEL });
    await application.save({ fromUser });
    await sendNotificationApplicationClosedBecausePhase2Validated(application);
  }
}

export async function cancelPendingEquivalence(pendingEquivalences, fromUser) {
  for (const equivalence of pendingEquivalences) {
    equivalence.set({ status: EQUIVALENCE_STATUS.REFUSED, message: "La phase 2 a été validée" });
    await equivalence.save({ fromUser });
  }
}

export async function sendNotificationApplicationClosedBecausePhase2Validated(application) {
  if (application.tutorId) {
    const responsible = await ReferentModel.findById(application.tutorId);
    if (responsible)
      await sendTemplate(SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION_PHASE_2_VALIDATED, {
        emailTo: [{ name: `${responsible.firstName} ${responsible.lastName}`, email: responsible.email }],
        params: {
          missionName: application.missionName,
          youngFirstName: application.youngFirstName,
          youngLastName: application.youngLastName,
        },
      });
  }
}

export function isYoung(user) {
  return user instanceof YoungModel;
}
export function isReferent(user) {
  return user instanceof ReferentModel;
}

export function inSevenDays() {
  return Date.now() + 86400000 * 7;
}

export const getCcOfYoung = ({ template, young }) => {
  if (!young || !template) return [];
  let cc: { name: string; email: string }[] = [];
  if (Object.values(SENDINBLUE_TEMPLATES.young).includes(template)) {
    if (young.parent1Email && young.parent1FirstName && young.parent1LastName) cc.push({ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email });
    if (young.parent2Email && young.parent2FirstName && young.parent2LastName) cc.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email });
  }
  return cc;
};

export async function notifDepartmentChange(department, template, young, extraParams = {}) {
  const referents = await ReferentModel.find({ department: department, role: ROLES.REFERENT_DEPARTMENT });
  for (let referent of referents) {
    await sendTemplate(template, {
      emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
      params: {
        youngFirstName: young.firstName,
        youngLastName: young.lastName,
        cta: `${config.ADMIN_URL}/volontaire/${young._id}`,
        ...extraParams,
      },
    });
  }
}

export async function addingDayToDate(days, dateStart) {
  const startDate = new Date(dateStart);
  const newDate = addDays(startDate, days);
  const formattedValidationDate = newDate.toISOString();

  return formattedValidationDate;
}

export async function autoValidationSessionPhase1Young({ young, sessionPhase1, user }) {
  const youngCohort = await CohortModel.findOne({ name: young.cohort });
  let cohortWithOldRules = ["2021", "2022", "Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B"];

  const {
    daysToValidate: daysToValidate,
    validationDate: dateDeValidation,
    validationDateForTerminaleGrade: dateDeValidationTerminale,
    dateStart: dateStartCohort,
  } = (await getCohortDateInfo(sessionPhase1.cohort)) as any;

  // Ici on regarde si la session à des date spécifique sinon on garde la date de la cohort
  const bus = await LigneBusModel.findById(young.ligneId);
  const dateStart = getDepartureDate(young, sessionPhase1, youngCohort, { bus });
  const isTerminale = young?.grade === "Terminale";
  // cette constante nous permet d'avoir la date de validation d'un séjour en fonction du grade d'un Young
  const validationDate = isTerminale ? dateDeValidationTerminale : dateDeValidation;
  const validationDateWithDays = await addingDayToDate(daysToValidate, dateStart);

  if (young.cohort === "Juin 2023") {
    await updateStatusPhase1WithSpecificCase(young, validationDate, user);
  } else if (cohortWithOldRules.includes(young.cohort)) {
    await updateStatusPhase1WithOldRules(young, validationDate, isTerminale, user);
  } else {
    await updateStatusPhase1(young, validationDateWithDays, user);
  }
  return { dateStart, daysToValidate, validationDateWithDays, dateStartCohort };
}

export async function updateStatusPhase1(young, validationDateWithDays, user) {
  const initialState = young.statusPhase1;
  try {
    const now = new Date();
    const validationDate = new Date(validationDateWithDays);
    // due to a bug the timezone may vary between french and UTC time
    validationDate.setHours(validationDate.getHours() - 2);
    // Cette constante nous permet de vérifier si un jeune a passé sa date de validation (basé sur son grade)
    const isValidationDatePassed = now >= validationDate;
    // Cette constante nous permet de vérifier si un jeune était présent au début du séjour (exception pour cette cohorte : pas besoin de JDM)(basé sur son grade)
    // ! Si null, on considère que le statut de pointage n'est pas encore connu (présent/absent)
    const isCohesionStayValid = young.cohesionStayPresence === "true";
    // Cette constante pour permet de vérifier si la date de départ d'un jeune permet de valider sa phase 1 (basé sur son grade)
    const isDepartureDateValid = now >= validationDate && (!young?.departSejourAt || young?.departSejourAt >= validationDate);
    // On valide la phase 1 si toutes les condition sont réunis. Une exception : le jeune a été exclu.
    if (isValidationDatePassed) {
      if (isCohesionStayValid && isDepartureDateValid) {
        if (young?.departSejourMotif === "Exclusion") {
          young.set({ statusPhase1: "NOT_DONE" });
        } else {
          young.set({ statusPhase1: "DONE" });
        }
      } else if (!isDepartureDateValid) {
        if (DEPART_SEJOUR_MOTIFS_NOT_DONE.includes(young?.departSejourMotif)) {
          young.set({ statusPhase1: "NOT_DONE" });
        }
      } else {
        // Sinon on ne valide pas sa phase 1.
        // Inclut les jeunes avec départs séjour motifs avant le 8ème jour de présence
        if (young.cohesionStayPresence === "false") {
          young.set({ statusPhase1: "NOT_DONE" });
        } else {
          young.set({ statusPhase1: "AFFECTED" });
        }
      }
    }
    if (initialState !== young.statusPhase1) {
      await young.save({ fromUser: user });
      return true;
    }
    return false;
  } catch (e) {
    capture(e);
    return false;
  }
}

export const getReferentManagerPhase2 = async (department) => {
  let toReferent = await ReferentModel.find({
    subRole: SUB_ROLES.manager_phase2,
    role: ROLES.REFERENT_DEPARTMENT,
    department,
  });

  if (!toReferent.length) {
    toReferent = await ReferentModel.find({
      subRole: SUB_ROLES.secretariat,
      role: ROLES.REFERENT_DEPARTMENT,
      department,
    });
  }

  if (!toReferent.length) {
    toReferent = await ReferentModel.find({
      subRole: SUB_ROLES.manager_department,
      role: ROLES.REFERENT_DEPARTMENT,
      department,
    });
  }

  if (!toReferent.length) {
    toReferent = await ReferentModel.find({
      subRole: SUB_ROLES.assistant_manager_department,
      role: ROLES.REFERENT_DEPARTMENT,
      department,
    });
  }

  if (!toReferent.length) {
    toReferent = await ReferentModel.find({
      role: ROLES.REFERENT_DEPARTMENT,
      department,
    });
  }
  return toReferent;
};

export const updateYoungApplicationFilesType = async (application, user) => {
  try {
    const young = await YoungModel.findById(application.youngId);
    const applications = await ApplicationModel.find({ youngId: application.youngId });

    const listFiles: string[] = [];
    applications.map(async (application) => {
      const currentListFiles: string[] = [];
      if (application.contractAvenantFiles.length > 0) {
        currentListFiles.push("contractAvenantFiles");
        listFiles.indexOf("contractAvenantFiles") === -1 && listFiles.push("contractAvenantFiles");
      }
      if (application.justificatifsFiles.length > 0) {
        currentListFiles.push("justificatifsFiles");
        listFiles.indexOf("justificatifsFiles") === -1 && listFiles.push("justificatifsFiles");
      }
      if (application.feedBackExperienceFiles.length > 0) {
        currentListFiles.push("feedBackExperienceFiles");
        listFiles.indexOf("feedBackExperienceFiles") === -1 && listFiles.push("feedBackExperienceFiles");
      }
      if (application.othersFiles.length > 0) {
        currentListFiles.push("othersFiles");
        listFiles.indexOf("othersFiles") === -1 && listFiles.push("othersFiles");
      }
      application.set({ filesType: currentListFiles });
      await application.save({ fromUser: user });
    });
    young!.set({ phase2ApplicationFilesType: listFiles });
    await young!.save({ fromUser: user });
  } catch (e) {
    capture(e);
  }
};

export const updateHeadCenter = async (headCenterId, user) => {
  const headCenter = await ReferentModel.findById(headCenterId);
  if (!headCenter) return;
  const sessions = await SessionPhase1Model.find({ headCenterId }, { cohort: 1 });
  const cohorts = new Set(sessions.map((s) => s.cohort!));
  const cohortIds = await getCohortIdsFromCohortName([...cohorts]);
  headCenter.set({ cohorts: [...cohorts], cohortIds: cohortIds });
  await headCenter.save({ fromUser: user });
};

export const getTransporter = async () => {
  let toReferent = await ReferentModel.find({
    role: ROLES.TRANSPORTER,
  });
  return toReferent;
};

// TODO: move to snu-lib
export const ERRORS = {
  SERVER_ERROR: "SERVER_ERROR",
  NOT_FOUND: "NOT_FOUND",
  BAD_REQUEST: "BAD_REQUEST",
  PASSWORD_TOKEN_EXPIRED_OR_INVALID: "PASSWORD_TOKEN_EXPIRED_OR_INVALID",
  EMAIL_VALIDATION_TOKEN_EXPIRED_OR_INVALID: "EMAIL_VALIDATION_TOKEN_EXPIRED_OR_INVALID",
  OPERATION_UNAUTHORIZED: "OPERATION_UNAUTHORIZED",
  OPERATION_NOT_ALLOWED: "OPERATION_NOT_ALLOWED",
  USER_ALREADY_REGISTERED: "USER_ALREADY_REGISTERED",
  PASSWORD_NOT_VALIDATED: "PASSWORD_NOT_VALIDATED",
  INVITATION_TOKEN_EXPIRED_OR_INVALID: "INVITATION_TOKEN_EXPIRED_OR_INVALID",
  FILE_CORRUPTED: "FILE_CORRUPTED",
  FILE_INFECTED: "FILE_INFECTED",
  YOUNG_ALREADY_REGISTERED: "YOUNG_ALREADY_REGISTERED",
  UNSUPPORTED_TYPE: "UNSUPPORTED_TYPE",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  LINKED_OBJECT: "LINKED_OBJECT",
  LINKED_MISSIONS: "LINKED_MISSIONS",
  LINKED_CLASSES: "LINKED_CLASSES",
  LINKED_ETABLISSEMENT: "LINKED_ETABLISSEMENT",
  LINKED_STRUCTURE: "LINKED_STRUCTURE",
  NO_TEMPLATE_FOUND: "NO_TEMPLATE_FOUND",
  INVALID_BODY: "INVALID_BODY",
  INVALID_PARAMS: "INVALID_PARAMS",
  INVALID_QUERY: "INVALID_QUERY",
  EMAIL_OR_PASSWORD_INVALID: "EMAIL_OR_PASSWORD_INVALID",
  EMAIL_OR_API_KEY_INVALID: "EMAIL_OR_API_KEY_INVALID",
  TOKEN_INVALID: "TOKEN_INVALID",
  PASSWORD_INVALID: "PASSWORD_INVALID",
  EMAIL_INVALID: "EMAIL_INVALID",
  EMAIL_AND_PASSWORD_REQUIRED: "EMAIL_AND_PASSWORD_REQUIRED",
  EMAIL_ALREADY_USED: "EMAIL_ALREADY_USED",
  EMAIL_UNCHANGED: "EMAIL_UNCHANGED",
  PASSWORDS_NOT_MATCH: "PASSWORDS_NOT_MATCH",
  USER_NOT_EXISTS: "USER_NOT_EXISTS",
  NEW_PASSWORD_IDENTICAL_PASSWORD: "NEW_PASSWORD_IDENTICAL_PASSWORD",
  INVALID_IP: "INVALID_IP",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  YOUNG_NOT_FOUND: "YOUNG_NOT_FOUND",
  FEATURE_NOT_AVAILABLE: "FEATURE_NOT_AVAILABLE",
  APPLICATION_NOT_FOUND: "APPLICATION_NOT_FOUND",
  YOUNG_NOT_EDITABLE: "YOUNG_NOT_EDITABLE",
  NOT_ALLOWED: "NOT_ALLOWED",
};

export const YOUNG_SITUATIONS = {
  GENERAL_SCHOOL: "GENERAL_SCHOOL",
  PROFESSIONAL_SCHOOL: "PROFESSIONAL_SCHOOL",
  AGRICULTURAL_SCHOOL: "AGRICULTURAL_SCHOOL",
  SPECIALIZED_SCHOOL: "SPECIALIZED_SCHOOL",
  APPRENTICESHIP: "APPRENTICESHIP",
  EMPLOYEE: "EMPLOYEE",
  INDEPENDANT: "INDEPENDANT",
  SELF_EMPLOYED: "SELF_EMPLOYED",
  ADAPTED_COMPANY: "ADAPTED_COMPANY",
  POLE_EMPLOI: "POLE_EMPLOI",
  MISSION_LOCALE: "MISSION_LOCALE",
  CAP_EMPLOI: "CAP_EMPLOI",
  NOTHING: "NOTHING", // @todo find a better key --'
};

export const STEPS = {
  PROFIL: "PROFIL",
  COORDONNEES: "COORDONNEES",
  AVAILABILITY: "AVAILABILITY",
  PARTICULIERES: "PARTICULIERES",
  REPRESENTANTS: "REPRESENTANTS",
  CONSENTEMENTS: "CONSENTEMENTS",
  DOCUMENTS: "DOCUMENTS",
  DONE: "DONE",
};
export const STEPS2023 = {
  EMAIL_WAITING_VALIDATION: "EMAIL_WAITING_VALIDATION",
  COORDONNEES: "COORDONNEES",
  CONSENTEMENTS: "CONSENTEMENTS",
  REPRESENTANTS: "REPRESENTANTS",
  DOCUMENTS: "DOCUMENTS",
  CONFIRM: "CONFIRM",
  WAITING_CONSENT: "WAITING_CONSENT",
  DONE: "DONE",
};

export const validateBirthDate = (date) => {
  const d = dayjs(date);
  if (!d.isValid()) return false;
  if (d.isBefore(dayjs(new Date(2000, 0, 1)))) return false;
  if (d.isAfter(dayjs())) return false;
  return true;
};

export const normalizeString = (str) => {
  return str
    .normalize("NFD") // Normalise la chaîne de caractères (décompose les accents)
    .replace(/[\u0300-\u036f]/g, "") // Supprime les diacritiques (accents)
    .replace(/[-\s._']/g, "") // Supprime les tirets, espaces, points, apostrophes, et underscores
    .toLowerCase(); // Convertit tout en minuscules
};
