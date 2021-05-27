const express = require("express");
const passport = require("passport");
const fetch = require("node-fetch");
const queryString = require("querystring");
const crypto = require("crypto");
const router = express.Router();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const config = require("../config");
const { capture } = require("../sentry");
const renderFromHtml = require("../htmlToPdf");

const { encrypt } = require("../cryptoUtils");
const { getQPV } = require("../qpv");
const YoungObject = require("../models/young");
const CohesionCenterObject = require("../models/cohesionCenter");
const AuthObject = require("../auth");
const { uploadFile, validatePassword, updatePlacesCenter, assignNextYoungFromWaitingList, ERRORS } = require("../utils");
const { 
  validateId,
  validateString,
  validateEmail,
  validateToken
} = require("../utils/defaultValidate");
const validateFromYoung = require("../utils/young");
const { sendEmail } = require("../sendinblue");
const certificate = require("../templates/certificate");
const { cookieOptions } = require("../cookie-options");

const YoungAuth = new AuthObject(YoungObject);

router.post("/signin", (req, res) => YoungAuth.signin(req, res));
router.post("/logout", (req, res) => YoungAuth.logout(req, res));
router.post("/signup", (req, res) => YoungAuth.signup(req, res));

router.get("/signin_token", passport.authenticate("young", { session: false }), (req, res) => YoungAuth.signinToken(req, res));
router.post("/forgot_password", async (req, res) => YoungAuth.forgotPassword(req, res, `${config.APP_URL}/auth/reset`));
router.post("/forgot_password_reset", async (req, res) => YoungAuth.forgotPasswordReset(req, res));
router.post("/reset_password", passport.authenticate("young", { session: false }), async (req, res) => YoungAuth.resetPassword(req, res));

