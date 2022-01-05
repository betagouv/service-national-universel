const express = require("express");
const router = express.Router();
const passport = require("passport");
const slugify = require("slugify");
const { ROLES } = require("snu-lib/roles");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const esClient = require("../es");
const config = require("../config");
const { capture } = require("../sentry");
const KnowledgeBaseObject = require("../models/knowledgeBase");
const { uploadPublicPicture, ERRORS } = require("../utils/index.js");
const { validateId } = require("../utils/validator");
const { getToken } = require("../passport");
const Young = require("../models/young");
const Referent = require("../models/referent");

const findChildrenRecursive = async (section, allChildren, { findAll = false }) => {
  if (section.type !== "section") return;
  const children = await KnowledgeBaseObject.find({ parentId: section._id })
    .sort({ type: -1, position: 1 })
    .populate({ path: "author", select: "_id firstName lastName role" })
    .lean(); // to json;
  for (const child of children) {
    allChildren.push(child);
    if (findAll) await findChildrenRecursive(child, allChildren, { findAll });
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

const findArticlesWithSlug = (slug, content) => {
  for (const item of content) {
    if (item.type === "link") {
      if (item.url.includes(slug)) return true;
    }
    if (item.children) {
      const hasSlug = findArticlesWithSlug(slug, item.children);
      if (hasSlug) return true;
    }
  }
  return false;
};

const findAndUpdateArticlesWithLinksWithSlug = async (oldSlug, newSlug) => {
  const articles = await KnowledgeBaseObject.find({ type: "article", slug: { $ne: newSlug } });
  const findAndUpdateLink = (item) => {
    if (item.type === "link") {
      if (item.url.includes(oldSlug)) {
        const url = `/base-de-connaissance/${newSlug}`;
        return {
          ...item,
          url,
        };
      }
      return item;
    }
    if (item.children) {
      return {
        ...item,
        children: item.children.map(findAndUpdateLink),
      };
    }
    return item;
  };
  for (const article of articles) {
    const { content } = article;
    if (JSON.stringify(content).includes(oldSlug)) {
      article.set({ content: content.map(findAndUpdateLink) });
      await article.save();
    }
  }
};

const getSlug = async (title) => {
  const slug = slugify(title.trim(), {
    replacement: "-",
    remove: /[*+~.()'"!?:@]/g,
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
    locale: "fr", // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  });
  let itemWithSameSlug = await KnowledgeBaseObject.findOne({ slug });
  let inc = 0;
  let newSlug = slug;
  while (itemWithSameSlug) {
    inc++;
    newSlug = `${slug}-${inc}`;
    itemWithSameSlug = await KnowledgeBaseObject.findOne({ slug: newSlug });
  }
  return newSlug;
};

const getContentAsText = (content) => {
  const getTextFromElement = (element, strings) => {
    for (const key of Object.keys(element)) {
      if (["text", "url"].includes(key)) strings.push(element[key].trim());
      if (["children"].includes(key)) {
        for (const childElement of element[key]) {
          getTextFromElement(childElement, strings);
        }
      }
    }
  };
  return content
    .reduce((strings, element) => {
      getTextFromElement(element, strings);
      return strings;
    }, [])
    .join(" ");
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

    if (!req.body.hasOwnProperty("title") || !req.body.title.trim()) {
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
      kb.slug = await getSlug(req.body.title);
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
    if (req.body.hasOwnProperty("keywords")) kb.keywords = req.body.keywords;
    if (req.body.hasOwnProperty("zammadId")) kb.zammadId = req.body.zammadId;
    if (req.body.hasOwnProperty("zammadParentId")) kb.zammadParentId = req.body.zammadParentId;
    if (req.body.hasOwnProperty("content")) {
      kb.content = req.body.content;
      kb.contentAsText = getContentAsText(req.body.content);
    }

    const newKb = await KnowledgeBaseObject.create(kb);

    const data = await KnowledgeBaseObject.findById(newKb._id).populate({ path: "author", select: "_id firstName lastName role" }).lean();
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// this is when reordering by drag and drop, in the tree or in a section
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
    session.endSession();
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
    let oldSlugToUpdate = null;
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
      oldSlugToUpdate = existingKb.slug;
      updateKb.slug = await getSlug(req.body.slug.trim());
    }
    if (req.body.hasOwnProperty("imageSrc")) updateKb.imageSrc = req.body.imageSrc;
    if (req.body.hasOwnProperty("imageAlt")) updateKb.imageAlt = req.body.imageAlt;
    if (req.body.hasOwnProperty("icon")) updateKb.icon = req.body.icon;
    if (req.body.hasOwnProperty("group")) updateKb.group = req.body.group;
    if (req.body.hasOwnProperty("keywords")) updateKb.keywords = req.body.keywords;
    if (req.body.hasOwnProperty("content")) {
      updateKb.content = req.body.content;
      updateKb.contentAsText = getContentAsText(req.body.content);
    }
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

    if (oldSlugToUpdate) {
      await findAndUpdateArticlesWithLinksWithSlug(oldSlugToUpdate, existingKb.slug);
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

// this is for admin: we download all in once so that we can build the tree and navigate quickly
router.get("/all", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const data = await KnowledgeBaseObject.find(req.query || {}).populate({ path: "author", select: "_id firstName lastName role" });

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// this is a middleware to set proper role and then filter knowledge-base by allowed role
const setAllowedRoleMiddleWare = async (req, res, next) => {
  try {
    req.allowedRole = "public";
    const token = getToken(req);
    if (!token) return next();
    const jwtPayload = await new Promise((resolve, reject) => {
      jwt.verify(token, config.secret, function (err, decoded) {
        if (err) reject(err);
        resolve(decoded);
      });
    });
    if (!jwtPayload) return next();
    const { error, value } = Joi.object({ _id: Joi.string().required() }).validate({ _id: jwtPayload._id });
    if (error) return next();

    const young = await Young.findById(value._id);
    if (young) {
      req.user = young;
      req.allowedRole = "young";
      return next();
    }
    const referent = await Referent.findById(value._id);
    if (referent) {
      req.user = young;
      req.allowedRole = (() => {
        switch (referent.role) {
          case ROLES.ADMIN:
            return "admin";
          case ROLES.REFERENT_DEPARTMENT:
          case ROLES.REFERENT_REGION:
            return "referent";
          case ROLES.RESPONSIBLE:
          case ROLES.SUPERVISOR:
            return "structure";
          case ROLES.HEAD_CENTER:
            return "head_center";
          default:
            return "public";
        }
      })();
    }
    next();
  } catch (e) {
    next(e);
  }
};

router.get("/:allowedRole(admin|referent|young|public)/search", setAllowedRoleMiddleWare, async (req, res) => {
  try {
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-multi-match-query.html#multi-match-types
    const response = await esClient.search({
      index: "knowledgebase",
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: req.query.search,
                  fields: ["title^3", "contentAsText"],
                },
              },
            ],
            filter: [
              {
                term: { "allowedRoles.keyword": req.allowedRole },
              },
            ],
          },
        },
        size: 1000,
      },
    });
    return res.status(200).send({
      ok: true,
      data: response.body.hits.hits.map((hit) => ({
        _id: hit._id,
        ...hit._source,
      })),
    });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }

  // reset and redo es indexing
  // (async () => {
  //   let i = 0;
  //   for await (const doc of KnowledgeBaseObject.find([{ $sort: { _id: 1 } }]).cursor()) {
  //     await doc.index();
  //     if (i % 100 === 0) console.log(i, doc._id);
  //     i++;
  //   }
  //   console.log("DONE");
  // })();
});

// this is for the public-access part of the knowledge base (not the admin part)
router.get("/:allowedRole(referent|young|public)/:slug", setAllowedRoleMiddleWare, async (req, res) => {
  try {
    const existingKb = await KnowledgeBaseObject.findOne({ slug: req.params.slug, allowedRoles: req.allowedRole })
      .populate({
        path: "author",
        select: "_id firstName lastName role",
      })
      .lean(); // to json

    if (!existingKb) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const parents = await findParents(existingKb);
    existingKb.parents = parents;

    if (existingKb.type === "section") {
      const children = await KnowledgeBaseObject.find({ parentId: existingKb._id, allowedRoles: req.allowedRole })
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

// this is for the public-access part of the knowledge base (not the admin part)
router.get("/:allowedRole(referent|young|public)", setAllowedRoleMiddleWare, async (req, res) => {
  try {
    const children = await KnowledgeBaseObject.find({ parentId: null, allowedRoles: req.allowedRole })
      .sort({ type: -1, position: 1 })
      .populate({ path: "author", select: "_id firstName lastName role" })
      .lean(); // to json;

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
    // check if there is no reference of existing article/section in links
    const slugs = [kb, ...childrenToDelete].map((item) => item.slug);
    const articlesReferingItemsToDelete = [];
    const articlesNotToDelete = await KnowledgeBaseObject.find({ type: "article", _id: { $nin: [kb, ...childrenToDelete].map((item) => item._id) } });
    for (const slug of slugs) {
      for (const article of articlesNotToDelete) {
        const hasSlug = findArticlesWithSlug(slug, article.content);
        if (hasSlug) articlesReferingItemsToDelete.push(article);
      }
    }

    if (articlesReferingItemsToDelete.length) {
      return res.status(400).send({
        ok: true,
        data: articlesReferingItemsToDelete,
        error: `Il y a une référence de l'élément que vous souhaitez supprimer dans d'autres articles, veuillez les mettre à jour: ${articlesReferingItemsToDelete.map(
          (article) => `\n${article.title}`,
        )}`,
      });
    }

    // delete items
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
