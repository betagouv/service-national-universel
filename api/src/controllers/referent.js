const express = require("express");
const passport = require("passport");
const router = express.Router();
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const mime = require("mime-types");
const FileType = require("file-type");
const Joi = require("joi");

const { getFile } = require("../utils");
const config = require("../config");
const { capture } = require("../sentry");

const ReferentObject = require("../models/referent");
const YoungObject = require("../models/young");
const MissionObject = require("../models/mission");
const ApplicationObject = require("../models/application");
const CohesionCenterObject = require("../models/cohesionCenter");
const AuthObject = require("../auth");

const { decrypt } = require("../cryptoUtils");
const { sendEmail } = require("../sendinblue");
const { 
  uploadFile, 
  validatePassword, 
  updatePlacesCenter, 
  assignNextYoungFromWaitingList, 
  ERRORS,
  validateEmail,
  validateId,
  validateString,
  validateToken 
} = require("../utils/index");

const {
  validateYoungFromRef,
  validateReferentFromRef
} = require('../utils/referent')

const { encrypt } = require("../cryptoUtils");
const ReferentAuth = new AuthObject(ReferentObject);

const { cookieOptions, JWT_MAX_AGE } = require("../cookie-options");
const { valid } = require("joi");

async function updateTutorNameInMissionsAndApplications(tutor) {
  if (!tutor || !tutor.firstName || !tutor.lastName) return;
  const { error, value : checkedId } = validateId(tutor._id);
  if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_URI, error });
  const missions = await MissionObject.find({ tutorId: checkedId });
  // Update missions
  if (missions && missions.length) {
    for (let mission of missions) {
      mission.set({ tutorName: `${tutor.firstName} ${tutor.lastName}` });
      await mission.save();
      // ... and update each application
      const applications = await ApplicationObject.find({ missionId: mission._id });
      if (applications && applications.length) {
        for (let application of applications) {
          application.set({ tutorId: mission.tutorId, tutorName: `${tutor.firstName} ${tutor.lastName}` });
          await application.save();
        }
      }
    }
  }
}

router.post("/signin", (req, res) => ReferentAuth.signin(req, res));
router.post("/logout", (req, res) => ReferentAuth.logout(req, res));
router.post("/signup", (req, res) => ReferentAuth.signup(req, res));

router.get("/signin_token", passport.authenticate("referent", { session: false }), (req, res) => ReferentAuth.signinToken(req, res));
router.post("/forgot_password", async (req, res) => ReferentAuth.forgotPassword(req, res, `${config.ADMIN_URL}/auth/reset`));
router.post("/forgot_password_reset", async (req, res) => ReferentAuth.forgotPasswordReset(req, res));


router.post("/signin_as/:type/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { type, id } = req.params;
    const { errorType, value : checkedType } = validateString(type);
    const { errorId, value : checkedId } = validateId(id);
    if(errorType || errorId ) return res.status(400).send({ ok: false, code: ERRORS.INVALID_URI, error });
    let user = null;
    if (checkedType === "referent" && req.user.role !== "admin") return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    if (checkedType === "referent") user = await ReferentObject.findById(checkedId);
    else if(checkedType === "young") user = await YoungObject.findById(checkedId);
    if (!user) return res.status(404).send({ code: ERRORS.USER_NOT_FOUND, ok: false });
    const token = jwt.sign({ _id: user.id }, config.secret, { expiresIn: JWT_MAX_AGE });
    res.cookie("jwt", token, cookieOptions());
    return res.status(200).send({ data: user, ok: true, token });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});



