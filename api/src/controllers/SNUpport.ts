import express, { CookieOptions } from "express";
import passport from "passport";
import fileUpload from "express-fileupload";
import fs from "fs";
import Joi from "joi";
import { v4 as uuid } from "uuid";

import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES, SENDINBLUE_TEMPLATES } from "snu-lib";

import slack from "../slack";
import { cookieOptions, COOKIE_SNUPPORT_MAX_AGE_MS } from "../cookie-options";
import { capture } from "../sentry";
import SNUpport from "../SNUpport";
import { ERRORS, isYoung, uploadFile, getFile, SUPPORT_BUCKET_CONFIG } from "../utils";
import { config } from "../config";
import { sendTemplate } from "../brevo";
import { YoungModel, ClasseModel, ReferentModel } from "../models";
import { validateId } from "../utils/validator";
import { encrypt, decrypt } from "../cryptoUtils";
import { getUserAttributes } from "../services/support";
import optionalAuth from "../middlewares/optionalAuth";
import { scanFile } from "../utils/virusScanner";
import { getMimeFromFile } from "../utils/file";
import { UserRequest } from "./request";
import { authMiddleware } from "../middlewares/authMiddleware";
import { permissionAccessControlMiddleware } from "../middlewares/permissionAccessControlMiddleware";

interface File {
  name: string;
  url: string;
  path: string;
}

interface Ticket {
  id?: string;
  status?: string;
  contactEmail?: string;
}

interface Message {
  message: string;
  email: string;
  subject: string;
  firstName: string;
  lastName: string;
  source: string;
  parcours?: string;
  author?: string;
  formSubjectStep1?: string;
  formSubjectStep2?: string;
  attributes?: Array<{ name: string; value: string }>;
  files?: File[];
  ticketId?: string;
  classe?: any;
  clientId?: string;
}

interface UploadResponse {
  Location: string;
  key: string;
}

interface UploadedFile {
  name: string;
  data: Buffer;
  tempFilePath?: string;
  mimetype?: string;
}

const router = express.Router();

