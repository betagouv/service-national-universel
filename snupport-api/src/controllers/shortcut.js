const express = require("express");
const router = express.Router();
const ShortcutModel = require("../models/shortcut");
const { agentGuard } = require("../middlewares/authenticationGuards");
const { requireRole } = require("../middlewares/userRoleGuards");
const { validateParams, validateBody, validateQuery, idSchema } = require("../middlewares/validation");
const Joi = require("joi");
const { ERRORS } = require("../errors");
const { SCHEMA_SLATE_CONTENT, sanitizeUserHtml } = require("../utils/userContent");
const { buildSignatureQuery, canManageShortcut } = require("../utils/shortcutScope");
const { autocompleteRegex } = require("../utils/searchRegex");

// Le HTML d'un module de texte est assaini à l'écriture : il est relu par l'éditeur d'autres comptes.
const SCHEMA_SHORTCUT_HTML = Joi.string()
  .trim()
  .custom((value) => sanitizeUserHtml(value));

router.use(agentGuard);

const updateChildrenRecursive = async (content, user) => {
  for (const object of content) {
    if (object.children) await updateChildrenRecursive(object.children, user);
    if (object.text) {
      const regex = /#{(.*?)}/g;
      const matches = object.text.match(regex);
      if (matches) {
        for (const match of matches) {
          const value = match.replace("#{", "").replace("}", "").split(".")[1];
          object.text = object.text.replace(match, user[value]);
        }
      }
    }
  }
  return content;
};

router.get(
  "/",
  validateQuery(
    Joi.object({
      signatureDest: Joi.string().pattern(/^[0-9a-z_ ]+$/),
    })
  ),
  async (req, res) => {
    const query = buildSignatureQuery(req.user, req.cleanQuery.signatureDest);
    const data = await ShortcutModel.findOne(query);
    if (data) {
      data.content = await updateChildrenRecursive(data.content ? data.content : [], req.user);
      return res.status(200).send({ ok: true, data });
    }
    return res.status(404).send({ ok: false, message: "No matching shortcut data found" });
  }
);

router.get(
  "/search",
  validateQuery(
    Joi.object({
      q: Joi.string().trim().max(128),
    })
  ),
  async (req, res) => {
    let query = {};
    const q = req.cleanQuery.q || "";
    if (req.user.role === "REFERENT_DEPARTMENT") {
      query = {
        $or: [
          { userRole: req.user.role, userDepartment: req.user.departments, name: { $regex: autocompleteRegex(q) } },
          { userRole: "AGENT", name: { $regex: autocompleteRegex(q) }, userVisibility: "ALL" },
        ],
      };
    } else if (req.user.role === "REFERENT_REGION") {
      query = {
        $or: [
          { userRole: req.user.role, userRegion: req.user.region, name: { $regex: autocompleteRegex(q) } },
          { userRole: "AGENT", name: { $regex: autocompleteRegex(q) }, userVisibility: "ALL" },
        ],
      };
    } else {
      query = {
        userRole: req.user.role,
        name: { $regex: autocompleteRegex(q) },
      };
    }
    const hits = await ShortcutModel.find(query);
    const data = hits.map((e) => ({
      _id: e._id,
      name: e.name,
      text: e.text,
      status: e.status,
      content: e.content,
      keyword: e.keyword,
      userVisibility: e.userVisibility,
      dest: e.dest,
      ...e._source,
    }));

    return res.status(200).send({ ok: true, data });
  }
);

router.post(
  "/search",
  validateBody(
    Joi.object({
      q: Joi.string().trim().max(128),
      isSignature: Joi.boolean(),
      contactGroup: Joi.array().items(Joi.string().trim()),
    })
  ),
  async (req, res) => {
    let query = {};
    const q = req.cleanBody.q || "";
    if (req.user.role === "REFERENT_DEPARTMENT") {
      query = {
        $or: [
          { userRole: req.user.role, userDepartment: req.user.departments, name: { $regex: autocompleteRegex(q) } },
          { userRole: "AGENT", name: { $regex: autocompleteRegex(q) }, userVisibility: "ALL" },
        ],
      };
    } else if (req.user.role === "REFERENT_REGION") {
      query = {
        $or: [
          { userRole: req.user.role, userRegion: req.user.region, name: { $regex: autocompleteRegex(q) } },
          { userRole: "AGENT", name: { $regex: autocompleteRegex(q) }, userVisibility: "ALL" },
        ],
      };
    } else {
      query = {
        userRole: req.user.role,
        name: { $regex: autocompleteRegex(q) },
      };
    }
    if (req.cleanBody.contactGroup) {
      query = {
        ...query,
        dest: { $in: req.cleanBody.contactGroup },
      };
    }
    if (req.cleanBody.isSignature) {
      query = {
        ...query,
        isSignature: true,
      };
    } else {
      query = {
        ...query,
        isSignature: { $ne: true },
      };
    }
    const hits = await ShortcutModel.find(query);
    const data = hits.map((e) => ({
      _id: e._id,
      name: e.name,
      text: e.text,
      status: e.status,
      content: e.content,
      keyword: e.keyword,
      userVisibility: e.userVisibility,
      dest: e.dest,
      ...e._source,
    }));

    return res.status(200).send({ ok: true, data });
  }
);

// Les modules de texte et signatures ne s'administrent que depuis les paramètres de snupport-app,
// réservés au rôle AGENT. Le modèle n'a pas de propriétaire : sans cette garde, un référent modifiait
// les modules de tous les référents de son rôle et de son territoire (FH11, GOO-13).
router.post(
  "/",
  requireRole("AGENT"),
  validateBody(
    Joi.object({
      content: SCHEMA_SLATE_CONTENT,
      dest: Joi.array().items(Joi.string().trim()),
      keyword: Joi.array().items(Joi.string().trim()),
      name: Joi.string().trim(),
      text: SCHEMA_SHORTCUT_HTML,
      isSignature: Joi.boolean().optional(),
    }).prefs({ presence: "required" })
  ),
  async (req, res) => {
    let shortcut = req.cleanBody;
    shortcut.userRole = req.user.role;
    if (req.user.role === "REFERENT_REGION") shortcut.userRegion = req.user.region;
    await ShortcutModel.create(shortcut);
    return res.status(200).send({ ok: true });
  }
);

router.patch(
  "/:id",
  requireRole("AGENT"),
  validateParams(idSchema),
  validateBody(
    Joi.object({
      content: SCHEMA_SLATE_CONTENT,
      dest: Joi.array().items(Joi.string().trim()),
      keyword: Joi.array().items(Joi.string().trim()),
      name: Joi.string().trim(),
      text: SCHEMA_SHORTCUT_HTML,
      status: Joi.boolean(),
      userVisibility: Joi.string().valid("ALL", "AGENT"),
    }).min(1)
  ),
  async (req, res) => {
    const shortcut = await ShortcutModel.findById(req.cleanParams.id);
    if (!shortcut) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!canManageShortcut(req.user, shortcut)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    await ShortcutModel.findOneAndUpdate({ _id: shortcut._id }, req.cleanBody);
    return res.status(200).send({ ok: true });
  }
);

router.delete("/:id", requireRole("AGENT"), validateParams(idSchema), async (req, res) => {
  const shortcut = await ShortcutModel.findById(req.cleanParams.id);
  if (!shortcut) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
  if (!canManageShortcut(req.user, shortcut)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
  await ShortcutModel.findByIdAndDelete(shortcut._id);

  return res.status(200).send({ ok: true });
});
module.exports = router;