router.post("/signup_invite/:template", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    /// Need to be tested
    const obj = {};
    const reqTemplate = req.params.template;
    if (req.body.hasOwnProperty(`email`)) obj.email = req.body.email.trim().toLowerCase();
    if (req.body.hasOwnProperty(`firstName`))
      obj.firstName = req.body.firstName.charAt(0).toUpperCase() + (req.body.firstName || "").toLowerCase().slice(1);
    if (req.body.hasOwnProperty(`lastName`)) obj.lastName = req.body.lastName.toUpperCase();
    if (req.body.hasOwnProperty(`role`)) obj.role = req.body.role;

    if (req.body.hasOwnProperty(`region`)) obj.region = req.body.region; //TODO
    if (req.body.hasOwnProperty(`department`)) obj.department = req.body.department;

    if (req.body.hasOwnProperty(`structureId`)) obj.structureId = req.body.structureId;

    const invitation_token = crypto.randomBytes(20).toString("hex");
    obj.invitationToken = invitation_token;
    obj.invitationExpires = Date.now() + 86400000 * 7; // 7 days

    const referent = await ReferentObject.create(obj);
    await updateTutorNameInMissionsAndApplications(referent);

    let template = "";
    let mailObject = "";
    if (reqTemplate === "referent_department") {
      template = "../templates/inviteReferentDepartment.html";
      mailObject = "Activez votre compte référent départemental SNU";
    } else if (reqTemplate === "referent_region") {
      template = "../templates/inviteReferentRegion.html";
      mailObject = "Activez votre compte référent régional SNU";
    } else if (reqTemplate === "responsible") {
      template = "../templates/inviteMember.html";
      mailObject = "Activez votre compte de responsable de structure";
    } else if (reqTemplate === "responsible_new_structure") {
      template = "../templates/inviteMemberNewStructure.html";
      mailObject = "Activez votre compte de responsable de structure";
    } else if (reqTemplate === "admin") {
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
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});



router.post("/signup_retry", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    /// Need to be tested
    const { error, value : checkedEmail } = validateEmail(email);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_MAIL, error });
    const referent = await ReferentObject.findOne({ checkedEmail });
    if (!referent) return res.status(400).send({ ok: false, code: ERRORS.USER_NOT_FOUND });

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
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/signup_verify", async (req, res) => {
  try {
    /// Need to be tested
    const { error, value : checkedInvitationToken } = validateToken(req.body.invitationToken)
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID, error });
    const referent = await ReferentObject.findOne({ invitationToken: checkedInvitationToken, invitationExpires: { $gt: Date.now() } });
    if (!referent) return res.status(200).send({ ok: false, code: ERRORS.INVITATION_TOKEN_EXPIRED_OR_INVALID });
    const token = jwt.sign({ _id: referent._id }, config.secret, { expiresIn: "30d" });
    return res.status(200).send({ ok: true, token, data: referent });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
