/* eslint-disable no-prototype-builtins */
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const slugify = require("slugify");

const KnowledgeBaseModel = require("../models/knowledgeBase");
const KbSearchModel = require("../models/kbSearch");
const { uploadPublicPicture, diacriticSensitiveRegex } = require("../utils/index.js");
const { ERRORS } = require("../errors");
const { revalidateSiteMap, formatSectionsIntoSitemap } = require("../utils/sitemap.utils");
const  { agentGuard } = require("../middlewares/authenticationGuards");
const { requireRole } = require("../middlewares/userRoleGuards");
const { validateParams, validateBody, validateQuery, idSchema } = require("../middlewares/validation");
const { SCHEMA_ID } = require("../schemas");
const escapeStringRegexp = require("escape-string-regexp");


function search_regex(query) {
  return diacriticSensitiveRegex(escapeStringRegexp(query));
}

const SCHEMA_ROLE = Joi.string().valid("public", "young", "young_cle", "structure", "referent", "referent_sanitaire", "head_center", "head_center_adjoint", "visitor", "transporter", "referent_classe", "admin", "administrateur_cle", "administrateur_cle_coordinateur_cle", "administrateur_cle_referent_etablissement", "responsible");

const findChildrenRecursive = async (section, allChildren, { findAll = false }) => {
  if (section.type !== "section") return;
  const children = await KnowledgeBaseModel.find({ parentId: section._id })
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
    const parent = await KnowledgeBaseModel.findById(currentItem.parentId).lean(); // to json;
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
        await KnowledgeBaseModel.findByIdAndUpdate(child._id, {
          allowedRoles: [...child.allowedRoles.filter((role) => section.allowedRoles.includes(role)), ...childNewAllowedRoles],
        });
      }
      await checkAllowedRoles(child);
    }
  };
  checkAllowedRoles(tree);
};

