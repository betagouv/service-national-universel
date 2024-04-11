const express = require("express");
const passport = require("passport");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mime = require("mime-types");
const FileType = require("file-type");
const Joi = require("joi");
const fs = require("fs");
const fileUpload = require("express-fileupload");

const ReferentModel = require("../models/referent");
const YoungModel = require("../models/young");
const MissionModel = require("../models/mission");
const ApplicationModel = require("../models/application");
const SessionPhase1 = require("../models/sessionPhase1");
const StructureModel = require("../models/structure");
const MissionEquivalenceModel = require("../models/missionEquivalence");
const AuthObject = require("../auth");
const ReferentAuth = new AuthObject(ReferentModel);
const patches = require("./patches");
const CohesionCenterModel = require("../models/cohesionCenter");
const LigneDeBusModel = require("../models/PlanDeTransport/ligneBus");
const EtablissementModel = require("../models/cle/etablissement");
const ClasseModel = require("../models/cle/classe");
const StateManager = require("../states");
const emailsEmitter = require("../emails");

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
  ERRORS,
  isYoung,
  inSevenDays,
  FILE_STATUS_PHASE1,
  translateFileStatusPhase1,
  getCcOfYoung,
  notifDepartmentChange,
  updateSeatsTakenInBusLine,
  cancelPendingApplications,
  cancelPendingEquivalence,
} = require("../utils");
const { validateId, validateSelf, validateYoung, validateReferent } = require("../utils/validator");
const { serializeYoung, serializeReferent, serializeSessionPhase1, serializeStructure } = require("../utils/serializer");
const { JWT_SIGNIN_MAX_AGE_SEC, JWT_SIGNIN_VERSION } = require("../jwt-options");
const { cookieOptions, COOKIE_SIGNIN_MAX_AGE_MS } = require("../cookie-options");
const {
  ROLES_LIST,
  canInviteUser,
  canDeleteReferent,
  canViewReferent,
  canViewYoung,
  SUB_ROLES,
  ROLES,
  canUpdateReferent,
  canUpdateMyself,
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
  SENDINBLUE_TEMPLATES,
  YOUNG_STATUS,
  YOUNG_STATUS_PHASE1,
  YOUNG_STATUS_PHASE2,
  MILITARY_FILE_KEYS,
  department2region,
  formatPhoneNumberFromPhoneZone,
  canCheckIfRefExist,
  YOUNG_SOURCE,
  YOUNG_SOURCE_LIST,
  APPLICATION_STATUS,
  EQUIVALENCE_STATUS,
} = require("snu-lib");
const { getFilteredSessions, getAllSessions } = require("../utils/cohort");
const scanFile = require("../utils/virusScanner");

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

function cleanReferentData(referent) {
  if (!referent.role) return referent;

  const fields = ["department", "region", "sessionPhase1Id", "cohorts", "cohesionCenterId", "cohesionCenterName", "structureId"];

  const fieldsToKeep = {
    admin: [],
    dsnj: [],
    head_center: ["cohesionCenterId", "cohesionCenterName", "cohorts", "sessionPhase1Id"],
    referent_department: ["department", "region"],
    referent_region: ["department", "region"],
    responsible: ["structureId"],
    supervisor: ["structureId"],
    transporter: [],
    visitor: ["region"],
  };

  if (!Object.keys(fieldsToKeep).includes(referent.role)) return referent;

  const fieldsToDelete = fields.filter((field) => !fieldsToKeep[referent.role].includes(field));

  for (const field of fieldsToDelete) {
    referent[field] = undefined;
  }

  return referent;
}

