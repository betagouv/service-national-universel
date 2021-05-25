const AWS = require("aws-sdk");
const https = require("https");
const http = require("http");
const passwordValidator = require("password-validator");
const YoungModel = require("../models/young");
const CohesionCenterModel = require("../models/cohesionCenter");

const { CELLAR_ENDPOINT, CELLAR_KEYID, CELLAR_KEYSECRET, BUCKET_NAME, ENVIRONMENT } = require("../config");

function getReq(url, cb) {
  if (url.toString().indexOf("https") === 0) return https.get(url, cb);
  return http.get(url, cb);
}

function uploadFile(path, file) {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: CELLAR_ENDPOINT, accessKeyId: CELLAR_KEYID, secretAccessKey: CELLAR_KEYSECRET });
    var params = {
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
  schema.is().min(8); // Minimum length 8

  return schema.validate(password);
}

const updatePlacesCenter = async (center) => {
  try {
    const youngs = await YoungModel.find({ cohesionCenterId: center._id });
    const placesTaken = youngs.filter(
      (young) => ["AFFECTED", "WAITING_ACCEPTATION"].includes(young.statusPhase1) && young.status === "VALIDATED"
    ).length;
    const placesLeft = Math.max(0, center.placesTotal - placesTaken);
    if (center.placesLeft !== placesLeft) {
      console.log(`Center ${center.id}: total ${center.placesTotal}, left from ${center.placesLeft} to ${placesLeft}`);
      center.set({ placesLeft });
      await center.save();
      await center.index();
    }
  } catch (e) {
    console.log(e);
  }
  return center;
};

const assignNextYoungFromWaitingList = async (young) => {
  if (ENVIRONMENT === "production") return;
  const nextYoung = await getYoungFromWaitingList(young);
  if (!nextYoung) {
    //notify referents & admin
    console.log("no young found");
    //todo : send mail to ref region & admin
  } else {
    //notify young & modify statusPhase1
    console.log("young found", nextYoung._id);
    nextYoung.set({ statusPhase1: "WAITING_ACCEPTATION" });
    await nextYoung.save();

    //remove the young from the waiting list
    const center = await CohesionCenterModel.findById(nextYoung.cohesionCenterId);
    if (center?.waitingList?.indexOf(nextYoung._id) !== -1) {
      const i = center.waitingList.indexOf(nextYoung._id);
      center.waitingList.splice(i, 1);
      await center.save();
    }

    //todo : send mail to young
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
      if (tempYoung.department === young.department && tempYoung.gender === young.gender) {
        res = tempYoung;
        break;
      }
    }
    return res;
  } catch (e) {
    console.log(e);
  }
};

function validateString(string){
  return Joi.string().allow(null,'').validate(string, { stripUnknown: true });
}

function validateEmail(mail){
  return Joi.string().allow(null,'').validate(mail, { stripUnknown: true });
}

function validateToken(token){
  return Joi.string().allow(null,'').validate(token, { stripUnknown : true});
}

function validateId(id){
  return Joi.string().allow(null,'').validate(id, { stripUnknown : true});
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
};

module.exports = {
  uploadFile,
  getFile,
  fileExist,
  validatePassword,
  ERRORS,
  getSignedUrl,
  updatePlacesCenter,
  assignNextYoungFromWaitingList,
  validateEmail,
  validateId,
  validateString,
  validateToken
};
