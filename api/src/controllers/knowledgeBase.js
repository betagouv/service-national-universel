"use strict";
const express = require("express");
const router = express.Router();
const passport = require("passport");
const slugify = require("slugify");

const { capture } = require("../sentry");
const KnowledgeBaseObject = require("../models/knowledgeBase");
const { uploadPublicPicture, ERRORS } = require("../utils/index.js");
const { validateId } = require("../utils/validator");

const findChildrenRecursive = async (section, allChildren, { findAll = false, lean = true }) => {
  if (section.type !== "section") return;
  const children = lean
    ? await KnowledgeBaseObject.find({ parentId: section._id }).sort({ type: -1, position: 1 }).populate({ path: "author", select: "_id firstName lastName role" }).lean() // to json;
    : await KnowledgeBaseObject.find({ parentId: section._id }).sort({ type: -1, position: 1 });
  for (const child of children) {
    allChildren.push(child);
    if (findAll) await findChildrenRecursive(child, allChildren, { findAll, lean });
  }
};

const findParents = async (item) => {
  const fromRootToItem = [{ ...item }]; // we spread item to avoid circular reference in item.parents = parents
  let currentItem = item;
  while (currentItem.parentId) {
    const parent = await KnowledgeBaseObject.findById(currentItem.parentId).lean(); // to json;
    fromRootToItem.unshift(parent);
    currentItem = parent;
  }
  return fromRootToItem;
};

const findChildren = async (section, findAll = false) => {
  const allChildren = [];
  await findChildrenRecursive(section, allChildren, { findAll });
  return allChildren;
};

const buildTree = async (root, { lean = true } = {}) => {
  root.children = [];
  const children = [];
  await findChildrenRecursive(root, children, { lean });
  for (const child of children) {
    await buildTree(child);
  }
  root.children = children;
  return root;
};

const consolidateAllowedRoles = async (initSection = { type: "section" }, newAllowedRoles = []) => {
  const tree = await buildTree(initSection, { lean: true });
  const checkAllowedRoles = async (section) => {
    if (!section?.children?.length) return;
    for (const child of section.children) {
      const unallowedRoles = child.allowedRoles.filter((role) => !section.allowedRoles.includes(role));
      const childNewAllowedRoles = newAllowedRoles.filter((role) => !child.allowedRoles.includes(role));
      if (unallowedRoles.length || childNewAllowedRoles.length) {
        await KnowledgeBaseObject.findByIdAndUpdate(child._id, {
          allowedRoles: [...child.allowedRoles.filter((role) => section.allowedRoles.includes(role)), ...childNewAllowedRoles],
        });
      }
      await checkAllowedRoles(child);
    }
  };
  checkAllowedRoles(tree);
};

