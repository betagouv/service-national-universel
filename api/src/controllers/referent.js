const express = require("express");
const passport = require("passport");
const router = express.Router();
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const { getFile } = require("../utils");
const config = require("../config");
const { capture } = require("../sentry");

const ReferentObject = require("../models/referent");
const YoungObject = require("../models/young");
const AuthObject = require("../auth");

const { decrypt } = require("../cryptoUtils");
const { sendEmail } = require("../sendinblue");
const { validatePassword } = require("../utils");

const ReferentAuth = new AuthObject(ReferentObject);

const SERVER_ERROR = "SERVER_ERROR";
const USER_ALREADY_REGISTERED = "USER_ALREADY_REGISTERED";
const PASSWORD_NOT_VALIDATED = "PASSWORD_NOT_VALIDATED";
const INVITATION_TOKEN_EXPIRED_OR_INVALID = "INVITATION_TOKEN_EXPIRED_OR_INVALID";
const NOT_FOUND = "NOT_FOUND";
const USER_NOT_FOUND = "USER_NOT_FOUND";
const OPERATION_UNAUTHORIZED = "OPERATION_UNAUTHORIZED";

const COOKIE_MAX_AGE = 2592000000;

router.post("/signin", (req, res) => ReferentAuth.signin(req, res));
router.post("/logout", (req, res) => ReferentAuth.logout(req, res));

router.get("/signin_token", passport.authenticate("referent", { session: false }), (req, res) => ReferentAuth.signinToken(req, res));
router.post("/forgot_password", async (req, res) => ReferentAuth.forgotPassword(req, res, `${config.ADMIN_URL}/auth/reset`));
router.post("/forgot_password_reset", async (req, res) => ReferentAuth.forgotPasswordReset(req, res));
router.post("/reset_password", passport.authenticate("referent", { session: false }), async (req, res) => ReferentAuth.resetPassword(req, res));

