const express = require("express");
const passport = require("passport");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mime = require("mime-types");
const FileType = require("file-type");
const Joi = require("joi");

const ReferentModel = require("../models/referent");
const YoungModel = require("../models/young");
const MissionModel = require("../models/mission");
const ApplicationModel = require("../models/application");
const CohesionCenterModel = require("../models/cohesionCenter");
const StructureModel = require("../models/structure");
const AuthObject = require("../auth");
const ReferentAuth = new AuthObject(ReferentModel);
const patches = require("./patches");

const config = require("../config");
const { capture } = require("../sentry");
const { decrypt, encrypt } = require("../cryptoUtils");
const { sendTemplate } = require("../sendinblue");
const {
  getFile,
  uploadFile,
  validatePassword,
  updatePlacesCenter,
  signinLimiter,
  assignNextYoungFromWaitingList,
  ERRORS,
  isYoung,
  inSevenDays,
} = require("../utils");
const { validateId, validateSelf, validateYoung, validateReferent } = require("../utils/validator");
const { serializeYoung, serializeReferent } = require("../utils/serializer");
const { cookieOptions, JWT_MAX_AGE } = require("../cookie-options");
const { SENDINBLUE_TEMPLATES } = require("snu-lib/constants");
const { department2region } = require("snu-lib/region-and-departments");
const {
  ROLES_LIST,
  canInviteUser,
  canDeleteReferent,
  canViewReferent,
  SUB_ROLES,
  ROLES,
  canUpdateReferent,
  canViewYoungMilitaryPreparationFile,
  canSigninAs,
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

router.post("/signin", signinLimiter, (req, res) => ReferentAuth.signin(req, res));
router.post("/logout", (req, res) => ReferentAuth.logout(req, res));
router.post("/signup", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      email: Joi.string().lowercase().trim().email().required(),
      firstName: Joi.string().lowercase().trim().required(),
      lastName: Joi.string().uppercase().trim().required(),
      password: Joi.string().required(),
    })
      .unknown()
      .validate(req.body);

    if (error) {
      if (error.details.find((e) => e.path.find((p) => p === "email")))
        return res.status(400).send({ ok: false, user: null, code: ERRORS.EMAIL_INVALID });
      return res.status(400).send({ ok: false, code: error.toString() });
    }
    const { email, lastName, password } = value;
    if (!validatePassword(password)) return res.status(400).send({ ok: false, user: null, code: ERRORS.PASSWORD_NOT_VALIDATED });
    const firstName = value.firstName.charAt(0).toUpperCase() + value.firstName.toLowerCase().slice(1);
    const role = ROLES.RESPONSIBLE; // responsible by default

    const user = await ReferentModel.create({ password, email, firstName, lastName, role });
    const token = jwt.sign({ _id: user._id }, config.secret, { expiresIn: JWT_MAX_AGE });
    res.cookie("jwt", token, cookieOptions());

    return res.status(200).send({ user, token, ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
router.get("/signin_token", passport.authenticate("referent", { session: false, failWithError: true }), (req, res) =>
  ReferentAuth.signinToken(req, res)
);
router.post("/forgot_password", async (req, res) => ReferentAuth.forgotPassword(req, res, `${config.ADMIN_URL}/auth/reset`));
router.post("/forgot_password_reset", async (req, res) => ReferentAuth.forgotPasswordReset(req, res));
router.post("/reset_password", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) =>
  ReferentAuth.resetPassword(req, res)
);

router.post("/signin_as/:type/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: params } = Joi.object({ id: Joi.string().required(), type: Joi.string().required() })
      .unknown()
      .validate(req.params, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { id, type } = params;

    let user = null;
    if (type === "referent") user = await ReferentModel.findById(id);
    else if (type === "young") user = await YoungModel.findById(id);
    if (!user) return res.status(404).send({ code: ERRORS.USER_NOT_FOUND, ok: false });

    if (!canSigninAs(req.user, user)) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const token = jwt.sign({ _id: user.id }, config.secret, { expiresIn: JWT_MAX_AGE });
    res.cookie("jwt", token, cookieOptions());

    return res.status(200).send({ data: user, ok: true, token, data: isYoung(user) ? serializeYoung(user, user) : serializeReferent(user, user) });
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

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.details.map((e) => e.message) });
    if (!canInviteUser(req.user.role, value.role)) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const {
      template,
      email,
      firstName,
      lastName,
      role,
      subRole,
      region,
      department,
      structureId,
      structureName,
      cohesionCenterName,
      cohesionCenterId,
    } = value;
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
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error: error.message });
  }
});