const findArticlesWithSlug = (slug, content) => {
  if (!content) return false;
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
  const articles = await KnowledgeBaseModel.find({ type: "article", slug: { $ne: newSlug } });
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
    if (!!content && JSON.stringify(content).includes(oldSlug)) {
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
  let itemWithSameSlug = await KnowledgeBaseModel.findOne({ slug });
  let inc = 0;
  let newSlug = slug;
  while (itemWithSameSlug) {
    inc++;
    newSlug = `${slug}-${inc}`;
    itemWithSameSlug = await KnowledgeBaseModel.findOne({ slug: newSlug });
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

router.post("/:allowedRole/siblings",
  validateParams(Joi.object({
    allowedRole: SCHEMA_ROLE,
  }).prefs({ presence: 'required' })),
  validateBody(Joi.object({
    parentId: SCHEMA_ID,
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    const siblings = await KnowledgeBaseModel.find({ ...req.cleanParams, ...req.cleanBody }).lean();

    return res.status(200).send({ siblings: siblings, ok: true });
  }
);

router.post("/picture", agentGuard, async (req, res) => {
  const files = Object.keys(req.files || {}).map((e) => req.files[e]);
  let file = files[0];
  // If multiple file with same names are provided, file is an array. We just take the latest.
  if (Array.isArray(file)) {
    file = file[file.length - 1];
  }
  const { name, data, mimetype } = file;
  if (!["image/jpeg", "image/png"].includes(mimetype)) return res.status(400).send({ ok: false, code: "UNSUPPORTED_TYPE" });

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
});

router.post("/",
  agentGuard,
  validateBody(Joi.object({
    title: Joi.string().trim(),
    status: Joi.string().valid("DRAFT", "PUBLISHED", "ARCHIVED").default("DRAFT"),
    type: Joi.string().valid("section", "article"),
    position: Joi.number().integer().positive(),
    allowedRoles: Joi.array().items(SCHEMA_ROLE),
    parentId: SCHEMA_ID.optional(),
    description: Joi.string().optional(),
    keywords: Joi.string().optional(),
    content: Joi.string().optional(),
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    const slug = await getSlug(req.cleanBody.title);
    const kb = {
      ...req.cleanBody, 
      author: req.user._id,
      slug,
    };

    if (req.cleanBody.content) {
      kb.contentAsText = getContentAsText(req.cleanBody.content);
    }

    if (kb.parentId) {
      const parent = await KnowledgeBaseModel.findById(kb.parentId);
      if (parent) {
        kb.allowedRoles = req.cleanBody.allowedRoles.filter((role) => parent.allowedRoles.includes(role));
      }
    }

    const newKb = await KnowledgeBaseModel.create(kb);
    await revalidateSiteMap();

    const data = await KnowledgeBaseModel.findById(newKb._id).populate({ path: "author", select: "_id firstName lastName role" }).lean();
    return res.status(200).send({ ok: true, data });
  }
);

router.post("/duplicate/:id",
  agentGuard,
  validateParams(idSchema),
  async (req, res) => {
    const oldKb = await KnowledgeBaseModel.findById(req.cleanParams.id);
    if (!oldKb) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    //duplicate old kb
    const newKb = await KnowledgeBaseModel.create({
      type: oldKb.type,
      parentId: oldKb.parentId,
      position: oldKb.position + 1,
      title: oldKb.title + " - (Copie)",
      slug: oldKb.slug + "-copie",
      allowedRoles: oldKb.allowedRoles,
      status: "DRAFT",
      author: req.user._id,
      icon: oldKb.icon,
      content: oldKb.content,
      contentAsText: oldKb.contentAsText,
      group: oldKb.group,
      keywords: oldKb.keywords,
    });
    await revalidateSiteMap();
    const data = await KnowledgeBaseModel.findById(newKb._id).populate({ path: "author", select: "_id firstName lastName role" }).lean();
    return res.status(200).send({ ok: true, data });
  }
);

// this is when reordering by drag and drop, in the tree or in a section
router.put("/reorder",
  agentGuard,
  validateBody(Joi.array().items(Joi.object({
    _id: SCHEMA_ID,
    position: Joi.number().integer().positive(),
    parentId: SCHEMA_ID.optional(),
    allowedRoles: Joi.array().items(SCHEMA_ROLE),
  })).prefs({ presence: 'required' })),
  async (req, res) => {
    const itemsToReorder = req.cleanBody;
    const session = await KnowledgeBaseModel.startSession();
    await session.withTransaction(async () => {
      for (const item of itemsToReorder) {
        await KnowledgeBaseModel.findByIdAndUpdate(item._id, { position: item.position, parentId: item.parentId || null });
        await consolidateAllowedRoles(item, item.allowedRoles);
      }
    });
    session.endSession();
    await revalidateSiteMap();
    const data = await KnowledgeBaseModel.find().populate({ path: "author", select: "_id firstName lastName role" });
    return res.status(200).send({ ok: true, data });
  }
);

router.patch("/:id",
  agentGuard,
  validateParams(idSchema),
  validateBody(Joi.object({
    title: Joi.string().trim(),
    status: Joi.string().valid("DRAFT", "PUBLISHED", "ARCHIVED").default("DRAFT"),
    type: Joi.string().valid("section", "article"),
    position: Joi.number().integer().positive(),
    allowedRoles: Joi.array().items(SCHEMA_ROLE),
    parentId: SCHEMA_ID,
    description: Joi.string(),
    keywords: Joi.string(),
    content: Joi.string(),
    group: Joi.string().token(),
    icon: Joi.string().token(),
    author: SCHEMA_ID,
    read: Joi.number().integer().min(0),
    imageSrc: Joi.string().uri(),
    imageAlt: Joi.string().token(),
    slug: Joi.string().pattern(/^[0-9a-z-]+$/),
  }).min(1)),
  async (req, res) => {
    const existingKb = await KnowledgeBaseModel.findById(req.cleanParams.id);
    if (!existingKb) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const updateKb = { ...req.cleanBody };
    let updateChildrenAllowedRoles = false;
    let oldSlugToUpdate = null;
    let newAllowedRoles = [];

    if (req.cleanBody.status === "ARCHIVED") {
      updateKb.parentId = "637df076cf15bd3fed5ff754";
    }

    if (req.cleanBody.slug) {
      if (req.cleanBody.slug !== existingKb.slug) {
        updateKb.slug = await getSlug(req.cleanBody.slug);
        if (existingKb.slug !== updateKb.slug) oldSlugToUpdate = existingKb.slug;
      }
    }
    if (req.cleanBody.allowedRoles) {
      if (JSON.stringify(existingKb.allowedRoles) !== JSON.stringify(updateKb.allowedRoles)) {
        if (existingKb.parentId) {
          const parent = await KnowledgeBaseModel.findById(existingKb.parentId);
          if (parent) {
            updateKb.allowedRoles = req.cleanBody.allowedRoles.filter((role) => parent.allowedRoles.includes(role));
          }
        }
        newAllowedRoles = updateKb.allowedRoles.filter((role) => !existingKb.allowedRoles.includes(role));
        updateChildrenAllowedRoles = true;
      }
    }

    existingKb.set(updateKb);
    await existingKb.save({ fromUser: req.user });

    if (updateChildrenAllowedRoles) {
      await consolidateAllowedRoles(existingKb, newAllowedRoles);
    }

    if (oldSlugToUpdate) {
      await findAndUpdateArticlesWithLinksWithSlug(oldSlugToUpdate, existingKb.slug);
    }

    await revalidateSiteMap();

    return res.status(200).send({
      ok: true,
      data: await KnowledgeBaseModel.findById(existingKb._id).populate({ path: "author", select: "_id firstName lastName role" }).lean(), // to json,
    });
  }
);

router.put("/:id/content",
  agentGuard,
  validateParams(idSchema),
  validateBody(Joi.object({
    content: Joi.array(),
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    const existingKb = await KnowledgeBaseModel.findById(req.cleanParams.id);
    if (!existingKb) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const updateKb = {};

    updateKb.content = req.cleanBody.content;
    updateKb.contentAsText = getContentAsText(req.cleanBody.content);
    updateKb.contentUpdatedAt = new Date();

    existingKb.set(updateKb);
    await existingKb.save({ fromUser: req.user });

    if (existingKb.type === "section") await revalidateSiteMap();

    return res.status(200).send({
      ok: true,
      data: await KnowledgeBaseModel.findById(existingKb._id).populate({ path: "author", select: "_id firstName lastName role" }).lean(), // to json,
    });
  }
);

router.get("/sitemap", async (req, res) => {
  const pipeline = [{ $match: { status: "PUBLISHED" } }, { $group: { _id: "$parentId", count: { $sum: 1 } } }];
  const sections = await KnowledgeBaseModel.aggregate(pipeline);
  // Filter out null group (sections and orphaned items) and map the rest into an array of IDs.
  const sectionIds = sections.filter((e) => e._id).map((e) => e._id.toString());
  const data = await KnowledgeBaseModel.find(
    { type: "section", status: "PUBLISHED", _id: { $in: sectionIds } },
    { title: 1, slug: 1, parentId: 1, position: 1, allowedRoles: 1 }
  );
  if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
  return res.status(200).send({ ok: true, data: formatSectionsIntoSitemap(data) });
});

router.post("/all",
  agentGuard,
  validateBody(Joi.object({
    allowedRoles: Joi.array().items(SCHEMA_ROLE),
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    const data = await KnowledgeBaseModel.find({}).populate({ path: "author", select: "_id firstName lastName role" });
    const filteredData = data.filter((item) =>
      item.type === "section" || req.cleanBody.allowedRoles.length > 0 ? req.cleanBody.allowedRoles?.every((v) => item.allowedRoles.includes(v)) : true
    );

    return res.status(200).send({ ok: true, data: filteredData });
  }
);

router.get("/:allowedRole/search",
  validateParams(Joi.object({
    allowedRole: SCHEMA_ROLE,
  }).prefs({ presence: 'required' })),
  validateQuery(Joi.object({
    search: Joi.string(),
  }).prefs({ presence: 'required', stripUnknown: true })),
  async (req, res) => {
    if (req.cleanQuery.search.length < 3) {
      res.status(200).send({
        ok: true,
        data: [],
      });
      return
    }
    const regex = {
      $regex: search_regex(req.cleanQuery.search),
      $options: 'i',
    }
    const query = {
      $or:  [
        { title: regex },
        { keywords: regex },
      ]
    };
    if (req.cleanParams.allowedRole !== "admin") {
      query.allowedRoles = req.cleanParams.allowedRole;
      query.status = "PUBLISHED";
    }
    const results = await KnowledgeBaseModel.find(query).limit(20);

    await KbSearchModel.create({
      search: req.cleanQuery.search,
      role: req.cleanParams.allowedRole,
      resultsNumber: results.length,
    });

    res.status(200).send({
      ok: true,
      data: results,
    });
  }
);


// this is for the public-access part of the knowledge base (not the admin part)
router.get("/:allowedRole/:slug",
  validateParams(Joi.object({
    allowedRole: SCHEMA_ROLE,
    slug: Joi.string(),
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    const existingKb = await KnowledgeBaseModel.findOne({ slug: req.cleanParams.slug, allowedRoles: req.cleanParams.allowedRole, status: "PUBLISHED" })
      .populate({
        path: "author",
        select: "_id firstName lastName role",
      })
      .lean(); // to json

    if (!existingKb) {
      // if already connected and document not existing with specified role, we just return NOT_FOUND
      if (req.cleanParams.allowedRole !== "public") return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      // if not connected yet, we check if the document exists for specific roles
      const existingKbDifferentRole = await KnowledgeBaseModel.findOne({ slug: req.cleanParams.slug, status: "PUBLISHED" })
        .populate({
          path: "author",
          select: "_id firstName lastName role",
        })
        .lean(); // to json
      if (!existingKbDifferentRole) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      // this should trigger login modal
      return res.status(400).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    if (req.cleanParams.allowedRole !== "admin") {
      await KnowledgeBaseModel.findByIdAndUpdate(existingKb._id, { $inc: { read: 1 } });
    }

    const parents = await findParents(existingKb);
    existingKb.parents = parents;

    if (existingKb.type === "section") {
      const children = await KnowledgeBaseModel.find({ parentId: existingKb._id, allowedRoles: req.cleanParams.allowedRole, status: "PUBLISHED" })
        .sort({ type: -1, position: 1 })
        .populate({ path: "author", select: "_id firstName lastName role" })
        .lean(); // to json;
      existingKb.children = children;
      for (const child of existingKb.children) {
        if (child.type === "section") {
          const subChildren = await KnowledgeBaseModel.find({ parentId: child._id, allowedRoles: req.cleanParams.allowedRole, status: "PUBLISHED" })
            .sort({ type: -1, position: 1 })
            .populate({ path: "author", select: "_id firstName lastName role" })
            .lean(); // to json;
          child.children = subChildren;
        }
      }
    }

    return res.status(200).send({ ok: true, data: existingKb });
  }
);

// this is for the public-access part of the knowledge base (not the admin part)
router.get("/:allowedRole",
  validateParams(Joi.object({
    allowedRole: SCHEMA_ROLE,
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    const children = await KnowledgeBaseModel.find({ allowedRoles: req.cleanParams.allowedRole, status: "PUBLISHED" })
      .sort({ parentId: 1, type: -1, position: 1 })
      .populate({ path: "author", select: "_id firstName lastName role" })
      .lean(); // to json;

    const data = [];
    children.forEach((child) => {
      if (!child.parentId) {
        data.push(child);
      } else {
        const parent = data.find((item) => item._id.toString() === child.parentId.toString());
        if (!parent) return;
        if (!parent.children) parent.children = [];
        parent.children.push(child);
      }
    });

    return res.status(200).send({ ok: true, data });
  }
);

router.delete("/:id",
  validateParams(idSchema),
  agentGuard, async (req, res) => {
    const kb = await KnowledgeBaseModel.findById(req.cleanParams.id);
    if (!kb) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const childrenToDelete = await findChildren(kb, true);
    // check if there is no reference of existing article/section in links
    const slugs = [kb, ...childrenToDelete].map((item) => item.slug);
    const articlesReferingItemsToDelete = [];
    const articlesNotToDelete = await KnowledgeBaseModel.find({ type: "article", _id: { $nin: [kb, ...childrenToDelete].map((item) => item._id) } });
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
        code: "ARTICLES_REFERING_TO_ITEMS",
        // error: `Il y a une référence de l'élément que vous souhaitez supprimer dans d'autres articles, veuillez les mettre à jour: ${articlesReferingItemsToDelete.map(
        //   (article) => `\n${article.title}`,
        // )}`,
      });
    }

    // delete items
    for (const child of [kb, ...childrenToDelete]) {
      await KnowledgeBaseModel.findByIdAndDelete(child._id);
    }

    if (kb.type === "section") await revalidateSiteMap();

    res.status(200).send({ ok: true });
  }
);

/*
Routes deleted as not used :
GET /knowledge-base/all
GET /knowledge-base/<allowedRole>/top4article/<number>
*/

module.exports = router;
