const express = require("express");
const passport = require("passport");
const fetch = require("node-fetch");
const queryString = require("querystring");
const crypto = require("crypto");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mime = require("mime-types");
const fs = require("fs");
const FileType = require("file-type");
const fileUpload = require("express-fileupload");
const redis = require("redis");
const { decrypt, encrypt } = require("../../cryptoUtils");
const config = require("../../config");
const { capture } = require("../../sentry");
const YoungObject = require("../../models/young");
const ReferentModel = require("../../models/referent");
const SessionPhase1 = require("../../models/sessionPhase1");
const ApplicationModel = require("../../models/application");
const MissionModel = require("../../models/mission");
const AuthObject = require("../../auth");
const LigneDeBusModel = require("../../models/PlanDeTransport/ligneBus");
const ClasseModel = require("../../models/cle/classe");
const YoungAuth = new AuthObject(YoungObject);
const {
  uploadFile,
  validatePassword,
  ERRORS,
  inSevenDays,
  isYoung,
  isReferent,
  updatePlacesSessionPhase1,
  translateFileStatusPhase1,
  getCcOfYoung,
  getFile,
  autoValidationSessionPhase1Young,
  deleteFile,
  updateSeatsTakenInBusLine,
} = require("../../utils");
const { sendTemplate, unsync } = require("../../sendinblue");
const { cookieOptions, COOKIE_SIGNIN_MAX_AGE_MS } = require("../../cookie-options");
const { validateYoung, validateId, validatePhase1Document } = require("../../utils/validator");
const patches = require("../patches");
const { serializeYoung, serializeApplication } = require("../../utils/serializer");
const {
  canDeleteYoung,
  canGetYoungByEmail,
  canInviteYoung,
  canEditYoung,
  canSendTemplateToYoung,
  canViewYoungApplications,
  canEditPresenceYoung,
  canDeletePatchesHistory,
  SENDINBLUE_TEMPLATES,
  YOUNG_STATUS_PHASE1,
  YOUNG_STATUS,
  ROLES,
  YOUNG_STATUS_PHASE2,
  YOUNG_SOURCE,
  youngCanChangeSession,
  youngCanDeleteAccount,
  REGLEMENT_INTERIEUR_VERSION,
} = require("snu-lib");
const { APP_URL } = require("../../config");
const { getFilteredSessions } = require("../../utils/cohort");
const { anonymizeApplicationsFromYoungId } = require("../../services/application");
const { anonymizeContractsFromYoungId } = require("../../services/contract");
const { getFillingRate, FILLING_RATE_LIMIT } = require("../../services/inscription-goal");
const { JWT_SIGNIN_VERSION, JWT_SIGNIN_MAX_AGE_SEC } = require("../../jwt-options");
const scanFile = require("../../utils/virusScanner");
const emailsEmitter = require("../../emails");

router.post("/signup", (req, res) => YoungAuth.signUp(req, res));
router.post("/signup/email", passport.authenticate("young", { session: false, failWithError: true }), (req, res) => YoungAuth.changeEmailDuringSignUp(req, res));
router.post("/signin", (req, res) => YoungAuth.signin(req, res));
router.post("/signin-2fa", (req, res) => YoungAuth.signin2FA(req, res));
router.post("/email", passport.authenticate("young", { session: false, failWithError: true }), (req, res) => YoungAuth.requestEmailUpdate(req, res));
router.post("/email-validation/new-email", passport.authenticate("young", { session: false, failWithError: true }), (req, res) => YoungAuth.validateEmailUpdate(req, res));
router.post("/email-validation", passport.authenticate("young", { session: false, failWithError: true }), (req, res) => YoungAuth.validateEmail(req, res));
router.get("/email-validation/token", passport.authenticate("young", { session: false, failWithError: true }), (req, res) => YoungAuth.requestNewEmailValidationToken(req, res));
router.post("/logout", passport.authenticate("young", { session: false, failWithError: true }), (req, res) => YoungAuth.logout(req, res));
router.get("/signin_token", passport.authenticate("young", { session: false, failWithError: true }), (req, res) => YoungAuth.signinToken(req, res));
router.post("/forgot_password", async (req, res) => YoungAuth.forgotPassword(req, res, `${config.APP_URL}/auth/reset`));
router.post("/forgot_password_reset", async (req, res) => YoungAuth.forgotPasswordReset(req, res));
router.post("/reset_password", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => YoungAuth.resetPassword(req, res));
router.post("/check_password", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => YoungAuth.checkPassword(req, res));

