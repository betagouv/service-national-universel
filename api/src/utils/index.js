const AWS = require("aws-sdk");
const https = require("https");
const http = require("http");
const passwordValidator = require("password-validator");
const sanitizeHtml = require("sanitize-html");
const YoungModel = require("../models/young");
const MeetingPointModel = require("../models/meetingPoint");
const ApplicationModel = require("../models/application");
const ReferentModel = require("../models/referent");
const ContractObject = require("../models/contract");
const SessionPhase1 = require("../models/sessionPhase1");
const { sendEmail, sendTemplate } = require("../sendinblue");
const path = require("path");
const fs = require("fs");
const { APP_URL, ADMIN_URL } = require("../config");
const {
  CELLAR_ENDPOINT,
  CELLAR_KEYID,
  CELLAR_KEYSECRET,
  BUCKET_NAME,
  PUBLIC_BUCKET_NAME,
  ENVIRONMENT,
  API_ASSOCIATION_CELLAR_ENDPOINT,
  API_ASSOCIATION_CELLAR_KEYID,
  API_ASSOCIATION_CELLAR_KEYSECRET,
} = require("../config");
const { YOUNG_STATUS_PHASE2, SENDINBLUE_TEMPLATES, YOUNG_STATUS, MISSION_STATUS, APPLICATION_STATUS, FILE_STATUS_PHASE1, ROLES, COHESION_STAY_END } = require("snu-lib");

const { translateFileStatusPhase1 } = require("snu-lib/translation");
const { getQPV, getDensity } = require("../geo");

// Timeout a promise in ms
const timeout = (prom, time) => {
  let timer;
  return Promise.race([prom, new Promise((_r, rej) => (timer = setTimeout(rej, time)))]).finally(() => clearTimeout(timer));
};

function sanitizeAll(text) {
  return sanitizeHtml(text || "", { allowedTags: ["li", "br", "b"], allowedAttributes: {} });
}

function getReq(url, cb) {
  if (url.toString().indexOf("https") === 0) return https.get(url, cb);
  return http.get(url, cb);
}

function uploadFile(path, file) {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: CELLAR_ENDPOINT, accessKeyId: CELLAR_KEYID, secretAccessKey: CELLAR_KEYSECRET });
    const params = {
      Bucket: BUCKET_NAME,
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

function uploadPublicPicture(path, file) {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: CELLAR_ENDPOINT, accessKeyId: CELLAR_KEYID, secretAccessKey: CELLAR_KEYSECRET });
    const params = {
      Bucket: PUBLIC_BUCKET_NAME,
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

function deleteFile(path) {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: CELLAR_ENDPOINT, accessKeyId: CELLAR_KEYID, secretAccessKey: CELLAR_KEYSECRET });
    const params = { Bucket: BUCKET_NAME, Key: path };
    s3bucket.deleteObject(params, (err, data) => {
      if (err) return reject(`error in callback:${err}`);
      resolve(data);
    });
  });
}

function listFiles(path) {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: CELLAR_ENDPOINT, accessKeyId: CELLAR_KEYID, secretAccessKey: CELLAR_KEYSECRET });
    const params = { Bucket: BUCKET_NAME, Prefix: path };
    s3bucket.listObjects(params, (err, data) => {
      if (err) return reject(`error in callback:${err}`);
      resolve(data.Contents);
    });
  });
}

const getFile = (name) => {
  const p = new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: CELLAR_ENDPOINT, accessKeyId: CELLAR_KEYID, secretAccessKey: CELLAR_KEYSECRET });
    const params = { Bucket: BUCKET_NAME, Key: name };
    s3bucket.getObject(params, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
  return p;
};

function getSignedUrl(path) {
  const s3bucket = new AWS.S3({ endpoint: CELLAR_ENDPOINT, accessKeyId: CELLAR_KEYID, secretAccessKey: CELLAR_KEYSECRET });
  return s3bucket.getSignedUrl("getObject", {
    Bucket: BUCKET_NAME,
    Key: path,
  });
}

function getSignedUrlForApiAssociation(path) {
  const s3bucket = new AWS.S3({
    endpoint: API_ASSOCIATION_CELLAR_ENDPOINT,
    accessKeyId: API_ASSOCIATION_CELLAR_KEYID,
    secretAccessKey: API_ASSOCIATION_CELLAR_KEYSECRET,
  });
  return s3bucket.getSignedUrl("getObject", {
    Bucket: "association",
    Key: path,
  });
}

