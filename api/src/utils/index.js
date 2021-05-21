const AWS = require("aws-sdk");
const https = require("https");
const http = require("http");
const passwordValidator = require("password-validator");
const YoungModel = require("../models/young");
const CohesionCenterModel = require("../models/cohesionCenter");
const Joi = require("joi");

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

function validateYoung(young){
  return Joi.object()
    .keys({
      cohort: Joi.string().allow(null,''),
      sqlId: Joi.string().allow(null,''),
      firstName: Joi.string().allow(null,''),
      lastName: Joi.string().allow(null,''),
      frenchNationality: Joi.string().allow(null,''),
      birthCountry: Joi.string().allow(null,''),
      email: Joi.string().allow(null,''),
      phone: Joi.string().allow(null,''),
      gender: Joi.string().allow(null,''),
      birthdateAt: Joi.string().allow(null,''),
      cohort: Joi.string().allow(null,''),
      phase: Joi.string().allow(null,''),
      status: Joi.string().allow(null,''),
      statusPhase1: Joi.string().allow(null,''),
      statusPhase2: Joi.string().allow(null,''),
      statusPhase3: Joi.string().allow(null,''),
      lastStatusAt: Joi.string().allow(null,''),
      withdrawnMessage: Joi.string().allow(null,''),
      inscriptionStep: Joi.string().allow(null,''),
      cohesion2020Step: Joi.string().allow(null,''),
      historic: Joi.array().items(Joi.object()
        .keys({
          phase : Joi.string().allow(null,''),
          userName : Joi.string().allow(null,''),
          userId : Joi.string().allow(null,''),
          status : Joi.string().allow(null,''),
          createdAt : Joi.string().allow(null,''),
          note : Joi.string().allow(null,'')
        })),
      password: Joi.string().allow(null,''),
      lastLoginAt: Joi.string().allow(null,''),
      forgotPasswordResetToken: Joi.string().allow(null,''),
      forgotPasswordResetExpires: Joi.string().allow(null,''),
      invitationToken: Joi.string().allow(null,''),
      invitationExpires: Joi.string().allow(null,''),
      cniFiles: Joi.array().items(Joi.string()),
      cohesionStayPresence: Joi.string().allow(null,''),
      cohesionStayMedicalFileReceived: Joi.string().allow(null,''),
      cohesionCenterId: Joi.string().allow(null,''),
      cohesionCenterName: Joi.string().allow(null,''),
      cohesionCenterZip: Joi.string().allow(null,''),
      phase2ApplicationStatus: Joi.array().items(Joi.string()),
      phase3StructureName: Joi.string().allow(null,''),
      phase3MissionDomain: Joi.string().allow(null,''),
      phase3MissionDescription: Joi.string().allow(null,''),
      phase3MissionStartAt: Joi.string().allow(null,''),
      phase3MissionEndAt: Joi.string().allow(null,''),
      phase3TutorFirstName: Joi.string().allow(null,''),
      phase3TutorLastName: Joi.string().allow(null,''),
      phase3TutorEmail: Joi.string().allow(null,''),
      phase3TutorPhone: Joi.string().allow(null,''),
      phase3TutorNote: Joi.string().allow(null,''),
      phase3Token: Joi.string().allow(null,''),
      address: Joi.string().allow(null,''),
      complementAddress: Joi.string().allow(null,''),
      zip: Joi.string().allow(null,''),
      city: Joi.string().allow(null,''),
      cityCode: Joi.string().allow(null,''),
      populationDensity: Joi.string().allow(null,''),
      department: Joi.string().allow(null,''),
      region: Joi.string().allow(null,''),
      location: Joi.object().keys({
        lat : Joi.number(),
        lon : Joi.number(),
      }),
      qpv: Joi.string().allow(null,''),
      populationDensity: Joi.string().allow(null,''),
      situation: Joi.string().allow(null,''),
      grade: Joi.string().allow(null,''),
      schoolCertification: Joi.string().allow(null,''),
      schooled: Joi.string().allow(null,''),
      schoolName: Joi.string().allow(null,''),
      schoolType: Joi.string().allow(null,''),
      schoolAddress:Joi.string().allow(null,''),
      schoolComplementAdresse: Joi.string().allow(null,''),
      schoolZip: Joi.string().allow(null,''),
      schoolCity: Joi.string().allow(null,''),
      schoolDepartment: Joi.string().allow(null,''),
      schoolRegion: Joi.string().allow(null,''),
      schoolLocation: Joi.object().keys({
        lat : Joi.number(),
        lon : Joi.number(),
      }),
      schoolId: Joi.string().allow(null,''),
      parent1Status: Joi.string().allow(null,''),
      parent1FirstName: Joi.string().allow(null,''),
      parent1LastName: Joi.string().allow(null,''),
      parent1Email: Joi.string().allow(null,''),
      parent1Phone: Joi.string().allow(null,''),
      parent1OwnAddress: Joi.string().allow(null,''),
      parent1Address: Joi.string().allow(null,''),
      parent1ComplementAddress: Joi.string().allow(null,''),
      parent1Zip: Joi.string().allow(null,''),
      parent1City: Joi.string().allow(null,''),
      parent1Department: Joi.string().allow(null,''),
      parent1Region: Joi.string().allow(null,''),
      parent1Location: Joi.object().keys({
        lat : Joi.number(),
        lon : Joi.number(),
      }),
      parent1FromFranceConnect: Joi.string().allow(null,''),
      parent2Status: Joi.string().allow(null,''),
      parent2FirstName: Joi.string().allow(null,''),
      parent2LastName: Joi.string().allow(null,''),
      parent2Email: Joi.string().allow(null,''),
      parent2Phone: Joi.string().allow(null,''),
      parent2OwnAddress: Joi.string().allow(null,''),
      parent2Address: Joi.string().allow(null,''),
      parent2ComplementAddress: Joi.string().allow(null,''),
      parent2Zip: Joi.string().allow(null,''),
      parent2City: Joi.string().allow(null,''),
      parent2Department: Joi.string().allow(null,''),
      parent2Region: Joi.string().allow(null,''),
      parent2Location: Joi.object().keys({
        lat : Joi.number(),
        lon : Joi.number(),
      }),
      parent2FromFranceConnect: Joi.string().allow(null,''),
      handicap: Joi.string().allow(null,''),
      ppsBeneficiary: Joi.string().allow(null,''),
      paiBeneficiary: Joi.string().allow(null,''),
      medicosocialStructure: Joi.string().allow(null,''),
      medicosocialStructureName: Joi.string().allow(null,''),
      medicosocialStructureAddress: Joi.string().allow(null,''),
      medicosocialStructureComplementAddress: Joi.string().allow(null,''),
      medicosocialStructureZip: Joi.string().allow(null,''),
      medicosocialStructureCity: Joi.string().allow(null,''),
      medicosocialStructureDepartment: Joi.string().allow(null,''),
      medicosocialStructureRegion: Joi.string().allow(null,''),
      medicosocialStructureLocation: Joi.object().keys({
        lat : Joi.number(),
        lon : Joi.number(),
      }),
      engagedStructure: Joi.string().allow(null,''),
      specificAmenagment: Joi.string().allow(null,''),
      specificAmenagmentType: Joi.string().allow(null,''),  
      highSkilledActivity: Joi.string().allow(null,''),
      highSkilledActivityType: Joi.string().allow(null,''),
      highSkilledActivityProofFiles: Joi.array().items(Joi.string().allow(null,'')),
      parentConsentment: Joi.string().allow(null,''),
      parentConsentmentFiles: Joi.array().items(Joi.string()),
      parentConsentmentFilesCompliant: Joi.string().allow(null,''),
      parentConsentmentFilesCompliantInfo: Joi.string().allow(null,''),
      consentment: Joi.string().allow(null,''),
      imageRight: Joi.string().allow(null,''),
      imageRightFiles: Joi.array().items(Joi.string()),
      jdc: Joi.string().allow(null,''),
      motivations: Joi.string().allow(null,''),
      domains: Joi.array().items(Joi.string()),
      professionnalProject: Joi.string().allow(null,''),
      professionnalProjectPrecision: Joi.string().allow(null,''),
      period: Joi.string().allow(null,''),
      periodRanking: Joi.array().items(Joi.string()),
      mobilityNearSchool: Joi.string().allow(null,''),
      mobilityNearHome: Joi.string().allow(null,''),
      mobilityNearRelative: Joi.string().allow(null,''),
      mobilityNearRelativeName: Joi.string().allow(null,''),
      mobilityNearRelativeAddress: Joi.string().allow(null,''),
      mobilityNearRelativeZip: Joi.string().allow(null,''),
      mobilityTransport: Joi.array().items(Joi.string()),
      mobilityTransportOther: Joi.string().allow(null,''),
      missionFormat: Joi.string().allow(null,''),
      engaged: Joi.string().allow(null,''),
      engagedDescription: Joi.string().allow(null,''),
      desiredLocation: Joi.string().allow(null,''),
      defenseInterest: Joi.string().allow(null,''),
      defenseTypeInterest: Joi.string().allow(null,''),
      defenseDomainInterest: Joi.string().allow(null,''),
      defenseMotivationInterest: Joi.string().allow(null,''),
      securityInterest: Joi.string().allow(null,''),
      securityDomainInterest: Joi.string().allow(null,''),
      solidarityInterest: Joi.string().allow(null,''),
      healthInterest: Joi.string().allow(null,''),
      educationInterest: Joi.string().allow(null,''),
      cultureInterest: Joi.string().allow(null,''),
      sportInterest: Joi.string().allow(null,''),
      environmentInterest: Joi.string().allow(null,''),
      citizenshipInterest: Joi.string().allow(null,''),
      // createdAt: Joi.string().allow(null,''),
      // updatedAt: Joi.string().allow(null,''),
      // _id: Joi.string().allow(null, ''),
      // __v : Joi.number(),
      // Attention aux attributs récupérés, ceux voulus ou non
      // Qu'est-ce qu'on veut concretement ecrire
      // Ce qu'on doit passer dans le truc update c'est exclusivement ce qu'on PEUT modifier
      // Le front ne doit envoyer qu'exclusivement l'objet avec ses attributs définis
      // Par exemple ici _id et __v ne devrait pas etre accessible ou modifiable par le front
      applications : Joi.array().items(Joi.object()
      .keys({
        sqlId: Joi.string().allow(null,''),
        youngId: Joi.string().allow(null,''),
        youngFirstName: Joi.string().allow(null,''),
        youngLastName: Joi.string().allow(null,''),
        youngEmail: Joi.string().allow(null,''),
        youngBirthdateAt: Joi.string().allow(null,''),
        youngCity: Joi.string().allow(null,''),
        youngDepartment: Joi.string().allow(null,''),
        youngCohort: Joi.string().allow(null,''),
        missionId: Joi.string().allow(null,''),
        missionName: Joi.string().allow(null,''),
        missionDepartment: Joi.string().allow(null,''),
        missionRegion: Joi.string().allow(null,''),
        structureId:Joi.string().allow(null,''),
        tutorId: Joi.string().allow(null,''),
        tutorName: Joi.string().allow(null,''),
        priority: Joi.string().allow(null,''),
        status: Joi.string().allow(null,''),
        // createdAt: Joi.string().allow(null,''),
        // updatedAt: Joi.string().allow(null,''),
      })),
    })
    .validate(young, { stripUnknown: true });
}

