const express = require("express");
const passport = require("passport");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mime = require("mime-types");
const FileType = require("file-type");
const Joi = require("joi");
const NodeClam = require("clamscan");
const fs = require("fs");

const ReferentModel = require("../models/referent");
const YoungModel = require("../models/young");
const MissionModel = require("../models/mission");
const ApplicationModel = require("../models/application");
const SessionPhase1 = require("../models/sessionPhase1");
const MeetingPointModel = require("../models/meetingPoint");
const CohesionCenterModel = require("../models/cohesionCenter");
const BusModel = require("../models/bus");
const StructureModel = require("../models/structure");
const AuthObject = require("../auth");
const ReferentAuth = new AuthObject(ReferentModel);
const patches = require("./patches");

const { getQPV, getDensity } = require("../geo");
const config = require("../config");
const { capture } = require("../sentry");
const { decrypt, encrypt } = require("../cryptoUtils");
const { sendTemplate } = require("../sendinblue");
const {
  getFile,
  uploadFile,
  deleteFile,
  validatePassword,
  updatePlacesSessionPhase1,
  updatePlacesBus,
  ERRORS,
  isYoung,
  inSevenDays,
  FILE_STATUS_PHASE1,
  translateFileStatusPhase1,
  getCcOfYoung,
  //  updateApplicationsWithYoungOrMission,
} = require("../utils");
const { validateId, validateSelf, validateYoung, validateReferent } = require("../utils/validator");
const { serializeYoung, serializeReferent, serializeSessionPhase1, serializeCohesionCenter } = require("../utils/serializer");
const { cookieOptions, JWT_MAX_AGE } = require("../cookie-options");
const { SENDINBLUE_TEMPLATES, YOUNG_STATUS_PHASE1 } = require("snu-lib/constants");
const { department2region } = require("snu-lib/region-and-departments");
const { translateCohort } = require("snu-lib/translation");
const {
  ROLES_LIST,
  canInviteUser,
  canDeleteReferent,
  canViewReferent,
  canViewYoung,
  SUB_ROLES,
  ROLES,
  canUpdateReferent,
  canViewYoungMilitaryPreparationFile,
  canSigninAs,
  canGetReferentByEmail,
  canEditYoung,
  canViewYoungFile,
  canRefuseMilitaryPreparation,
  canChangeYoungCohort,
  canSendTutorTemplate,
  canModifyStructure,
  canSearchSessionPhase1,
  canCreateOrUpdateSessionPhase1,
} = require("snu-lib/roles");

async function updateTutorNameInMissionsAndApplications(tutor, fromUser) {
  if (!tutor || !tutor.firstName || !tutor.lastName) return;

  const missions = await MissionModel.find({ tutorId: tutor._id });
  // Update missions
  if (missions && missions.length) {
    for (let mission of missions) {
      mission.set({ tutorName: `${tutor.firstName} ${tutor.lastName}` });
      await mission.save({ fromUser });
      // ... and update each application
      const applications = await ApplicationModel.find({ missionId: mission._id });
      if (applications && applications.length) {
        for (let application of applications) {
          application.set({ tutorId: mission.tutorId, tutorName: `${tutor.firstName} ${tutor.lastName}` });
          await application.save({ fromUser });
        }
      }
    }
  }
}

