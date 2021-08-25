const AWS = require("aws-sdk");
const https = require("https");
const http = require("http");
const passwordValidator = require("password-validator");
const YoungModel = require("../models/young");
const CohesionCenterModel = require("../models/cohesionCenter");
const MeetingPointModel = require("../models/meetingPoint");
const ReferentModel = require("../models/referent");
const { sendEmail } = require("../sendinblue");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const sendinblue = require("../sendinblue");
const { ADMIN_URL, APP_URL } = require("../config");
const { CELLAR_ENDPOINT, CELLAR_KEYID, CELLAR_KEYSECRET, BUCKET_NAME, ENVIRONMENT } = require("../config");
const { ROLES } = require("snu-lib/roles");

// Set the number of requests allowed to 15 in a 1 hour window
const signinLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  skipSuccessfulRequests: true,
  message: {
    ok: false,
    code: "TOO_MANY_REQUESTS",
  },
});

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

function deleteFile(name) {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: CELLAR_ENDPOINT, accessKeyId: CELLAR_KEYID, secretAccessKey: CELLAR_KEYSECRET });
    const params = { Bucket: BUCKET_NAME, Key: name };
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

function fileExist(url) {
  return new Promise((resolve, reject) => {
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

const updatePlacesCenter = async (center) => {
  console.log(`update place center ${center?._id} ${center?.name}`);
  try {
    const youngs = await YoungModel.find({ cohesionCenterId: center._id });
    const placesTaken = youngs.filter(
      (young) => ["AFFECTED", "WAITING_ACCEPTATION", "DONE"].includes(young.statusPhase1) && young.status === "VALIDATED"
    ).length;
    const placesLeft = Math.max(0, center.placesTotal - placesTaken);
    if (center.placesLeft !== placesLeft) {
      console.log(`Center ${center.id}: total ${center.placesTotal}, left from ${center.placesLeft} to ${placesLeft}`);
      center.set({ placesLeft });
      await center.save();
      await center.index();
    } else {
      console.log(`Center ${center.id}: total ${center.placesTotal} left not changed ${center.placesLeft}`);
    }
  } catch (e) {
    console.log(e);
  }
  return center;
};

const updateCenterDependencies = async (center) => {
  const youngs = await YoungModel.find({ cohesionCenterId: center._id });
  youngs.forEach(async (young) => {
    young.set({
      cohesionCenterName: center.name,
      cohesionCenterZip: center.zip,
      cohesionCenterCity: center.city,
    });
    await young.save();
  });
  const referents = await ReferentModel.find({ cohesionCenterId: center._id });
  referents.forEach(async (referent) => {
    referent.set({ cohesionCenterName: center.name });
    await referent.save();
  });
  const meetingPoints = await MeetingPointModel.find({ centerId: center._id });
  meetingPoints.forEach(async (meetingPoint) => {
    meetingPoint.set({ centerCode: center.code });
    await meetingPoint.save();
  });
};

const deleteCenterDependencies = async (center) => {
  const youngs = await YoungModel.find({ cohesionCenterId: center._id });
  youngs.forEach(async (young) => {
    young.set({
      cohesionCenterId: undefined,
      cohesionCenterName: undefined,
      cohesionCenterZip: undefined,
      cohesionCenterCity: undefined,
    });
    await young.save();
  });
  const referents = await ReferentModel.find({ cohesionCenterId: center._id });
  referents.forEach(async (referent) => {
    referent.set({ cohesionCenterId: undefined, cohesionCenterName: undefined });
    await referent.save();
  });
  const meetingPoints = await MeetingPointModel.find({ centerId: center._id });
  meetingPoints.forEach(async (meetingPoint) => {
    meetingPoint.set({ centerId: undefined, centerCode: undefined });
    await meetingPoint.save();
  });
};

const updatePlacesBus = async (bus) => {
  console.log(`update bus ${bus.id} - ${bus.idExcel}`);
  try {
    const meetingPoints = await MeetingPointModel.find({ busId: bus.id });
    if (!meetingPoints?.length) return console.log("meetingPoints not found");
    const idsMeetingPoints = meetingPoints.map((e) => e._id);
    console.log(`idsMeetingPoints for bus ${bus.id}`, idsMeetingPoints);
    const youngs = await YoungModel.find({
      status: "VALIDATED",
      statusPhase1: "AFFECTED",
      meetingPointId: {
        $in: idsMeetingPoints,
      },
    });
    const placesTaken = youngs.length;
    const placesLeft = Math.max(0, bus.capacity - placesTaken);
    if (bus.placesLeft !== placesLeft) {
      console.log(`Bus ${bus.id}: total ${bus.capacity}, left from ${bus.placesLeft} to ${placesLeft}`);
      bus.set({ placesLeft });
      await bus.save();
      await bus.index();
    } else {
      console.log(`Bus ${bus.id}: total ${bus.capacity}, left not changed ${placesLeft}`);
    }
  } catch (e) {
    console.log(e);
  }
  return bus;
};

const sendAutoAffectationMail = async (nextYoung, center) => {
  // Send mail.
  const cc = [];
  if (nextYoung.parent1Email) cc.push({ email: nextYoung.parent1Email });
  if (nextYoung.parent2Email) cc.push({ email: nextYoung.parent2Email });
  await sendEmail(
    {
      name: `${nextYoung.firstName} ${nextYoung.lastName}`,
      email: nextYoung.email,
    },
    "Une place dans le séjour de cohésion SNU 2021 s’est libérée !",
    fs
      .readFileSync(path.resolve(__dirname, "./templates/autoAffectation.html"))
      .toString()
      .replace(/{{firstName}}/, nextYoung.firstName)
      .replace(/{{lastName}}/, nextYoung.lastName)
      .replace(/{{centerName}}/, center.name)
      .replace(/{{centerAddress}}/, center.address + " " + center.zip + " " + center.city)
      .replace(/{{centerDepartement}}/, center.department)
      .replace(/{{ctaAccept}}/, "https://inscription.snu.gouv.fr/auth/login?redirect=phase1")
      .replace(/{{ctaDocuments}}/, "https://inscription.snu.gouv.fr/auth/login?redirect=phase1")
      .replace(/{{ctaWithdraw}}/, "https://inscription.snu.gouv.fr/auth/login?redirect=phase1"),
    { cc }
  );
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
      .replace(/{{firstName}}/, young.firstName)
      .replace(/{{lastName}}/, young.lastName)
      .replace(/{{cta}}/g, `${APP_URL}/auth/login?redirect=phase1`),
    { cc }
  );
};

const sendAutoAffectationNotFoundMails = async (to, young, center) => {
  // Send mail.
  await sendEmail(
    {
      name: `${to.firstName} ${to.lastName}`,
      email: to.email,
    },
    "Une place s'est libérée dans l'un de vos centres de séjour SNU",
    fs
      .readFileSync(path.resolve(__dirname, "./templates/autoAffectationNotFound.html"))
      .toString()
      .replace(/{{firstName}}/, to.firstName)
      .replace(/{{lastName}}/, to.lastName)
      .replace(/{{youngFirstName}}/, young.firstName)
      .replace(/{{youngLastName}}/, young.lastName)
      .replace(/{{centerName}}/, center.name)
      .replace(/{{cta}}/, `${ADMIN_URL}/auth?redirect=centre/${center._id}/affectation`)
  );
};

const assignNextYoungFromWaitingList = async (young) => {
  const nextYoung = await getYoungFromWaitingList(young);
  if (!nextYoung) {
    //notify referents & admin
    console.log(`no replacement found for young ${young._id} in center ${young.cohesionCenterId}`);

    const center = await CohesionCenterModel.findById(young.cohesionCenterId);
    if (!center) return null;
    let to = await ReferentModel.find({ role: ROLES.ADMIN, email: { $in: ["youssef.tahiri@education.gouv.fr", "nicolas.roy@recherche.gouv.fr"] } });
    to = to.concat(await ReferentModel.find({ role: ROLES.REFERENT_REGION, region: center.region }));
    for (let i = 0; i < to.length; i++) {
      await sendAutoAffectationNotFoundMails(to[i], young, center);
    }
  } else {
    // Notify young & modify statusPhase1
    console.log("replacement found", nextYoung._id);

    // Activate waiting accepation and 48h cron
    nextYoung.set({ status: "VALIDATED", statusPhase1: "WAITING_ACCEPTATION", autoAffectationPhase1ExpiresAt: Date.now() + 60 * 1000 * 60 * 48 });
    await nextYoung.save();
    await sendinblue.sync(nextYoung, "young");

    const center = await CohesionCenterModel.findById(nextYoung.cohesionCenterId);
    await sendAutoAffectationMail(nextYoung, center);

    //remove the young from the waiting list
    if (center?.waitingList?.indexOf(nextYoung._id) !== -1) {
      console.log(`remove young ${nextYoung._id} from waiting_list of ${nextYoung.cohesionCenterId}`);
      const i = center.waitingList.indexOf(nextYoung._id);
      center.waitingList.splice(i, 1);
      await center.save();
    }
  }
};

const getYoungFromWaitingList = async (young) => {
  try {
    if (!young || !young.cohesionCenterId) return null;
    const center = await CohesionCenterModel.findById(young.cohesionCenterId);
    if (!center) return null;
    let res = null;
    for (let i = 0; i < center.waitingList?.length; i++) {
      const tempYoung = await YoungModel.findById(center.waitingList[i]);
      if (tempYoung.statusPhase1 === "WAITING_LIST" && tempYoung.department === young.department && tempYoung.gender === young.gender) {
        res = tempYoung;
        break;
      }
    }
    return res;
  } catch (e) {
    console.log(e);
  }
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
  NO_TEMPLATE_FOUND: "NO_TEMPLATE_FOUND",
  INVALID_BODY: "INVALID_BODY",
  INVALID_PARAMS: "INVALID_PARAMS",
  EMAIL_OR_PASSWORD_INVALID: "EMAIL_OR_PASSWORD_INVALID",
  PASSWORD_INVALID: "PASSWORD_INVALID",
  EMAIL_INVALID: "EMAIL_INVALID",
  EMAIL_AND_PASSWORD_REQUIRED: "EMAIL_AND_PASSWORD_REQUIRED",
  PASSWORDS_NOT_MATCH: "PASSWORDS_NOT_MATCH",
  USER_NOT_EXISTS: "USER_NOT_EXISTS",
  NEW_PASSWORD_IDENTICAL_PASSWORD: "NEW_PASSWORD_IDENTICAL_PASSWORD",
  INVALID_IP: "INVALID_IP",
};

module.exports = {
  uploadFile,
  getFile,
  fileExist,
  validatePassword,
  ERRORS,
  getSignedUrl,
  updatePlacesCenter,
  updateCenterDependencies,
  deleteCenterDependencies,
  assignNextYoungFromWaitingList,
  sendAutoAffectationMail,
  updatePlacesBus,
  sendAutoCancelMeetingPoint,
  listFiles,
  deleteFile,
  signinLimiter,
  isYoung,
  isReferent,
  inSevenDays,
};