function validateReferent(referent){
  return Joi.object()
    .keys({
      sqlId: Joi.string().allow(null,''),
      firstName: Joi.string().allow(null,''),
      lastName: Joi.string().allow(null,''),
      email: Joi.string().allow(null,''),
      password: Joi.string().allow(null,''),
      lastLoginAt: Joi.string().allow(null,''),
      registredAt: Joi.string().allow(null,''),
      forgotPasswordResetToken: Joi.string().allow(null,''),
      forgotPasswordResetExpires: Joi.string().allow(null,''),
      invitationToken: Joi.string().allow(null,''),
      invitationExpires: Joi.string().allow(null,''),
      role: Joi.string().allow(null,''),
      region: Joi.string().allow(null,''),
      department: Joi.string().allow(null,''),
      subRole: Joi.string().allow(null,''),
      cohesionCenterId: Joi.string().allow(null,''),
      cohesionCenterName: Joi.string().allow(null,''),
      phone: Joi.string().allow(null,''),
      mobile: Joi.string().allow(null,''),
      structureId: Joi.string().allow(null,'')
    })
    .validate(referent, { stripUnknown: true });
}

function validateMission(mission){
  return Joi.object()
    .keys({
      sqlId: Joi.string().allow(null,''),
      sqlStructureId: Joi.string().allow(null,''),
      sqlTutorId: Joi.string().allow(null,''),
      name: Joi.string().allow(null,''),
      domains: Joi.array().items(Joi.string().allow(null,'')),
      startAt: Joi.string().allow(null,''),
      endAt: Joi.string().allow(null,''),
      format: Joi.string().allow(null,''),
      frequence: Joi.string().allow(null,''),
      period: Joi.array().items(Joi.string().allow(null,'')),
      subPeriod: Joi.array().items(Joi.string().allow(null,'')),
      placesTotal: Joi.number(),
      placesLeft: Joi.number(),
      actions: Joi.string().allow(null,''),
      description: Joi.string().allow(null,''),
      justifications: Joi.string().allow(null,''),
      contraintes: Joi.string().allow(null,''),
      structureId: Joi.string().allow(null,''),
      structureName: Joi.string().allow(null,''),
      status: Joi.string().allow(null,''),
      // structure_id: { type: String, required: true },
      // referent_id: { type: String, required: true },
      tutorId: Joi.string().allow(null,''),
      tutorName: Joi.string().allow(null,''),
      //
    
      // dates_infos: { type: String },
      // periodes: { type: String },
      // frequence: { type: String },
      // planning: { type: String },
      address: Joi.string().allow(null,''),
      zip: Joi.string().allow(null,''),
      city: Joi.string().allow(null,''),
      department: Joi.string().allow(null,''),
      region: Joi.string().allow(null,''),
      country: Joi.string().allow(null,''),
      location: Joi.object().keys({
        lat : Joi.number(),
        lon : Joi.number(),
      }),
      remote: Joi.string().allow(null,''),
      //
      //
      //
      // state: { type: String },
    })
    .validate(mission, {stripUnknown : true})
}

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
  validateYoung,
  validateReferent,
  validateMission,
  validateString,
  validateEmail,
  validateToken,
  validateId
};