function fileExist(url) {
  return new Promise((resolve) => {
    getReq(url, (resp) => {
      if (resp.statusCode === 200) return resolve(true);
      return resolve(false);
    }).on("error", (err) => {
      resolve(false);
      console.log("Error: " + err.message);
    });
  });
}

function validatePassword(password) {
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

const updatePlacesCenter = async (center, fromUser) => {
  // console.log(`update place center ${center?._id} ${center?.name}`);
  try {
    const youngs = await YoungModel.find({ cohesionCenterId: center._id });
    const placesTaken = youngs.filter((young) => ["AFFECTED", "WAITING_ACCEPTATION", "DONE"].includes(young.statusPhase1) && young.status === "VALIDATED").length;
    const placesLeft = Math.max(0, center.placesTotal - placesTaken);
    if (center.placesLeft !== placesLeft) {
      console.log(`Center ${center.id}: total ${center.placesTotal}, left from ${center.placesLeft} to ${placesLeft}`);
      center.set({ placesLeft });
      await center.save({ fromUser });
      await center.index();
    } else {
      // console.log(`Center ${center.id}: total ${center.placesTotal} left not changed ${center.placesLeft}`);
    }
  } catch (e) {
    console.log(e);
  }
  return center;
};

// first iteration
// duplicate of updatePlacesCenter
// we'll remove the updatePlacesCenter function once the migration is done
const updatePlacesSessionPhase1 = async (sessionPhase1, fromUser) => {
  // console.log(`update place sessionPhase1 ${sessionPhase1?._id}`);
  try {
    const youngs = await YoungModel.find({ sessionPhase1Id: sessionPhase1._id });
    const placesTaken = youngs.filter(
      (young) => (["AFFECTED", "DONE"].includes(young.statusPhase1) || ["AFFECTED", "DONE"].includes(young.statusPhase1Tmp)) && young.status === "VALIDATED",
    ).length;
    const placesLeft = Math.max(0, sessionPhase1.placesTotal - placesTaken);
    if (sessionPhase1.placesLeft !== placesLeft) {
      console.log(`sessionPhase1 ${sessionPhase1.id}: total ${sessionPhase1.placesTotal}, left from ${sessionPhase1.placesLeft} to ${placesLeft}`);
      sessionPhase1.set({ placesLeft });
      await sessionPhase1.save({ fromUser });
      await sessionPhase1.index();
    } else {
      // console.log(`sessionPhase1 ${sessionPhase1.id}: total ${sessionPhase1.placesTotal}, left not changed ${sessionPhase1.placesLeft}`);
    }
  } catch (e) {
    console.log(e);
  }
  return sessionPhase1;
};

const updateCenterDependencies = async (center, fromUser) => {
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
  const meetingPoints = await MeetingPointModel.find({ centerId: center._id });
  meetingPoints.forEach(async (meetingPoint) => {
    meetingPoint.set({ centerCode: center.code2022 });
    await meetingPoint.save({ fromUser });
  });
};

const deleteCenterDependencies = async (center, fromUser) => {
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

const updatePlacesBus = async (bus) => {
  // console.log(`update bus ${bus.id} - ${bus.idExcel}`);
  try {
    const meetingPoints = await MeetingPointModel.find({ busId: bus.id, cohort: bus.cohort });
    if (!meetingPoints?.length) return console.log("meetingPoints not found");
    const idsMeetingPoints = meetingPoints.map((e) => e._id);
    // console.log(`idsMeetingPoints for bus ${bus.id}`, idsMeetingPoints);
    const youngs = await YoungModel.find({
      status: "VALIDATED",
      meetingPointId: {
        $in: idsMeetingPoints,
      },
    });
    const placesTaken = youngs.filter(
      (young) => (["AFFECTED", "DONE"].includes(young.statusPhase1) || ["AFFECTED", "DONE"].includes(young.statusPhase1Tmp)) && young.status === "VALIDATED",
    ).length;
    const placesLeft = Math.max(0, bus.capacity - placesTaken);
    if (bus.placesLeft !== placesLeft) {
      console.log(`Bus ${bus.id}: total ${bus.capacity}, left from ${bus.placesLeft} to ${placesLeft}`);
      bus.set({ placesLeft });
      await bus.save();
      await bus.index();
    } else {
      // console.log(`Bus ${bus.id}: total ${bus.capacity}, left not changed ${placesLeft}`);
    }
  } catch (e) {
    console.log(e);
  }
  return bus;
};

const sendAutoCancelMeetingPoint = async (young) => {
  const cc = [];
  if (young.parent1Email) cc.push({ email: young.parent1Email });
  if (young.parent2Email) cc.push({ email: young.parent2Email });
  await sendEmail(
    {
      name: `${young.firstName} ${young.lastName}`,
      email: young.email,
    },
    "Sélection de votre point de rassemblement - Action à faire",
    fs
      .readFileSync(path.resolve(__dirname, "../templates/autoCancelMeetingPoint.html"))
      .toString()
      .replace(/{{firstName}}/, sanitizeAll(young.firstName))
      .replace(/{{lastName}}/, sanitizeAll(young.lastName))
      .replace(/{{cta}}/g, sanitizeAll(`${APP_URL}/auth/login?redirect=phase1`)),
    { cc },
  );
};

async function updateYoungPhase2Hours(young, fromUser) {
  const applications = await ApplicationModel.find({
    youngId: young._id,
    status: { $in: ["VALIDATED", "IN_PROGRESS", "DONE"] },
  });
  young.set({
    phase2NumberHoursDone: String(
      applications
        .filter((application) => application.status === "DONE")
        .map((application) => Number(application.missionDuration || 0))
        .reduce((acc, current) => acc + current, 0),
    ),
    phase2NumberHoursEstimated: String(
      applications
        .filter((application) => ["VALIDATED", "IN_PROGRESS"].includes(application.status))
        .map((application) => Number(application.missionDuration || 0))
        .reduce((acc, current) => acc + current, 0),
    ),
  });
  await young.save({ fromUser });
}
// This function should always be called after updateYoungPhase2Hours.
// This could be refactored in one function.
const updateStatusPhase2 = async (young, fromUser) => {
  const applications = await ApplicationModel.find({ youngId: young._id });
  young.set({ phase2ApplicationStatus: applications.map((e) => e.status) });

  const activeApplication = applications.filter(
    (a) =>
      a.status === APPLICATION_STATUS.WAITING_VALIDATION ||
      a.status === APPLICATION_STATUS.VALIDATED ||
      a.status === APPLICATION_STATUS.IN_PROGRESS ||
      a.status === APPLICATION_STATUS.WAITING_VERIFICATION,
  );

  young.set({ statusPhase2UpdatedAt: Date.now() });

  if (young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED || young.statusPhase2 === YOUNG_STATUS_PHASE2.WITHDRAWN) {
    // We do not change young status if phase 2 is already VALIDATED (2020 cohort or manual change) or WITHDRAWN.
    young.set({ statusPhase2: young.statusPhase2, statusPhase2ValidatedAt: Date.now() });
  } else if (Number(young.phase2NumberHoursDone) >= 84) {
    // We change young status to DONE if he has 84 hours of phase 2 done.
    young.set({
      statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
      statusPhase2ValidatedAt: Date.now(),
      militaryPreparationFilesIdentity: [],
      militaryPreparationFilesCensus: [],
      militaryPreparationFilesAuthorization: [],
      militaryPreparationFilesCertificate: [],
      statusMilitaryPreparationFiles: undefined,
    });
    let template = SENDINBLUE_TEMPLATES.young.PHASE_2_VALIDATED;
    let cc = getCcOfYoung({ template, young });
    await sendTemplate(template, {
      emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
      params: {
        cta: `${APP_URL}/phase2?utm_campaign=transactionnel+nouvelles+mig+proposees&utm_source=notifauto&utm_medium=mail+154+telecharger`,
      },
      cc,
    });
  } else if (activeApplication.length) {
    // We change young status to IN_PROGRESS if he has an 'active' application.
    young.set({ statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS });
  } else {
    // We change young status to WAITING_LIST if he has no estimated hours of phase 2.
    young.set({ statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION });
  }
  await young.save({ fromUser });
};

const checkStatusContract = (contract) => {
  if (!contract.invitationSent || contract.invitationSent === "false") return "DRAFT";
  // To find if everybody has validated we count actual tokens and number of validated. It should be improved later.
  const tokenKeys = ["parent1Token", "parent2Token", "projectManagerToken", "structureManagerToken", "youngContractToken"];
  const tokenCount = tokenKeys.reduce((acc, current) => (contract[current] ? acc + 1 : acc), 0);
  const validateKeys = ["parent1Status", "parent2Status", "projectManagerStatus", "structureManagerStatus", "youngContractStatus"];
  const validatedCount = validateKeys.reduce((acc, current) => (contract[current] === "VALIDATED" ? acc + 1 : acc), 0);
  if (validatedCount >= tokenCount) {
    return "VALIDATED";
  } else {
    return "SENT";
  }
};

const updateYoungStatusPhase2Contract = async (young, fromUser) => {
  const contracts = await ContractObject.find({ youngId: young._id });

  // on récupère toutes les candidatures du volontaire
  const applications = await ApplicationModel.find({ _id: { $in: contracts?.map((c) => c.applicationId) } });

  // on filtre sur les candidatures pour lesquelles le contrat est "actif"
  const applicationsThatContractIsActive = applications.filter((application) => ["VALIDATED", "IN_PROGRESS", "DONE", "ABANDON"].includes(application.status));

  //on filtre les contrats liés à ces candidatures filtrée précédement
  const activeContracts = contracts.filter((contract) => applicationsThatContractIsActive.map((application) => application._id.toString()).includes(contract.applicationId));

  young.set({
    statusPhase2Contract: activeContracts.map((contract) => checkStatusContract(contract)),
  });

  await young.save({ fromUser });
};

function isYoung(user) {
  return user instanceof YoungModel;
}
function isReferent(user) {
  return user instanceof ReferentModel;
}

function inSevenDays() {
  return Date.now() + 86400000 * 7;
}

const getBaseUrl = () => {
  if (ENVIRONMENT === "staging") return "https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io";
  if (ENVIRONMENT === "production") return "https://api.snu.gouv.fr";
  return "http://localhost:8080";
};

async function inscriptionCheck(value, young, req) {
  // Check quartier prioritaires.
  if (value.zip && value.city && value.address) {
    const qpv = await getQPV(value.zip, value.city, value.address);
    if (qpv === true) young.set({ qpv: "true" });
    else if (qpv === false) young.set({ qpv: "false" });
    else young.set({ qpv: "" });
    await young.save({ fromUser: req.user });
  }

  // Check quartier prioritaires.
  if (value.cityCode) {
    const populationDensity = await getDensity(value.cityCode);
    young.set({ populationDensity });
    await young.save({ fromUser: req.user });
  }

  // if withdrawn, cascade withdrawn on every status
  if (young.status === "WITHDRAWN" && (young.statusPhase1 !== "WITHDRAWN" || young.statusPhase2 !== "WITHDRAWN" || young.statusPhase3 !== "WITHDRAWN")) {
    if (young.statusPhase1 !== "DONE") young.set({ statusPhase1: "WITHDRAWN" });
    if (young.statusPhase2 !== "VALIDATED") young.set({ statusPhase2: "WITHDRAWN" });
    if (young.statusPhase3 !== "VALIDATED") young.set({ statusPhase3: "WITHDRAWN" });
    await young.save({ fromUser: req.user });
  }

  // if they had a cohesion center, we check if we need to update the places taken / left
  if (young.sessionPhase1Id) {
    const sessionPhase1 = await SessionPhase1.findById(young.sessionPhase1Id);
    if (sessionPhase1) await updatePlacesSessionPhase1(sessionPhase1, req.user);
  }
}

const updateApplication = async (mission, fromUser = null) => {
  if (![MISSION_STATUS.CANCEL, MISSION_STATUS.ARCHIVED, MISSION_STATUS.REFUSED].includes(mission.status))
    return console.log(`no need to update applications, new status for mission ${mission._id} is ${mission.status}`);
  const applications = await ApplicationModel.find({
    missionId: mission._id,
    status: {
      $in: [
        APPLICATION_STATUS.WAITING_VALIDATION,
        APPLICATION_STATUS.WAITING_ACCEPTATION,
        APPLICATION_STATUS.WAITING_VERIFICATION,
        // APPLICATION_STATUS.VALIDATED,
        // APPLICATION_STATUS.IN_PROGRESS,
      ],
    },
  });
  for (let application of applications) {
    let cta = `${APP_URL}/phase2`;
    let statusComment = "";
    let sendinblueTemplate = "";
    switch (mission.status) {
      case MISSION_STATUS.REFUSED:
        statusComment = "La mission n'est plus disponible.";
        break;
      case MISSION_STATUS.CANCEL:
        statusComment = "La mission a été annulée.";
        sendinblueTemplate = SENDINBLUE_TEMPLATES.young.MISSION_CANCEL;
        cta = `${APP_URL}/phase2?utm_campaign=transactionnel+mig+annulee&utm_source=notifauto&utm_medium=mail+261+acceder`;
        break;
      case MISSION_STATUS.ARCHIVED:
        statusComment = "La mission a été archivée.";
        sendinblueTemplate = SENDINBLUE_TEMPLATES.young.MISSION_ARCHIVED;
        break;
    }
    application.set({ status: APPLICATION_STATUS.CANCEL, statusComment });
    await application.save({ fromUser });

    // ! Should update contract too if it exists

    if (sendinblueTemplate) {
      const young = await YoungModel.findById(application.youngId);
      let cc = getCcOfYoung({ template: sendinblueTemplate, young });

      await sendTemplate(sendinblueTemplate, {
        emailTo: [{ name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail }],
        params: {
          cta,
          missionName: mission.name,
          message: mission.statusComment,
        },
        cc,
      });
    }
  }
};

const getCcOfYoung = ({ template, young }) => {
  if (!young || !template) return [];
  let cc = [];
  if (Object.values(SENDINBLUE_TEMPLATES.young).includes(template)) {
    if (young.parent1Email && young.parent1FirstName && young.parent1LastName) cc.push({ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email });
    if (young.parent2Email && young.parent2FirstName && young.parent2LastName) cc.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email });
  }
  return cc;
};