router.post("/file/:key", passport.authenticate("young", { session: false }), async (req, res) => {
  try {
    const key = req.params.key;
    const names = JSON.parse(req.body.body).names;
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
      const { error, value : checkedId } = validateId(req.user._id);
      if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_URI, error });
      await uploadFile(`app/young/${checkedId}/${key}/${name}`, resultingFile);
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

router.post("/signup_verify", async (req, res) => {
  try {
    const { error, value : checkedInvitationToken } = validateString(req.body.invitationToken);
    if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const young = await YoungObject.findOne({ invitationToken: checkedInvitationToken, invitationExpires: { $gt: Date.now() } });
    if (!young) return res.status(200).send({ ok: false, code: ERRORS.INVITATION_TOKEN_EXPIRED_OR_INVALID });
    const token = jwt.sign({ _id: young._id }, config.secret, { expiresIn: "30d" });
    return res.status(200).send({ ok: true, token, data: young });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/signup_invite", async (req, res) => {
  try {
    const { errorEmail, value : checkedEmail } = validateEmail(req.body.email);
    if(errorEmail) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const email = (checkedEmail || "").trim().toLowerCase();

    const young = await YoungObject.findOne({ email });
    if (!young) return res.status(200).send({ ok: false, data: null, code: ERRORS.USER_NOT_FOUND });

    if (young.registredAt) return res.status(200).send({ ok: false, data: null, code: ERRORS.YOUNG_ALREADY_REGISTERED });

    if (!validatePassword(req.body.password)) return res.status(200).send({ ok: false, prescriber: null, code: ERRORS.PASSWORD_NOT_VALIDATED });
    young.set({ password: req.body.password });
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
    const { error, value : checkedYoung } = validateFromYoung.validateYoung(req.body);
    if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const young = await YoungObject.create(checkedYoung);
    return res.status(200).send({ young, ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.YOUNG_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/validate_phase3/:young/:token", async (req, res) => {
  try {
    const { errorToken, value : checkedToken } = validateToken(req.params.token);
    const { errorId, value : checkedId } = validateId(req.params.young);
    if(errorToken || errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_URI, error });
    const data = await YoungObject.findOne({ _id: checkedId, phase3Token: checkedToken });
    if (!data) {
      capture(`Young not found ${req.params.id}`);
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
    const { errorToken, value : checkedToken } = validateToken(req.params.token);
    const { errorId, value : checkedId } = validateId(req.params.young);
    if(errorToken || errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_URI, error });
    const data = await YoungObject.findOne({ _id: checkedId, phase3Token: checkedToken });
    if (!data) {
      capture(`Young not found ${req.params.id}`);
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    const { errorNote, value : checkedTutorNote } = validateString(req.body.phase3TutorNote);
    if(errorNote) return res.status(400).send({ ok: false, code: ERRORS.INVALID_URI, error });
    data.set({ statusPhase3: "VALIDATED", phase3TutorNote: checkedTutorNote });
    await data.save();
    await data.index();
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate("young", { session: false }), async (req, res) => {
  try {
    const { error, value : checkedId } = validateId(req.user._id);
    if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_URI, error });
    const young = await YoungObject.findOne({ user_id: checkedId });
    return res.status(200).send({ ok: true, young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/validate_mission", passport.authenticate("young", { session: false }), async (req, res) => {
  try {
    const { errorYoung, value : checkedYoung } = validateFromYoung.validateYoung(req.body);
    if(errorYoung) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const { errorId, value : checkedId } = validateId(req.user._id);
    if(errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_URI, error });
    const obj = checkedYoung;
    obj.phase3Token = crypto.randomBytes(20).toString("hex");
    const young = await YoungObject.findByIdAndUpdate(checkedId, obj, { new: true });
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    // todo send mail to tutor
    let htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/validatePhase3.html")).toString();
    let youngName = `${young.firstName} ${young.lastName}`;
    let subject = `Confirmez la participation de ${youngName} sur votre mission`;
    htmlContent = htmlContent.replace(/{{toName}}/g, `${young.phase3TutorFirstName} ${young.phase3TutorLastName}`);
    htmlContent = htmlContent.replace(/{{youngName}}/g, youngName);
    htmlContent = htmlContent.replace(/{{structureName}}/g, young.phase3StructureName);
    htmlContent = htmlContent.replace(/{{startAt}}/g, young.phase3MissionStartAt.toLocaleDateString("fr"));
    htmlContent = htmlContent.replace(/{{endAt}}/g, young.phase3MissionEndAt.toLocaleDateString("fr"));
    htmlContent = htmlContent.replace(/{{cta}}/g, `${config.ADMIN_URL}/validate?token=${young.phase3Token}&young_id=${young._id}`);
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
    const { errorId, value : checkedId } = validateId(req.user._id);
    if(errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_URI, error });
    const { errorYoung, value : checkedYoung } = validateFromYoung.validateYoung(req.body);
    if(errorYoung) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const obj = checkedYoung;

    const young = await YoungObject.findByIdAndUpdate(checkedId, obj, { new: true });
    res.status(200).send({ ok: true, data: young });

    //Check quartier prioritaires.
    if (obj.zip && obj.city && obj.address) {
      const qpv = await getQPV(obj.zip, obj.city, obj.address);
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
      await assignNextYoungFromWaitingList(young);
    }

    // if they had a cohesion center, we check if we need to update the places taken / left
    if (req.user.statusPhase1 !== young.statusPhase1 && young.cohesionCenterId) {
      console.log("update center", young.cohesionCenterId);
      const center = await CohesionCenterObject.findById(young.cohesionCenterId);
      if (center) await updatePlacesCenter(center);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Get authorization from France Connect.
router.post("/france-connect/authorization-url", async (req, res) => {
  const query = {
    scope: `openid given_name family_name email`,
    redirect_uri: `${config.APP_URL}/${req.body.callback}`,
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
  // Get token…
  const body = {
    grant_type: "authorization_code",
    redirect_uri: `${config.APP_URL}/${req.body.callback}`,
    client_id: process.env.FRANCE_CONNECT_CLIENT_ID,
    client_secret: process.env.FRANCE_CONNECT_CLIENT_SECRET,
    code: req.body.code,
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
    const { error, value : checkedId } = validateId(req.params.id)
    if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_URI, error });
    const young = await YoungObject.findOne({ _id: checkedId });
    await young.remove();
    console.log(`Young ${req.params.id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:id/certificate/:template", passport.authenticate(["young", "referent"], { session: false }), async (req, res) => {
  const {error, value : checkedYoung } = validateId(req.params.id);
  if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_URI, error });
  const young = await YoungObject.findById(checkedYoung);
  if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

  const options = req.body.options || { format: "A4", margin: 0 };

  //create html
  let newhtml = "";
  if (req.params.template === "1") {
    newhtml = certificate.phase1(young);
  } else if (req.params.template === "2") {
    newhtml = certificate.phase2(young);
  } else if (req.params.template === "3") {
    newhtml = certificate.phase3(young);
  } else if (req.params.template === "snu") {
    newhtml = certificate.snu(young);
  }

  if (!newhtml) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

  const buffer = await renderFromHtml(newhtml, options);
  res.contentType("application/pdf");
  res.setHeader("Content-Dispositon", 'inline; filename="test.pdf"');
  res.set("Cache-Control", "public, max-age=1");
  res.send(buffer);
});

module.exports = router;
