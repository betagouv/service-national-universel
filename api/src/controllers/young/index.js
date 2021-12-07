const express = require("express");
const passport = require("passport");
const fetch = require("node-fetch");
const queryString = require("querystring");
const crypto = require("crypto");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const config = require("../../config");
const { capture } = require("../../sentry");
const { encrypt } = require("../../cryptoUtils");
const { getQPV, getDensity } = require("../../geo");
const YoungObject = require("../../models/young");
const ReferentModel = require("../../models/referent");
const CohesionCenterObject = require("../../models/cohesionCenter");
const ApplicationModel = require("../../models/application");
const MissionModel = require("../../models/mission");
const AuthObject = require("../../auth");
const YoungAuth = new AuthObject(YoungObject);
const {
  uploadFile,
  validatePassword,
  updatePlacesCenter,
  signinLimiter,
  assignNextYoungFromWaitingList,
  ERRORS,
  inSevenDays,
  isYoung,
  updateApplicationsWithYoungOrMission,
} = require("../../utils");
const { sendTemplate } = require("../../sendinblue");
const { cookieOptions, JWT_MAX_AGE } = require("../../cookie-options");
const { validateYoung, validateId, validateFirstName } = require("../../utils/validator");
const patches = require("../patches");
const { serializeYoung, serializeApplication } = require("../../utils/serializer");
const { canDeleteYoung } = require("snu-lib/roles");
const { SENDINBLUE_TEMPLATES } = require("snu-lib/constants");

router.post("/signin", signinLimiter, (req, res) => YoungAuth.signin(req, res));
router.post("/logout", (req, res) => YoungAuth.logout(req, res));
router.get("/signin_token", passport.authenticate("young", { session: false, failWithError: true }), (req, res) => YoungAuth.signinToken(req, res));
router.post("/forgot_password", async (req, res) => YoungAuth.forgotPassword(req, res, `${config.APP_URL}/auth/reset`));
router.post("/forgot_password_reset", async (req, res) => YoungAuth.forgotPasswordReset(req, res));
router.post("/reset_password", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => YoungAuth.resetPassword(req, res));

router.post("/signup", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      email: Joi.string().lowercase().trim().email().required(),
      firstName: validateFirstName().trim().required(),
      lastName: Joi.string().uppercase().trim().required(),
      password: Joi.string().required(),
      birthdateAt: Joi.string().trim().required(),
    })
      .unknown()
      .validate(req.body);

    if (error) {
      if (error.details.find((e) => e.path === "email")) return res.status(400).send({ ok: false, user: null, code: ERRORS.EMAIL_INVALID });
      if (error.details.find((e) => e.path === "password")) return res.status(400).send({ ok: false, user: null, code: ERRORS.PASSWORD_NOT_VALIDATED });
      return res.status(400).send({ ok: false, code: error.toString() });
    }

    const { password, email, lastName, firstName, birthdateAt } = value;
    if (!validatePassword(password)) return res.status(400).send({ ok: false, user: null, code: ERRORS.PASSWORD_NOT_VALIDATED });

    const countDocuments = await YoungObject.countDocuments({ lastName, firstName, birthdateAt });
    if (countDocuments > 0) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });

    const user = await YoungObject.create({ password, email, firstName, lastName, birthdateAt });
    const token = jwt.sign({ _id: user._id }, config.secret, { expiresIn: JWT_MAX_AGE });
    res.cookie("jwt", token, cookieOptions());

    return res.status(200).send({
      ok: true,
      token,
      user: serializeYoung(user, user),
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error: error.message });
  }
});

