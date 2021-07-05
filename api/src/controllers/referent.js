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
const MissionObject = require("../models/mission");
const ApplicationObject = require("../models/application");
const CohesionCenterObject = require("../models/cohesionCenter");
const AuthObject = require("../auth");

const { decrypt } = require("../cryptoUtils");
const { sendEmail } = require("../sendinblue");
const { uploadFile, validatePassword, updatePlacesCenter, assignNextYoungFromWaitingList, ERRORS } = require("../utils");
const { encrypt } = require("../cryptoUtils");
const referentValidator = require("../utils/validator/referent");
const ReferentAuth = new AuthObject(ReferentObject);
const { cookieOptions, JWT_MAX_AGE } = require("../cookie-options");
const Joi = require("joi");
const { ROLES_LIST, canInviteUser, canDelete } = require("snu-lib/roles");

function inSevenDays() {
  return Date.now() + 86400000 * 7;
}

async function updateTutorNameInMissionsAndApplications(tutor) {
  if (!tutor || !tutor.firstName || !tutor.lastName) return;

  const missions = await MissionObject.find({ tutorId: tutor._id });
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
    const { error, value: params } = Joi.object({ id: Joi.string().required(), type: Joi.string().required() }).unknown().validate(req.params);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { id, type } = params;

    if (type === "referent" && req.user.role !== "admin") return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    let user = null;
    if (type === "referent") user = await ReferentObject.findById(id);
    else if (type === "young") user = await YoungObject.findById(id);

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
    const { error, value } = Joi.object({
      template: Joi.string().required(),
      email: Joi.string().lowercase().trim().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      role: Joi.string()
        .valid(...ROLES_LIST)
        .required(),
      region: Joi.string().allow(null, ""),
      department: Joi.string().allow(null, ""),
      structureId: Joi.string().allow(null, ""),
      structureName: Joi.string().allow(null, ""),
      centerName: Joi.string().allow(null, ""),
    })
      .unknown()
      .validate({ ...req.params, ...req.body });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canInviteUser(req.user.role, value.role)) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { template: reqTemplate, email, firstName, lastName, role, region, department, structureId, structureName, centerName } = value;
    const referentProperties = {};
    if (email) referentProperties.email = email.trim().toLowerCase();
    if (firstName) referentProperties.firstName = firstName.charAt(0).toUpperCase() + (firstName || "").toLowerCase().slice(1);
    if (lastName) referentProperties.lastName = lastName.toUpperCase();
    if (role) referentProperties.role = role;
    if (region) referentProperties.region = region;
    if (department) referentProperties.department = department;
    if (structureId) referentProperties.structureId = structureId;

    const invitation_token = crypto.randomBytes(20).toString("hex");
    referentProperties.invitationToken = invitation_token;
    referentProperties.invitationExpires = inSevenDays();

    const referent = await ReferentObject.create(referentProperties);
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
    } else if (reqTemplate === "head_center") {
      template = "../templates/inviteHeadCenter.html";
      mailObject = "Activez votre compte de chef de centre SNU";
    }
    let htmlContent = fs
      .readFileSync(path.resolve(__dirname, template))
      .toString()
      .replace(/{{toName}}/g, `${referent.firstName} ${referent.lastName}`)
      .replace(/{{fromName}}/g, `${req.user.firstName} ${req.user.lastName}`)
      .replace(/{{department}}/g, `${referent.department}`)
      .replace(/{{region}}/g, `${referent.region}`)
      .replace(/{{structureName}}/g, structureName)
      .replace(/{{centerName}}/g, centerName || "")
      .replace(/{{cta}}/g, `${config.ADMIN_URL}/auth/signup/invite?token=${invitation_token}`);

    await sendEmail({ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }, mailObject, htmlContent);

    return res.status(200).send({ data: referent, ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error: error.message });
  }
});