router.post("/signin", (req, res) => ReferentAuth.signin(req, res));
router.post("/logout", (req, res) => ReferentAuth.logout(req, res));
router.post("/signup", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      email: Joi.string().lowercase().trim().email().required(),
      firstName: Joi.string().lowercase().trim().required(),
      lastName: Joi.string().uppercase().trim().required(),
      password: Joi.string().required(),
      acceptCGU: Joi.string().required(),
    })
      .unknown()
      .validate(req.body);

    if (error) {
      if (error.details.find((e) => e.path.find((p) => p === "email"))) return res.status(400).send({ ok: false, user: null, code: ERRORS.EMAIL_INVALID });
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { email, lastName, password, acceptCGU } = value;
    if (!validatePassword(password)) return res.status(400).send({ ok: false, user: null, code: ERRORS.PASSWORD_NOT_VALIDATED });
    const firstName = value.firstName.charAt(0).toUpperCase() + value.firstName.toLowerCase().slice(1);
    const role = ROLES.RESPONSIBLE; // responsible by default

    const user = await ReferentModel.create({ password, email, firstName, lastName, role, acceptCGU });
    const token = jwt.sign({ _id: user._id }, config.secret, { expiresIn: JWT_MAX_AGE });
    res.cookie("jwt", token, cookieOptions());

    return res.status(200).send({ user, token, ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
router.get("/signin_token", passport.authenticate("referent", { session: false, failWithError: true }), (req, res) => ReferentAuth.signinToken(req, res));
router.post("/forgot_password", async (req, res) => ReferentAuth.forgotPassword(req, res, `${config.ADMIN_URL}/auth/reset`));
router.post("/forgot_password_reset", async (req, res) => ReferentAuth.forgotPasswordReset(req, res));
router.post("/reset_password", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => ReferentAuth.resetPassword(req, res));

router.post("/signin_as/:type/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: params } = Joi.object({ id: Joi.string().required(), type: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { id, type } = params;

    let user = null;
    if (type === "referent") user = await ReferentModel.findById(id);
    else if (type === "young") user = await YoungModel.findById(id);
    if (!user) return res.status(404).send({ code: ERRORS.USER_NOT_FOUND, ok: false });

    if (!canSigninAs(req.user, user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const token = jwt.sign({ _id: user.id }, config.secret, { expiresIn: JWT_MAX_AGE });
    res.cookie("jwt", token, cookieOptions());

    return res.status(200).send({ ok: true, token, data: isYoung(user) ? serializeYoung(user, user) : serializeReferent(user, user) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/signup_invite/:template", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      template: Joi.string().required(),
      email: Joi.string().lowercase().trim().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      role: Joi.string()
        .valid(...ROLES_LIST)
        .required(),
      subRole: Joi.string().allow(null, ""),
      region: Joi.string().allow(null, ""),
      department: Joi.string().allow(null, ""),
      structureId: Joi.string().allow(null, ""),
      structureName: Joi.string().allow(null, ""),
      cohesionCenterName: Joi.string().allow(null, ""),
      cohesionCenterId: Joi.string().allow(null, ""),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canInviteUser(req.user.role, value.role)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { template, email, firstName, lastName, role, subRole, region, department, structureId, structureName, cohesionCenterName, cohesionCenterId } = value;
    const referentProperties = {};
    if (email) referentProperties.email = email.trim().toLowerCase();
    if (firstName) referentProperties.firstName = firstName.charAt(0).toUpperCase() + (firstName || "").toLowerCase().slice(1);
    if (lastName) referentProperties.lastName = lastName.toUpperCase();
    if (role) referentProperties.role = role;
    if (subRole) referentProperties.subRole = subRole;
    if (region) referentProperties.region = region;
    if (department) referentProperties.department = department;
    if (structureId) referentProperties.structureId = structureId;
    if (cohesionCenterName) referentProperties.cohesionCenterName = cohesionCenterName;
    if (cohesionCenterId) referentProperties.cohesionCenterId = cohesionCenterId;

    const invitation_token = crypto.randomBytes(20).toString("hex");
    referentProperties.invitationToken = invitation_token;
    referentProperties.invitationExpires = inSevenDays();

    const referent = await ReferentModel.create(referentProperties);
    await updateTutorNameInMissionsAndApplications(referent, req.user);

    const cta = `${config.ADMIN_URL}/auth/signup/invite?token=${invitation_token}`;
    const fromName = `${req.user.firstName} ${req.user.lastName}`;
    const toName = `${referent.firstName} ${referent.lastName}`;

    await sendTemplate(template, {
      emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
      params: { cta, cohesionCenterName, structureName, region, department, fromName, toName },
    });

    return res.status(200).send({ data: serializeReferent(referent, req.user), ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/signup_retry", async (req, res) => {
  try {
    const { error, value } = Joi.object({ email: Joi.string().lowercase().trim().email().required() }).unknown().validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const referent = await ReferentModel.findOne({ email: value.email });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.USER_NOT_FOUND });

    const invitationToken = crypto.randomBytes(20).toString("hex");
    referent.set({ invitationToken });
    referent.set({ invitationExpires: inSevenDays() });

    const cta = `${config.ADMIN_URL}/auth/signup/invite?token=${invitationToken}`;
    const fromName = "L'équipe SNU";
    const toName = `${referent.firstName} ${referent.lastName}`;
    const cohesionCenterName = referent.cohesionCenterName;
    const region = referent.region;
    const department = referent.department;
    const structureName = referent.structureId ? (await StructureModel.findById(referent.structureId)).name : "";

    await referent.save({ fromUser: req.user });
    await sendTemplate(SENDINBLUE_TEMPLATES.invitationReferent[referent.role], {
      emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
      params: { cta, cohesionCenterName, structureName, region, department, fromName, toName },
    });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/signup_verify", async (req, res) => {
  try {
    const { error, value } = Joi.object({ invitationToken: Joi.string().required() }).unknown().validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const referent = await ReferentModel.findOne({ invitationToken: value.invitationToken, invitationExpires: { $gt: Date.now() } });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.INVITATION_TOKEN_EXPIRED_OR_INVALID });

    const token = jwt.sign({ _id: referent._id }, config.secret, { expiresIn: "30d" });
    return res.status(200).send({ ok: true, token, data: serializeReferent(referent, referent) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
router.post("/signup_invite", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      email: Joi.string().lowercase().trim().email().required(),
      password: Joi.string().required(),
      firstName: Joi.string().allow(null, ""),
      lastName: Joi.string().allow(null, ""),
      invitationToken: Joi.string().required(),
      acceptCGU: Joi.string().required(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { email, password, firstName, lastName, invitationToken, acceptCGU } = value;

    const referent = await ReferentModel.findOne({ email, invitationToken, invitationExpires: { $gt: Date.now() } });
    if (!referent) return res.status(404).send({ ok: false, data: null, code: ERRORS.USER_NOT_FOUND });
    if (referent.registredAt) return res.status(400).send({ ok: false, data: null, code: ERRORS.USER_ALREADY_REGISTERED });
    if (!validatePassword(password)) return res.status(400).send({ ok: false, prescriber: null, code: ERRORS.PASSWORD_NOT_VALIDATED });

    referent.set({
      firstName,
      lastName,
      password,
      registredAt: Date.now(),
      lastLoginAt: Date.now(),
      invitationToken: "",
      invitationExpires: null,
      acceptCGU,
    });

    const token = jwt.sign({ _id: referent.id }, config.secret, { expiresIn: "30d" });
    res.cookie("jwt", token, cookieOptions());

    await referent.save({ fromUser: req.user });
    await updateTutorNameInMissionsAndApplications(referent, req.user);

    if (referent.role === ROLES.REFERENT_DEPARTMENT) {
      await sendTemplate(SENDINBLUE_TEMPLATES.referent.WELCOME, {
        emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
      });
    }

    return res.status(200).send({ data: serializeReferent(referent, referent), token, ok: true });
  } catch (error) {
    capture(error);
    return res.sendStatus(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// todo move to young controller
router.put("/young/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateYoung(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { id } = req.params;
    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (!canEditYoung(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.YOUNG_NOT_EDITABLE });

    // eslint-disable-next-line no-unused-vars
    let { __v, ...newYoung } = value;

    // if withdrawn, cascade withdrawn on every status
    if (newYoung.status === "WITHDRAWN" && (young.statusPhase1 !== "WITHDRAWN" || young.statusPhase2 !== "WITHDRAWN" || young.statusPhase3 !== "WITHDRAWN")) {
      if (young.statusPhase1 !== "DONE") newYoung.statusPhase1 = "WITHDRAWN";
      if (young.statusPhase2 !== "VALIDATED") newYoung.statusPhase2 = "WITHDRAWN";
      if (young.statusPhase3 !== "VALIDATED") newYoung.statusPhase3 = "WITHDRAWN";
    }

    if (newYoung?.department && young?.department && newYoung?.department !== young?.department) {
      const referents = await ReferentModel.find({ department: newYoung.department, role: ROLES.REFERENT_DEPARTMENT });
      for (let referent of referents) {
        await sendTemplate(SENDINBLUE_TEMPLATES.young.DEPARTMENT_CHANGE, {
          emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
          params: {
            youngFirstName: young.firstName,
            youngLastName: young.lastName,
            cta: `${config.ADMIN_URL}/volontaire/${young._id}`,
          },
        });
      }
    }

    if (newYoung.cohesionStayPresence === "true" && young.cohesionStayPresence !== "true") {
      let emailTo = [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }];
      if (young.parent2Email) emailTo.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email });

      await sendTemplate(SENDINBLUE_TEMPLATES.YOUNG_ARRIVED_IN_CENTER_TO_REPRESENTANT_LEGAL, {
        emailTo,
        params: {
          youngFirstName: young.firstName,
          youngLastName: young.lastName,
        },
      });

      // autovalidate the phase 1 if the young is present in the session
      newYoung.statusPhase1 = "DONE";
    }

    if (newYoung.cohesionStayPresence === "false" && young.cohesionStayPresence !== "false") {
      // reject the phase 1 if the young is NOT present in the session
      newYoung.statusPhase1 = "NOT_DONE";
    }

    // Check quartier prioritaires.
    if (newYoung.zip && newYoung.city && newYoung.address) {
      const qpv = await getQPV(newYoung.zip, newYoung.city, newYoung.address);
      if (qpv === true) newYoung.qpv = "true";
      else if (qpv === false) newYoung.qpv = "false";
      else newYoung.qpv = "";
    }

    // Check quartier prioritaires.
    if (newYoung.cityCode) {
      const populationDensity = await getDensity(newYoung.cityCode);
      newYoung.populationDensity = populationDensity;
    }

    // await updateApplicationsWithYoungOrMission({ young, newYoung });

    young.set(newYoung);
    await young.save({ fromUser: req.user });

    // if they had a cohesion center, we check if we need to update the places taken / left
    if (young.sessionPhase1Id) {
      const sessionPhase1 = await SessionPhase1.findById(young.sessionPhase1Id);
      if (sessionPhase1) await updatePlacesSessionPhase1(sessionPhase1);
    }
    res.status(200).send({ ok: true, data: young });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.EMAIL_ALREADY_USED });

    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/young/:id/refuse-military-preparation-files", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { id } = req.params;
    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (!canRefuseMilitaryPreparation(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.YOUNG_NOT_EDITABLE });

    const newYoung = { statusMilitaryPreparationFiles: "REFUSED" };

    const militaryKeys = ["militaryPreparationFilesIdentity", "militaryPreparationFilesCensus", "militaryPreparationFilesAuthorization", "militaryPreparationFilesCertificate"];
    for (let key of militaryKeys) {
      young[key].forEach((file) => deleteFile(`app/young/${young._id}/military-preparation/${key}/${file}`));
      newYoung[key] = [];
    }

    young.set(newYoung);
    await young.save({ fromUser: req.user });
    res.status(200).send({ ok: true, data: young });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.EMAIL_ALREADY_USED });
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/young/:id/change-cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const validatedMessage = Joi.string().required().validate(req.body.message);
    const validatedBody = validateYoung(req.body);
    if (validatedBody?.error || validatedMessage?.error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { id } = req.params;
    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (!canChangeYoungCohort(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.YOUNG_NOT_EDITABLE });

    const { cohort, cohortChangeReason } = validatedBody.value;

    const oldSessionPhase1Id = young.sessionPhase1Id;
    const oldMeetingPointId = young.meetingPointId;
    if (young.cohort !== cohort && (young.sessionPhase1Id || young.meetingPointId)) {
      young.set({ sessionPhase1Id: undefined });
      young.set({ meetingPointId: undefined });
    }

    // si le volontaire change pour la première fois de cohorte, on stocke sa cohorte d'origine
    if (!young.originalCohort) {
      young.set({ originalCohort: young.cohort });
    }

    young.set({ statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION, cohort, cohortChangeReason, cohesionStayPresence: undefined, cohesionStayMedicalFileReceived: undefined });
    await young.save({ fromUser: req.user });

    // if they had a session, we check if we need to update the places taken / left
    if (oldSessionPhase1Id) {
      const sessionPhase1 = await SessionPhase1.findById(oldSessionPhase1Id);
      if (sessionPhase1) await updatePlacesSessionPhase1(sessionPhase1);
    }

    // if they had a meetingPoint, we check if we need to update the places taken / left in the bus
    if (oldMeetingPointId) {
      const meetingPoint = await MeetingPointModel.findById(oldMeetingPointId);
      if (meetingPoint) {
        const bus = await BusModel.findById(meetingPoint.busId);
        if (bus) await updatePlacesBus(bus);
      }
    }

    let template = SENDINBLUE_TEMPLATES.young.CHANGE_COHORT;
    let cc = getCcOfYoung({ template, young });
    await sendTemplate(template, {
      emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
      params: {
        motif: cohortChangeReason,
        message: validatedMessage.value,
        cohortPeriod: translateCohort(cohort),
      },
      cc,
    });

    res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:tutorId/email/:template", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      tutorId: Joi.string().required(),
      template: Joi.string().required(),
      subject: Joi.string().allow(null, ""),
      message: Joi.string().allow(null, ""),
      app: Joi.object().allow(null, {}),
      missionName: Joi.string().allow(null, ""),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // eslint-disable-next-line no-unused-vars
    const { tutorId, template, subject, message, app, missionName } = value;
    const tutor = await ReferentModel.findById(tutorId);
    if (!tutor) return res.status(404).send({ ok: false, data: null, code: ERRORS.USER_NOT_FOUND });

    if (!canSendTutorTemplate(req.user, tutor)) return res.status(403).send({ ok: false, code: ERRORS.YOUNG_NOT_EDITABLE });

    if (
      [
        SENDINBLUE_TEMPLATES.referent.MISSION_WAITING_CORRECTION,
        SENDINBLUE_TEMPLATES.referent.MISSION_REFUSED,
        SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_VALIDATED,
      ].includes(template)
    )
      await sendTemplate(template, {
        emailTo: [{ name: `${tutor.firstName} ${tutor.lastName}`, email: tutor.email }],
        params: {
          cta: config.ADMIN_URL,
          message,
          missionName: missionName || app?.missionName,
          youngFirstName: app?.youngFirstName,
          youngLastName: app?.youngLastName,
        },
      });
    else {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    return res.status(200).send({ ok: true });
  } catch (error) {
    console.log(error);
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Todo: refactor
// get /young/:id/file/:key/:filename accessible only by ref or themself
router.get("/youngFile/:youngId/:key/:fileName", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      youngId: Joi.string().required(),
      key: Joi.string().required(),
      fileName: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { youngId, key, fileName } = value;

    const young = await YoungModel.findById(youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!canViewYoungFile(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const downloaded = await getFile(`app/young/${youngId}/${key}/${fileName}`);
    const decryptedBuffer = decrypt(downloaded.Body);

    let mimeFromFile = null;
    try {
      const { mime } = await FileType.fromBuffer(decryptedBuffer);
      mimeFromFile = mime;
    } catch (e) {
      //
    }

    return res.status(200).send({
      data: Buffer.from(decryptedBuffer, "base64"),
      mimeType: mimeFromFile ? mimeFromFile : mime.lookup(fileName),
      fileName: fileName,
      ok: true,
    });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

//todo: refactor do not duplicate routes
// get /young/:id/file/:key/:filename accessible only by ref or themself
router.get("/youngFile/:youngId/military-preparation/:key/:fileName", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      youngId: Joi.string().required(),
      key: Joi.string().required(),
      fileName: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { youngId, key, fileName } = value;

    const young = await YoungModel.findById(youngId);
    // if they are not admin nor referent, it is not allowed to access this route unless they are from a military preparation structure
    if (!canViewYoungMilitaryPreparationFile(req.user, young)) {
      const structure = await StructureModel.findById(req.user.structureId);
      if (!structure || structure?.isMilitaryPreparation !== "true") return res.status(400).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const downloaded = await getFile(`app/young/${youngId}/military-preparation/${key}/${fileName}`);
    const decryptedBuffer = decrypt(downloaded.Body);

    let mimeFromFile = null;
    try {
      const { mime } = await FileType.fromBuffer(decryptedBuffer);
      mimeFromFile = mime;
    } catch (e) {
      //
    }

    return res.status(200).send({
      data: Buffer.from(decryptedBuffer, "base64"),
      mimeType: mimeFromFile ? mimeFromFile : mime.lookup(fileName),
      fileName: fileName,
      ok: true,
    });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/file/:key", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      key: Joi.string().required(),
      body: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    const { key, body } = value;
    const {
      error: bodyError,
      value: { names, youngId },
    } = Joi.object({
      names: Joi.array().items(Joi.string()).required(),
      youngId: Joi.string().required(),
    }).validate(JSON.parse(body), { stripUnknown: true });

    if (error || bodyError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungModel.findById(youngId);
    if (!young) return res.status(404).send({ ok: false });

    if (!canViewYoungFile(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Validate files with Joi
    const { error: filesError, value: files } = Joi.array()
      .items(
        Joi.alternatives().try(
          Joi.object({
            name: Joi.string().required(),
            data: Joi.binary().required(),
            tempFilePath: Joi.string().allow("").optional(),
          }).unknown(),
          Joi.array().items(
            Joi.object({
              name: Joi.string().required(),
              data: Joi.binary().required(),
              tempFilePath: Joi.string().allow("").optional(),
            }).unknown(),
          ),
        ),
      )
      .validate(
        Object.keys(req.files || {}).map((e) => req.files[e]),
        { stripUnknown: true },
      );
    if (filesError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    for (let currentFile of files) {
      // If multiple file with same names are provided, currentFile is an array. We just take the latest.
      if (Array.isArray(currentFile)) {
        currentFile = currentFile[currentFile.length - 1];
      }
      const { name, tempFilePath, mimetype } = currentFile;
      const { mime: mimeFromMagicNumbers } = await FileType.fromFile(tempFilePath);
      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!(validTypes.includes(mimetype) && validTypes.includes(mimeFromMagicNumbers))) {
        fs.unlinkSync(tempFilePath);
        return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });
      }

      if (config.ENVIRONMENT === "staging" || config.ENVIRONMENT === "production") {
        const clamscan = await new NodeClam().init({
          removeInfected: true,
        });
        const { isInfected } = await clamscan.isInfected(tempFilePath);
        if (isInfected) {
          fs.unlinkSync(tempFilePath);
          return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
        }
      }

      const data = fs.readFileSync(tempFilePath);
      const encryptedBuffer = encrypt(data);
      const resultingFile = { mimetype: "image/png", encoding: "7bit", data: encryptedBuffer };
      await uploadFile(`app/young/${young._id}/${key}/${name}`, resultingFile);
      fs.unlinkSync(tempFilePath);
    }
    young.set({ [key]: names });
    await young.save({ fromUser: req.user });
    return res.status(200).send({ data: names, ok: true });
  } catch (error) {
    capture(error);
    if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: "FILE_CORRUPTED" });
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

//todo: refactor: in young controller (if referent, add the applications)
router.get("/young/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required() })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewYoung(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await YoungModel.findById(value.id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const applicationsFromDb = await ApplicationModel.find({ youngId: data._id });
    let applications = [];
    for (let application of applicationsFromDb) {
      const structure = await StructureModel.findById(application.structureId);
      applications.push({ ...application._doc, structure });
    }
    return res.status(200).send({ ok: true, data: { ...data._doc, applications } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/patches", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => await patches.get(req, res, ReferentModel));

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const referent = await ReferentModel.findById(checkedId);
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canViewReferent(req.user, referent)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    return res.status(200).send({ ok: true, data: serializeReferent(referent, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const { error, value } = Joi.string().required().email().validate(req.query.email);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canGetReferentByEmail(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    let data = await ReferentModel.findOne({ email: value });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, error: "Aucun utilisateur trouvé" });

    return res.status(200).send({
      ok: true,
      // Since this route is only used in a few places and does not require all information,
      // we return just what we need.
      data: {
        _id: data._id,
        email: data.email,
        role: data.role,
        department: data.department,
        region: data.region,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/manager_phase2/:department", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ department: Joi.string().required() })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // get the referent_department
    let data = await ReferentModel.findOne({
      subRole: SUB_ROLES.manager_phase2,
      role: ROLES.REFERENT_DEPARTMENT,
      department: value.department,
    });
    // if not found, get the referent_region
    if (!data) {
      data = await ReferentModel.findOne({
        subRole: SUB_ROLES.manager_phase2,
        role: ROLES.REFERENT_REGION,
        region: department2region[value.department],
      });
    }
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data: { firstName: data.firstName, lastName: data.lastName, email: data.email, department: data.department } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateReferent(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const referent = await ReferentModel.findById(req.params.id);
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const structure = await StructureModel.findById(value.structureId);

    if (!canUpdateReferent({ actor: req.user, originalTarget: referent, modifiedTarget: value, structure })) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    referent.set(value);
    await referent.save({ fromUser: req.user });
    await updateTutorNameInMissionsAndApplications(referent, req.user);
    res.status(200).send({ ok: true, data: referent });
  } catch (error) {
    capture(error);
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.EMAIL_ALREADY_USED });
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateSelf(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const user = await ReferentModel.findById(req.user._id);
    if (!user) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    user.set(value);
    await user.save();
    await updateTutorNameInMissionsAndApplications(user, req.user);
    res.status(200).send({ ok: true, data: user });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/structure/:structureId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    const { error: errorStructureId, value: checkedStructureId } = validateId(req.params.structureId);
    if (errorId || errorStructureId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const structure = await StructureModel.findById(checkedStructureId);
    const referent = await ReferentModel.findById(checkedId);
    if (!referent || !structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!canModifyStructure(req.user, structure) || !canUpdateReferent({ actor: req.user, originalTarget: referent })) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const missions = await MissionModel.find({ tutorId: referent._id });
    if (missions.length > 0) return res.status(405).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    referent.set({ structureId: structure._id, role: ROLES.RESPONSIBLE });
    await referent.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: referent });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const referent = await ReferentModel.findById(req.params.id);
    if (!referent) return res.status(404).send({ ok: false });
    let structure;
    if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(referent.role)) {
      structure = await StructureModel.findById(referent.structureId);
    }

    if (!canDeleteReferent({ actor: req.user, originalTarget: referent, structure })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const referents = await ReferentModel.find({ structureId: referent.structureId });
    const missionsLinkedToReferent = await MissionModel.find({ tutorId: referent._id }).countDocuments();
    if (missionsLinkedToReferent || referents.length === 1) return res.status(409).send({ ok: false, code: ERRORS.LINKED_OBJECT });
    await referent.remove();
    console.log(`Referent ${req.params.id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/session-phase1", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canSearchSessionPhase1(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const sessions = await SessionPhase1.find({ headCenterId: checkedId });
    return res.status(200).send({ ok: true, data: sessions.map(serializeSessionPhase1) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
router.get("/:id/cohesion-center", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });

    const sessions = await SessionPhase1.find({ headCenterId: checkedId });
    let centers = [];
    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      const center = await CohesionCenterModel.findById(session.cohesionCenterId);
      centers.push(center);
    }
    return res.status(200).send({ ok: true, data: centers.map(serializeCohesionCenter) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/young/:id/phase1Status/:document", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const keys = ["cohesionStayMedical", "autoTestPCR", "imageRight", "rules"];
    const { error: documentError, value: document } = Joi.string()
      .required()
      .valid(...keys)
      .validate(req.params.document);
    if (documentError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungModel.findById(req.params.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    let value;
    if (["autoTestPCR", "imageRight"].includes(document)) {
      const { error: bodyError, value: tempValue } = Joi.object({
        [`${document}FilesStatus`]: Joi.string()
          .trim()
          .valid(FILE_STATUS_PHASE1.TO_UPLOAD, FILE_STATUS_PHASE1.WAITING_VERIFICATION, FILE_STATUS_PHASE1.WAITING_CORRECTION, FILE_STATUS_PHASE1.VALIDATED)
          .required(),
        [`${document}FilesComment`]: Joi.alternatives().conditional(`${document}FilesStatus`, {
          is: FILE_STATUS_PHASE1.WAITING_CORRECTION,
          then: Joi.string().trim().required(),
          otherwise: Joi.isError(new Error()),
        }),
      }).validate(req.body);
      if (bodyError) return res.status(400).send({ ok: false, code: bodyError });
      if (!tempValue[`${document}FilesComment`]) tempValue[`${document}FilesComment`] = undefined;
      value = tempValue;
    } else if (document === "cohesionStayMedical") {
      const { error: bodyError, value: tempValue } = Joi.object({
        cohesionStayMedicalFileReceived: Joi.string().trim().required().valid("true", "false"),
        cohesionStayMedicalFileDownload: Joi.string().trim().required().valid("true", "false"),
      }).validate(req.body);
      if (bodyError) return res.status(400).send({ ok: false, code: bodyError });
      value = tempValue;
    } else if (document === "rules") {
      const { error: bodyError, value: tempValue } = Joi.object({
        rulesYoung: Joi.string().trim().required().valid("true", "false"),
      }).validate(req.body);
      if (bodyError) return res.status(400).send({ ok: false, code: bodyError });
      value = tempValue;
    } else {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canCreateOrUpdateSessionPhase1(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    young.set(value);
    await young.save({ fromUser: req.user });

    if (["autoTestPCR", "imageRight", "rules"].includes(document)) {
      if ([FILE_STATUS_PHASE1.WAITING_VERIFICATION, FILE_STATUS_PHASE1.WAITING_CORRECTION, FILE_STATUS_PHASE1.VALIDATED].includes(value[`${document}FilesStatus`])) {
        const statusToMail = {
          WAITING_VERIFICATION: SENDINBLUE_TEMPLATES.young.PHASE_1_PJ_WAITING_VERIFICATION,
          WAITING_CORRECTION: SENDINBLUE_TEMPLATES.young.PHASE_1_PJ_WAITING_CORRECTION,
          VALIDATED: SENDINBLUE_TEMPLATES.young.PHASE_1_PJ_VALIDATED,
        };

        let cc = getCcOfYoung({ template: statusToMail[value[`${document}FilesStatus`]], young });
        await sendTemplate(statusToMail[value[`${document}FilesStatus`]], {
          emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
          params: { type_document: translateFileStatusPhase1(document), modif: value[`${document}FilesComment`] },
          cc,
        });
      }
    }
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/young/:id/phase1Files/:document", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const keys = ["autoTestPCR", "imageRight", "rules"];
    const { error: documentError, value: document } = Joi.string()
      .required()
      .valid(...keys)
      .validate(req.params.document);
    if (documentError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungModel.findById(req.params.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const { error: bodyError, value } = Joi.object({
      [`${document}`]: Joi.string().trim().valid("true", "false"),
      [`${document}Files`]: Joi.array().items(Joi.string()),
    }).validate(req.body);
    if (bodyError) return res.status(400).send({ ok: false, code: bodyError });

    if (!canCreateOrUpdateSessionPhase1(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    young.set(value);
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