router.post("/signin", (req, res) => ReferentAuth.signin(req, res));
router.post("/signin-2fa", (req, res) => ReferentAuth.signin2FA(req, res));
router.post("/logout", passport.authenticate("referent", { session: false, failWithError: true }), (req, res) => ReferentAuth.logout(req, res));
router.post("/signup", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      // referent
      email: Joi.string().lowercase().trim().email().required(),
      firstName: Joi.string().lowercase().trim().required(),
      lastName: Joi.string().uppercase().trim().required(),
      password: Joi.string().required(),
      acceptCGU: Joi.string().required(),
      phone: Joi.string().required(),
      // structure
      name: Joi.string().required(),
      description: Joi.string().allow(null, ""),
      legalStatus: Joi.string().required(),
      types: Joi.array().items(Joi.string().allow(null, "")).allow(null, ""),
      zip: Joi.string().required(),
      region: Joi.string().required(),
      department: Joi.string().required(),
      sousType: Joi.string().allow(null, ""),
    })
      .unknown()
      .validate(req.body);

    if (error) {
      if (error.details.find((e) => e.path.find((p) => p === "email"))) return res.status(400).send({ ok: false, user: null, code: ERRORS.EMAIL_INVALID });
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { email, lastName, password, acceptCGU, phone } = value;
    if (!validatePassword(password)) return res.status(400).send({ ok: false, user: null, code: ERRORS.PASSWORD_NOT_VALIDATED });
    const firstName = value.firstName.charAt(0).toUpperCase() + value.firstName.toLowerCase().slice(1);
    const role = ROLES.RESPONSIBLE; // responsible by default

    const user = await ReferentModel.create({ password, email, firstName, lastName, role, acceptCGU, phone, mobile: phone });
    const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: user.id, lastLogoutAt: null, passwordChangedAt: null }, config.secret, { expiresIn: JWT_SIGNIN_MAX_AGE_SEC });
    res.cookie("jwt_ref", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));

    //Create structure
    const { name, description, legalStatus, types, zip, region, department, sousType } = value;
    const structure = await StructureModel.create({
      name,
      description,
      legalStatus,
      types,
      zip,
      region,
      department,
      sousType,
    });

    //Update user with structureId
    user.set({ structureId: structure._id });
    await user.save({ fromUser: user });

    return res.status(200).send({ user, token, ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
router.get("/signin_token", passport.authenticate("referent", { session: false, failWithError: true }), (req, res) => ReferentAuth.signinToken(req, res));
router.get("/refresh_token", passport.authenticate("referent", { session: false, failWithError: true }), (req, res) => ReferentAuth.refreshToken(req, res));
router.post("/forgot_password", async (req, res) => ReferentAuth.forgotPassword(req, res, `${config.ADMIN_URL}/auth/reset`));
router.post("/forgot_password_reset", async (req, res) => ReferentAuth.forgotPasswordReset(req, res));
router.post("/reset_password", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => ReferentAuth.resetPassword(req, res));

router.post("/signin_as/:type/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: params } = Joi.object({ id: Joi.string().required(), type: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { id, type } = params;

    let user = null;
    if (type === "referent") user = await ReferentModel.findById(id);
    else if (type === "young") user = await YoungModel.findById(id);
    if (!user) return res.status(404).send({ code: ERRORS.USER_NOT_FOUND, ok: false });

    if (!canSigninAs(req.user, user, type)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: user.id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt: user.passwordChangedAt }, config.secret, {
      expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
    });
    if (type === "referent") res.cookie("jwt_ref", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));
    else if (type === "young") {
      res.cookie("jwt_young", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));
    }

    return res.status(200).send({ ok: true, token, data: isYoung(user) ? serializeYoung(user, user) : serializeReferent(user, user) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/restore_signin", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ jwt: Joi.string().required() }).unknown().validate(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    let jwtPayload;
    try {
      jwtPayload = await jwt.verify(value.jwt, config.secret);
    } catch (error) {
      return res.status(401).send({ ok: false, user: { restriction: "public" } });
    }

    const user = await ReferentModel.findOne({ _id: jwtPayload._id, role: ROLES.ADMIN });
    if (!user) return res.status(401).send({ ok: false, user: { restriction: "public" } });

    const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: user.id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt: user.passwordChangedAt }, config.secret, {
      expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
    });
    res.cookie("jwt_ref", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));
    return res.status(200).send({ ok: true, token, data: serializeReferent(user, user) });
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
      department: Joi.array().items(Joi.string().allow(null, "")).allow(null, ""),
      structureId: Joi.string().allow(null, ""),
      structureName: Joi.string().allow(null, ""),
      cohesionCenterName: Joi.string().allow(null, ""),
      cohesionCenterId: Joi.string().allow(null, ""),
      phone: Joi.string().allow(null, ""),
      cohorts: Joi.array().items(Joi.string().allow(null, "")).allow(null, ""),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canInviteUser(req.user.role, value.role)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { template, email, firstName, lastName, role, subRole, region, department, structureId, structureName, cohesionCenterName, cohesionCenterId, phone, cohorts } = value;
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
    if (phone) {
      referentProperties.phone = phone;
      referentProperties.mobile = phone;
    }
    if (cohorts) referentProperties.cohorts = cohorts;

    const invitation_token = crypto.randomBytes(20).toString("hex");
    referentProperties.invitationToken = invitation_token;
    referentProperties.invitationExpires = inSevenDays();

    if (referentProperties.role === ROLES.ADMINISTRATEUR_CLE) referentProperties.subRole = SUB_ROLES.referent_etablissement;

    const referent = await ReferentModel.create(referentProperties);
    await updateTutorNameInMissionsAndApplications(referent, req.user);

    let cta = `${config.ADMIN_URL}/auth/signup/invite?token=${invitation_token}`;
    if ([ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(referentProperties.role)) {
      // fixme: update url
      cta = `${config.ADMIN_URL}/creer-mon-compte?token=${invitation_token}`;
    }
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
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

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
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const referent = await ReferentModel.findOne({ invitationToken: value.invitationToken, invitationExpires: { $gt: Date.now() } });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.INVITATION_TOKEN_EXPIRED_OR_INVALID });

    const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: referent.id, lastLogoutAt: null, passwordChangedAt: null }, config.secret, { expiresIn: JWT_SIGNIN_MAX_AGE_SEC });
    return res.status(200).send({ ok: true, token, data: serializeReferent(referent, referent) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
router.post("/signup_invite", async (req, res) => {
  // Elle sert encore cette route ?
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
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
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
      lastActivityAt: Date.now(),
      invitationToken: "",
      invitationExpires: null,
      acceptCGU,
    });

    const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: referent.id, lastLogoutAt: null, passwordChangedAt: null }, config.secret, { expiresIn: JWT_SIGNIN_MAX_AGE_SEC });
    res.cookie("jwt_ref", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));

    await referent.save({ fromUser: req.user });
    await updateTutorNameInMissionsAndApplications(referent, req.user);

    const toName = `${referent.firstName} ${referent.lastName}`;

    if (referent.role === ROLES.REFERENT_DEPARTMENT) {
      await sendTemplate(SENDINBLUE_TEMPLATES.referent.WELCOME_REF_DEP, {
        emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
        params: { toName },
      });
    }

    if (referent.role === ROLES.REFERENT_REGION) {
      await sendTemplate(SENDINBLUE_TEMPLATES.referent.WELCOME_REF_REG, {
        emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
        params: { toName },
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
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (value.phone) {
      value.phone = formatPhoneNumberFromPhoneZone(value.phone, value.phoneZone);
    }
    if (value.parent1Phone) {
      value.parent1Phone = formatPhoneNumberFromPhoneZone(value.parent1Phone, value.parent1PhoneZone);
    }
    if (value.parent2Phone) {
      value.parent2Phone = formatPhoneNumberFromPhoneZone(value.parent2Phone, value.parent2PhoneZone);
    }

    const { id } = req.params;
    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (!canEditYoung(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.YOUNG_NOT_EDITABLE });

    // eslint-disable-next-line no-unused-vars
    let { __v, ...newYoung } = value;

    if (newYoung.status === "REINSCRIPTION") {
      newYoung.cohesionStayPresence = undefined;
      newYoung.presenceJDM = undefined;
      newYoung.departSejourAt = undefined;
      newYoung.departSejourMotif = undefined;
      newYoung.departSejourMotifComment = undefined;
      newYoung.meetingPointId = undefined;
      newYoung.cohesionCenterId = undefined;
      newYoung.sessionPhase1Id = undefined;
      newYoung.statusPhase1 = YOUNG_STATUS_PHASE1.WAITING_AFFECTATION;
    }

    if (newYoung?.department && young?.department && newYoung?.department !== young?.department) {
      await notifDepartmentChange(newYoung.department, SENDINBLUE_TEMPLATES.young.DEPARTMENT_IN, young, { previousDepartment: young.department });
      await notifDepartmentChange(young.department, SENDINBLUE_TEMPLATES.young.DEPARTMENT_OUT, young, { newDepartment: newYoung.department });
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
      else newYoung.qpv = undefined;
    }

    // Check quartier prioritaires.
    if (newYoung.cityCode) {
      const populationDensity = await getDensity(newYoung.cityCode);
      newYoung.populationDensity = populationDensity;
    }

    // when changing statusPhase2, we check applications and equivalence
    if (newYoung.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED) {
      const applications = await ApplicationModel.find({ youngId: young._id });
      const pendingApplication = applications.filter((a) => [APPLICATION_STATUS.WAITING_VALIDATION, APPLICATION_STATUS.WAITING_VERIFICATION].includes(a.status));

      const equivalences = await MissionEquivalenceModel.find({ youngId: young._id });
      const pendingEquivalence = equivalences.filter((equivalence) => [EQUIVALENCE_STATUS.WAITING_CORRECTION, EQUIVALENCE_STATUS.WAITING_VERIFICATION].includes(equivalence.status));

      await cancelPendingApplications(pendingApplication, req.user);
      await cancelPendingEquivalence(pendingEquivalence, req.user);
      if (pendingEquivalence.length > 0) {
        newYoung.status_equivalence = EQUIVALENCE_STATUS.REFUSED;
      }
    }

    young.set(newYoung);
    await young.save({ fromUser: req.user });

    // if they had a cohesion center, we check if we need to update the places taken / left
    if (young.sessionPhase1Id) {
      const sessionPhase1 = await SessionPhase1.findById(young.sessionPhase1Id);
      if (sessionPhase1) await updatePlacesSessionPhase1(sessionPhase1, req.user);
    }

    if (young.ligneId) {
      const bus = await LigneDeBusModel.findById(young.ligneId);
      if (bus) await updateSeatsTakenInBusLine(bus);
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

    for (let key of MILITARY_FILE_KEYS) {
      young[key].forEach((file) => deleteFile(`app/young/${young._id}/military-preparation/${key}/${file}`));
      delete young.files[key];
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
    const { error, value } = Joi.object({
      source: Joi.string()
        .valid(...YOUNG_SOURCE_LIST)
        .required(),
      cohort: Joi.string().required(),
      // HTS
      message: Joi.alternatives().conditional("source", { is: YOUNG_SOURCE.VOLONTAIRE, then: Joi.string().required() }),
      cohortChangeReason: Joi.alternatives().conditional("source", { is: YOUNG_SOURCE.VOLONTAIRE, then: Joi.string().required() }),
      // CLE
      etablissementId: Joi.alternatives().conditional("source", { is: YOUNG_SOURCE.CLE, then: Joi.string().required() }),
      classeId: Joi.alternatives().conditional("source", { is: YOUNG_SOURCE.CLE, then: Joi.string().required() }),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { id } = req.params;
    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });
    const previousYoung = { ...young.toObject() };

    let classe = undefined;
    if (value.source === YOUNG_SOURCE.CLE) {
      const [etablissement, dbClasse] = await Promise.all([await EtablissementModel.findById(value.etablissementId), await ClasseModel.findById(value.classeId)]);
      if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.ETABLISSEMENT_NOT_FOUND });
      if (!dbClasse) return res.status(404).send({ ok: false, code: ERRORS.CLASSE_NOT_FOUND });
      classe = dbClasse;
    }

    let previousEtablissement = undefined;
    let previousClasse = undefined;
    if (young.source === YOUNG_SOURCE.CLE) {
      const [dbEtablissement, dbClasse] = await Promise.all([await EtablissementModel.findById(young.etablissementId), await ClasseModel.findById(young.classeId)]);
      if (!dbEtablissement) return res.status(404).send({ ok: false, code: ERRORS.ETABLISSEMENT_NOT_FOUND });
      if (!dbClasse) return res.status(404).send({ ok: false, code: ERRORS.CLASSE_NOT_FOUND });
      previousEtablissement = dbEtablissement;
      previousClasse = dbClasse;
    }

    if (!canChangeYoungCohort(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.YOUNG_NOT_EDITABLE });

    const { cohort, cohortChangeReason } = value;

    const sessions = req.user.role === ROLES.ADMIN ? await getAllSessions(young) : await getFilteredSessions(young, req.headers["x-user-timezone"] || null);
    if (cohort !== "à venir" && !sessions.some(({ name }) => name === cohort)) return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    const oldSessionPhase1Id = young.sessionPhase1Id;
    const oldBusId = young.ligneId;
    if (young.cohort !== cohort && (young.sessionPhase1Id || young.meetingPointId)) {
      young.set({
        cohesionCenterId: undefined,
        sessionPhase1Id: undefined,
        meetingPointId: undefined,
        ligneId: undefined,
        deplacementPhase1Autonomous: undefined,
        transportInfoGivenByLocal: undefined,
        cohesionStayPresence: undefined,
        presenceJDM: undefined,
        departInform: undefined,
        departSejourAt: undefined,
        departSejourMotif: undefined,
        departSejourMotifComment: undefined,
        youngPhase1Agreement: "false",
        hasMeetingInformation: undefined,
        cohesionStayMedicalFileReceived: undefined,
      });
    }

    young.set({
      status: getYoungStatus(young),
      statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
      cohort,
      originalCohort: previousYoung.cohort,
      cohortChangeReason: cohortChangeReason ?? young.cohortChangeReason,
      cohesionStayPresence: undefined,
      cohesionStayMedicalFileReceived: undefined,
    });
    if (value.source === YOUNG_SOURCE.CLE) {
      young.set({
        source: YOUNG_SOURCE.CLE,
        etablissementId: value.etablissementId,
        classeId: value.classeId,
        cniFiles: [],
        "files.cniFiles": [],
        latestCNIFileExpirationDate: undefined,
        latestCNIFileCategory: undefined,
        cohesionCenterId: classe.cohesionCenterId,
        sessionPhase1Id: classe.sessionId,
        meetingPointId: classe.pointDeRassemblementId,
      });
      if (young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION && classe.cohesionCenterId && classe.sessionId && classe.pointDeRassemblementId) {
        young.set({
          hasMeetingInformation: "true",
          statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
        });
      }
    } else {
      if (value.source === YOUNG_SOURCE.VOLONTAIRE) {
        if (young.source !== YOUNG_SOURCE.VOLONTAIRE) {
          young.set({
            status: getYoungStatus(young),
            statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
            cniFiles: [],
            "files.cniFiles": [],
            latestCNIFileExpirationDate: undefined,
            latestCNIFileCategory: undefined,
          });
        }
      }
      young.set({
        // Init if young was previously CLE
        source: YOUNG_SOURCE.VOLONTAIRE,
        etablissementId: undefined,
        classeId: undefined,
      });
    }

    const date = new Date();
    const newNote = {
      note: `
        Changement de cohorte de ${previousYoung.cohort} (${previousYoung.source || YOUNG_SOURCE.VOLONTAIRE}) à ${young.cohort} (${young.source})${
          cohortChangeReason && ` pour la raison suivante : ${cohortChangeReason}`
        }.\n${previousEtablissement ? `Etablissement précédent : ${previousEtablissement.name}.` : ""}\n${
          previousClasse ? `Classe précédente : ${previousClasse.uniqueKeyAndId} ${previousClasse.name}.` : ""
        }\n${previousYoung.cohesionCenterId ? `Centre précédent : ${previousYoung.cohesionCenterId}.` : ""}\n${
          previousYoung.sessionPhase1Id ? `Session précédente : ${previousYoung.sessionPhase1Id}.` : ""
        }\n${previousYoung.meetingPointId ? `Point de rendez-vous précédent : ${previousYoung.meetingPointId}.` : ""}\n${
          Object.prototype.hasOwnProperty.call(previousYoung, "presenceJDM") ? `Présence JDM précédente : ${previousYoung.presenceJDM}.` : ""
        }
        `.trim(),
      phase: "PHASE_1",
      createdAt: date,
      updatedAt: date,
      referent: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
      },
    };
    young.set({ notes: [...(young.notes ?? []), newNote], hasNotes: "true" });

    await young.save({ fromUser: req.user });
    if (previousClasse) await StateManager.Classe.compute(previousClasse._id, req.user, { YoungModel });
    if (classe) await StateManager.Classe.compute(classe._id, req.user, { YoungModel });

    // if they had a session, we check if we need to update the places taken / left
    if (oldSessionPhase1Id) {
      const sessionPhase1 = await SessionPhase1.findById(oldSessionPhase1Id);
      if (sessionPhase1) await updatePlacesSessionPhase1(sessionPhase1, req.user);
    }

    // if they had a meetingPoint, we check if we need to update the places taken / left in the bus
    if (oldBusId) {
      const bus = await LigneDeBusModel.findById(oldBusId);
      if (bus) await updateSeatsTakenInBusLine(bus);
    }

    emailsEmitter.emit(SENDINBLUE_TEMPLATES.young.CHANGE_COHORT, {
      young,
      previousYoung,
      cohortName: cohort,
      cohortChangeReason,
      message: value.message,
      classe,
    });

    res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

const getYoungStatus = (young) => {
  switch (young.status) {
    case YOUNG_STATUS.IN_PROGRESS:
      return YOUNG_STATUS.IN_PROGRESS;
    case YOUNG_STATUS.WAITING_VALIDATION:
      return YOUNG_STATUS.WAITING_VALIDATION;
    case YOUNG_STATUS.WAITING_CORRECTION:
      return YOUNG_STATUS.WAITING_VALIDATION;
    default:
      return YOUNG_STATUS.WAITING_VALIDATION;
  }
};

router.post("/:tutorId/email/:template", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      tutorId: Joi.string().required(),
      template: Joi.string().required(),
      subject: Joi.string().allow(null, ""),
      message: Joi.string().allow(null, ""),
      app: Joi.object({
        missionName: Joi.string().allow(null, ""),
        youngFirstName: Joi.string().allow(null, ""),
        youngLastName: Joi.string().allow(null, ""),
      }).allow(null, {}),
      missionName: Joi.string().allow(null, ""),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

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
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { youngId, key, fileName } = value;

    const young = await YoungModel.findById(youngId);

    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    switch (req.user.role) {
      case ROLES.HEAD_CENTER: {
        const sessionPhase1 = await SessionPhase1.findById(young.sessionPhase1Id);
        if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        const center = await CohesionCenterModel.findById(sessionPhase1.cohesionCenterId);
        if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        if (sessionPhase1.headCenterId !== req.user.id) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
        break;
      }
      case ROLES.SUPERVISOR:
      case ROLES.RESPONSIBLE: {
        if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        const structures = await StructureModel.find({ $or: [{ networkId: String(req.user.structureId) }, { _id: String(req.user.structureId) }] });
        if (!structures) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        if (!structures.reduce((acc, curr) => acc || canViewYoungFile(req.user, young, curr), false))
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

        // ? Use better check link between structure and young ! + Check for tutorId as well ?
        // const test = await new Promise().any(
        //   structures.eachAsync(async (structure) => {
        //     // console.log("🚀 ~ file: referent.js ~ line 570 ~ test ~ structure", structure);
        //     const applications = await ApplicationModel.find({ structureId: structure._id.toString(), youngId: youngId });
        //     return applications.length > 0 ? true : false;
        //   }),
        // );
        // if (!test) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        break;
      }
      case ROLES.ADMIN:
      case ROLES.REFERENT_DEPARTMENT:
      case ROLES.REFERENT_REGION: {
        if (!canViewYoungFile(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
        break;
      }
      default:
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const downloaded = await getFile(`app/young/${youngId}/${key}/${fileName}`);
    const decryptedBuffer = decrypt(downloaded.Body);

    let mimeFromFile = null;
    try {
      const { mime } = await FileType.fromBuffer(decryptedBuffer);
      mimeFromFile = mime;
    } catch (e) {
      capture(e);
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
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
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
      capture(e);
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

router.post(
  "/file/:key",
  passport.authenticate("referent", { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req, res) => {
    try {
      const militaryKeys = ["militaryPreparationFilesIdentity", "militaryPreparationFilesCensus", "militaryPreparationFilesAuthorization", "militaryPreparationFilesCertificate"];
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

        const scanResult = await scanFile(tempFilePath, name, req.user);
        if (scanResult.infected) {
          return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
        }

        const data = fs.readFileSync(tempFilePath);
        const encryptedBuffer = encrypt(data);
        const resultingFile = { mimetype: mimeFromMagicNumbers, encoding: "7bit", data: encryptedBuffer };
        if (militaryKeys.includes(key)) {
          await uploadFile(`app/young/${young._id}/military-preparation/${key}/${name}`, resultingFile);
        } else {
          await uploadFile(`app/young/${young._id}/${key}/${name}`, resultingFile);
        }
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
  },
);

//todo: refactor: in young controller (if referent, add the applications)
router.get("/young/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (!canViewYoung(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await YoungModel.findById(value);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const applicationsFromDb = await ApplicationModel.find({ youngId: data._id });
    let applications = [];
    for (let application of applicationsFromDb) {
      const structure = await StructureModel.findById(application.structureId);
      applications.push({ ...application._doc, structure: structure ? serializeStructure(structure, req.user) : null });
    }

    let etablissement = undefined;
    let classe = undefined;

    if (data.source === YOUNG_SOURCE.CLE) {
      etablissement = await EtablissementModel.findById(data.etablissementId);
      classe = await ClasseModel.findById(data.classeId);
      //Can throw 404 because when preinsciption for young CLE is finished, we already this information
      if (!etablissement || !classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    return res.status(200).send({ ok: true, data: { ...data._doc, applications, etablissement, classe } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/patches", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => await patches.get(req, res, ReferentModel));

async function populateReferent(ref) {
  if (ref.subRole === SUB_ROLES.referent_etablissement) {
    const etablissement = await EtablissementModel.findOne({ referentEtablissementIds: ref._id }).lean();
    if (!etablissement) throw new Error(ERRORS.NOT_FOUND);
    // Do not return res.status(404).send() in a helper function, only at the root of the route handler.
    ref.etablissement = etablissement;
  }

  if (ref.subRole === SUB_ROLES.coordinateur_cle) {
    const etablissement = await EtablissementModel.findOne({ coordinateurIds: ref._id }).lean();
    if (!etablissement) throw new Error(ERRORS.NOT_FOUND);
    ref.etablissement = etablissement;

    const classes = await ClasseModel.find({ referentClasseIds: ref._id }).lean();
    ref.classe = classes;
  }

  if (ref.role === ROLES.REFERENT_CLASSE) {
    const classes = await ClasseModel.find({ referentClasseIds: ref._id }).lean();
    if (!classes) throw new Error(ERRORS.NOT_FOUND);
    ref.classe = classes;

    const etablissement = await EtablissementModel.findById(classes[0].etablissementId).lean();
    if (!etablissement) throw new Error(ERRORS.NOT_FOUND);
    ref.etablissement = etablissement;
  }
}

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    let referent = await ReferentModel.findById(checkedId);
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!canViewReferent(req.user, referent)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    referent = serializeReferent(referent, req.user);

    await populateReferent(referent);

    return res.status(200).send({ ok: true, data: referent });
  } catch (error) {
    capture(error);
    if (error === ERRORS.NOT_FOUND) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const { error, value } = Joi.string().required().email().validate(req.query.email);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
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

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

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
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const referent = await ReferentModel.findById(req.params.id);
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const structure = await StructureModel.findById(value.structureId);

    if (!canUpdateReferent({ actor: req.user, originalTarget: referent, modifiedTarget: value, structure })) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    referent.set(value);
    referent.set(cleanReferentData(referent));

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
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const user = await ReferentModel.findById(req.user._id);
    if (!user) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateMyself({ actor: user, modifiedTarget: req.user })) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    user.set(value);
    user.set(cleanReferentData(user));
    await user.save({ fromUser: req.user });
    await updateTutorNameInMissionsAndApplications(user, req.user);
    res.status(200).send({ ok: true, data: user });
  } catch (error) {
    capture(error);
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.EMAIL_ALREADY_USED });
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
    if (!canModifyStructure(req.user, structure) || !canUpdateReferent({ actor: req.user, originalTarget: referent, structure })) {
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
    const structure = await StructureModel.findById(referent.structureId);

    if (!canDeleteReferent({ actor: req.user, originalTarget: referent, structure })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const referents = await ReferentModel.find({ structureId: referent.structureId });
    const missionsLinkedToReferent = await MissionModel.find({ tutorId: referent._id }).countDocuments();
    if (referents.length === 1) return res.status(409).send({ ok: false, code: ERRORS.LINKED_STRUCTURE });
    if (missionsLinkedToReferent) return res.status(409).send({ ok: false, code: ERRORS.LINKED_MISSIONS });

    const classes = await ClasseModel.find({ referentClasseIds: { $in: [referent._id] } });
    if (classes.length > 0) return res.status(409).send({ ok: false, code: ERRORS.LINKED_CLASSES });

    if (referent.subRole === SUB_ROLES.referent_etablissement && referent.role === ROLES.ADMINISTRATEUR_CLE) {
      const etablissement = await EtablissementModel.findOne({ referentEtablissementIds: { $in: [referent._id] } });
      if (etablissement) return res.status(409).send({ ok: false, code: ERRORS.LINKED_ETABLISSEMENT });
    }

    if (referent.subRole === SUB_ROLES.coordinateur_cle && referent.role === ROLES.ADMINISTRATEUR_CLE) {
      const etablissement = await EtablissementModel.findOne({ coordinateurIds: { $in: [referent._id] } });
      if (etablissement) {
        const coordinateur = etablissement.coordinateurIds.filter((c) => c.toString() !== referent._id.toString());
        etablissement.set({ coordinateurIds: coordinateur });
        await etablissement.save({ fromUser: req.user });
      }
    }

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
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const JoiQueryWithCohesionCenter = Joi.string().validate(req.query.with_cohesion_center);
    if (JoiQueryWithCohesionCenter.error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canSearchSessionPhase1(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    let sessions = await SessionPhase1.find({ headCenterId: checkedId });
    const cohesionCenters = await CohesionCenterModel.find({ _id: { $in: sessions.map((s) => s.cohesionCenterId.toString()) } });
    if (JoiQueryWithCohesionCenter.value === "true") {
      sessions = sessions.map((s) => {
        s._doc.cohesionCenter = cohesionCenters.find((c) => c._id.toString() === s.cohesionCenterId.toString());
        return s;
      });
    }
    return res.status(200).send({ ok: true, data: sessions.map(serializeSessionPhase1) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/young/:id/phase1Status/:document", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const keys = ["cohesionStayMedical", "imageRight", "rules"];
    const { error: documentError, value: document } = Joi.string()
      .required()
      .valid(...keys)
      .validate(req.params.document);
    if (documentError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungModel.findById(req.params.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    let value;
    if (["imageRight"].includes(document)) {
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

    const session = await SessionPhase1.findById(young.sessionPhase1Id);

    if (!canCreateOrUpdateSessionPhase1(req.user, session)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    young.set(value);
    await young.save({ fromUser: req.user });

    if (["imageRight", "rules"].includes(document)) {
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

router.put("/young/:id/removeMilitaryFile/:key", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const militaryKeys = ["militaryPreparationFilesIdentity", "militaryPreparationFilesCensus", "militaryPreparationFilesAuthorization", "militaryPreparationFilesCertificate"];
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      key: Joi.string()
        .required()
        .valid(...militaryKeys),
      filesList: Joi.array().items(Joi.string()),
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canViewYoungFile(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set({ [value.key]: value.filesList });
    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/exist", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ email: Joi.string().email() }).validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const where = {};
    if (value.email) where.email = value.email;
    if (!canCheckIfRefExist(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const referent = await ReferentModel.findOne(where);
    if (referent) return res.status(200).send({ ok: true, data: true });
    else return res.status(200).send({ ok: true, data: false });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
