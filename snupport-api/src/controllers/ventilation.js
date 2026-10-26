const express = require("express");
const router = express.Router();
const VentilationModel = require("../models/ventilation");
const  { agentGuard } = require("../middlewares/authenticationGuards");
const { requireRole } = require("../middlewares/userRoleGuards");
const { validateParams, validateBody, idSchema } = require("../middlewares/validation");
const Joi = require("joi");
const { SCHEMA_ID, SCHEMA_SOURCE, SCHEMA_TICKET_STATUS } = require("../schemas");
const { ERRORS } = require("../errors");
const { canManageOwnedResource, scopeOwnedResourceQuery } = require("../utils/ownedResourceScope");

const SCHEMA_CONDITION = Joi.object({
  field: Joi.string().valid("status", "number", "subject", "agentId", "createdAt", "updatedAt", "tags", "textMessage", "lastUpdateAgent", "contactGroup", "contactEmail", "source", "contactDepartment", "contactRegion"),
  operator: Joi.string().when('field', {
    switch: [
        { is: Joi.valid("subject", "tags", "textMessage", "contactEmail"), then: Joi.valid("contains", "not contains") },
        { is: Joi.valid("number", "createdAt", "updatedAt"), then: Joi.valid("smaller", "greater") },
    ],
    otherwise: Joi.valid("is", "is not")
  }),
  value: Joi.when('field', {
    switch: [
        { is: "status", then: SCHEMA_TICKET_STATUS },
        { is: "number", then: Joi.number().integer().positive() },
        { is: "source", then: SCHEMA_SOURCE },
        { is: "contactGroup", then: Joi.valid("unknown", "admin exterior", "young exterior", "responsible", "supervisor", "head_center", "referent_region", "referent_department", "visitor", "young", "parent", "admin", "administrateur_cle", "referent_classe", "transporter", "dsnj", "injep", "moderator") },
        { is: Joi.valid("createdAt", "updatedAt"), then: Joi.date() },
        { is: Joi.valid("agentId", "lastUpdateAgent"), then: SCHEMA_ID },
        { is: Joi.valid("number", "createdAt", "updatedAt"), then: Joi.valid("smaller", "greater") },
    ],
    otherwise: Joi.string().trim()
  }),
});
const SCHEMA_VENTILATION = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string().trim(),
  active: Joi.boolean(),
  actions: Joi.array().items(Joi.object({
    action: Joi.string().valid("SET"),
    field: Joi.string().valid("status", "agentId", "foldersId", "tag"),
    value: Joi.string().when('field', {
      switch: [
          { is: "status", then: SCHEMA_TICKET_STATUS },
      ],
      otherwise: SCHEMA_ID,
    }),
  })),
  conditionsEt: Joi.array().items(SCHEMA_CONDITION),
  conditionsOu: Joi.array().items(SCHEMA_CONDITION),
});

router.use(agentGuard);

// Les règles de ventilation s'exécutent automatiquement sur les tickets entrants. Chaque règle
// appartient à un rôle (AGENT central, ou un référent départemental / régional) : un compte ne crée,
// ne lit, ne modifie et ne supprime que les règles de son propre périmètre. Le champ `userRole` (et le
// territoire pour les référents) est forcé côté serveur à la création — il n'est de toute façon pas
// dans le schéma de validation, donc rejeté s'il est fourni dans le corps.
// Aucun usage légitime documenté côté UI pour un référent (setting/index.jsx L79 : écran réservé à
// AGENT) : la création est désormais réservée au support central (PM47).
router.post("/",
  requireRole("AGENT"),
  validateBody(SCHEMA_VENTILATION.prefs({ presence: 'required' })),
  async (req, res) => {
    await VentilationModel.create({ ...req.cleanBody, userRole: req.user.role });
    return res.status(200).send({ ok: true });
  }
);

// AGENT et DG sont le support central : ils voient toutes les règles, y compris celles des
// référents, pour pouvoir superviser la ventilation (PL22). DG n'est pas un `userRole` possible
// d'une règle (pas de ressources qui lui appartiennent), seulement un rôle d'agent lecteur.
const isCentralSupport = (user) => user.role === "AGENT" || user.role === "DG";

router.get("/", async (req, res) => {
  const ventilation = await VentilationModel.find(isCentralSupport(req.user) ? {} : scopeOwnedResourceQuery(req.user));
  return res.status(200).send({ ok: true, data: ventilation });
});

router.patch("/:id",
  validateParams(idSchema),
  validateBody(SCHEMA_VENTILATION.min(1)),
  async (req, res) => {
    const ventilation = await VentilationModel.findById(req.cleanParams.id);
    if (!ventilation) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    // Un agent central peut neutraliser une règle de référent (désactivation seule), pas la
    // réécrire : au-delà de `active:false`, le périmètre par propriétaire s'applique comme avant (PL22).
    const isDeactivationOnly = Object.keys(req.cleanBody).length === 1 && req.cleanBody.active === false;
    const canBypassAsAgent = req.user.role === "AGENT" && isDeactivationOnly;
    if (!canManageOwnedResource(req.user, ventilation) && !canBypassAsAgent) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    await VentilationModel.findOneAndUpdate({ _id: ventilation._id }, req.cleanBody);
    return res.status(200).send({ ok: true });
  }
);

router.delete("/:id",
  validateParams(idSchema),
  async (req, res) => {
    const ventilation = await VentilationModel.findById(req.cleanParams.id);
    if (!ventilation) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    // Un agent central peut toujours supprimer une règle de référent (PL22).
    const canBypassAsAgent = req.user.role === "AGENT";
    if (!canManageOwnedResource(req.user, ventilation) && !canBypassAsAgent) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    await VentilationModel.findByIdAndDelete(ventilation._id);
    return res.status(200).send({ ok: true });
  }
);

module.exports = router;
