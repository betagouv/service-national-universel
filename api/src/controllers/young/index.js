const express = require("express");
const passport = require("passport");
const fetch = require("node-fetch");
const queryString = require("querystring");
const crypto = require("crypto");
const router = express.Router();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const config = require("../../config");
const { capture } = require("../../sentry");

const { encrypt } = require("../../cryptoUtils");
const { getQPV } = require("../../qpv");
const YoungObject = require("../../models/young");
const CohesionCenterObject = require("../../models/cohesionCenter");
const DepartmentServiceModel = require("../../models/departmentService");
const AuthObject = require("../../auth");
const { uploadFile, validatePassword, updatePlacesCenter, signinLimiter, assignNextYoungFromWaitingList, ERRORS } = require("../../utils");
const { sendEmail } = require("../../sendinblue");
const { cookieOptions } = require("../../cookie-options");
const Joi = require("joi");
const { validateYoung, validateId } = require("../../utils/validator");
const patches = require("../patches");

const YoungAuth = new AuthObject(YoungObject);

router.post("/signin", signinLimiter, (req, res) => YoungAuth.signin(req, res));
router.post("/logout", (req, res) => YoungAuth.logout(req, res));
router.post("/signup", (req, res) => YoungAuth.signup(req, res));

router.get("/signin_token", passport.authenticate("young", { session: false }), (req, res) => YoungAuth.signinToken(req, res));
router.post("/forgot_password", async (req, res) => YoungAuth.forgotPassword(req, res, `${config.APP_URL}/auth/reset`));
router.post("/forgot_password_reset", async (req, res) => YoungAuth.forgotPasswordReset(req, res));
router.post("/reset_password", passport.authenticate("young", { session: false }), async (req, res) => YoungAuth.resetPassword(req, res));

router.post("/file/:key", passport.authenticate("young", { session: false }), async (req, res) => {
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
      value: { names },
    } = Joi.object({
      names: Joi.array().items(Joi.string().required()).required(),
    }).validate(JSON.parse(body), { stripUnknown: true });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });
    if (bodyError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: bodyError.message });

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
      await uploadFile(`app/young/${req.user._id}/${key}/${name}`, resultingFile);
    }
    req.user.set({ [key]: names });
    await req.user.save();
    return res.status(200).send({ data: names, ok: true });
  } catch (error) {
    capture(error);
    if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: ERRORS.FILE_CORRUPTED });
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:id/file/military-preparation/:key", passport.authenticate("young", { session: false }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: errorId });

    const { error, value } = Joi.object({
      key: Joi.string().required(),
      body: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    const { key, body } = value;
    const {
      error: bodyError,
      value: { names },
    } = Joi.object({
      names: Joi.array().items(Joi.string()).required(),
    }).validate(JSON.parse(body), { stripUnknown: true });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });
    if (bodyError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: bodyError.message });
    const young = await YoungObject.findById(checkedId);
    if (!young) {
      capture(`young not found ${id}`);
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
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
      await uploadFile(`app/young/${young._id}/military-preparation/${key}/${name}`, resultingFile);
    }
    young.set({ [key]: names });
    await young.save();
    return res.status(200).send({ data: names, ok: true });
  } catch (error) {
    capture(error);
    if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: ERRORS.FILE_CORRUPTED });
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/signup_verify", async (req, res) => {
  try {
    const { error, value } = Joi.object({ invitationToken: Joi.string().required() }).unknown().validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungObject.findOne({ invitationToken: value.invitationToken, invitationExpires: { $gt: Date.now() } });
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.INVITATION_TOKEN_EXPIRED_OR_INVALID });
    const token = jwt.sign({ _id: young._id }, config.secret, { expiresIn: "30d" });
    return res.status(200).send({ ok: true, token, data: young });
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

    await young.save();

    young.password = undefined;

    return res.status(200).send({ data: young, token, ok: true });
  } catch (error) {
    capture(error);
    return res.sendStatus(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/", async (req, res) => {
  try {
    const { error, value } = validateYoung(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const young = await YoungObject.create(value);
    return res.status(200).send({ young, ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.YOUNG_ALREADY_REGISTERED });
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
    return res.status(200).send({ ok: true, data });
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

    await data.save();
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// todo : delete and replace by /department-service/:department in frontend
// update the serializer // authorization (a young can only view department service of his own department)
router.get("/department-service", passport.authenticate("young", { session: false }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ department: Joi.string().required() }).unknown().validate(req.user, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const data = await DepartmentServiceModel.findOne({ department: value.department });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id/patches", passport.authenticate("referent", { session: false }), async (req, res) => await patches.get(req, res, YoungObject));

router.put("/validate_mission", passport.authenticate("young", { session: false }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
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
      .validate(req.body, { stripUnknown: true });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    value.phase3Token = crypto.randomBytes(20).toString("hex");
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set(value);
    await young.save();

    // Todo: send mail to tutor
    let youngName = `${young.firstName} ${young.lastName}`;
    let subject = `Confirmez la participation de ${youngName} sur votre mission`;
    let htmlContent = fs
      .readFileSync(path.resolve(__dirname, "../../templates/validatePhase3.html"))
      .toString()
      .replace(/{{toName}}/g, `${young.phase3TutorFirstName} ${young.phase3TutorLastName}`)
      .replace(/{{youngName}}/g, youngName)
      .replace(/{{structureName}}/g, young.phase3StructureName)
      .replace(/{{startAt}}/g, young.phase3MissionStartAt.toLocaleDateString("fr"))
      .replace(/{{endAt}}/g, young.phase3MissionEndAt.toLocaleDateString("fr"))
      .replace(/{{cta}}/g, `${config.ADMIN_URL}/validate?token=${young.phase3Token}&young_id=${young._id}`);

    await sendEmail({ name: `${young.phase3TutorFirstName} ${young.phase3TutorLastName}`, email: young.phase3TutorEmail }, subject, htmlContent);
    young.phase3Token = null;

    res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

//@check
router.put("/", passport.authenticate("young", { session: false }), async (req, res) => {
  try {
    const { error, value } = validateYoung(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const young = await YoungObject.findByIdAndUpdate(req.user._id, value, { new: true });

    //Check quartier prioritaires.
    if (value.zip && value.city && value.address) {
      const qpv = await getQPV(value.zip, value.city, value.address);
      if (qpv === true) {
        young.set({ qpv: "true" });
      } else if (qpv === false) {
        young.set({ qpv: "false" });
      } else {
        young.set({ qpv: "" });
      }
      await young.save();
    }

    // if withdrawn, cascade withdrawn on every status
    if (
      young.status === "WITHDRAWN" &&
      (young.statusPhase1 !== "WITHDRAWN" || young.statusPhase2 !== "WITHDRAWN" || young.statusPhase3 !== "WITHDRAWN")
    ) {
      young.set({ statusPhase1: "WITHDRAWN", statusPhase2: "WITHDRAWN", statusPhase3: "WITHDRAWN" });
      await young.save();
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
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
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
  const { error, value } = Joi.object({ code: Joi.string().required(), callback: Joi.string().required() })
    .unknown()
    .validate(req.body, { stripUnknown: true });
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
    return res.sendStatus(401, token);
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
router.delete("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const young = await YoungObject.findOne({ _id: id });
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    await young.remove();
    console.log(`Young ${id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

router.use("/:id/documents", require("./documents"));
router.use("/:id/meeting-point", require("./meeting-point"));

module.exports = router;
