const express = require("express");
const passport = require("passport");
const fileUpload = require("express-fileupload");
const FileType = require("file-type");
const NodeClam = require("clamscan");
const fs = require("fs");
const Joi = require("joi");
const { v4: uuid } = require("uuid");

const { ROLES } = require("snu-lib/roles");

const slack = require("../slack");
const { cookieOptions } = require("../cookie-options");
const { capture } = require("../sentry");
const zammood = require("../zammood");
const { ERRORS, isYoung, uploadFile, getFile, SUPPORT_BUCKET_CONFIG } = require("../utils");
const { ADMIN_URL, ENVIRONMENT, FILE_ENCRYPTION_SECRET_SUPPORT } = require("../config.js");
const { sendTemplate } = require("../sendinblue");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const ReferentObject = require("../models/referent");
const YoungObject = require("../models/young");
const { validateId } = require("../utils/validator");
const { encrypt, decrypt } = require("../cryptoUtils");

const router = express.Router();

router.get("/tickets", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { ok, data } = await zammood.api(`/v0/ticket?email=${req.user.email}`, { method: "GET", credentials: "include" });
    if (!ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/signin", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { ok, data, token } = await zammood.api(`/v0/sso/signin?email=${req.user.email}`, { method: "GET", credentials: "include" });
    if (!ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    res.cookie("jwtzamoud", token, cookieOptions());
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/knowledgeBase/search", async (req, res) => {
  try {
    const { ok, data } = await zammood.api(`/knowledge-base/${req.query.restriction}/search?search=${req.query.search}`, { method: "GET", credentials: "include" });
    if (!ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/tickets", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { ok, data } = await zammood.api(`/v0/ticket/search`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(req.body),
    });
    if (!ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // TODO : JOI - verif body coté SUPPORT

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Get one tickets with its messages.
router.get("/ticket/:id", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const messages = await zammood.api(`/v0/ticket/withMessages?ticketId=${checkedId}`, { method: "GET", credentials: "include" });
    if (!messages.ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: messages.data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Create a new ticket while authenticated
router.post("/ticket", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const obj = {
      subject: req.body.subject,
      message: req.body.message,
      fromPage: req.body.fromPage,
      formSubjectStep1: req.body.subjectStep1,
      formSubjectStep2: req.body.subjectStep2,
      files: req.body.files,
    };
    const { error, value } = Joi.object({
      subject: Joi.string().required(),
      message: Joi.string().required(),
      fromPage: Joi.string(),
      formSubjectStep1: Joi.string(),
      formSubjectStep2: Joi.string(),
      files: Joi.array().items(
        Joi.object().keys({
          name: Joi.string().required(),
          url: Joi.string().required(),
          path: Joi.string().required(),
        }),
      ),
    })
      .unknown()
      .validate(obj);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { subject, message, formSubjectStep1, formSubjectStep2, files } = value;
    const userAttributes = await getUserAttributes(req.user);
    const response = await zammood.api("/v0/message", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        message,
        email: req.user.email,
        subject,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        source: "PLATFORM",
        formSubjectStep1,
        formSubjectStep2,
        attributes: [...userAttributes, { name: "page précédente", value: value.fromPage }],
        files,
      }),
    });
    if (!response.ok) slack.error({ title: "Create ticket via message Zammod", text: JSON.stringify(response.code) });
    else if (isYoung(req.user && subject.includes("J'ai une question"))) {
      const isNotified = await notifyReferent(response.data, req.body.message);
      if (!isNotified) slack.error({ title: "Notify referent new message to zammood", text: JSON.stringify(response.code) });
    }
    if (!response.ok) return res.status(400).send({ ok: false, code: response });
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

//create ticket for non authenticated users
router.post("/ticket/form", async (req, res) => {
  try {
    const obj = {
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      department: req.body.department,
      region: req.body.region,
      formSubjectStep1: req.body.subjectStep1,
      formSubjectStep2: req.body.subjectStep2,
      role: req.body.role,
      fromPage: req.body.fromPage,
      files: req.body.files,
    };
    const { error, value } = Joi.object({
      email: Joi.string().email().required(),
      subject: Joi.string().required(),
      message: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      department: Joi.string().required(),
      region: Joi.string().required(),
      formSubjectStep1: Joi.string().required(),
      formSubjectStep2: Joi.string().required(),
      role: Joi.string().required(),
      fromPage: Joi.string(),
      files: Joi.array().items(
        Joi.object().keys({
          name: Joi.string().required(),
          url: Joi.string().required(),
          path: Joi.string().required(),
        }),
      ),
    })
      .unknown()
      .validate(obj);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { subject, message, firstName, lastName, email, clientId, department, region, formSubjectStep1, formSubjectStep2, role, fromPage, files } = value;

    const userAttributes = [
      { name: "departement", value: department },
      { name: "region", value: region },
      { name: "role", value: role },
      { name: "page précédente", value: fromPage },
    ];
    const response = await zammood.api("/v0/message", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        message,
        email,
        clientId,
        subject,
        firstName,
        lastName,
        source: "FORM",
        attributes: userAttributes,
        formSubjectStep1,
        formSubjectStep2,
        files,
      }),
    });
    if (!response.ok) return res.status(400).send({ ok: false, code: response });
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Update one ticket.
router.put("/ticket/:id", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { errorBody, value } = Joi.object({
      status: Joi.string().required(),
    }).validate(req.body, { stripUnknown: true });
    if (errorBody) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { status } = value;

    const response = await zammood.api(`/v0/ticket/${checkedId}`, {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify({
        status,
      }),
    });
    if (!response.id) return res.status(400).send({ ok: false });
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/ticket/:id/message", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { errorBody, value } = Joi.object({
      message: Joi.string().allow(null, ""),
      files: Joi.array().items(
        Joi.object().keys({
          name: Joi.string().required(),
          url: Joi.string().required(),
          path: Joi.string().required(),
        }),
      ),
    }).validate(req.body, { stripUnknown: true });
    if (errorBody) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { message, files } = value;

    const userAttributes = await getUserAttributes(req.user);
    const response = await zammood.api("/v0/message", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        lastName: req.user.lastName,
        firstName: req.user.firstName,
        email: req.user.email,
        message,
        files,
        ticketId: checkedId,
        attributes: userAttributes,
      }),
    });
    if (!response.ok) slack.error({ title: "Create message Zammood", text: JSON.stringify(response.code) });
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/upload", fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }), async (req, res) => {
  try {
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
    if (filesError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const responseData = [];

    for (let currentFile of files) {
      // If multiple file with same names are provided, currentFile is an array. We just take the latest.
      if (Array.isArray(currentFile)) {
        currentFile = currentFile[currentFile.length - 1];
      }
      const { name, tempFilePath, mimetype } = currentFile;
      const { mime: mimeFromMagicNumbers } = await FileType.fromFile(tempFilePath);
      const validTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (!(validTypes.includes(mimetype) && validTypes.includes(mimeFromMagicNumbers))) {
        fs.unlinkSync(tempFilePath);
        return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });
      }

      if (ENVIRONMENT === "staging" || ENVIRONMENT === "production") {
        const clamscan = await new NodeClam().init({
          preference: "clamscan",
          removeInfected: true,
        });
        const { isInfected } = await clamscan.isInfected(tempFilePath);
        if (isInfected) {
          capture(`File ${name} is infected`);
          return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
        }
      }

      const data = fs.readFileSync(tempFilePath);
      const path = getS3Path(name);
      const encryptedBuffer = encrypt(data, FILE_ENCRYPTION_SECRET_SUPPORT);
      const response = await uploadFile(path, { data: encryptedBuffer, encoding: "7bit", mimetype: mimeFromMagicNumbers }, SUPPORT_BUCKET_CONFIG);
      responseData.push({ name, url: response.Location, path: response.key });
      fs.unlinkSync(tempFilePath);
    }

    return res.status(200).send({ data: responseData, ok: true });
  } catch (error) {
    capture(error);
    if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: ERRORS.FILE_CORRUPTED });
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/s3file/:id", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const file = await getFile(`message/${req.params.id}`, SUPPORT_BUCKET_CONFIG);
    const buffer = decrypt(file.Body, FILE_ENCRYPTION_SECRET_SUPPORT);
    return res.status(200).send({ ok: true, data: buffer });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

