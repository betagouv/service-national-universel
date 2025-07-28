const express = require("express");
const router = express.Router();
const ShortcutModel = require("../models/shortcut");
const { agentGuard } = require("../middlewares/authenticationGuards");
const { validateParams, validateBody, validateQuery, idSchema } = require("../middlewares/validation");
const Joi = require("joi");

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
    const query = {};
    if (req.cleanQuery.signatureDest) {
      query.dest = { $in: [req.cleanQuery.signatureDest] };
    }
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
      q: Joi.string().trim(),
    })
  ),
  async (req, res) => {
    let query = {};
    const q = req.cleanQuery.q || "";
    if (req.user.role === "REFERENT_DEPARTMENT") {
      query = {
        $or: [
          { userRole: req.user.role, userDepartment: req.user.departments, name: { $regex: q } },
          { userRole: "AGENT", name: { $regex: q }, userVisibility: "ALL" },
        ],
      };
    } else if (req.user.role === "REFERENT_REGION") {
      query = {
        $or: [
          { userRole: req.user.role, userRegion: req.user.region, name: { $regex: q } },
          { userRole: "AGENT", name: { $regex: q }, userVisibility: "ALL" },
        ],
      };
    } else {
      query = {
        userRole: req.user.role,
        name: { $regex: q },
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
      q: Joi.string().trim(),
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
          { userRole: req.user.role, userDepartment: req.user.departments, name: { $regex: q } },
          { userRole: "AGENT", name: { $regex: q }, userVisibility: "ALL" },
        ],
      };
    } else if (req.user.role === "REFERENT_REGION") {
      query = {
        $or: [
          { userRole: req.user.role, userRegion: req.user.region, name: { $regex: q } },
          { userRole: "AGENT", name: { $regex: q }, userVisibility: "ALL" },
        ],
      };
    } else {
      query = {
        userRole: req.user.role,
        name: { $regex: q },
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

router.post(
  "/",
  validateBody(
    Joi.object({
      content: Joi.array(),
      dest: Joi.array().items(Joi.string().trim()),
      keyword: Joi.array().items(Joi.string().trim()),
      name: Joi.string().trim(),
      text: Joi.string().trim(),
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
  validateParams(idSchema),
  validateBody(
    Joi.object({
      content: Joi.array(),
      dest: Joi.array().items(Joi.string().trim()),
      keyword: Joi.array().items(Joi.string().trim()),
      name: Joi.string().trim(),
      text: Joi.string().trim(),
      status: Joi.boolean(),
      userVisibility: Joi.string().valid("ALL", "AGENT"),
    }).min(1)
  ),
  async (req, res) => {
    await ShortcutModel.findOneAndUpdate({ _id: req.cleanParams.id }, req.cleanBody);
    return res.status(200).send({ ok: true });
  }
);

router.delete("/:id", validateParams(idSchema), async (req, res) => {
  await ShortcutModel.findByIdAndDelete(req.cleanParams.id);

  return res.status(200).send({ ok: true });
});
module.exports = router;