router.post("/signup_retry", async (req, res) => {
  try {
    const { error, value } = Joi.object({ email: Joi.string().lowercase().trim().email().required() }).unknown().validate(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const referent = await ReferentObject.findOne({ email: value.email });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.USER_NOT_FOUND });

    const invitationToken = crypto.randomBytes(20).toString("hex");
    referent.set({ invitationToken });
    referent.set({ invitationExpires: inSevenDays() });

    // Why is it only for referent department?
    const htmlContent = fs
      .readFileSync(path.resolve(__dirname, "../templates/inviteReferentDepartment.html"))
      .toString()
      .replace(/{{toName}}/g, `${referent.firstName} ${referent.lastName}`)
      .replace(/{{fromName}}/g, `contact@snu.gouv.fr`)
      .replace(/{{department}}/g, `${referent.department}`)
      .replace(/{{cta}}/g, `${config.ADMIN_URL}/auth/signup/invite?token=${invitationToken}`);
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
    const { error, value } = Joi.object({ invitationToken: Joi.string().required() }).unknown().validate(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const referent = await ReferentObject.findOne({ invitationToken: value.invitationToken, invitationExpires: { $gt: Date.now() } });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.INVITATION_TOKEN_EXPIRED_OR_INVALID });

    const token = jwt.sign({ _id: referent._id }, config.secret, { expiresIn: "30d" });
    return res.status(200).send({ ok: true, token, data: referent });
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
    })
      .unknown()
      .validate(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { email, password, firstName, lastName } = value;

    const referent = await ReferentObject.findOne({ email });
    if (!referent) return res.status(404).send({ ok: false, data: null, code: ERRORS.USER_NOT_FOUND });
    if (referent.registredAt) return res.status(400).send({ ok: false, data: null, code: ERRORS.USER_ALREADY_REGISTERED });
    if (!validatePassword(password)) return res.status(400).send({ ok: false, prescriber: null, code: ERRORS.PASSWORD_NOT_VALIDATED });

    referent.set({ firstName: firstName });
    referent.set({ lastName: lastName });
    referent.set({ password: password });
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
    const { error, value } = referentValidator.validateYoung(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const { id } = req.params;
    const young = await YoungObject.findById(id);
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
    } else if (newYoung.cohesionStayPresence === "false" && young.statusPhase1 !== "NOT_DONE") {
      newYoung = { ...newYoung, statusPhase1: "NOT_DONE" };
    }

    young.set(newYoung);
    await young.save();

    // if they had a cohesion center, we check if we need to update the places taken / left
    if (young.cohesionCenterId) {
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
    const { error, value } = referentValidator.validateYoung(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const obj = { ...value };
    const invitation_token = crypto.randomBytes(20).toString("hex");
    obj.invitationToken = invitation_token;
    obj.invitationExpires = inSevenDays(); // 7 days

    const young = await YoungObject.create(obj);

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
    const { error, value } = Joi.object({
      tutorId: Joi.string().required(),
      template: Joi.string().required(),
      subject: Joi.string().required().allow(null, ""),
      message: Joi.string().required().allow(null, ""),
    })
      .unknown()
      .validate({ ...req.params, ...req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const { tutorId, template, subject, message } = value;
    const tutor = await ReferentObject.findById(tutorId);
    if (!tutor) return res.status(200).send({ ok: true });

    let htmlContent = "";

    if (template === "correction") {
      htmlContent = fs
        .readFileSync(path.resolve(__dirname, "../templates/correctionMission.html"))
        .toString()
        .replace(/{{message}}/g, `${message.replace(/\n/g, "<br/>")}`)
        .replace(/{{cta}}/g, "https://admin.snu.gouv.fr");
    } else if (template === "refused") {
      htmlContent = fs
        .readFileSync(path.resolve(__dirname, "../templates/refusedMission.html"))
        .toString()
        .replace(/{{message}}/g, `${message.replace(/\n/g, "<br/>")}`)
        .replace(/{{cta}}/g, "https://admin.snu.gouv.fr");
    } else {
      throw new Error("Template de mail introuvable");
    }

    await sendEmail({ name: `${tutor.firstName} ${tutor.lastName}`, email: tutor.email }, subject, htmlContent);
    return res.status(200).send({ ok: true }); //todo
  } catch (error) {
    console.log(error);
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/email/:template/:youngId", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      youngId: Joi.string().required(),
      template: Joi.string().required(),
      message: Joi.string().allow(null, ""),
      prevStatus: Joi.string().allow(null, ""),
      missionName: Joi.string().allow(null, ""),
      structureName: Joi.string().allow(null, ""),
    })
      .unknown()
      .validate({ ...req.params, ...req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });
    const { youngId, template, message, prevStatus, missionName, structureName } = value;

    const young = await YoungObject.findById(youngId);
    if (!young) return res.status(200).send({ ok: true });

    let htmlContent = "";
    let subject = "";

    if (template === "correction") {
      htmlContent = fs
        .readFileSync(path.resolve(__dirname, "../templates/waitingCorrection.html"))
        .toString()
        .replace(/{{message}}/g, `${message}`)
        .replace(/{{cta}}/g, "https://inscription.snu.gouv.fr")
        .replace(/\n/g, "<br/>");
      subject = "Votre candidature au SNU est en attente de correction";
    } else if (template === "validate") {
      const template = prevStatus === "WITHDRAWN" ? "revalidated" : "validated";
      htmlContent = fs
        .readFileSync(path.resolve(__dirname, `../templates/${template}.html`))
        .toString()
        .replace(/{{cta}}/g, "https://inscription.snu.gouv.fr")
        .replace(/{{firstName}}/g, young.firstName)
        .replace(/{{lastName}}/g, young.lastName);
      subject = prevStatus === "WITHDRAWN" ? "Votre compte SNU a été réactivé" : "Votre candidature au SNU a été validée";
    } else if (template === "refuse") {
      htmlContent = fs
        .readFileSync(path.resolve(__dirname, "../templates/rejected.html"))
        .toString()
        .replace(/{{message}}/g, `${message}`)
        .replace(/{{firstName}}/g, young.firstName)
        .replace(/{{lastName}}/g, young.lastName)
        .replace(/\n/g, "<br/>");
      subject = "Votre candidature au SNU a été refusée";
    } else if (template === "waiting_list") {
      htmlContent = fs
        .readFileSync(path.resolve(__dirname, "../templates/waitingList.html"))
        .toString()
        .replace(/{{firstName}}/g, young.firstName)
        .replace(/{{lastName}}/g, young.lastName)
        .replace(/\n/g, "<br/>");
      subject = "Votre candidature au SNU a été mise sur liste complémentaire";
    } else if (template === "apply") {
      htmlContent = fs
        .readFileSync(path.resolve(__dirname, "../templates/apply.html"))
        .toString()
        .replace(/{{cta}}/g, "https://inscription.snu.gouv.fr/auth")
        .replace(/{{firstName}}/g, young.firstName)
        .replace(/{{lastName}}/g, young.lastName)
        .replace(/{{missionName}}/g, missionName)
        .replace(/{{structureName}}/g, structureName)
        .replace(/\n/g, "<br/>");
      subject = `La mission ${missionName} devrait vous intéresser !`;
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
    const { error, value } = Joi.object({
      youngId: Joi.string().required(),
      key: Joi.string().required(),
      fileName: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const { youngId, key, fileName } = value;
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
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
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
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/young/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await YoungObject.findOne({ _id: req.params.id });
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

router.get("/:id/patches", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const referent = await ReferentObject.findById(req.params.id);
    if (!referent) {
      capture(`referent not found ${req.params.id}`);
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    const data = await referent.patches.find({ ref: referent.id }).sort("-date");
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const user = await ReferentObject.findOne({ _id: req.user._id });
    return res.status(200).send({ ok: true, user });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await ReferentObject.findOne({ _id: req.params.id });
    if (!data) return res.status(404).send({ ok: false });

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

router.get("/subrole/:subRole", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await ReferentObject.find({ subRole: String(req.params.subRole) });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/structure/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await ReferentObject.find({ structureId: req.params.id });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await ReferentObject.findOne({ _id: req.params.id });
    if (!data) return res.status(404).send({ ok: false });

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
    const referent = await ReferentObject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await updateTutorNameInMissionsAndApplications(referent);
    res.status(200).send({ ok: true, data: referent });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

//@check
router.put("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const obj = req.body;
    obj.email = req.body.email && req.body.email.trim().toLowerCase();
    obj.firstName = req.body.firstName && req.body.firstName.charAt(0).toUpperCase() + (req.body.firstName || "").toLowerCase().slice(1);
    obj.lastName = req.body.lastName && req.body.lastName.toUpperCase();
    const user = await ReferentObject.findByIdAndUpdate(req.user._id, obj, { new: true });
    await updateTutorNameInMissionsAndApplications(user);
    res.status(200).send({ ok: true, data: user });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const referent = await ReferentObject.findOne({ _id: req.params.id });
    if (!referent) return res.status(404).send({ ok: false });
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