router.post("/picture", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const files = Object.keys(req.files || {}).map((e) => req.files[e]);
    let file = files[0];
    // If multiple file with same names are provided, file is an array. We just take the latest.
    if (Array.isArray(file)) {
      file = file[file.length - 1];
    }
    const { name, data, mimetype } = file;
    if (!["image/jpeg", "image/png"].includes(mimetype)) return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });

    const resultingFile = { mimetype: "image/png", data };
    const filename = slugify(`kn/${Date.now()}-${name.replace(".png", "").replace(".jpg", "").replace(".jpeg", "")}`, {
      replacement: "-",
      remove: /[*+~.()'"!?:@]/g,
      lower: true, // convert to lower case, defaults to `false`
      strict: true, // strip special characters except replacement, defaults to `false`
      locale: "fr", // language code of the locale to use
      trim: true, // trim leading and trailing replacement chars, defaults to `true`
    });
    const result = await uploadPublicPicture(`${filename}.png`, resultingFile);
    return res.status(200).send({ data: result.Location, ok: true });
  } catch (error) {
    capture(error);
    if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: ERRORS.FILE_CORRUPTED });
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const kb = {};

    kb.author = req.user._id;
    kb.status = "DRAFT";

    if (!req.body.hasOwnProperty("title")) {
      return res.status(400).send({
        ok: false,
        error: "Un titre est obligatoire !",
      });
    }
    if (req.body.hasOwnProperty("type")) kb.type = req.body.type;
    if (req.body.hasOwnProperty("parentId")) kb.parentId = req.body.parentId;
    if (req.body.hasOwnProperty("position")) kb.position = req.body.position;
    if (req.body.hasOwnProperty("title")) {
      kb.title = req.body.title.trim();
      let slug = slugify(req.body.title.trim(), {
        replacement: "-",
        remove: /[*+~.()'"!?:@]/g,
        lower: true, // convert to lower case, defaults to `false`
        strict: true, // strip special characters except replacement, defaults to `false`
        locale: "fr", // language code of the locale to use
        trim: true, // trim leading and trailing replacement chars, defaults to `true`
      });
      let itemWithSameSlug = await KnowledgeBaseObject.findOne({ slug });
      while (itemWithSameSlug) {
        slug = `${slug}-${new Date().toISOString().split("T")[0]}`;
        itemWithSameSlug = await KnowledgeBaseObject.findOne({ slug });
      }
      kb.slug = slug;
    }
    if (req.body.hasOwnProperty("allowedRoles")) {
      kb.allowedRoles = req.body.allowedRoles;
      if (kb.parentId) {
        const parent = await KnowledgeBaseObject.findById(kb.parentId);
        if (parent) {
          kb.allowedRoles = req.body.allowedRoles.filter((role) => parent.allowedRoles.includes(role));
        }
      }
    }
    if (req.body.hasOwnProperty("status")) kb.status = req.body.status;

    const newKb = await KnowledgeBaseObject.create(kb);

    const data = await KnowledgeBaseObject.findById(newKb._id).populate({ path: "author", select: "_id firstName lastName role" }).lean();
    return res.status(200).send({ ok: true, data });
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
        await KnowledgeBaseObject.findByIdAndUpdate(item._id, { position: item.position, parentId: item.parentId || null });
        await consolidateAllowedRoles(item, item.allowedRoles);
      }
    });
    const data = await KnowledgeBaseObject.find().populate({ path: "author", select: "_id firstName lastName role" });
    return res.status(200).send({ ok: true, data });
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
    let updateChildrenAllowedRoles = false;
    let newAllowedRoles = [];

    if (req.body.hasOwnProperty("type")) updateKb.type = req.body.type;
    if (req.body.hasOwnProperty("parentId")) updateKb.parentId = req.body.parentId;
    if (req.body.hasOwnProperty("position")) updateKb.position = req.body.position;
    if (req.body.hasOwnProperty("title")) {
      if (!req.body.title.trim().length) {
        return res.status(400).send({
          ok: false,
          error: "Un titre est obligatoire !",
        });
      }
      updateKb.title = req.body.title;
    }
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
    if (req.body.hasOwnProperty("icon")) updateKb.icon = req.body.icon;
    if (req.body.hasOwnProperty("group")) updateKb.group = req.body.group;
    if (req.body.hasOwnProperty("content")) updateKb.content = req.body.content;
    if (req.body.hasOwnProperty("description")) updateKb.description = req.body.description;
    if (req.body.hasOwnProperty("allowedRoles")) {
      updateKb.allowedRoles = req.body.allowedRoles;
      if (JSON.stringify(existingKb.allowedRoles) !== JSON.stringify(updateKb.allowedRoles)) {
        if (existingKb.parentId) {
          const parent = await KnowledgeBaseObject.findById(existingKb.parentId);
          if (parent) {
            updateKb.allowedRoles = req.body.allowedRoles.filter((role) => parent.allowedRoles.includes(role));
          }
        }
        newAllowedRoles = updateKb.allowedRoles.filter((role) => !existingKb.allowedRoles.includes(role));
        updateChildrenAllowedRoles = true;
      }
    }
    if (req.body.hasOwnProperty("status")) updateKb.status = req.body.status;
    if (req.body.hasOwnProperty("author")) updateKb.author = req.body.author;
    if (req.body.hasOwnProperty("read")) updateKb.read = req.body.read;

    existingKb.set(updateKb);
    await existingKb.save();

    if (updateChildrenAllowedRoles) {
      await consolidateAllowedRoles(existingKb, newAllowedRoles);
    }

    return res.status(200).send({
      ok: true,
      data: await KnowledgeBaseObject.findById(existingKb._id).populate({ path: "author", select: "_id firstName lastName role" }).lean(), // to json,
    });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/tree", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const rootKbs = await KnowledgeBaseObject.find({ parentId: { $in: [undefined, null] } })
      .sort({ type: -1, position: 1 })
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

router.get("/all", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const data = await KnowledgeBaseObject.find().populate({ path: "author", select: "_id firstName lastName role" });

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/all-slugs", async (req, res) => {
  try {
    const data = await KnowledgeBaseObject.find();

    return res.status(200).send({ ok: true, data: data.map((item) => item.slug) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const existingKb = await KnowledgeBaseObject.findOne({ slug: req.params.slug })
      .populate({
        path: "author",
        select: "_id firstName lastName role",
      })
      .lean(); // to json

    if (!existingKb) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const parents = await findParents(existingKb);
    existingKb.parents = parents;

    if (existingKb.type === "section") {
      const children = await KnowledgeBaseObject.find({ parentId: existingKb._id })
        .sort({ type: -1, position: 1 })
        .populate({ path: "author", select: "_id firstName lastName role" })
        .lean(); // to json;
      existingKb.children = children;
    }

    return res.status(200).send({ ok: true, data: existingKb });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", async (req, res) => {
  try {
    const children = await KnowledgeBaseObject.find({ parentId: null }).sort({ type: -1, position: 1 }).populate({ path: "author", select: "_id firstName lastName role" }).lean(); // to json;

    return res.status(200).send({ ok: true, data: children });
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
