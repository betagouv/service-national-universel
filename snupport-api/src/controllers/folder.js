const express = require("express");
const router = express.Router();
const Joi = require("joi");
const  { agentGuard } = require("../middlewares/authenticationGuards");
const { validateParams, validateBody, idSchema } = require("../middlewares/validation");
const { SCHEMA_ID } = require("../schemas");
const { ERRORS } = require("../errors");
const { canManageOwnedResource } = require("../utils/ownedResourceScope");

router.use(agentGuard);

const SCHEMA_ABBREVIATION = Joi.string().length(2).trim();
const SCHEMA_NAME = Joi.string().trim();

const FolderModel = require("../models/folder");

router.get("/", async (req, res) => {
  let query = {};

  if (req.user.role === "REFERENT_DEPARTMENT") {
    query.userRole = req.user.role;
    query.userDepartment = { $in: req.user.departments };
  } else if (req.user.role === "REFERENT_REGION") {
    query.userRole = req.user.role;
    query.userRegion = req.user.region;
  } else {
    query.userRole = req.user.role;
  }

  const folders = await FolderModel.find(query).sort({ folderIndex: 1 }).exec();

  return res.status(200).send({ ok: true, data: folders });
});

router.get("/all", async (req, res) => {
  let folders = await FolderModel.find({});

  return res.status(200).send({ ok: true, data: folders });
});

router.post("/",
  validateBody(Joi.object({
    abbreviation: SCHEMA_ABBREVIATION,
    name: SCHEMA_NAME,
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    const newFolderIndex = await FolderModel.countDocuments();
    let folder = req.cleanBody;
    folder.folderIndex = newFolderIndex;
    folder.userRole = req.user.role;
    if (req.user.role === "REFERENT_DEPARTMENT") {
      folder.userDepartment = req.user.departments[0];
    }
    if (req.user.role === "REFERENT_REGION") {
      folder.userRegion = req.user.region;
    }
    await FolderModel.create(folder);
    return res.status(200).send({ ok: true });
  }
);

router.patch("/:id",
  validateParams(idSchema),
  validateBody(Joi.object({
    abbreviation: SCHEMA_ABBREVIATION,
    name: SCHEMA_NAME,
  }).min(1)),
  async (req, res) => {
    const folder = await FolderModel.findById(req.cleanParams.id);
    if (!folder) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!canManageOwnedResource(req.user, folder)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    await FolderModel.findOneAndUpdate({ _id: folder._id }, req.cleanBody, { new: true });
    return res.status(200).send({ ok: true });
  }
);

router.post("/reindex",
  validateBody(Joi.object({
    ids: Joi.array().items(SCHEMA_ID),
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    // On ne réordonne que les dossiers du périmètre de l'appelant : les identifiants hors périmètre
    // (ou inconnus) sont ignorés, jamais réindexés. Le `forEach(async …)` précédent ne renvoyait
    // aucune promesse : la réponse partait avant la fin des écritures.
    const folders = await FolderModel.find({ _id: { $in: req.cleanBody.ids } });
    const foldersById = new Map(folders.map((folder) => [String(folder._id), folder]));
    await Promise.all(
      req.cleanBody.ids.map(async (id, folderIndex) => {
        const folder = foldersById.get(String(id));
        if (!folder || !canManageOwnedResource(req.user, folder)) return;
        await FolderModel.findOneAndUpdate({ _id: id }, { folderIndex });
      })
    );
    return res.status(200).send({ ok: true });
  }
);

router.delete("/:id",
  validateParams(idSchema),
  async (req, res) => {
    const folder = await FolderModel.findById(req.cleanParams.id);
    if (!folder) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!canManageOwnedResource(req.user, folder)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    await FolderModel.findOneAndDelete({ _id: folder._id });
    return res.status(200).send({ ok: true });
  }
);

module.exports = router;