async function notifDepartmentChange(department, template, young) {
  const referents = await ReferentModel.find({ department: department, role: ROLES.REFERENT_DEPARTMENT });
  for (let referent of referents) {
    await sendTemplate(template, {
      emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
      params: {
        youngFirstName: young.firstName,
        youngLastName: young.lastName,
        cta: `${ADMIN_URL}/volontaire/${young._id}`,
      },
    });
  }
}

async function autoValidationSessionPhase1Young({ young, sessionPhase1, req }) {
  const dateDeValidation = {
    2019: new Date("06/28/2019"),
    2020: new Date("07/02/2021"),
    2021: new Date("07/02/2021"),
    "Juin 2022": new Date(2022, 5, 20, 18), //20 juin 2022 à 18h
    "Juillet 2022": new Date(2022, 6, 11, 18), //11 juillet 2022 à 18h
  };

  const dateDeValidationTerminale = {
    2019: new Date("06/28/2019"),
    2020: new Date("07/02/2021"),
    2021: new Date("07/02/2021"),
    "Juin 2022": new Date(2022, 5, 22, 18), //22 juin 2022 à 18h
    "Juillet 2022": new Date(2022, 6, 13, 18), //13 juillet 2022 à 18h
  };
  const now = new Date();
  if ((now >= dateDeValidation[sessionPhase1.cohort] && young?.grade !== "Terminale") || (now >= dateDeValidationTerminale[sessionPhase1.cohort] && young?.grade === "Terminale")) {
    if (young.cohesionStayPresence === "true" && (young.presenceJDM === "true" || young.grade === "Terminale")) {
      if (
        (now >= dateDeValidation[sessionPhase1.cohort] &&
          young?.grade !== "Terminale" &&
          (!young?.departSejourAt || young?.departSejourAt > dateDeValidation[sessionPhase1.cohort])) ||
        (now >= dateDeValidationTerminale[sessionPhase1.cohort] &&
          young?.grade === "Terminale" &&
          (!young?.departSejourAt || young?.departSejourAt > dateDeValidationTerminale[sessionPhase1.cohort]))
      ) {
        if (young?.departSejourMotif && ["Exclusion"].includes(young.departSejourMotif)) {
          young.set({ statusPhase1: "NOT_DONE" });
        } else {
          young.set({ statusPhase1: "DONE" });
        }
      } else {
        if (young?.departSejourMotif && ["Exclusion", "Autre"].includes(young.departSejourMotif)) {
          young.set({ statusPhase1: "NOT_DONE" });
        } else if (
          young?.departSejourMotif &&
          ["Cas de force majeure pour le volontaire", "Annulation du séjour ou mesure d’éviction sanitaire"].includes(young.departSejourMotif)
        ) {
          young.set({ statusPhase1: "DONE" });
        }
      }
    } else {
      young.set({ statusPhase1: "NOT_DONE" });
    }
    await young.save({ fromUser: req.user });
  }
}