router.post("/signup_retry", async (req, res) => {
  try {
    const { error, value } = Joi.object({ email: Joi.string().lowercase().trim().email().required() })
      .unknown()
      .validate(req.body, { stripUnknown: true });
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
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { email, password, firstName, lastName, invitationToken } = value;

    const referent = await ReferentModel.findOne({ email, invitationToken, invitationExpires: { $gt: Date.now() } });
    if (!referent) return res.status(404).send({ ok: false, data: null, code: ERRORS.USER_NOT_FOUND });
    if (referent.registredAt) return res.status(400).send({ ok: false, data: null, code: ERRORS.USER_ALREADY_REGISTERED });
    if (!validatePassword(password)) return res.status(400).send({ ok: false, prescriber: null, code: ERRORS.PASSWORD_NOT_VALIDATED });

    referent.set({ firstName, lastName, password, registredAt: Date.now(), lastLoginAt: Date.now(), invitationToken: "", invitationExpires: null });

    const token = jwt.sign({ _id: referent.id }, config.secret, { expiresIn: "30d" });
    res.cookie("jwt", token, cookieOptions());

    await referent.save({ fromUser: req.user });
    await updateTutorNameInMissionsAndApplications(referent, req.user);

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
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const { id } = req.params;
    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    let { __v, ...newYoung } = value;

    // if withdrawn, cascade withdrawn on every status
    if (
      newYoung.status === "WITHDRAWN" &&
      (young.statusPhase1 !== "WITHDRAWN" || young.statusPhase2 !== "WITHDRAWN" || young.statusPhase3 !== "WITHDRAWN")
    ) {
      newYoung = { ...newYoung, statusPhase1: "WITHDRAWN", statusPhase2: "WITHDRAWN", statusPhase3: "WITHDRAWN" };
    }

    // if withdrawn from phase1 -> run the script that find a replacement for this young
    if (newYoung.statusPhase1 === "WITHDRAWN" && ["AFFECTED", "WAITING_ACCEPTATION"].includes(young.statusPhase1) && young.cohesionCenterId) {
      // disable the 08 jun 21
      // await assignNextYoungFromWaitingList(young);
    }

    // if a referent said that a young is present in the cohesion stay, we validate its phase1
    if (newYoung.cohesionStayPresence === "true" && young.statusPhase1 !== "DONE") {
      newYoung = { ...newYoung, statusPhase1: "DONE" };
    } else if (newYoung.cohesionStayPresence === "false" && young.statusPhase1 !== "NOT_DONE" && young.statusPhase1 !== "CANCEL") {
      newYoung = { ...newYoung, statusPhase1: "NOT_DONE" };
    }

    young.set(newYoung);
    await young.save({ fromUser: req.user });

    // if they had a cohesion center, we check if we need to update the places taken / left
    if (young.cohesionCenterId) {
      const center = await CohesionCenterModel.findById(young.cohesionCenterId);
      if (center) await updatePlacesCenter(center);
    }
    res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
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
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const { tutorId, template, subject, message, app, missionName } = value;
    const tutor = await ReferentModel.findById(tutorId);
    if (!tutor) return res.status(404).send({ ok: false, data: null, code: ERRORS.USER_NOT_FOUND });

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

//todo: refactor
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
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const { youngId, key, fileName } = value;
    const downloaded = await getFile(`app/young/${youngId}/${key}/${fileName}`);
    const decryptedBuffer = decrypt(downloaded.Body);

    let mimeFromFile = null;
    try {
      const { mime } = await FileType.fromBuffer(decryptedBuffer);
      mimeFromFile = mime;
    } catch (e) { }

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
router.get(
  "/youngFile/:youngId/military-preparation/:key/:fileName",
  passport.authenticate("referent", { session: false, failWithError: true }),
  async (req, res) => {
    try {
      const { error, value } = Joi.object({
        youngId: Joi.string().required(),
        key: Joi.string().required(),
        fileName: Joi.string().required(),
      })
        .unknown()
        .validate({ ...req.params }, { stripUnknown: true });
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });
      const { youngId, key, fileName } = value;

      const young = await YoungModel.findById(youngId);
      // if they are not admin nor referent, it is not allowed to access this route unless they are from a military preparation structure
      if (!canViewYoungMilitaryPreparationFile(req.user, young)) {
        const structure = await StructureModel.findById(req.user.structureId);
        if (!structure || structure?.isMilitaryPreparation !== "true")
          return res.status(400).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const downloaded = await getFile(`app/young/${youngId}/military-preparation/${key}/${fileName}`);
      const decryptedBuffer = decrypt(downloaded.Body);

      let mimeFromFile = null;
      try {
        const { mime } = await FileType.fromBuffer(decryptedBuffer);
        mimeFromFile = mime;
      } catch (e) {}

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
  }
);

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

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });
    if (bodyError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: bodyError.message });

    const young = await YoungModel.findById(youngId);
    if (!young) return res.status(404).send({ ok: false });

    // Validate files with Joi
    const { error: filesError, value: files } = Joi.array()
      .items(
        Joi.alternatives().try(
          Joi.object({
            name: Joi.string().required(),
            data: Joi.binary().required(),
          }).unknown(),
          Joi.array().items(
            Joi.object({
              name: Joi.string().required(),
              data: Joi.binary().required(),
            }).unknown()
          )
        )
      )
      .validate(
        Object.keys(req.files || {}).map((e) => req.files[e]),
        { stripUnknown: true }
      );
    if (filesError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: filesError.message });

    for (let currentFile of files) {
      // If multiple file with same names are provided, currentFile is an array. We just take the latest.
      if (Array.isArray(currentFile)) {
        currentFile = currentFile[currentFile.length - 1];
      }
      const { name, data } = currentFile;

      const encryptedBuffer = encrypt(data);
      const resultingFile = { mimetype: "image/png", encoding: "7bit", data: encryptedBuffer };
      await uploadFile(`app/young/${young._id}/${key}/${name}`, resultingFile);
    }
    young.set({ [key]: names });
    await young.save({ fromUser: req.user });
    return res.status(200).send({ data: names, ok: true });
  } catch (error) {
    capture(error);
    if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: FILE_CORRUPTED });
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