router.post("/signup_invite/:role", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const obj = {};
    if (req.body.hasOwnProperty(`email`)) obj.email = req.body.email.trim().toLowerCase();
    if (req.body.hasOwnProperty(`firstName`))
      obj.firstName = req.body.firstName.charAt(0).toUpperCase() + (req.body.firstName || "").toLowerCase().slice(1);
    if (req.body.hasOwnProperty(`lastName`)) obj.lastName = req.body.lastName.toUpperCase();
    if (req.body.hasOwnProperty(`role`)) obj.role = "referent_department";
    if (req.body.hasOwnProperty(`region`)) obj.region = req.body.region; //TODO
    if (req.body.hasOwnProperty(`department`)) obj.department = req.body.department;

    const invitation_token = crypto.randomBytes(20).toString("hex");
    obj.invitationToken = invitation_token;
    obj.invitationExpires = Date.now() + 86400000 * 7; // 7 days

    const referent = await ReferentObject.create(obj);

    let htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/inviteReferentDepartment.html")).toString();
    htmlContent = htmlContent.replace(/{{toName}}/g, `${obj.firstName} ${obj.lastName}`);
    htmlContent = htmlContent.replace(/{{fromName}}/g, `${req.user.firstName} ${req.user.lastName}`);
    htmlContent = htmlContent.replace(/{{department}}/g, `${obj.department}`);
    htmlContent = htmlContent.replace(/{{cta}}/g, `${config.ADMIN_URL}/auth/signup?token=${invitation_token}`);
    await sendEmail({ name: `${obj.firstName} ${obj.lastName}`, email: obj.email }, "Activez votre compte référent départemental SNU", htmlContent);

    return res.status(200).send({ data: referent, ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: USER_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.post("/signup_retry", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();

    const referent = await ReferentObject.findOne({ email });
    if (!referent) return res.status(400).send({ ok: false, code: USER_NOT_FOUND });

    const invitationToken = crypto.randomBytes(20).toString("hex");
    referent.set({ invitationToken });
    referent.set({ invitationExpires: Date.now() + 86400000 * 7 });

    let htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/inviteReferentDepartment.html")).toString();
    htmlContent = htmlContent.replace(/{{toName}}/g, `${referent.firstName} ${referent.lastName}`);
    htmlContent = htmlContent.replace(/{{fromName}}/g, `contact@snu.gouv.fr`);
    htmlContent = htmlContent.replace(/{{department}}/g, `${referent.department}`);
    htmlContent = htmlContent.replace(/{{cta}}/g, `${config.ADMIN_URL}/auth/signup?token=${invitationToken}`);
    await sendEmail(
      { name: `${referent.firstName} ${referent.lastName}`, email: referent.email },
      "Activez votre compte référent départemental SNU",
      htmlContent
    );

    await referent.save();
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.post("/signup_verify", async (req, res) => {
  try {
    const referent = await ReferentObject.findOne({ invitationToken: req.body.invitationToken, invitationExpires: { $gt: Date.now() } });
    if (!referent) return res.status(200).send({ ok: false, code: INVITATION_TOKEN_EXPIRED_OR_INVALID });
    const token = jwt.sign({ _id: referent._id }, config.secret, { expiresIn: "30d" });
    return res.status(200).send({ ok: true, token, data: referent });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});
router.post("/signup", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();

    const referent = await ReferentObject.findOne({ email });
    if (!referent) return res.status(200).send({ ok: false, data: null, code: USER_NOT_FOUND });

    if (referent.registredAt) return res.status(200).send({ ok: false, data: null, code: USER_ALREADY_REGISTERED });

    if (!validatePassword(req.body.password)) return res.status(200).send({ ok: false, prescriber: null, code: PASSWORD_NOT_VALIDATED });

    referent.set({ firstname: req.body.firstname });
    referent.set({ lastname: req.body.lastname });
    referent.set({ password: req.body.password });
    referent.set({ registredAt: Date.now() });
    referent.set({ lastLoginAt: Date.now() });

    referent.set({ invitationToken: "" });
    referent.set({ invitationExpires: null });

    const token = jwt.sign({ _id: referent.id }, config.secret, { expiresIn: "30d" });
    const opts = { maxAge: COOKIE_MAX_AGE, secure: process.env.NODE_ENV === "production" ? true : false, httpOnly: true };
    res.cookie("jwt", token, opts);
    await referent.save();

    referent.password = undefined;

    return res.status(200).send({ data: referent, token, ok: true });
  } catch (error) {
    capture(error);
    return res.sendStatus(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.put("/young/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { id } = req.params;
    const young = await YoungObject.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.post("/email/:youngId", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { youngId } = req.params;
    const young = await YoungObject.findById(youngId);
    if (!young) return res.status(200).send({ ok: true });
    let htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/waitingCorrection.html")).toString();
    htmlContent = htmlContent.replace(/{{message}}/g, `${req.body.message}`);
    htmlContent = htmlContent.replace(/{{cta}}/g, "https://inscription.snu.gouv.fr");
    htmlContent = htmlContent.replace(/\n/g, "<br/>");
    console.log(htmlContent);
    await sendEmail(
      { name: `${young.firstName} ${young.lastName}`, email: young.email },
      "Votre candidature au SNU est en attente de correction",
      htmlContent
    );
    return res.status(200).send({ ok: true }); //todo
  } catch (error) {
    console.log(error);
    capture(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.get("/youngFile/:youngId/:key/:fileName", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { youngId, key, fileName } = req.params;
    const downloaded = await getFile(`app/young/${youngId}/${key}/${fileName}`);
    const decryptedBuffer = decrypt(downloaded.Body);

    return res.status(200).send({ data: Buffer.from(decryptedBuffer, "base64"), ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.get("/young/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await YoungObject.findOne({ _id: req.params.id });
    if (!data) {
      capture(`Young not found ${req.params.id}`);
      return res.status(404).send({ ok: false, code: NOT_FOUND });
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const user = await ReferentObject.findOne({ _id: req.user._id });
    return res.status(200).send({ ok: true, user });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(401).send({ ok: false, code: OPERATION_UNAUTHORIZED });
    const data = await ReferentObject.findOne({ _id: req.params.id });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(401).send({ ok: false, code: OPERATION_UNAUTHORIZED });
    const referent = await ReferentObject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send({ ok: true, data: referent });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

// router.put("/file/logo", passport.authenticate("referent", { session: false }), upload.single('logo'), async (req, res) => {
//   try {
//     const logoName = Object.keys(req.files)[0];
//     const logo = req.files[logoName];
//     let _id = req.user.role === "admin" ? req.query.user_id || req.user._id : req.user._id;
//     const url = `app/users/${_id}/${logo.name}`;
//     // await uploadToS3FromBuffer(url, logo.data);

//     res.status(200).send({ ok: true, url: "" });
//   } catch (error) {
//     capture(error);
//     res.status(500).send({ ok: false, code: SERVER_ERROR, error });
//   }
// });

//@check
router.put("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const user = await ReferentObject.findByIdAndUpdate(req.user._id, req.body, { new: true });
    res.status(200).send({ ok: true, data: user });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

module.exports = router;