const ERRORS = {
  SERVER_ERROR: "SERVER_ERROR",
  NOT_FOUND: "NOT_FOUND",
  PASSWORD_TOKEN_EXPIRED_OR_INVALID: "PASSWORD_TOKEN_EXPIRED_OR_INVALID",
  OPERATION_UNAUTHORIZED: "OPERATION_UNAUTHORIZED",
  OPERATION_NOT_ALLOWED: "OPERATION_NOT_ALLOWED",
  USER_ALREADY_REGISTERED: "USER_ALREADY_REGISTERED",
  PASSWORD_NOT_VALIDATED: "PASSWORD_NOT_VALIDATED",
  INVITATION_TOKEN_EXPIRED_OR_INVALID: "INVITATION_TOKEN_EXPIRED_OR_INVALID",
  FILE_CORRUPTED: "FILE_CORRUPTED",
  YOUNG_ALREADY_REGISTERED: "YOUNG_ALREADY_REGISTERED",
  UNSUPPORTED_TYPE: "UNSUPPORTED_TYPE",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  LINKED_OBJECT: "LINKED_OBJECT",
  LINKED_MISSIONS: "LINKED_MISSIONS",
  LINKED_STRUCTURE: "LINKED_STRUCTURE",
  PDF_ERROR: "PDF_ERROR",
  NO_TEMPLATE_FOUND: "NO_TEMPLATE_FOUND",
  INVALID_BODY: "INVALID_BODY",
  INVALID_PARAMS: "INVALID_PARAMS",
  EMAIL_OR_PASSWORD_INVALID: "EMAIL_OR_PASSWORD_INVALID",
  EMAIL_OR_TOKEN_INVALID: "EMAIL_OR_TOKEN_INVALID",
  PASSWORD_INVALID: "PASSWORD_INVALID",
  EMAIL_INVALID: "EMAIL_INVALID",
  EMAIL_AND_PASSWORD_REQUIRED: "EMAIL_AND_PASSWORD_REQUIRED",
  EMAIL_ALREADY_USED: "EMAIL_ALREADY_USED",
  PASSWORDS_NOT_MATCH: "PASSWORDS_NOT_MATCH",
  USER_NOT_EXISTS: "USER_NOT_EXISTS",
  NEW_PASSWORD_IDENTICAL_PASSWORD: "NEW_PASSWORD_IDENTICAL_PASSWORD",
  INVALID_IP: "INVALID_IP",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  YOUNG_NOT_FOUND: "YOUNG_NOT_FOUND",
};