router.post("/signup_verify", async (req, res) => {
  try {
    const { error, value } = Joi.object({ invitationToken: Joi.string().required() }).unknown().validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findOne({ invitationToken: value.invitationToken, invitationExpires: { $gt: Date.now() } });
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.INVITATION_TOKEN_EXPIRED_OR_INVALID });
    const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: young._id, passwordChangedAt: null, lastLogoutAt: null }, config.secret, { expiresIn: JWT_SIGNIN_MAX_AGE_SEC });
    return res.status(200).send({ ok: true, token, data: serializeYoung(young, young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/signup_invite", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      invitationToken: Joi.string().required(),
      email: Joi.string().lowercase().trim().email().required(),
      password: Joi.string().required(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { email, password, invitationToken } = value;
    const young = await YoungObject.findOne({ email, invitationToken, invitationExpires: { $gt: Date.now() } });
    if (!young) return res.status(404).send({ ok: false, data: null, code: ERRORS.USER_NOT_FOUND });

    if (young.registredAt) return res.status(400).send({ ok: false, data: null, code: ERRORS.YOUNG_ALREADY_REGISTERED });

    if (!validatePassword(password)) return res.status(400).send({ ok: false, prescriber: null, code: ERRORS.PASSWORD_NOT_VALIDATED });

    young.set({ password });
    young.set({ registredAt: Date.now() });
    young.set({ lastLoginAt: Date.now(), lastActivityAt: Date.now() });
    young.set({ invitationToken: "" });
    young.set({ invitationExpires: null });

    const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: young._id, passwordChangedAt: null, lastLogoutAt: null }, config.secret, { expiresIn: JWT_SIGNIN_MAX_AGE_SEC });
    res.cookie("jwt_young", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));

    await young.save({ fromUser: req.user });

    return res.status(200).send({ data: serializeYoung(young, young), token, ok: true });
  } catch (error) {
    capture(error);
    return res.sendStatus(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post(
  "/file/:key",
  passport.authenticate("young", { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req, res) => {
    try {
      const rootKeys = [
        "cniFiles",
        "highSkilledActivityProofFiles",
        "parentConsentmentFiles",
        "imageRightFiles",
        "dataProcessingConsentmentFiles",
        "rulesFiles",
        "equivalenceFiles",
      ];
      const militaryKeys = ["militaryPreparationFilesIdentity", "militaryPreparationFilesCensus", "militaryPreparationFilesAuthorization", "militaryPreparationFilesCertificate"];
      const { error: keyError, value: key } = Joi.string()
        .required()
        .valid(...[...rootKeys, ...militaryKeys])
        .validate(req.params.key, { stripUnknown: true });
      if (keyError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const { error: bodyError, value: body } = Joi.string().required().validate(req.body.body);
      if (bodyError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      if (key !== "equivalenceFiles") throw "Route deprecated.";

      const {
        error: namesError,
        value: { names },
      } = Joi.object({ names: Joi.array().items(Joi.string()).required() }).validate(JSON.parse(body), { stripUnknown: true });
      if (namesError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

      const user = await YoungObject.findById(req.user._id);
      if (!user) return res.status(404).send({ ok: false, code: ERRORS.USER_NOT_FOUND });

      const files = Object.keys(req.files || {}).map((e) => req.files[e]);
      for (let i = 0; i < files.length; i++) {
        let currentFile = files[i];
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

        const scanResult = await scanFile(tempFilePath, name, req.user._id);
        if (scanResult.infected) {
          return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
        }

        const data = fs.readFileSync(tempFilePath);
        const encryptedBuffer = encrypt(data);
        const resultingFile = { mimetype: mimeFromMagicNumbers, encoding: "7bit", data: encryptedBuffer };
        if (militaryKeys.includes(key)) {
          await uploadFile(`app/young/${user._id}/military-preparation/${key}/${name}`, resultingFile);
        } else {
          await uploadFile(`app/young/${user._id}/${key}/${name}`, resultingFile);
        }
        fs.unlinkSync(tempFilePath);
      }
      user.set({ [key]: names });
      await user.save({ fromUser: req.user });

      return res.status(200).send({ young: serializeYoung(user, user), data: names, ok: true });
    } catch (error) {
      capture(error);
      if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: ERRORS.FILE_CORRUPTED });
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.post("/invite", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateYoung(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canInviteYoung(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    const obj = { ...value };

    obj.acceptRI = REGLEMENT_INTERIEUR_VERSION;

    const formatedDate = new Date(obj.birthdateAt).setUTCHours(11, 0, 0);
    obj.birthdateAt = formatedDate;

    const invitation_token = crypto.randomBytes(20).toString("hex");
    obj.invitationToken = invitation_token;
    obj.invitationExpires = inSevenDays(); // 7 days

    obj.country = "France";

    obj.parent1ContactPreference = "email";
    obj.parent2ContactPreference = "email";

    obj.parent1Inscription2023Token = crypto.randomBytes(20).toString("hex");
    if (obj.parent2Email) obj.parent2Inscription2023Token = crypto.randomBytes(20).toString("hex");
    obj.inscriptionDoneDate = new Date();
    if (obj.classeId) {
      obj.source = YOUNG_SOURCE.CLE;
      const classe = await ClasseModel.findById(obj.classeId);
      if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      obj.etablissementId = classe.etablissementId;
    }
    const young = await YoungObject.create({ ...obj, fromUser: req.user });

    const toName = `${young.firstName} ${young.lastName}`;
    const cta = `${config.APP_URL}/auth/signup/invite?token=${invitation_token}&utm_campaign=transactionnel+compte+cree&utm_source=notifauto&utm_medium=mail+166+activer`;
    const fromName = `${req.user.firstName} ${req.user.lastName}`;
    await sendTemplate(SENDINBLUE_TEMPLATES.INVITATION_YOUNG, {
      emailTo: [{ name: toName, email: young.email }],
      params: { toName, cta, fromName },
    });

    return res.status(200).send({ young, ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/validate_phase3/:young/:token", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      young: Joi.string().required(),
      token: Joi.string().required(),
    })
      .unknown()
      .validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const data = await YoungObject.findOne({ _id: value.young, phase3Token: value.token });
    if (!data) {
      capture(`Young not found ${req.params.young}`);
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    return res.status(200).send({ ok: true, data: serializeYoung(data, data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/validate_phase3/:young/:token", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      young: Joi.string().required(),
      token: Joi.string().required(),
      phase3TutorNote: Joi.string().optional(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const data = await YoungObject.findOne({ _id: value.young, phase3Token: value.token });

    if (!data) {
      capture(`Young not found ${value.young}`);
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    data.set({ statusPhase3: "VALIDATED", statusPhase3UpdatedAt: Date.now(), statusPhase3ValidatedAt: Date.now(), phase3TutorNote: value.phase3TutorNote });
    await data.save({ fromUser: req.user });

    let template = SENDINBLUE_TEMPLATES.young.VALIDATE_PHASE3;
    let cc = getCcOfYoung({ template, young: data });
    await sendTemplate(template, {
      emailTo: [{ name: `${data.firstName} ${data.lastName}`, email: data.email }],
      params: { cta: `${config.APP_URL}/phase3?utm_campaign=transactionnel+phase3+terminee&utm_source=notifauto&utm_medium=mail+200+telecharger` },
      cc,
    });

    return res.status(200).send({ ok: true, data: serializeYoung(data, data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/update_phase3/:young", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      young: Joi.string().required(),
      phase3StructureName: Joi.string().required(),
      phase3MissionDescription: Joi.string().required(),
      phase3TutorFirstName: Joi.string().required(),
      phase3TutorLastName: Joi.string().required(),
      phase3TutorEmail: Joi.string().lowercase().trim().email().required(),
      phase3TutorPhone: Joi.string().required(),
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const data = await YoungObject.findOne({ _id: value.young });

    if (!canEditYoung(req.user, data)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    if (!data) {
      capture(`Young not found ${value.young}`);
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    delete value.young;
    data.set({ ...value, statusPhase3UpdatedAt: Date.now() });
    await data.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(data, data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/patches", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => await patches.get(req, res, YoungObject));

router.put("/:id/validate-mission-phase3", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      phase3StructureName: Joi.string().optional().allow(null, ""),
      phase3MissionDomain: Joi.string().optional().allow(null, ""),
      phase3MissionDescription: Joi.string().optional().allow(null, ""),
      phase3MissionStartAt: Joi.string().optional().allow(null, ""),
      phase3MissionEndAt: Joi.string().optional().allow(null, ""),
      phase3TutorFirstName: Joi.string().optional().allow(null, ""),
      phase3TutorLastName: Joi.string().optional().allow(null, ""),
      phase3TutorEmail: Joi.string().optional().allow(null, ""),
      phase3TutorPhone: Joi.string().optional().allow(null, ""),
      statusPhase3: Joi.string().optional().allow(null, ""),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // young can only update their own mission phase3.
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    // eslint-disable-next-line no-unused-vars
    const { id, ...values } = value;
    values.phase3Token = crypto.randomBytes(20).toString("hex");

    young.set({ ...values, statusPhase3UpdatedAt: Date.now() });
    await young.save({ fromUser: req.user });

    const youngName = `${young.firstName} ${young.lastName}`;
    const toName = `${young.phase3TutorFirstName} ${young.phase3TutorLastName}`;
    const structureName = young.phase3StructureName;
    const startAt = young.phase3MissionStartAt.toLocaleDateString("fr");
    const endAt = young.phase3MissionEndAt.toLocaleDateString("fr");
    const cta = `${config.ADMIN_URL}/validate?token=${young.phase3Token}&young_id=${young._id}`;

    await sendTemplate(SENDINBLUE_TEMPLATES.referent.VALIDATE_MISSION_PHASE3, {
      emailTo: [{ name: toName, email: young.phase3TutorEmail }],
      params: { toName, youngName, structureName, startAt, endAt, cta },
    });
    young.phase3Token = null;

    res.status(200).send({ ok: true, data: serializeYoung(young, young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/accept-cgu", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set({ acceptCGU: "true" });
    await young.save({ fromUser: req.user });

    res.status(200).send({ ok: true, data: serializeYoung(young, young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/accept-ri", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set({ acceptRI: REGLEMENT_INTERIEUR_VERSION });
    await young.save({ fromUser: req.user });

    await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT1_REVALIDATE_RI, {
      emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
      params: {
        cta: `${APP_URL}/representants-legaux/ri-consentement?token=${young.parent1Inscription2023Token}`,
        youngFirstName: young.firstName,
        youngName: young.lastName,
      },
    });

    res.status(200).send({ ok: true, data: serializeYoung(young, young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/change-cohort", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateYoung(req.body);

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { error: idError, value: id } = validateId(req.params.id);
    if (idError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungObject.findById(id);

    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });
    if (!youngCanChangeSession(young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    const { cohort, cohortChangeReason, cohortDetailedChangeReason } = value;
    const previousYoung = { ...young.toObject() };

    const oldSessionPhase1Id = young.sessionPhase1Id;
    const oldBusId = young.ligneId;
    const oldCohort = young.cohort;
    if (young.cohort !== cohort && (young.sessionPhase1Id || young.meetingPointId || young.ligneId)) {
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
        statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
      });
    }

    // si le volontaire change pour la première fois de cohorte, on stocke sa cohorte d'origine
    if (!young.originalCohort) {
      young.set({ originalCohort: young.cohort });
    }

    const sessions = await getFilteredSessions(young, req.headers["x-user-timezone"] || null);
    const session = sessions.find(({ name }) => name === cohort);
    if (!session && cohort !== "à venir") return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    young.set({ cohort, cohortChangeReason, cohortDetailedChangeReason, cohesionStayPresence: undefined, cohesionStayMedicalFileReceived: undefined });

    if (cohort !== "à venir") {
      const fillingRate = await getFillingRate(young.department, cohort);

      if (fillingRate >= FILLING_RATE_LIMIT && young.status === YOUNG_STATUS.VALIDATED) {
        young.set({ status: YOUNG_STATUS.WAITING_LIST });
      }

      if (fillingRate < FILLING_RATE_LIMIT && young.status === YOUNG_STATUS.WAITING_LIST) {
        young.set({ status: YOUNG_STATUS.VALIDATED });
      }
    }

    await young.save({ fromUser: req.user });

    // if they had a session, we check if we need to update the places taken / left
    if (oldSessionPhase1Id) {
      const sessionPhase1 = await SessionPhase1.findById(oldSessionPhase1Id);
      if (sessionPhase1) await updatePlacesSessionPhase1(sessionPhase1, req.user);
    }

    // if they had a bus, we check if we need to update the places taken / left in the bus
    if (oldBusId) {
      const bus = await LigneDeBusModel.findById(oldBusId);
      if (bus) await updateSeatsTakenInBusLine(bus);
    }

    const referents = await ReferentModel.find({ role: ROLES.REFERENT_DEPARTMENT, department: young.department });
    for (let referent of referents) {
      await sendTemplate(SENDINBLUE_TEMPLATES.referent.YOUNG_CHANGE_COHORT, {
        emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
        params: {
          motif: cohortChangeReason,
          oldCohort,
          cohort,
          youngFirstName: young?.firstName,
          youngLastName: young?.lastName,
        },
      });
    }
    const emailsTo = [];
    if (young.parent1AllowSNU === "true") emailsTo.push({ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email });
    if (young?.parent2AllowSNU === "true") emailsTo.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email });
    if (emailsTo.length !== 0) {
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT_YOUNG_COHORT_CHANGE, {
        emailTo: emailsTo,
        params: {
          cohort,
          youngFirstName: young.firstName,
          youngName: young.lastName,
          cta: `${config.APP_URL}/change-cohort`,
        },
      });
    }

    emailsEmitter.emit(SENDINBLUE_TEMPLATES.young.CHANGE_COHORT, {
      young,
      previousYoung,
      cohortName: cohort,
      cohortChangeReason,
      message: value.message,
    });

    res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:id/email/:template", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      template: Joi.string().required(),
      message: Joi.string().allow(null, ""),
      prevStatus: Joi.string().allow(null, ""),
      missionName: Joi.string().allow(null, ""),
      structureName: Joi.string().allow(null, ""),
      cta: Joi.string().allow(null, ""),
      type_document: Joi.string().allow(null, ""),
      object: Joi.string().allow(null, ""),
      link: Joi.string().allow(null, ""),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    // eslint-disable-next-line no-unused-vars
    const { id, template, message, prevStatus, missionName, structureName, cta, type_document, object, link } = value;

    // The template must exist.
    if (!Object.values(SENDINBLUE_TEMPLATES.young).includes(template) && !Object.values(SENDINBLUE_TEMPLATES.parent).includes(template)) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    // The young must exist.
    const young = await YoungObject.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // If actor is a young it must be the same as the young.
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    // If actor is a referent it must be allowed to send template.
    if (isReferent(req.user) && !canSendTemplateToYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    let buttonCta = cta || config.APP_URL;
    if (template === SENDINBLUE_TEMPLATES.young.MILITARY_PREPARATION_DOCS_CORRECTION) buttonCta = `${config.APP_URL}/ma-preparation-militaire`;
    if (template === SENDINBLUE_TEMPLATES.young.INSCRIPTION_STARTED)
      buttonCta = `${config.APP_URL}/inscription/coordonnees?utm_campaign=transactionnel+compte+cree&utm_source=notifauto&utm_medium=mail+219+acceder`;
    if (template === SENDINBLUE_TEMPLATES.young.MISSION_PROPOSITION)
      buttonCta = `${config.APP_URL}?utm_campaign=transactionnel+nouvelles+mig+proposees&utm_source=notifauto&utm_medium=mail+170+acceder`;
    if (template === SENDINBLUE_TEMPLATES.young.INSCRIPTION_REACTIVATED)
      buttonCta = `${config.APP_URL}?utm_campaign=transactionnel+compte+reactive&utm_source=notifauto&utm_medium=mail+168+seconnecter`;
    if (template === SENDINBLUE_TEMPLATES.young.INSCRIPTION_VALIDATED)
      buttonCta = `${config.APP_URL}?utm_campaign=transactionnel+inscription+validee&utm_source=notifauto&utm_medium=mail+167+seconnecter`;
    if (buttonCta === SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_CORRECTION)
      buttonCta = `${config.APP_URL}?utm_campaign=transactionnel+dossier+attente+correction&utm_source=notifauto&utm_medium=mail+169+corriger`;

    if (Object.values(SENDINBLUE_TEMPLATES.young).includes(template)) {
      let cc = getCcOfYoung({ template, young });
      await sendTemplate(template, {
        emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
        params: { firstName: young.firstName, lastName: young.lastName, cta: buttonCta, message, missionName, structureName, type_document, object, link },
        cc,
      });
    }

    if (Object.values(SENDINBLUE_TEMPLATES.parent).includes(template)) {
      await sendTemplate(template, {
        emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
        params: { youngFirstName: young.firstName, youngLastName: young.lastName, cta: buttonCta, message, missionName, structureName, type_document, object, link },
      });
    }

    return res.status(200).send({ ok: true });
  } catch (error) {
    console.log(error);
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/application", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (isYoung(req.user) && req.user._id.toString() !== id) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const young = await YoungObject.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (isReferent(req.user) && !canViewYoungApplications(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    let data = await ApplicationModel.find({ youngId: id });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    for (let i = 0; i < data.length; i++) {
      const application = data[i];
      const mission = await MissionModel.findById(application.missionId);
      let tutor = {};
      if (mission?.tutorId) tutor = await ReferentModel.findById(mission.tutorId);
      if (mission?.tutorId && !application.tutorId) application.tutorId = mission.tutorId;
      if (mission?.structureId && !application.structureId) application.structureId = mission.structureId;
      data[i] = { ...serializeApplication(application), mission, tutor };
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Get authorization from France Connect.
router.post("/france-connect/authorization-url", async (req, res) => {
  try {
    const { error, value } = Joi.object({ callback: Joi.string().required() }).unknown().validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const query = {
      scope: `openid given_name family_name email`,
      redirect_uri: `${config.APP_URL}/${value.callback}`,
      response_type: "code",
      client_id: process.env.FRANCE_CONNECT_CLIENT_ID,
      state: crypto.randomBytes(20).toString("hex"),
      nonce: crypto.randomBytes(20).toString("hex"),
      acr_values: "eidas1",
    };
    const redisClient = redis.createClient({
      url: config.REDIS_URL,
      pingInterval: 60_000,
    });
    await redisClient.connect();

    await redisClient.setEx(`franceConnectNonce:${query.nonce}`, 1800, query.nonce);
    await redisClient.setEx(`franceConnectState:${query.state}`, 1800, query.state);

    await redisClient.disconnect();

    const url = `${process.env.FRANCE_CONNECT_URL}/authorize?${queryString.stringify(query)}`;
    return res.status(200).send({ ok: true, data: { url } });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Get user information for authorized user on France Connect.
router.post("/france-connect/user-info", async (req, res) => {
  try {
    const { error, value } = Joi.object({ code: Joi.string().required(), callback: Joi.string().required(), state: Joi.string().required() })
      .unknown()
      .validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    // Get token…
    const body = {
      grant_type: "authorization_code",
      redirect_uri: `${config.APP_URL}/${value.callback}`,
      client_id: process.env.FRANCE_CONNECT_CLIENT_ID,
      client_secret: process.env.FRANCE_CONNECT_CLIENT_SECRET,
      code: value.code,
    };

    const tokenResponse = await fetch(`${process.env.FRANCE_CONNECT_URL}/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: queryString.stringify(body),
    });

    const token = await tokenResponse.json();
    const franceConnectToken = token["id_token"];

    const decodedToken = jwt.decode(franceConnectToken);

    let storedState;
    let storedNonce;

    const redisClient = redis.createClient({
      url: config.REDIS_URL,
      pingInterval: 60_000,
    });
    await redisClient.connect();

    storedState = await redisClient.get(`franceConnectState:${value.state}`);
    storedNonce = await redisClient.get(`franceConnectNonce:${decodedToken.nonce}`);

    await redisClient.disconnect();

    if (!token["access_token"] || !token["id_token"] || !storedNonce || !storedState) {
      capture(`France Connect User Information failed: ${JSON.stringify({ storedNonce, storedState, token })}`);
      return res.sendStatus(403, token);
    }

    // … then get user info.
    const userInfoResponse = await fetch(`${process.env.FRANCE_CONNECT_URL}/userinfo`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token["access_token"]}` },
    });

    const userInfo = await userInfoResponse.json();

    res.status(200).send({ ok: true, data: userInfo, tokenId: token["id_token"] });
  } catch (e) {
    capture(e);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Delete one user (only admin can delete user)
// And apparently referent in same geography as well (see canDeleteYoung())
router.put("/:id/soft-delete", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!canDeleteYoung(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const fieldToKeep = [
      "_id",
      "__v",
      "birthdateAt",
      "cohort",
      "gender",
      "situation",
      "grade",
      "qpv",
      "populationDensity",
      "handicap",
      "ppsBeneficiary",
      "paiBeneficiary",
      "highSkilledActivity",
      "statusPhase1",
      "statusPhase2",
      "phase2ApplicationStatus",
      "statusPhase3",
      "inscriptionStep2023",
      "inscriptionDoneDate",
      "reinscriptionStep2023",
      "department",
      "region",
      "zip",
      "city",
      "createdAt",
    ];

    for (const key in young.files) {
      if (key.length) {
        for (const file in key) {
          try {
            if (key.includes("military")) await deleteFile(`app/young/${id}/military-preparation/${key}/${file._id}`);
            else await deleteFile(`app/young/${id}/${key}/${file._id}`);
            young.set({ files: { [key]: undefined } });
          } catch (e) {
            capture(e);
          }
        }
      }
    }

    for (const key in young._doc) {
      if (!fieldToKeep.find((val) => val === key)) {
        young.set({ [key]: undefined });
      }
    }

    await unsync(young);

    young.set({ location: { lat: undefined, lon: undefined } });
    young.set({ schoolLocation: { lat: undefined, lon: undefined } });
    young.set({ parent1Location: { lat: undefined, lon: undefined } });
    young.set({ parent2Location: { lat: undefined, lon: undefined } });
    young.set({ medicosocialStructureLocation: { lat: undefined, lon: undefined } });
    young.set({ email: `${young._doc["_id"]}@delete.com` });
    young.set({ status: YOUNG_STATUS.DELETED });

    await young.save({ fromUser: req.user });
    if (!canDeletePatchesHistory(req.user, young)) return res.status(403).json({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    await patches.deletePatches({ id, model: YoungObject });

    await anonymizeApplicationsFromYoungId({ youngId: young._id, anonymizedYoung: young });
    await anonymizeContractsFromYoungId({ youngId: young._id, anonymizedYoung: young });

    console.log(`Young ${id} has been soft deleted`);
    res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/withdraw", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: validationError, value } = Joi.object({ withdrawnMessage: Joi.string().required(), withdrawnReason: Joi.string().required() })
      .unknown()
      .validate(req.body, { stripUnknown: true });
    if (validationError) {
      capture(validationError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!youngCanDeleteAccount(young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const mandatoryPhasesDone = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
    const inscriptionStatus = [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status);

    if (mandatoryPhasesDone || inscriptionStatus) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const { withdrawnMessage, withdrawnReason } = value;

    young.set({
      status: YOUNG_STATUS.WITHDRAWN,
      lastStatusAt: Date.now(),
      withdrawnMessage,
      withdrawnReason,
    });

    const updatedYoung = await young.save({ fromUser: req.user });
    if (young.sessionPhase1Id) {
      const sessionPhase1 = await SessionPhase1.findById(young.sessionPhase1Id);
      if (sessionPhase1) await updatePlacesSessionPhase1(sessionPhase1, req.user);
    }

    // if they had a bus, we check if we need to update the places taken / left in the bus
    if (young.ligneId) {
      const bus = await LigneDeBusModel.findById(young.ligneId);
      if (bus) await updateSeatsTakenInBusLine(bus);
    }

    res.status(200).send({ ok: true, data: serializeYoung(updatedYoung, updatedYoung) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/abandon", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: validationError, value } = Joi.object({ withdrawnMessage: Joi.string().required(), withdrawnReason: Joi.string().required() })
      .unknown()
      .validate(req.body, { stripUnknown: true });
    if (validationError) {
      capture(validationError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!youngCanDeleteAccount(young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const mandatoryPhasesDone = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
    const inscriptionStatus = [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status);

    if (mandatoryPhasesDone || !inscriptionStatus) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const { withdrawnMessage, withdrawnReason } = value;

    young.set({
      status: YOUNG_STATUS.ABANDONED,
      lastStatusAt: Date.now(),
      withdrawnMessage,
      withdrawnReason,
    });

    const updatedYoung = await young.save({ fromUser: req.user });

    res.status(200).send({ ok: true, data: serializeYoung(updatedYoung, updatedYoung) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.string().required().email().validate(req.query.email, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (!canGetYoungByEmail(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    let data = await YoungObject.findOne({ email: value });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/phase1/:document", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const keys = ["cohesionStayMedical", "imageRight", "rules", "agreement", "convocation"];
    const { error: documentError, value: document } = Joi.string()
      .required()
      .valid(...keys)
      .validate(req.params.document, { stripUnknown: true });
    if (documentError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const { error: bodyError, value } = validatePhase1Document(req.body, document);
    if (bodyError) return res.status(400).send({ ok: false, code: bodyError });

    if (["imageRight"].includes(document)) {
      value[`${document}FilesStatus`] = "WAITING_VERIFICATION";
      value[`${document}FilesComment`] = undefined;
    }

    young.set(value);
    await young.save({ fromUser: req.user });

    if (["imageRight", "rules"].includes(document)) {
      let template = SENDINBLUE_TEMPLATES.young.PHASE_1_PJ_WAITING_VERIFICATION;
      let cc = getCcOfYoung({ template, young });
      await sendTemplate(template, {
        emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
        params: { type_document: translateFileStatusPhase1(document) },
        cc,
      });
    }

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/phase1/multiaction/depart", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      departSejourMotif: Joi.string().required(),
      departSejourAt: Joi.string().required(),
      departSejourMotifComment: Joi.string().optional().allow(null, ""),
      ids: Joi.array().items(Joi.string().required()).required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    }

    const { departSejourMotif, departSejourAt, departSejourMotifComment, ids } = value;

    const youngs = await YoungObject.find({ _id: { $in: ids } });
    if (!youngs || youngs?.length === 0) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (youngs.some((young) => !canEditPresenceYoung(req.user, young))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    if (youngs.some((young) => young.sessionPhase1Id !== youngs[0].sessionPhase1Id)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const sessionPhase1 = await SessionPhase1.findById(youngs[0].sessionPhase1Id);

    for (let young of youngs) {
      young.set({ departSejourAt, departSejourMotif, departSejourMotifComment, departInform: "true" });
      await young.save({ fromUser: req.user });
      await autoValidationSessionPhase1Young({ young, sessionPhase1, user: req.user });
    }

    res.status(200).send({ ok: true, data: youngs.map(serializeYoung) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/phase1/multiaction/:key", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const allowedKeys = ["cohesionStayPresence", "presenceJDM", "cohesionStayMedicalFileReceived"];
    const { error, value } = Joi.object({
      value: Joi.string().trim().valid("true", "false").required(),
      key: Joi.string()
        .trim()
        .required()
        .valid(...allowedKeys),
      ids: Joi.array().items(Joi.string().required()).required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { value: newValue, key, ids } = value;

    const youngs = await YoungObject.find({ _id: { $in: ids } });
    if (!youngs || youngs?.length === 0) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (youngs.some((young) => !canEditPresenceYoung(req.user, young))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    if (youngs.some((young) => young.sessionPhase1Id !== youngs[0].sessionPhase1Id)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    for (let young of youngs) {
      if ((key === "cohesionStayPresence" && newValue === "false") || (key === "presenceJDM" && young.cohesionStayPresence === "false")) {
        young.set({ cohesionStayPresence: "false", presenceJDM: "false" });
      } else {
        young.set({ [key]: newValue });
      }
      await young.save({ fromUser: req.user });
      const sessionPhase1 = await SessionPhase1.findById(young.sessionPhase1Id);
      await autoValidationSessionPhase1Young({ young, sessionPhase1, user: req.user });
      await updatePlacesSessionPhase1(sessionPhase1, req.user);
      if (key === "cohesionStayPresence" && newValue === "true") {
        let emailTo = [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }];
        if (young.parent2Email) emailTo.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email });
        await sendTemplate(SENDINBLUE_TEMPLATES.YOUNG_ARRIVED_IN_CENTER_TO_REPRESENTANT_LEGAL, {
          emailTo,
          params: {
            youngFirstName: young.firstName,
            youngLastName: young.lastName,
          },
        });
      }
    }

    res.status(200).send({ ok: true, data: youngs.map(serializeYoung) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/file/:youngId/:key/:fileName", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
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

    const young = await YoungObject.findById(youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (req.user._id.toString() !== young._id.toString()) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // add UUID logic here
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

router.use("/:id/documents", require("./documents"));
router.use("/:id/meeting-point", require("./meeting-point"));
router.use("/:id/session", require("./session"));
router.use("/:id/phase1", require("./phase1"));
router.use("/:id/phase2", require("./phase2"));
router.use("/reinscription", require("./reinscription"));
router.use("/inscription2023", require("./inscription2023"));
router.use("/note", require("./note"));
router.use("/:id/point-de-rassemblement", require("./point-de-rassemblement"));
router.use("/account", require("./account"));

module.exports = router;