router.get(
  "/tickets",
  authMiddleware(["referent", "young"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.SUPPORT, action: PERMISSION_ACTIONS.WRITE }]),
  async (req: UserRequest, res) => {
    try {
      const { ok, data } = await SNUpport.api(`/v0/ticket?email=${encodeURIComponent(req.user.email)}`, { method: "GET", credentials: "include" });
      if (!ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      return res.status(200).send({ ok: true, data });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get("/ticketsInfo", authMiddleware(["referent", "young"]), async (req: UserRequest, res) => {
  try {
    const { ok, data } = await SNUpport.api(`/v0/ticket?email=${encodeURIComponent(req.user.email)}`, { method: "GET", credentials: "include" });
    if (!ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const hasMessage = Array.isArray(data) && data.length > 0;
    const newStatusCount = Array.isArray(data) ? data.filter((ticket: Ticket) => ticket.status === "OPEN").length : 0;

    return res.status(200).send({ ok: true, data: { hasMessage, newStatusCount } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/signin", authMiddleware("referent"), async (req: UserRequest, res) => {
  try {
    const { ok, data, token } = await SNUpport.api(`/v0/sso/signin?email=${req.user.email}`, { method: "GET", credentials: "include" });
    if (!ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const options: CookieOptions = {
      ...cookieOptions(COOKIE_SNUPPORT_MAX_AGE_MS),
      sameSite: "lax" as const,
    };
    res.cookie("jwtzamoud", token, options);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/knowledgeBase/search", async (req: UserRequest, res) => {
  try {
    const { ok, data } = await SNUpport.api(`/knowledge-base/${req.query.restriction}/search?search=${req.query.search}`, { method: "GET", credentials: "include" });
    if (!ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/knowledgeBase/feedback", optionalAuth, async (req: UserRequest, res) => {
  try {
    const { ok, data } = await SNUpport.api(`/feedback`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ ...req.body, contactEmail: req.user?.email }),
    });
    if (!ok) return res.status(400).send({ ok: false, code: ERRORS.SERVER_ERROR });

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/tickets", authMiddleware(["referent", "young"]), async (req: UserRequest, res) => {
  try {
    const { ok, data } = await SNUpport.api(`/v0/ticket/search`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(req.body),
    });
    if (!ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get(
  "/ticketscount",
  authMiddleware("referent"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.SUPPORT, action: PERMISSION_ACTIONS.READ }]),
  async (req: UserRequest, res) => {
    try {
      const user = await ReferentModel.findById(req.user._id);
      if (!user) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }

      let query = {};
      if (user.role === ROLES.REFERENT_DEPARTMENT) {
        query = {
          type: "department",
          value: user.department,
        };
      }
      if (user.role === ROLES.REFERENT_REGION) {
        query = {
          type: "region",
          value: user.region,
        };
      }

      const { ok, data } = await SNUpport.api(`/v0/ticket/count`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(query),
      });
      if (!ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      return res.status(200).send({ ok: true, data });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get("/ticket/:id", authMiddleware(["referent", "young"]), async (req: UserRequest, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const messages = await SNUpport.api(`/v0/ticket/withMessages?ticketId=${checkedId}`, { method: "GET", credentials: "include" });
    if (!messages.ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: messages.data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post(
  "/ticket",
  authMiddleware(["referent", "young"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.SUPPORT, action: PERMISSION_ACTIONS.WRITE }]),
  async (req: UserRequest, res) => {
    try {
      const obj = {
        subject: req.body.subject,
        message: req.body.message,
        parcours: req.body.parcours,
        fromPage: req.body.fromPage,
        author: req.body.subjectStep0,
        formSubjectStep1: req.body.subjectStep1,
        formSubjectStep2: req.body.subjectStep2,
        files: req.body.files,
      };

      const { error, value } = Joi.object({
        subject: Joi.string().required(),
        message: Joi.string().required(),
        parcours: Joi.string(),
        fromPage: Joi.string().allow(null),
        author: Joi.string(),
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
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      const { subject, message, author, formSubjectStep1, formSubjectStep2, files, parcours } = value;
      const userAttributes = await getUserAttributes(req.user);
      const response = await SNUpport.api("/v0/message", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          message,
          email: req.user.email,
          subject,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          source: "PLATFORM",
          parcours,
          author,
          formSubjectStep1,
          formSubjectStep2,
          attributes: [...userAttributes, { name: "page précédente", value: value.fromPage }],
          files,
        }),
      });
      if (!response.ok) slack.error({ title: "Create ticket via message Zammod", text: JSON.stringify(response.code) });
      else if (isYoung(req.user) && subject.includes("J'ai une question")) {
        const isNotified = await notifyReferent(response.data, req.body.message);
        if (!isNotified) slack.error({ title: "Notify referent new message to SNUpport", text: JSON.stringify(response.code) });
      }
      if (!response.ok) return res.status(400).send({ ok: false, code: response });
      return res.status(200).send({ ok: true, data: response });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.post("/ticket/form", async (req: UserRequest, res) => {
  try {
    let author: string | undefined;

    const checkRole = async (role: string, email: string, findObject: any) => {
      const existing = await findObject.findOne({ email: email.toLowerCase() });
      return existing ? `${role} exterior` : "unknown";
    };

    if (req.body.role === "young" || req.body.role === "parent") {
      author = req.body.role;
      req.body.role = await checkRole("young", req.body.email, YoungModel);
    }

    if (req.body.role === "admin" || req.body.role === "admin exterior") {
      author = req.body.role;
      req.body.role = await checkRole("admin", req.body.email, ReferentModel);
    }

    const obj = {
      email: req.body.email.toLowerCase(),
      subject: req.body.subject,
      message: req.body.message,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      parcours: req.body.parcours,
      classeId: req.body.classeId,
      department: req.body.department,
      region: req.body.region,
      formSubjectStep1: req.body.subjectStep1,
      formSubjectStep2: req.body.subjectStep2,
      role: req.body.role,
      fromPage: req.body.fromPage,
      files: req.body.files,
    };
    const { error, value } = Joi.object({
      email: Joi.string().trim().email().required(),
      subject: Joi.string().required(),
      message: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      parcours: Joi.string(),
      classeId: Joi.string().allow(null),
      department: Joi.string().required(),
      region: Joi.string().required(),
      formSubjectStep1: Joi.string().required(),
      formSubjectStep2: Joi.string().required(),
      role: Joi.string().required(),
      fromPage: Joi.string().allow(null),
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
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { subject, message, firstName, lastName, email, department, region, formSubjectStep1, formSubjectStep2, role, fromPage, files, parcours, classeId } = value;

    const userAttributes = [
      { name: "departement", value: department },
      { name: "region", value: region },
      { name: "role", value: role },
      { name: "page précédente", value: fromPage },
    ];

    let body: Message = {
      message,
      email,
      parcours,
      subject,
      firstName,
      lastName,
      source: "FORM",
      attributes: userAttributes,
      formSubjectStep1,
      formSubjectStep2,
      files,
      author,
    };

    if (classeId) {
      const classe = await ClasseModel.findById(classeId);
      if (!classe) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      body = { ...body, classe };
    }

    const response = await SNUpport.api("/v0/message", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!response.ok) return res.status(400).send({ ok: false, code: response });
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/ticket/:id", authMiddleware(["referent", "young"]), async (req: UserRequest, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { error: validationError, value } = Joi.object({
      status: Joi.string().required(),
    }).validate(req.body, { stripUnknown: true });
    if (validationError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { status } = value;

    const response = await SNUpport.api(`/v0/ticket/${checkedId}`, {
      method: "PATCH",
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

router.post("/ticket/:id/message", authMiddleware(["referent", "young"]), async (req: UserRequest, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { error: validationError, value } = Joi.object({
      message: Joi.string().allow(null, ""),
      files: Joi.array().items(
        Joi.object().keys({
          name: Joi.string().required(),
          url: Joi.string().required(),
          path: Joi.string().required(),
        }),
      ),
    }).validate(req.body, { stripUnknown: true });
    if (validationError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { message, files } = value;

    const userAttributes = await getUserAttributes(req.user);
    const response = await SNUpport.api("/v0/message", {
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
    if (!response.ok) slack.error({ title: "Create message SNUpport", text: JSON.stringify(response.code) });
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/upload", fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }), async (req: UserRequest, res) => {
  try {
    const { error: filesError, value: files } = Joi.array()
      .items(
        Joi.alternatives().try(
          Joi.object<UploadedFile>({
            name: Joi.string().required(),
            data: Joi.binary().required(),
            tempFilePath: Joi.string().allow("").optional(),
            mimetype: Joi.string(),
          }).unknown(),
          Joi.array().items(
            Joi.object<UploadedFile>({
              name: Joi.string().required(),
              data: Joi.binary().required(),
              tempFilePath: Joi.string().allow("").optional(),
              mimetype: Joi.string(),
            }).unknown(),
          ),
        ),
      )
      .validate(
        Object.keys(req.files || {}).map((e) => req.files[e]),
        { stripUnknown: true },
      );
    if (filesError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const responseData: File[] = [];

    for (let currentFile of files) {
      if (Array.isArray(currentFile)) {
        currentFile = currentFile[currentFile.length - 1];
      }
      const { name, tempFilePath, mimetype } = currentFile;
      const mimeFromMagicNumbers = await getMimeFromFile(tempFilePath);
      const validTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (!(validTypes.includes(mimetype) && validTypes.includes(mimeFromMagicNumbers!))) {
        fs.unlinkSync(tempFilePath);
        return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });
      }

      const scanResult = await scanFile(tempFilePath, name);
      if (scanResult.infected) {
        return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
      }

      const data = fs.readFileSync(tempFilePath);
      const path = getS3Path(name);
      const encryptedBuffer = encrypt(data, config.FILE_ENCRYPTION_SECRET_SUPPORT);
      const response = (await uploadFile(path, { data: encryptedBuffer, encoding: "7bit", mimetype: mimeFromMagicNumbers }, SUPPORT_BUCKET_CONFIG)) as UploadResponse;
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

router.get("/s3file/:id", authMiddleware(["referent", "young"]), async (req: UserRequest, res) => {
  try {
    const file = await getFile(`message/${req.params.id}`, SUPPORT_BUCKET_CONFIG);
    const buffer = decrypt(file.Body, config.FILE_ENCRYPTION_SECRET_SUPPORT);
    return res.status(200).send({ ok: true, data: buffer });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

const getS3Path = (fileName: string): string => {
  const extension = fileName.substring(fileName.lastIndexOf(".") + 1);
  return `message/${uuid()}.${extension}`;
};

const notifyReferent = async (ticket: Ticket, message: string): Promise<boolean> => {
  if (!ticket) return false;
  let ticketCreator = await YoungModel.findOne({ email: ticket.contactEmail });
  if (!ticketCreator) return false;

  const department = ticketCreator.department;
  const departmentReferents = await ReferentModel.find({
    role: ROLES.REFERENT_DEPARTMENT,
    department,
  });

  for (let referent of departmentReferents) {
    sendTemplate(SENDINBLUE_TEMPLATES.referent.MESSAGE_NOTIFICATION, {
      emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: `${referent.email}` }],
      params: {
        cta: `${config.ADMIN_URL}/boite-de-reception`,
        message,
        from: `${ticketCreator.firstName} ${ticketCreator.lastName}`,
      },
    });
  }
  return true;
};

export default router;