const YOUNG_SITUATIONS = {
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

const STEPS = {
  PROFIL: "PROFIL",
  COORDONNEES: "COORDONNEES",
  AVAILABILITY: "AVAILABILITY",
  PARTICULIERES: "PARTICULIERES",
  REPRESENTANTS: "REPRESENTANTS",
  CONSENTEMENTS: "CONSENTEMENTS",
  DOCUMENTS: "DOCUMENTS",
  DONE: "DONE",
};

module.exports = {
  timeout,
  uploadFile,
  uploadPublicPicture,
  getFile,
  fileExist,
  validatePassword,
  ERRORS,
  getSignedUrl,
  updatePlacesCenter,
  updatePlacesSessionPhase1,
  updateCenterDependencies,
  deleteCenterDependencies,
  updatePlacesBus,
  sendAutoCancelMeetingPoint,
  listFiles,
  deleteFile,
  isYoung,
  isReferent,
  inSevenDays,
  getBaseUrl,
  updateYoungPhase2Hours,
  updateStatusPhase2,
  getSignedUrlForApiAssociation,
  updateYoungStatusPhase2Contract,
  checkStatusContract,
  sanitizeAll,
  YOUNG_STATUS,
  YOUNG_SITUATIONS,
  STEPS,
  inscriptionCheck,
  updateApplication,
  FILE_STATUS_PHASE1,
  translateFileStatusPhase1,
  getCcOfYoung,
  notifDepartmentChange,
  autoValidationSessionPhase1Young,
};
