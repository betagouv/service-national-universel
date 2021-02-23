const express = require("express");
const passport = require("passport");
const router = express.Router();
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const mime = require("mime-types");
const FileType = require("file-type");

const { getFile } = require("../utils");
const config = require("../config");
const { capture } = require("../sentry");

const ReferentObject = require("../models/referent");
const YoungObject = require("../models/young");
const ApplicationObject = require("../models/application");
const AuthObject = require("../auth");

const { decrypt } = require("../cryptoUtils");
const { sendEmail } = require("../sendinblue");
const { validatePassword } = require("../utils");
const { onlyAdmin } = require("../middleware/admin");
const { uploadFile } = require("../utils");
const { encrypt } = require("../cryptoUtils");
const ReferentAuth = new AuthObject(ReferentObject);

const SERVER_ERROR = "SERVER_ERROR";
const USER_ALREADY_REGISTERED = "USER_ALREADY_REGISTERED";
const PASSWORD_NOT_VALIDATED = "PASSWORD_NOT_VALIDATED";
const INVITATION_TOKEN_EXPIRED_OR_INVALID = "INVITATION_TOKEN_EXPIRED_OR_INVALID";
const NOT_FOUND = "NOT_FOUND";
const USER_NOT_FOUND = "USER_NOT_FOUND";
const OPERATION_UNAUTHORIZED = "OPERATION_UNAUTHORIZED";
const COOKIE_MAX_AGE = 60 * 60 * 2 * 1000; // 2h
const JWT_MAX_AGE = 60 * 60 * 2; // 2h

function cookieOptions() {
  if (config.ENVIRONMENT === "development") {
    return { maxAge: COOKIE_MAX_AGE, httpOnly: true, secure: false };
  } else {
    return { maxAge: COOKIE_MAX_AGE, httpOnly: true, secure: true, sameSite: "none" };
  }
}

router.post("/signin", (req, res) => ReferentAuth.signin(req, res));
router.post("/logout", (req, res) => ReferentAuth.logout(req, res));
router.post("/signup", (req, res) => ReferentAuth.signup(req, res));

router.get("/signin_token", passport.authenticate("referent", { session: false }), (req, res) => ReferentAuth.signinToken(req, res));
router.post("/forgot_password", async (req, res) => ReferentAuth.forgotPassword(req, res, `${config.ADMIN_URL}/auth/reset`));
router.post("/forgot_password_reset", async (req, res) => ReferentAuth.forgotPasswordReset(req, res));
router.post("/reset_password", passport.authenticate("referent", { session: false }), async (req, res) => ReferentAuth.resetPassword(req, res));