const getS3Path = (fileName) => {
  const extension = fileName.substring(fileName.lastIndexOf(".") + 1);
  return `message/${uuid()}.${extension}`;
};

const getUserAttributes = async (user) => {
  const departmentReferentPhase2 = await ReferentObject.findOne({
    department: user.department,
    subRole: { $in: ["manager_department_phase2", "manager_phase2"] },
  });
  const structureLink = `${ADMIN_URL}/structure/${user.structureId}`;
  const missionsLink = `${ADMIN_URL}/structure/${user.structureId}/missions`;
  const centerLink = `${ADMIN_URL}/centre/${user.cohesionCenterId}`;
  let departmentReferentPhase2Link = "";
  if (departmentReferentPhase2) departmentReferentPhase2Link = `${ADMIN_URL}/user/${departmentReferentPhase2._id}`;
  const profilLink = isYoung(user) ? `${ADMIN_URL}/volontaire/${user._id}` : `${ADMIN_URL}/user/${user._id}`;
  const role = isYoung(user) ? "young" : user.role;
  const userAttributes = [
    { name: "date de création", value: user.createdAt },
    { name: "dernière connexion", value: user.lastLoginAt },
    { name: "lien vers profil", value: profilLink },
    { name: "departement", value: user.department },
    { name: "region", value: user.region },
    { name: "role", value: role },
  ];

  if (isYoung(user)) {
    userAttributes.push({ name: "cohorte", value: user.cohort });
    userAttributes.push({ name: "statut général", value: user.status });
    userAttributes.push({ name: "statut phase 1", value: user.statusPhase1 });
    userAttributes.push({ name: "statut phase 2", value: user.statusPhase2 });
    userAttributes.push({ name: "statut phase 3", value: user.statusPhase3 });
    if (departmentReferentPhase2) userAttributes.push({ name: "lien vers référent phase 2", value: departmentReferentPhase2Link });
    userAttributes.push({ name: "lien vers candidatures", value: `${ADMIN_URL}/volontaire/${user._id}/phase2` });
    userAttributes.push({
      name: "lien vers équipe départementale",
      value: `${ADMIN_URL}/user?DEPARTMENT=%5B%22${user.department}%22%5D&ROLE=%5B%22referent_department%22%5D`,
    });
    userAttributes.push({ name: "classe", value: user.grade });
  } else {
    if (user.role === ROLES.RESPONSIBLE || user.role === ROLES.SUPERVISOR) {
      userAttributes.push({ name: "lien vers la fiche structure", value: structureLink });
      userAttributes.push({ name: "lien général vers la page des missions proposées par la structure", value: missionsLink });
      if (departmentReferentPhase2) userAttributes.push({ name: "lien vers référent phase 2", value: departmentReferentPhase2Link });
    }
    if (user.role === ROLES.HEAD_CENTER) {
      userAttributes.push({ name: "lien vers le centre de cohésion", value: centerLink });
    }
    if (user.role === ROLES.REFERENT_DEPARTMENT || user.role === ROLES.REFERENT_REGION) {
      userAttributes.push({
        name: "lien vers équipe départementale",
        value: `${ADMIN_URL}/user?DEPARTMENT=%5B%22${user.department}%22%5D&ROLE=%5B%22referent_department%22%5D`,
      });
      if (user.subRole) userAttributes.push({ name: "fonction", value: user.subRole });
    }
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      userAttributes.push({
        name: "lien vers équipe régionale",
        value: `${ADMIN_URL}/user?REGION=%5B%22${user.region}%22%5D&ROLE=%5B%22referent_region%22%5D`,
      });
    }
  }
  return userAttributes;
};

const notifyReferent = async (ticket, message) => {
  if (!ticket) return false;
  let ticketCreator = await YoungObject.findOne({ email: ticket.contactEmail });
  if (!ticketCreator) return false;

  const department = ticketCreator.department;
  const departmentReferents = await ReferentObject.find({
    role: ROLES.REFERENT_DEPARTMENT,
    department,
  });

  for (let referent of departmentReferents) {
    sendTemplate(SENDINBLUE_TEMPLATES.referent.MESSAGE_NOTIFICATION, {
      emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: `${referent.email}` }],
      params: {
        cta: `${ADMIN_URL}/boite-de-reception`,
        message,
        from: `${ticketCreator.firstName} ${ticketCreator.lastName}`,
      },
    });
  }
  return true;
};

module.exports = router;
