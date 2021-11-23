const express = require("express");
const router = express.Router();
const passport = require("passport");
const slugify = require("slugify");

const { capture } = require("../sentry");
const KnowledgeBaseObject = require("../models/knowledgeBase");
const { ERRORS } = require("../utils/index.js");
const { validateId } = require("../utils/validator");

const findChildrenRecursive = async (section, allChildren, findAll = false) => {
  if (section.type !== "section") return;
  const children = await KnowledgeBaseObject.find({ parentId: section._id })
    .sort({ position: 1 })
    .populate({ path: "author", select: "_id firstName lastName role" })
    .lean(); // to json;
  for (const child of children) {
    allChildren.push(child);
    if (findAll) await findChildrenRecursive(child, allChildren, findAll);
  }
};

const findParents = async (item) => {
  const fromRootToItem = [{ ...item }]; // we spread item to avoid circular reference in item.parents = parents
  let currentItem = item;
  while (!!currentItem.parentId) {
    const parent = await KnowledgeBaseObject.findById(currentItem.parentId).lean(); // to json;
    fromRootToItem.unshift(parent);
    currentItem = parent;
  }
  return fromRootToItem;
};

const findChildren = async (section, findAll = false) => {
  const allChildren = [];
  await findChildrenRecursive(section, allChildren, findAll);
  return allChildren;
};

const buildTree = async (root) => {
  root.children = [];
  const children = [];
  await findChildrenRecursive(root, children);
  for (const child of children) {
    await buildTree(child);
  }
  root.children = children;
  return root;
};

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const kb = {};

    kb.author = req.user._id;
    kb.status = "DRAFT";

    if (req.body.hasOwnProperty("type")) kb.type = req.body.type;
    if (req.body.hasOwnProperty("parentId")) kb.parentId = req.body.parentId;
    if (req.body.hasOwnProperty("position")) kb.position = req.body.position;
    if (req.body.hasOwnProperty("title")) {
      kb.title = req.body.title.trim();
      kb.slug = slugify(req.body.title.trim(), {
        replacement: "-",
        remove: /[*+~.()'"!?:@]/g,
        lower: true, // convert to lower case, defaults to `false`
        strict: true, // strip special characters except replacement, defaults to `false`
        locale: "fr", // language code of the locale to use
        trim: true, // trim leading and trailing replacement chars, defaults to `true`
      });
    }
    if (req.body.hasOwnProperty("allowedRoles")) kb.allowedRoles = req.body.allowedRoles;
    if (req.body.hasOwnProperty("status")) kb.status = req.body.status;

    const newKb = await KnowledgeBaseObject.create(kb);

    return res.status(200).send({
      ok: true,
      data: await KnowledgeBaseObject.findById(newKb._id).populate({ path: "author", select: "_id firstName lastName role" }).lean(),
    });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/reorder", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const itemsToReorder = req.body;
    const session = await KnowledgeBaseObject.startSession();
    await session.withTransaction(async () => {
      for (const item of itemsToReorder) {
        await KnowledgeBaseObject.findByIdAndUpdate(item._id, { position: item.position });
      }
    });
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});
router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const existingKb = await KnowledgeBaseObject.findById(req.params.id);
    if (!existingKb) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const updateKb = {};

    if (req.body.hasOwnProperty("type")) updateKb.type = req.body.type;
    if (req.body.hasOwnProperty("parentId")) updateKb.parentId = req.body.parentId;
    if (req.body.hasOwnProperty("position")) updateKb.position = req.body.position;
    if (req.body.hasOwnProperty("title")) updateKb.title = req.body.title;
    if (req.body.hasOwnProperty("slug")) {
      updateKb.slug = slugify(req.body.slug.trim(), {
        replacement: "-",
        remove: /[*+~.()'"!?:@]/g,
        lower: true, // convert to lower case, defaults to `false`
        strict: true, // strip special characters except replacement, defaults to `false`
        locale: "fr", // language code of the locale to use
        trim: true, // trim leading and trailing replacement chars, defaults to `true`
      });
    }
    if (req.body.hasOwnProperty("imageSrc")) updateKb.imageSrc = req.body.imageSrc;
    if (req.body.hasOwnProperty("imageAlt")) updateKb.imageAlt = req.body.imageAlt;
    if (req.body.hasOwnProperty("content")) {
      console.log(typeof req.body.content);
      updateKb.content = req.body.content;
    }
    if (req.body.hasOwnProperty("description")) updateKb.description = req.body.description;
    if (req.body.hasOwnProperty("allowedRoles")) updateKb.allowedRoles = req.body.allowedRoles;
    if (req.body.hasOwnProperty("status")) updateKb.status = req.body.status;
    if (req.body.hasOwnProperty("author")) updateKb.author = req.body.author;
    if (req.body.hasOwnProperty("read")) updateKb.read = req.body.read;

    existingKb.set(updateKb);
    await existingKb.save();

    return res.status(200).send({
      ok: true,
      data: await KnowledgeBaseObject.findById(existingKb._id).populate({ path: "author", select: "_id firstName lastName role" }).lean(), // to json,
    });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:slug", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!req.params.slug) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const existingKb = await KnowledgeBaseObject.findOne({ slug: req.params.slug })
      .populate({
        path: "author",
        select: "_id firstName lastName role",
      })
      .lean(); // to json
    if (!existingKb) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (req.query.withParents === "true") {
      const parents = await findParents(existingKb);
      existingKb.parents = parents;
    }

    if (req.query.withTree === "true") {
      const tree = await buildTree(existingKb);
      return res.status(200).send({ ok: true, data: tree });
    }

    if (req.query.withDirectChildren === "true" || req.query.withAllChildren === "true") {
      const children = findChildren(existingKb, req.query.withAllChildren === "true");
      existingKb.children = children;
    }

    return res.status(200).send({ ok: true, data: existingKb });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const rootKbs = await KnowledgeBaseObject.find({ parentId: { $in: [undefined, null] } })
      .sort({ position: 1 })
      .populate({
        path: "author",
        select: "_id firstName lastName role",
      })
      .lean(); // to json;
    if (!rootKbs) return res.status(200).send({ ok: true, data: [] });

    const tree = await Promise.all(rootKbs.map(buildTree));

    return res.status(200).send({ ok: true, data: { type: "root", children: tree } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });

    const kb = await KnowledgeBaseObject.findById(checkedId);
    if (!kb) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const childrenToDelete = await findChildren(kb, true);
    for (const child of [kb, ...childrenToDelete]) {
      await KnowledgeBaseObject.findByIdAndDelete(child._id);
    }

    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