router.post("/signup_invite", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    // Need to be tested
    const { error, value : checkedEmail } = validateEmail(email);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_MAIL, error });
    const referent = await ReferentObject.findOne({ checkedEmail });
    if (!referent) return res.status(200).send({ ok: false, data: null, code: ERRORS.USER_NOT_FOUND });

    if (referent.registredAt) return res.status(200).send({ ok: false, data: null, code: ERRORS.USER_ALREADY_REGISTERED });

    if (!validatePassword(req.body.password)) return res.status(200).send({ ok: false, prescriber: null, code: ERRORS.PASSWORD_NOT_VALIDATED });

    // Todo: firstname should be firstName, maybe we missed something here.
    // Pas tester
    const { errorFirstName, value : checkedFirstName } = validateString(req.body.firstName);
    const { errorLastName, value : checkedLastName } = validateString(req.body.lastName);
    const { errorPassword, value : checkedPassword } = validateString(req.body.password);
    if (errorFirstName || errorLastName || errorPassword ) return res.status(400).send({ ok: false, code: ERRORS.INVALID, error });
    referent.set({ firstname: checkedFirstName });
    referent.set({ lastname: checkedLastName });
    referent.set({ password: checkedPassword });
    referent.set({ registredAt: Date.now() });
    referent.set({ lastLoginAt: Date.now() });

    referent.set({ invitationToken: "" });
    referent.set({ invitationExpires: null });

    const token = jwt.sign({ _id: referent.id }, config.secret, { expiresIn: "30d" });
    res.cookie("jwt", token, cookieOptions());

    await referent.save();
    await updateTutorNameInMissionsAndApplications(referent);

    referent.password = undefined;

    return res.status(200).send({ data: referent, token, ok: true });
  } catch (error) {
    capture(error);
    return res.sendStatus(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/young/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { id } = req.params;
    const { errorId, value : checkedId } = validateId(id);
    const { errorYoung, value : checkedYoung } = validateYoungFromRef(req.body);
    if (errorId || errorYoung) return res.status(400).send({ ok: false, code: ERRORS.INVALID, error });
    const young = await YoungObject.findById(checkedId);

    // if withdrawn, cascade withdrawn on every status
    if (
      checkedYoung.status === "WITHDRAWN" &&
      (young.statusPhase1 !== "WITHDRAWN" || young.statusPhase2 !== "WITHDRAWN" || young.statusPhase3 !== "WITHDRAWN")
    ) {
      checkedYoung = { ...checkedYoung, statusPhase1: "WITHDRAWN", statusPhase2: "WITHDRAWN", statusPhase3: "WITHDRAWN" };
    }

    // if withdrawn from phase1 -> run the script that find a replacement for this young
    if (checkedYoung.statusPhase1 === "WITHDRAWN" && ["AFFECTED", "WAITING_ACCEPTATION"].includes(young.statusPhase1) && young.cohesionCenterId) {
      await assignNextYoungFromWaitingList(young);
    }

    young.set(checkedYoung);
    await young.save();

    // if they had a cohesion center, we check if we need to update the places taken / left
    if (young.cohesionCenterId) {
      console.log("update center", young.cohesionCenterId);
      const center = await CohesionCenterObject.findById(young.cohesionCenterId);
      if (center) await updatePlacesCenter(center);
    }
    res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.post("/young", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const obj = { ...req.body };
    const { error, value : checkedYoung } = validateYoungFromRef(obj);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const invitation_token = crypto.randomBytes(20).toString("hex");
    obj.invitationToken = invitation_token;
    obj.invitationExpires = Date.now() + 86400000 * 7; // 7 days

    const young = await YoungObject.create(checkedYoung);

    let htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/inviteYoung.html")).toString();
    htmlContent = htmlContent.replace(/{{toName}}/g, `${young.firstName} ${young.lastName}`);
    htmlContent = htmlContent.replace(/{{fromName}}/g, `${req.user.firstName} ${req.user.lastName}`);
    htmlContent = htmlContent.replace(/{{cta}}/g, `${config.APP_URL}/auth/signup/invite?token=${invitation_token}`);

    await sendEmail({ name: `${young.firstName} ${young.lastName}`, email: young.email }, "Activez votre compte SNU", htmlContent);

    return res.status(200).send({ young, ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/email-tutor/:template/:tutorId", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    // Need to be tested
    const { tutorId, template } = req.params;
    const { error, value : checkedTutorId } = validateString(tutorId);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID, error });
    const tutor = await ReferentObject.findById(checkedTutorId);
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
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/email/:template/:youngId", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    // Need to be tested
    const { youngId, template } = req.params;
    const { error, value : checkedYoungId } = validateString(youngId);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID, error });
    const young = await YoungObject.findById(checkedYoungId);
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
      const template = req.body.prevStatus === "WITHDRAWN" ? "revalidated" : "validated";
      htmlContent = fs.readFileSync(path.resolve(__dirname, `../templates/${template}.html`)).toString();
      htmlContent = htmlContent.replace(/{{cta}}/g, "https://inscription.snu.gouv.fr");
      htmlContent = htmlContent.replace(/{{firstName}}/g, young.firstName);
      htmlContent = htmlContent.replace(/{{lastName}}/g, young.lastName);
      subject = req.body.prevStatus === "WITHDRAWN" ? "Votre compte SNU a été réactivé" : "Votre candidature au SNU a été validée";
    } else if (template === "refuse") {
      htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/rejected.html")).toString();
      htmlContent = htmlContent.replace(/{{message}}/g, `${req.body.message}`);
      htmlContent = htmlContent.replace(/{{firstName}}/g, young.firstName);
      htmlContent = htmlContent.replace(/{{lastName}}/g, young.lastName);
      htmlContent = htmlContent.replace(/\n/g, "<br/>");
      subject = "Votre candidature au SNU a été refusée";
    } else if (template === "waiting_list") {
      htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/waitingList.html")).toString();
      htmlContent = htmlContent.replace(/{{firstName}}/g, young.firstName);
      htmlContent = htmlContent.replace(/{{lastName}}/g, young.lastName);
      htmlContent = htmlContent.replace(/\n/g, "<br/>");
      subject = "Votre candidature au SNU a été mise sur liste complémentaire";
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
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/youngFile/:youngId/:key/:fileName", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { youngId, key, fileName } = req.params;
    const { errorYoungId, value : checkedYoungId } = validateString(youngId);
    const { errorKey, value : checkedKey } = validateString(key);
    const { errorFileName, value : checkedFileName } = validateString(fileName);
    if (errorYoungId || errorKey || errorFileName ) return res.status(400).send({ ok: false, code: ERRORS.INVALID, error });
    const downloaded = await getFile(`app/young/${checkedYoungId}/${checkedKey}/${checkedFileName}`);
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
});