router.post("/signin_as/:type/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { type, id } = req.params;
    let user = null;
    if (type === "referent" && req.user.role !== "admin") return res.status(401).send({ ok: false, code: OPERATION_UNAUTHORIZED });
    if (type === "referent") user = await ReferentObject.findById(id);
    else if (type === "young") user = await YoungObject.findById(id);
    if (!user) return res.status(404).send({ code: NOT_FOUND, ok: false });
    const token = jwt.sign({ _id: user.id }, config.secret, { expiresIn: JWT_MAX_AGE });
    res.cookie("jwt", token, cookieOptions());
    return res.status(200).send({ data: user, ok: true, token });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.post("/signup_invite/:role", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const obj = {};
    if (req.body.hasOwnProperty(`email`)) obj.email = req.body.email.trim().toLowerCase();
    if (req.body.hasOwnProperty(`firstName`)) obj.firstName = req.body.firstName;
    if (req.body.hasOwnProperty(`lastName`)) obj.lastName = req.body.lastName;
    if (req.body.hasOwnProperty(`role`)) obj.role = req.body.role;

    if (req.body.hasOwnProperty(`region`)) obj.region = req.body.region; //TODO
    if (req.body.hasOwnProperty(`department`)) obj.department = req.body.department;

    if (req.body.hasOwnProperty(`structureId`)) obj.structureId = req.body.structureId;

    const invitation_token = crypto.randomBytes(20).toString("hex");
    obj.invitationToken = invitation_token;
    obj.invitationExpires = Date.now() + 86400000 * 7; // 7 days

    const referent = await ReferentObject.create(obj);
    let template = "";
    let mailObject = "";
    if (obj.role === "referent_department") {
      template = "../templates/inviteReferentDepartment.html";
      mailObject = "Activez votre compte référent départemental SNU";
    } else if (obj.role === "referent_region") {
      template = "../templates/inviteReferentRegion.html";
      mailObject = "Activez votre compte référent régional SNU";
    } else if (obj.role === "responsible") {
      template = "../templates/inviteMember.html";
      mailObject = "Activez votre compte de responsable de structure";
    } else if (obj.role === "admin") {
      template = "../templates/inviteAdmin.html";
      mailObject = "Activez votre compte administrateur SNU";
    }
    let htmlContent = fs.readFileSync(path.resolve(__dirname, template)).toString();
    htmlContent = htmlContent.replace(/{{toName}}/g, `${obj.firstName} ${obj.lastName}`);
    htmlContent = htmlContent.replace(/{{fromName}}/g, `${req.user.firstName} ${req.user.lastName}`);
    htmlContent = htmlContent.replace(/{{department}}/g, `${obj.department}`);
    htmlContent = htmlContent.replace(/{{region}}/g, `${obj.region}`);
    htmlContent = htmlContent.replace(/{{structureName}}/g, req.body.structureName);
    htmlContent = htmlContent.replace(/{{cta}}/g, `${config.ADMIN_URL}/auth/signup/invite?token=${invitation_token}`);

    await sendEmail({ name: `${obj.firstName} ${obj.lastName}`, email: obj.email }, mailObject, htmlContent);

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
    htmlContent = htmlContent.replace(/{{cta}}/g, `${config.ADMIN_URL}/auth/signup/invite?token=${invitationToken}`);
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
router.post("/signup_invite", async (req, res) => {
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
    res.cookie("jwt", token, cookieOptions());

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

router.post("/email-tutor/:template/:tutorId", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { tutorId, template } = req.params;
    const tutor = await ReferentObject.findById(tutorId);
    if (!tutor) return res.status(200).send({ ok: true });

    let htmlContent = "";
    let subject = "";

    if (template === "correction") {
      htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/correctionMission.html")).toString();
      htmlContent = htmlContent.replace(/{{message}}/g, `${req.body.message.replace(/\n/g, "<br/>")}`);
      htmlContent = htmlContent.replace(/{{cta}}/g, "https://admin.snu.gouv.fr");
      subject = req.body.subject;
    } else if (template === "refused") {
      htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/refusedMission.html")).toString();
      htmlContent = htmlContent.replace(/{{message}}/g, `${req.body.message.replace(/\n/g, "<br/>")}`);
      htmlContent = htmlContent.replace(/{{cta}}/g, "https://admin.snu.gouv.fr");
      subject = req.body.subject;
    } else {
      throw new Error("Template de mail introuvable");
    }

    await sendEmail({ name: `${tutor.firstName} ${tutor.lastName}`, email: "raph@selego.co" }, subject, htmlContent);
    return res.status(200).send({ ok: true }); //todo
  } catch (error) {
    console.log(error);
    capture(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.post("/email/:template/:youngId", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { youngId, template } = req.params;
    const young = await YoungObject.findById(youngId);
    if (!young) return res.status(200).send({ ok: true });

    let htmlContent = "";
    let subject = "";

    if (template === "correction") {
      htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/waitingCorrection.html")).toString();
      htmlContent = htmlContent.replace(/{{message}}/g, `${req.body.message}`);
      htmlContent = htmlContent.replace(/{{cta}}/g, "https://inscription.snu.gouv.fr");
      htmlContent = htmlContent.replace(/\n/g, "<br/>");
      subject = "Votre candidature au SNU est en attente de correction";
    } else if (template === "validate") {
      htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/validated.html")).toString();
      htmlContent = htmlContent.replace(/{{cta}}/g, "https://inscription.snu.gouv.fr");
      htmlContent = htmlContent.replace(/{{firstName}}/g, young.firstName);
      htmlContent = htmlContent.replace(/{{lastName}}/g, young.lastName);
      subject = "Votre candidature au SNU a été validée";
    } else if (template === "refuse") {
      htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/rejected.html")).toString();
      htmlContent = htmlContent.replace(/{{message}}/g, `${req.body.message}`);
      htmlContent = htmlContent.replace(/{{firstName}}/g, young.firstName);
      htmlContent = htmlContent.replace(/{{lastName}}/g, young.lastName);
      htmlContent = htmlContent.replace(/\n/g, "<br/>");
      subject = "Votre candidature au SNU a été refusée";
    } else if (template === "apply") {
      htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/apply.html")).toString();
      htmlContent = htmlContent.replace(/{{cta}}/g, "https://inscription.snu.gouv.fr/auth");
      htmlContent = htmlContent.replace(/{{firstName}}/g, young.firstName);
      htmlContent = htmlContent.replace(/{{lastName}}/g, young.lastName);
      htmlContent = htmlContent.replace(/{{missionName}}/g, req.body.missionName);
      htmlContent = htmlContent.replace(/{{structureName}}/g, req.body.structureName);
      htmlContent = htmlContent.replace(/\n/g, "<br/>");
      subject = `La mission ${req.body.missionName} devrait vous intéresser !`;
    }

    await sendEmail({ name: `${young.firstName} ${young.lastName}`, email: young.email }, subject, htmlContent);
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
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.post("/file/:key", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const key = req.params.key;
    const { names, youngId } = JSON.parse(req.body.body);
    const files = Object.keys(req.files || {}).map((e) => req.files[e]);

    const young = await YoungObject.findById(youngId);
    if (!young) return res.status(404).send({ ok: false });

    for (let i = 0; i < files.length; i++) {
      let currentFile = files[i];
      // If multiple file with same names are provided, currentFile is an array. We just take the latest.
      if (Array.isArray(currentFile)) {
        currentFile = currentFile[currentFile.length - 1];
      }
      const { name, data, mimetype } = currentFile;

      const encryptedBuffer = encrypt(data);
      const resultingFile = { mimetype: "image/png", encoding: "7bit", data: encryptedBuffer };
      await uploadFile(`app/young/${young._id}/${key}/${name}`, resultingFile);
    }
    young.set({ [key]: names });
    await young.save();
    return res.status(200).send({ data: names, ok: true });
  } catch (error) {
    capture(error);
    if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: FILE_CORRUPTED });
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
    const applications = await ApplicationObject.find({ youngId: data._id });
    return res.status(200).send({ ok: true, data: { ...data._doc, applications } });
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
    const data = await ReferentObject.findOne({ _id: req.params.id });
    const isAdminOrReferent = ["referent_department", "referent_region", "admin"].includes(req.user.role);
    const isResponsibleModifyingResponsible =
      ["responsible", "supervisor"].includes(req.user.role) && ["responsible", "supervisor"].includes(data.role);
    // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
    const authorized = isAdminOrReferent || isResponsibleModifyingResponsible;
    if (!authorized) return res.status(401).send({ ok: false, code: OPERATION_UNAUTHORIZED });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await ReferentObject.findOne({ _id: req.params.id });
    const isAdmin = req.user.role === "admin";
    const isResponsibleModifyingResponsibleWithoutChangingRole =
      // Is responsible...
      ["responsible", "supervisor"].includes(req.user.role) &&
      // ... modifying responsible ...
      ["responsible", "supervisor"].includes(data.role) &&
      // ... witout changing its role.
      ["responsible", "supervisor"].includes(req.body.role);

    // TODO: we must handle rights more precisely.
    // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
    const isReferentModifyingReferentWithoutChangingRole =
      // Is referent...
      ["referent_department", "referent_region"].includes(req.user.role) &&
      // ... modifying referent ...
      ["referent_department", "referent_region"].includes(data.role) &&
      // ... witout changing its role.
      ["referent_department", "referent_region"].includes(req.body.role);
    const authorized = isAdmin || isResponsibleModifyingResponsibleWithoutChangingRole || isReferentModifyingReferentWithoutChangingRole;

    if (!authorized) return res.status(401).send({ ok: false, code: OPERATION_UNAUTHORIZED });
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