//todo: refactor: in young controller (if referent, add the applications)
router.get("/young/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required() })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });
    const data = await YoungModel.findById(value.id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const applications = await ApplicationModel.find({ youngId: data._id });
    return res.status(200).send({ ok: true, data: { ...data._doc, applications } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get(
  "/:id/patches",
  passport.authenticate("referent", { session: false, failWithError: true }),
  async (req, res) => await patches.get(req, res, ReferentModel)
);

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });

    const referent = await ReferentModel.findById(checkedId);
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canViewReferent(req.user, referent)) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    return res.status(200).send({ ok: true, data: serializeReferent(referent, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const { error, value } = Joi.string().required().email().validate(req.query.email);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });
    let data = await ReferentModel.findOne({ email: value });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, error: "Aucun utilisateur trouvé" });
    return res.status(200).send({ ok: true, data: serializeReferent(data, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get(
  "/manager_department/:department",
  passport.authenticate(["referent", "young"], { session: false, failWithError: true }),
  async (req, res) => {
    try {
      const { error, value } = Joi.object({ department: Joi.string().required() })
        .unknown()
        .validate({ ...req.params }, { stripUnknown: true });

      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

      const data = await ReferentModel.findOne({
        subRole: SUB_ROLES.manager_department,
        role: ROLES.REFERENT_DEPARTMENT,
        department: value.department,
      });
      if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      return res.status(200).send({ ok: true, data });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
    }
  }
);
router.get("/manager_phase2/:department", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ department: Joi.string().required() })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

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
    return res
      .status(200)
      .send({ ok: true, data: { firstName: data.firstName, lastName: data.lastName, email: data.email, department: data.department } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateReferent(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const referent = await ReferentModel.findById(req.params.id);
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateReferent(req.user, referent, value)) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    referent.set(value);
    await referent.save({ fromUser: req.user });
    await updateTutorNameInMissionsAndApplications(referent, req.user);
    res.status(200).send({ ok: true, data: referent });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error: error.message });
  }
});

router.put("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateSelf(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });
    const user = await ReferentModel.findById(req.user._id);
    if (!user) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    user.set(value);
    await user.save();
    await updateTutorNameInMissionsAndApplications(user, req.user);
    res.status(200).send({ ok: true, data: user });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/:id/structure/:structureId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    const { error: errorStructureId, value: checkedStructureId } = validateId(req.params.structureId);
    if (errorId || errorStructureId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });
    const structure = await StructureModel.findById(checkedStructureId);
    const referent = await ReferentModel.findById(checkedId);
    if (!referent || !structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const missions = await MissionModel.find({ tutorId: referent._id });
    if (missions.length > 0) return res.status(405).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    referent.set({ structureId: structure._id, role: ROLES.RESPONSIBLE });
    await referent.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: referent });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const referent = await ReferentModel.findById(req.params.id);
    if (!referent) return res.status(404).send({ ok: false });
    if (!canDeleteReferent(req.user, referent)) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    await referent.remove();
    console.log(`Referent ${req.params.id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