router.post("/file/:key", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const key = req.params.key;
    const { names, value : youngId } = JSON.parse(req.body.body);
    const { errorKey, value : checkedKey } = validateString(key);
    const { errorNames, value : checkedNames } = Joi.array().items(Joi.string().allow(null,'')).validate(names , { stripUnknown : true});
    const { errorYoungId, value : checkedYoungId } = validateString(youngId);
    if(errorKey || errorNames || errorYoungId) return res.status(400).send({ ok: false, code: ERRORS.INVALID, error });
    const files = Object.keys(req.files || {}).map((e) => req.files[e]);

    const young = await YoungObject.findById(checkedYoungId);
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
      await uploadFile(`app/young/${young._id}/${checkedKey}/${name}`, resultingFile);
    }
    young.set({ [checkedKey]: checkedNames });
    await young.save();
    return res.status(200).send({ data: checkedNames, ok: true });
  } catch (error) {
    capture(error);
    if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: FILE_CORRUPTED });
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/young/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value : checkedId } = validateId(req.params.id)
    if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID, error });
    const data = await YoungObject.findOne({ _id: checkedId });
    if (!data) {
      capture(`Young not found ${req.params.id}`);
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    const applications = await ApplicationObject.find({ youngId: data._id });
    return res.status(200).send({ ok: true, data: { ...data._doc, applications } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value : checkedId } = validateId(req.user._id)
    if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID, error });
    const user = await ReferentObject.findOne({ _id: checkedId});
    return res.status(200).send({ ok: true, user });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value : checkedId } = validateId(req.params.id)
    if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID, error });
    const data = await ReferentObject.findOne({ _id: checkedId });
    const isAdminOrReferent = ["referent_department", "referent_region", "admin"].includes(req.user.role);
    const isResponsibleModifyingResponsible =
      ["responsible", "supervisor"].includes(req.user.role) && ["responsible", "supervisor"].includes(data.role);
    // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
    const authorized = isAdminOrReferent || isResponsibleModifyingResponsible;
    if (!authorized) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/structure/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value : checkedId } = validateId(req.params.id)
    if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID, error });
    const data = await ReferentObject.find({ structureId: checkedId });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { errorId, value : checkedId } = validateId(req.params.id);
    const { errorReferent, value : checkedReferent } = validateReferentFromRef(req.body);
    if(errorId || errorReferent) return res.status(400).send({ ok: false, code: ERRORS.INVALID, error });
    const data = await ReferentObject.findOne({ _id: checkedId });
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

    if (!authorized) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const referent = await ReferentObject.findByIdAndUpdate(req.params.id, checkedReferent, { new: true });
    await updateTutorNameInMissionsAndApplications(referent);
    res.status(200).send({ ok: true, data: referent });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
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
//     res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
//   }
// });

//@check
router.put("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { errorId, value : checkedId } = validateId(req.user._id);
    const { errorReferent, value : checkedReferent } = validateReferentFromRef(req.body);
    if(errorId || errorReferent) return res.status(400).send({ ok: false, code: ERRORS.INVALID, error });
    const obj = checkedReferent;
    obj.email = checkedReferent.email && req.body.email.trim().toLowerCase();
    obj.firstName = checkedReferent.firstName && checkedReferent.firstName.charAt(0).toUpperCase() + (checkedReferent.firstName || "").toLowerCase().slice(1);
    obj.lastName = checkedReferent.lastName && checkedReferent.lastName.toUpperCase();
    const user = await ReferentObject.findByIdAndUpdate(checkedId, obj, { new: true });
    await updateTutorNameInMissionsAndApplications(user);
    res.status(200).send({ ok: true, data: user });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

function canDelete(user, value) {
  if (user.role === "admin") return true;
  // https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  if (user.role === "referent_region") {
    if (
      (["referent_department", "referent_region"].includes(value.role) && user.region === value.region) ||
      ["supervisor", "responsible"].includes(value.role)
    )
      return true;
    return false;
  }
  if (user.role === "referent_department") {
    if ((user.role === value.role && user.department === value.department) || ["supervisor", "responsible"].includes(value.role)) return true;
    return false;
  }
  return false;
}

router.delete("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const {error, value : checkedId } = validateId(req.params.id);
    if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID, error });
    const referent = await ReferentObject.findOne({ _id: checkedId });
    if (!canDelete(req.user, referent)) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    await referent.remove();
    console.log(`Referent ${req.params.id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