router.post("/signup_verify", async (req, res) => {
  try {
    const { error, value } = Joi.object({ invitationToken: Joi.string().required() }).unknown().validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungObject.findOne({ invitationToken: value.invitationToken, invitationExpires: { $gt: Date.now() } });
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.INVITATION_TOKEN_EXPIRED_OR_INVALID });
    const token = jwt.sign({ _id: young._id }, config.secret, { expiresIn: "30d" });
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
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { email, password, invitationToken } = value;

    const young = await YoungObject.findOne({ email, invitationToken, invitationExpires: { $gt: Date.now() } });
    if (!young) return res.status(404).send({ ok: false, data: null, code: ERRORS.USER_NOT_FOUND });

    if (young.registredAt) return res.status(400).send({ ok: false, data: null, code: ERRORS.YOUNG_ALREADY_REGISTERED });

    if (!validatePassword(password)) return res.status(400).send({ ok: false, prescriber: null, code: ERRORS.PASSWORD_NOT_VALIDATED });

    young.set({ password });
    young.set({ registredAt: Date.now() });
    young.set({ lastLoginAt: Date.now() });
    young.set({ invitationToken: "" });
    young.set({ invitationExpires: null });

    const token = jwt.sign({ _id: young.id }, config.secret, { expiresIn: "30d" });
    res.cookie("jwt", token, cookieOptions());

    await young.save({ fromUser: req.user });

    return res.status(200).send({ data: serializeYoung(young, young), token, ok: true });
  } catch (error) {
    capture(error);
    return res.sendStatus(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/file/:key", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const rootKeys = ["cniFiles", "highSkilledActivityProofFiles", "parentConsentmentFiles", "autoTestPCRFiles", "imageRightFiles", "dataProcessingConsentmentFiles", "rulesFiles"];
    const militaryKeys = ["militaryPreparationFilesIdentity", "militaryPreparationFilesCensus", "militaryPreparationFilesAuthorization", "militaryPreparationFilesCertificate"];
    const { error: keyError, value: key } = Joi.string()
      .required()
      .valid(...[...rootKeys, ...militaryKeys])
      .validate(req.params.key);
    if (keyError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: keyError.message });

    const { error: bodyError, value: body } = Joi.string().required().validate(req.body.body);
    if (bodyError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: bodyError.message });

    const {
      error: namesError,
      value: { names },
    } = Joi.object({ names: Joi.array().items(Joi.string()).required() }).validate(JSON.parse(body), { stripUnknown: true });
    if (namesError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: namesError.message });

    const user = await YoungObject.findById(req.user._id);
    if (!user) return res.status(404).send({ ok: false, code: ERRORS.USER_NOT_FOUND });

    const files = Object.keys(req.files || {}).map((e) => req.files[e]);
    for (let i = 0; i < files.length; i++) {
      let currentFile = files[i];
      // If multiple file with same names are provided, currentFile is an array. We just take the latest.
      if (Array.isArray(currentFile)) {
        currentFile = currentFile[currentFile.length - 1];
      }
      const { name, data, mimetype } = currentFile;
      if (!["image/jpeg", "image/png", "application/pdf"].includes(mimetype)) return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });

      const encryptedBuffer = encrypt(data);
      const resultingFile = { mimetype: "image/png", encoding: "7bit", data: encryptedBuffer };

      if (militaryKeys.includes(key)) {
        await uploadFile(`app/young/${user._id}/military-preparation/${key}/${name}`, resultingFile);
      } else {
        await uploadFile(`app/young/${user._id}/${key}/${name}`, resultingFile);
      }
    }
    user.set({ [key]: names });
    await user.save({ fromUser: req.user });

    return res.status(200).send({ data: names, ok: true });
  } catch (error) {
    capture(error);
    if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: ERRORS.FILE_CORRUPTED });
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/", async (req, res) => {
  try {
    const { error, value } = validateYoung(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const young = await YoungObject.create({ ...value, fromUser: req.user });
    return res.status(200).send({ young: serializeYoung(young, young), ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.YOUNG_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/invite", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateYoung(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const obj = { ...value };
    const invitation_token = crypto.randomBytes(20).toString("hex");
    obj.invitationToken = invitation_token;
    obj.invitationExpires = inSevenDays(); // 7 days

    const young = await YoungObject.create({ ...obj, fromUser: req.user });

    const toName = `${young.firstName} ${young.lastName}`;
    const cta = `${config.APP_URL}/auth/signup/invite?token=${invitation_token}`;
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
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const data = await YoungObject.findOne({ _id: value.young, phase3Token: value.token });
    if (!data) {
      capture(`Young not found ${req.params.young}`);
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    return res.status(200).send({ ok: true, data: serializeYoung(data, data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
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
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const data = await YoungObject.findOne({ _id: value.young, phase3Token: value.token });

    if (!data) {
      capture(`Young not found ${value.young}`);
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    data.set({ statusPhase3: "VALIDATED", phase3TutorNote: value.phase3TutorNote });
    await data.save({ fromUser: req.user });

    await sendTemplate(SENDINBLUE_TEMPLATES.young.VALIDATE_PHASE3, {
      emailTo: [{ name: `${data.firstName} ${data.lastName}`, email: data.email }],
      params: { cta: `${config.APP_URL}/phase3` },
    });

    return res.status(200).send({ ok: true, data: serializeYoung(data, data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
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
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const young = await YoungObject.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // young can only update their own mission phase3.
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    const { id, ...values } = value;
    values.phase3Token = crypto.randomBytes(20).toString("hex");

    young.set(values);
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
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.post("/:id/archive", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const young = await YoungObject.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const previousEmail = young.email;
    young.set({
      email: "reliquat-2021+" + young.email.replace("reliquat-2021+", ""),
      lastName: "Reliquat 2021 " + young.lastName.replace("Reliquat 2021 ", ""),
    });
    await young.save({ fromUser: req.user });
    await sendTemplate(SENDINBLUE_TEMPLATES.young.ARCHIVED, {
      emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: previousEmail }],
      params: { cta: `${config.APP_URL}/inscription/profil` },
    });
    return res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateYoung(req.body, req.user);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // await updateApplicationsWithYoungOrMission({ young, newYoung: value });

    delete value.firstName;
    delete value.lastName;

    young.set(value);
    await young.save({ fromUser: req.user });

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
      young.set({ statusPhase1: "WITHDRAWN", statusPhase2: "WITHDRAWN", statusPhase3: "WITHDRAWN" });
      await young.save({ fromUser: req.user });
    }

    // if withdrawn from phase1 -> run the script that find a replacement for this young
    if (young.statusPhase1 === "WITHDRAWN" && ["AFFECTED", "WAITING_ACCEPTATION"].includes(req.user.statusPhase1) && req.user.cohesionCenterId) {
      // disable the 08 jun 21
      // await assignNextYoungFromWaitingList(young);
    }

    // if they had a cohesion center, we check if we need to update the places taken / left
    if (req.user.statusPhase1 !== young.statusPhase1 && young.cohesionCenterId) {
      const center = await CohesionCenterObject.findById(young.cohesionCenterId);
      if (center) await updatePlacesCenter(center);
    }
    return res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

//todo : add operation unauthorized:
// taking a user and a target, check if the user can send the template to the target
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
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });
    const { id, template, message, prevStatus, missionName, structureName, cta } = value;

    const young = await YoungObject.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    let buttonCta = cta || config.APP_URL;
    if (template === SENDINBLUE_TEMPLATES.young.MILITARY_PREPARATION_DOCS_CORRECTION) buttonCta = `${config.APP_URL}/ma-preparation-militaire`;
    if (template === SENDINBLUE_TEMPLATES.young.INSCRIPTION_STARTED) buttonCta = `${config.APP_URL}/inscription/coordonnees`;

    await sendTemplate(template, {
      emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
      params: { firstName: young.firstName, lastName: young.lastName, cta: buttonCta, message, missionName, structureName },
    });

    return res.status(200).send({ ok: true });
  } catch (error) {
    console.log(error);
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/application", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    if (isYoung(req.user) && req.user._id.toString() !== id) {
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
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Get authorization from France Connect.
router.post("/france-connect/authorization-url", async (req, res) => {
  const { error, value } = Joi.object({ callback: Joi.string().required() }).unknown().validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

  const query = {
    scope: `openid given_name family_name email`,
    redirect_uri: `${config.APP_URL}/${value.callback}`,
    response_type: "code",
    client_id: process.env.FRANCE_CONNECT_CLIENT_ID,
    state: "home",
    nonce: crypto.randomBytes(20).toString("hex"),
    acr_values: "eidas1",
  };
  const url = `${process.env.FRANCE_CONNECT_URL}/authorize?${queryString.stringify(query)}`;
  res.status(200).send({ ok: true, data: { url } });
});

// Get user information for authorized user on France Connect.
router.post("/france-connect/user-info", async (req, res) => {
  const { error, value } = Joi.object({ code: Joi.string().required(), callback: Joi.string().required() }).unknown().validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

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

  if (!token["access_token"] || !token["id_token"]) {
    return res.sendStatus(403, token);
  }

  // … then get user info.
  const userInfoResponse = await fetch(`${process.env.FRANCE_CONNECT_URL}/userinfo`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token["access_token"]}` },
  });
  const userInfo = await userInfoResponse.json();
  res.status(200).send({ ok: true, data: userInfo, tokenId: token["id_token"] });
});

// Delete one user (only admin can delete user)
router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const young = await YoungObject.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canDeleteYoung(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    await young.remove();
    console.log(`Young ${id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.string().required().email().validate(req.query.email);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });
    let data = await YoungObject.findOne({ email: value });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.use("/:id/documents", require("./documents"));
router.use("/:id/meeting-point", require("./meeting-point"));

module.exports = router;
