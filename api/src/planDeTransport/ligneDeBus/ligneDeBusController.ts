import express, { Response } from "express";
import passport from "passport";
import Joi from "joi";
import mongoose from "mongoose";
import { config } from "../../config";
import {
  formatStringLongDate,
  isIsoDate,
  translateBusPatchesField,
  canExportConvoyeur,
  isAdmin,
  SENDINBLUE_TEMPLATES,
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
  isReadAuthorized,
} from "snu-lib";
import { LigneBusModel, LigneToPointModel, PointDeRassemblementModel, CohesionCenterModel, SchemaDeRepartitionModel, ReferentModel, CohortModel } from "../../models";
import { capture } from "../../sentry";
import { sendTemplate } from "../../brevo";
import { ERRORS } from "../../utils";
import { validateId } from "../../utils/validator";
import { UserRequest } from "../../controllers/request";
import { getInfoBus } from "./ligneDeBusService";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { permissionAccessControlMiddleware } from "../../middlewares/permissionAccessControlMiddleware";
import { getCenterIdsInUserScope, isLigneBusInUserScope, serializeLigneBus, serializeLigneBusList, canViewConvoyeurTeam } from "../../services/sejourAccess";

const router = express.Router();

/**
 * Récupère toutes les ligneBus +  les points de rassemblemnts associés
 */
router.get(
  "/all",
  authMiddleware("referent"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.LIGNE_BUS, action: PERMISSION_ACTIONS.READ }]),
  async (req: UserRequest, res: Response) => {
    try {
      // Sans périmètre, cette route renvoyait le plan de transport national complet.
      const centerIds = await getCenterIdsInUserScope(req.user);
      const scopeFilter = centerIds === null ? {} : { centerId: { $in: centerIds } };
      const ligneBus = await LigneBusModel.find({ deletedAt: { $exists: false }, ...scopeFilter });
      let arrayMeetingPoints = [];
      // @ts-ignore
      ligneBus.map((l) => (arrayMeetingPoints = arrayMeetingPoints.concat(l.meetingPointsIds)));
      const meetingPoints = await PointDeRassemblementModel.find({ _id: { $in: arrayMeetingPoints }, deletedAt: { $exists: false } });
      const ligneToPoints = await LigneToPointModel.find({ lineId: { $in: ligneBus.map((l) => l._id) } });
      return res.status(200).send({ ok: true, data: { ligneBus: serializeLigneBusList(ligneBus, req.user), meetingPoints, ligneToPoints } });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

//Récupère toutes les ligneBus + les centres associés

router.get(
  "/cohort/:cohort",
  authMiddleware("referent"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.LIGNE_BUS, action: PERMISSION_ACTIONS.READ }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value } = Joi.object({
        cohort: Joi.string().required(),
      }).validate(req.params);
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      if (!canExportConvoyeur(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      const { cohort } = value;

      const centerIds = await getCenterIdsInUserScope(req.user);
      const scopeFilter = centerIds === null ? {} : { centerId: { $in: centerIds } };
      const ligneBus = await LigneBusModel.find({ cohort: { $in: [cohort] }, deletedAt: { $exists: false }, ...scopeFilter });
      let arrayCenter = [];
      // @ts-ignore
      ligneBus.map((l) => (arrayCenter = arrayCenter.concat(l.centerId)));
      const centers = await CohesionCenterModel.find({ _id: { $in: arrayCenter } });
      return res.status(200).send({ ok: true, data: { ligneBus: serializeLigneBusList(ligneBus, req.user), centers } });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/:id",
  authMiddleware("referent"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.LIGNE_BUS, action: PERMISSION_ACTIONS.READ }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value } = Joi.object({
        id: Joi.string().required(),
      }).validate(req.params);

      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const { id } = value;

      const ligneBus = await LigneBusModel.findById(id);
      if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      // Périmètre : la permission LIGNE_BUS:READ est seedée sans policy, elle vaut donc
      // accès national pour tout référent départemental / régional.
      if (!(await isLigneBusInUserScope(req.user, ligneBus))) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      const infoBus = await getInfoBus(ligneBus);
      return res.status(200).send({ ok: true, data: serializeLigneBus(infoBus, req.user) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/:id/availablePDRByRegion",
  authMiddleware("referent"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.LIGNE_BUS, action: PERMISSION_ACTIONS.READ }]),
  async (req: UserRequest, res) => {
    try {
      const { error, value } = Joi.object({
        id: Joi.string().required(),
      }).validate(req.params);

      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const { id } = value;

      const ligneBus = await LigneBusModel.findById(id);
      if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      // Périmètre : la permission LIGNE_BUS:READ est seedée sans policy, elle vaut donc
      // accès national pour tout référent départemental / régional.
      if (!(await isLigneBusInUserScope(req.user, ligneBus))) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      if (!ligneBus.meetingPointsIds.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const pointDeRassemblement = await PointDeRassemblementModel.findById(ligneBus.meetingPointsIds[0]);
      if (!pointDeRassemblement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const PDR = await PointDeRassemblementModel.find({ region: pointDeRassemblement.region, deletedAt: { $exists: false } });

      return res.status(200).send({ ok: true, data: PDR });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/:id/availablePDR",
  authMiddleware("referent"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.LIGNE_BUS, action: PERMISSION_ACTIONS.READ }]),
  async (req: UserRequest, res) => {
    try {
      const { error, value } = Joi.object({
        id: Joi.string().required(),
      }).validate(req.params);

      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const { id } = value;

      const ligneBus = await LigneBusModel.findById(id);
      if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      // Périmètre : la permission LIGNE_BUS:READ est seedée sans policy, elle vaut donc
      // accès national pour tout référent départemental / régional.
      if (!(await isLigneBusInUserScope(req.user, ligneBus))) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      const listGroup = await SchemaDeRepartitionModel.find({ centerId: ligneBus.centerId });

      let idPDR: string[] = [];
      for (let group of listGroup) {
        for (let pdr of group.gatheringPlaces) {
          if (!idPDR.includes(pdr)) {
            idPDR.push(pdr);
          }
        }
      }

      const PDR = await PointDeRassemblementModel.find({ _id: { $in: idPDR }, deletedAt: { $exists: false } });

      return res.status(200).send({ ok: true, data: PDR });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/:id/ligne-to-points",
  authMiddleware("referent"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.LIGNE_BUS, action: PERMISSION_ACTIONS.READ }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value } = Joi.object({
        id: Joi.string().required(),
      }).validate(req.params);

      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const { id } = value;

      const ligneBus = await LigneBusModel.findById(id);
      if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      // Périmètre : la permission LIGNE_BUS:READ est seedée sans policy, elle vaut donc
      // accès national pour tout référent départemental / régional.
      if (!(await isLigneBusInUserScope(req.user, ligneBus))) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      const ligneToPoints = await LigneToPointModel.find({ lineId: id, meetingPointId: { $in: ligneBus.meetingPointsIds }, deletedAt: { $exists: false } });

      for (let ligneToPoint of ligneToPoints) {
        const meetingPoint = await PointDeRassemblementModel.findById(ligneToPoint.meetingPointId);
        // @ts-ignore
        ligneToPoint._doc.meetingPoint = meetingPoint;
      }

      return res.status(200).send({ ok: true, data: ligneToPoints });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/:id/data-for-check",
  authMiddleware("referent"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.LIGNE_BUS, action: PERMISSION_ACTIONS.READ }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value: id } = validateId(req.params.id);

      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const ligneBus = await LigneBusModel.findById(id);
      if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      // Périmètre : la permission LIGNE_BUS:READ est seedée sans policy, elle vaut donc
      // accès national pour tout référent départemental / régional.
      if (!(await isLigneBusInUserScope(req.user, ligneBus))) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      //Get all youngs for this ligne and by meeting point
      const queryYoung = [
        { $match: { _id: ligneBus._id } },
        { $unwind: "$meetingPointsIds" },
        {
          $lookup: {
            from: "youngs",
            let: { meetingPoint: "$meetingPointsIds" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$cohort", ligneBus.cohort] },
                      { $eq: ["$status", "VALIDATED"] },
                      { $eq: ["$sessionPhase1Id", ligneBus.sessionId] },
                      { $eq: ["$ligneId", ligneBus._id.toString()] },
                      { $eq: ["$meetingPointId", "$$meetingPoint"] },
                      { $ne: ["$cohesionStayPresence", "false"] },
                      { $ne: ["$departInform", "true"] },
                    ],
                  },
                },
              },
            ],
            as: "youngs",
          },
        },
        {
          $lookup: {
            from: "youngs",
            let: { id: ligneBus._id.toString() },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$ligneId", "$$id"] }, { $eq: ["$status", "VALIDATED"] }],
                  },
                },
              },
            ],
            as: "youngsBus",
          },
        },
        {
          $project: { meetingPointsIds: 1, youngsCount: { $size: "$youngs" }, youngsBusCount: { $size: "$youngsBus" } },
        },
      ];

      const dataYoung = await LigneBusModel.aggregate(queryYoung).exec();

      let result: any = {
        meetingPoints: [],
      };
      let youngsCountBus = 0;
      for (let data of dataYoung) {
        result.meetingPoints.push({ youngsCount: data.youngsCount, meetingPointId: data.meetingPointsIds });
        youngsCountBus = data.youngsBusCount;
      }
      result.youngsCountBus = youngsCountBus;

      //Get young volume need for the destination center in bus
      const dataBus = await LigneBusModel.find({ sessionId: ligneBus.sessionId, _id: { $ne: ligneBus._id } });

      let busVolume = 0;
      for (let data of dataBus) {
        busVolume += data.youngCapacity;
      }

      result.busVolume = busVolume;

      return res.status(200).send({ ok: true, data: result });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/cohort/:cohort/hasValue",
  authMiddleware("referent"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.LIGNE_BUS, action: PERMISSION_ACTIONS.READ }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value } = Joi.object({
        cohort: Joi.string().required(),
      }).validate({ ...req.params });

      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

      let { cohort } = value;

      const ligne = await LigneBusModel.findOne({ cohort });

      return res.status(200).send({ ok: true, data: !!ligne });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

const PATCHES_COUNT_PER_PAGE = 20;
const HIDDEN_FIELDS = ["/missionsInMail", "/historic", "/uploadedAt", "/sessionPhase1Id", "/correctedAt", "/lastStatusAt", "/token", "/Token"];
/** Les patches `team/...` portent l'état civil, la date de naissance, l'email et le téléphone des accompagnateurs. */
const isConvoyeurTeamPath = (path: string) => typeof path === "string" && path.startsWith("/team");
const IGNORED_VALUES = [null, undefined, "", "Vide", "[]", false];

/**
 * Pour l'historique du plan de transport, permet de récupérer la liste des options des filtres
 */
router.get("/patches/filter-options", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    // Même garde que /patches/:cohort : les auteurs (email, rôle, département) étaient
    // lisibles par tout compte référent, et sur tout le territoire.
    if (!isReadAuthorized({ resource: PERMISSION_RESOURCES.PATCH, action: PERMISSION_ACTIONS.READ, user: req.user! })) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    const scopedCenterIds = await getCenterIdsInUserScope(req.user);
    if (scopedCenterIds !== null && scopedCenterIds.length === 0) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    let busLineFilter = {};
    let lineToPointFilter = {};
    if (scopedCenterIds !== null) {
      const lines = await LigneBusModel.find({ centerId: { $in: scopedCenterIds } }, { _id: 1 });
      const lineIds = lines.map((line) => line._id);
      const lineToPoints = await LigneToPointModel.find({ lineId: { $in: lineIds.map((id) => id.toString()) } }, { _id: 1 });
      busLineFilter = { ref: { $in: lineIds } };
      lineToPointFilter = { ref: { $in: lineToPoints.map((ltp) => ltp._id) } };
    }

    const db = mongoose.connection.db;
    const busline = {
      op: await db.collection("lignebus_patches").distinct("ops.op", busLineFilter),
      path: await db.collection("lignebus_patches").distinct("ops.path", busLineFilter),
      user: await db.collection("lignebus_patches").distinct("user", busLineFilter),
    };
    const lineToPoint = {
      op: await db.collection("lignetopoint_patches").distinct("ops.op", lineToPointFilter),
      path: await db.collection("lignetopoint_patches").distinct("ops.path", lineToPointFilter),
      user: await db.collection("lignetopoint_patches").distinct("user", lineToPointFilter),
    };

    const op = mergeArrayItems([...busline.op, ...lineToPoint.op]);
    const path = mergeArrayItems([...busline.path, ...lineToPoint.path]).filter((key) => canViewConvoyeurTeam(req.user) || key !== "team"); // clés sans « / » (pathToKey)
    // Le filtre n'affiche que le nom de l'auteur : email, rôle et département ne sortent plus.
    const user = mergeArrayItems([...busline.user, ...lineToPoint.user], "_id").map(({ _id, firstName, lastName }) => ({ _id, firstName, lastName }));

    return res.status(200).send({
      ok: true,
      data: { op, path, user },
    });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

/**
 * Historique des plan de transports
 * (on cherche l'historique dans 3 patches (lignebus, modificationBus et ligneToPoint)
 */
router.get("/patches/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    // --- validate data
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
    }).validate(req.params);
    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { error: errorQuery, value: valueQuery } = Joi.object({
      offset: Joi.number(),
      limit: Joi.number().default(PATCHES_COUNT_PER_PAGE),
      page: Joi.number()
        .integer()
        .default(0)
        .custom((value, helpers) => {
          if (value < 0) {
            return 0;
          }
          return value;
        }),
      op: Joi.string(),
      path: Joi.string(),
      userId: Joi.string(),
      query: Joi.string().trim().lowercase(),
      nopagination: Joi.string(),
      // filter: Joi.string().trim().allow("", null),
    }).validate(req.query, {
      stripUnknown: true,
    });
    if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    let { offset, limit, page, op: filterOp, path: filterPath, userId: filterUserId, query: filterQuery, nopagination } = valueQuery;
    if (filterQuery && filterQuery.trim().length === 0) {
      filterQuery = undefined;
    }

    // --- security
    if (!isReadAuthorized({ resource: PERMISSION_RESOURCES.PATCH, action: PERMISSION_ACTIONS.READ, user: req.user! })) {
      throw new Error(ERRORS.OPERATION_UNAUTHORIZED);
    }
    // PATCHES:READ est porté par des rôles à périmètre (référent de classe, administrateur CLE…) :
    // sans filtre, l'historique national du plan de transport était lisible par tous.
    const scopedCenterIds = await getCenterIdsInUserScope(req.user);
    if (scopedCenterIds !== null && scopedCenterIds.length === 0) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- query
    // ------ find all patches ids
    const { cohort: cohortName } = value;
    const cohort = await CohortModel.findOne({ name: cohortName });
    if (!cohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const lines = await LigneBusModel.find({ cohort: cohort.name, ...(scopedCenterIds === null ? {} : { centerId: { $in: scopedCenterIds } }) });
    if (lines.length > 0) {
      const lineIds = lines.map((line) => line._id);
      const lineSet = {};
      for (const line of lines) {
        lineSet[line._id.toString()] = line;
      }
      const lineStringIds = lineIds.map((l) => l.toString());
      const lineToPoints = await LigneToPointModel.find({ lineId: { $in: lineStringIds } }, { _id: 1, lineId: 1 });
      const lineToPointIds = lineToPoints.map((line) => line._id);
      const lineToPointSet = {};
      for (const ltp of lineToPoints) {
        lineToPointSet[ltp._id.toString()] = ltp.lineId;
      }

      // ------ compute filters
      let filterOpFunction;
      if (filterOp && filterOp.trim().length > 0) {
        if (filterPath && filterPath.trim().length > 0) {
          const realFilterPath = (filterPath.trim()[0] === "/" ? "" : "/") + filterPath.trim();
          filterOpFunction = (op) => op.path === realFilterPath && op.op === filterOp;
        } else {
          filterOpFunction = (op) => op.op === filterOp;
        }
      } else {
        if (filterPath && filterPath.trim().length > 0) {
          const realFilterPath = (filterPath.trim()[0] === "/" ? "" : "/") + filterPath.trim();
          filterOpFunction = (op) => op.path === realFilterPath;
        } else {
          filterOpFunction = () => true;
        }
      }
      let filterUserFunction;
      if (filterUserId && filterUserId.trim().length > 0) {
        filterUserFunction = (doc) => doc.user && doc.user._id && doc.user._id.toString() === filterUserId;
      } else {
        filterUserFunction = () => true;
      }

      // --- get all ops...
      const db = mongoose.connection.db;
      let patches: any[] = [];

      // PL8 (25/09/2026, résiduel de H58) : ne garder la branche `{ cohortId: cohort._id }` du `$or`
      // que pour ADMIN — pour un référent scopé, elle contournait le périmètre par centre et
      // renvoyait l'historique national du cohort. Même bascule qu'au L466 (scopedCenterIds).
      const patchesFilter = scopedCenterIds === null ? { $or: [{ ref: { $in: lineIds } }, { cohortId: cohort._id }] } : { ref: { $in: lineIds } };
      // PL8 : l'auteur d'un patch n'est projeté que sur {_id, firstName, lastName} pour un non-admin,
      // comme le fait déjà /patches/filter-options (L397) — email, rôle et département ne sortent plus.
      const projectPatchUser = (user: any) => (scopedCenterIds === null || !user ? user : { _id: user._id, firstName: user.firstName, lastName: user.lastName });

      // --- lignebus patches...
      let cursor = db.collection("lignebus_patches").find(patchesFilter);
      for await (const doc of cursor) {
        if (doc.ops && filterUserFunction(doc)) {
          const bus = lineSet[doc.ref];
          for (const op of doc.ops) {
            if (
              filterOpFunction(op) &&
              !HIDDEN_FIELDS.includes(op.path) &&
              !(isConvoyeurTeamPath(op.path) && !canViewConvoyeurTeam(req.user)) &&
              (!IGNORED_VALUES.includes(op.value) || op.path.match(/\/[0-9]+$/)) &&
              (!IGNORED_VALUES.includes(op.originalValue) || op.op === "create")
            ) {
              patches.push({
                modelName: doc.modelName,
                date: doc.date,
                ref: bus?._id,
                refName: bus?.busId || op.originalValue,
                op: op.op,
                path: op.path,
                value: op.value,
                originalValue: op.originalValue,
                user: projectPatchUser(doc.user),
              });
            }
          }
        }
      }

      // --- lineToPoints patches...
      cursor = db.collection("lignetopoint_patches").find({ ref: { $in: lineToPointIds } });
      for await (const doc of cursor) {
        if (doc.ops && filterUserFunction(doc)) {
          const lineId = lineToPointSet[doc.ref.toString()];
          const bus = lineId ? lineSet[lineId] : {};
          for (const op of doc.ops) {
            if (filterOpFunction(op) && !HIDDEN_FIELDS.includes(op.path) && !IGNORED_VALUES.includes(op.value) && !IGNORED_VALUES.includes(op.originalValue)) {
              patches.push({
                modelName: doc.modelName,
                date: doc.date,
                ref: bus?._id.toString(),
                refName: bus.busId,
                op: op.op,
                path: op.path,
                value: op.value,
                originalValue: op.originalValue,
                user: projectPatchUser(doc.user),
              });
            }
          }
        }
      }

      // --- results
      if (patches && patches.length > 0) {
        let results;

        // --- filtrage texte libre
        if (filterQuery) {
          results = patches.filter((p) => {
            return filterPatchWithQuery(p, filterQuery);
          });
        } else {
          results = patches;
        }

        // --- sort patches
        patches.sort((a, b) => {
          return b.date.valueOf() - a.date.valueOf();
        });

        if (nopagination) {
          // --- result without pagination
          return res.status(200).send({
            ok: true,
            data: results,
            pagination: {
              count: results.length,
              pageCount: 1,
              page: 0,
              itemsPerPage: results.length,
            },
          });
        } else {
          // --- result with pagination
          if (offset === undefined || offset === null) {
            if (page === undefined || page === null || page < 1) {
              offset = 0;
            } else {
              offset = page * limit;
            }
          }
          return res.status(200).send({
            ok: true,
            data: results.slice(offset, offset + limit),
            pagination: {
              count: results.length,
              pageCount: Math.ceil(results.length / limit),
              page: Math.floor(offset / limit),
              itemsPerPage: limit,
            },
          });
        }
      } else {
        return res.status(200).send({
          ok: true,
          data: [],
          pagination: {
            count: 0,
            pageCount: 0,
            page: 0,
            itemsPerPage: limit,
          },
        });
      }
    } else {
      return res.status(200).send({ ok: true, data: [], pagination: { count: 0, pageCount: 0, page: 0 } });
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:id/notifyRef", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate({ ...req.params });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!isAdmin(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    let { id } = value;

    const ligne = await LigneBusModel.findById(id);
    if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const pdrs = await PointDeRassemblementModel.find({ _id: ligne.meetingPointsIds });
    if (!pdrs?.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const center = await CohesionCenterModel.findById(ligne.centerId);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const departmentListToNotify = pdrs.map((pdr) => pdr.department);
    departmentListToNotify.push(center.department!);

    const regionListToNotify = pdrs.map((pdr) => pdr.region);
    regionListToNotify.push(center.region!);

    const subRoleRefDep = ["manager_department", "assistant_manager_department", "secretariat", "manager_phase2"];
    const subRoleRefReg = ["coordinator", "assistant_coordinator", "manager_phase2"];

    //on recherche les refDep des 2 departments avec les bon subRole
    //ET les ref regionnaux des 2 regions avec les bons subRole

    const referents = await ReferentModel.find({
      $or: [
        {
          department: { $in: departmentListToNotify },
          role: "referent_department",
          subRole: { $in: subRoleRefDep },
        },
        {
          role: "referent_region",
          subRole: { $in: subRoleRefReg },
          region: { $in: regionListToNotify },
        },
      ],
    });
    if (!referents?.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    //on prend un ref de chaque departement de la liste trié par subRole
    //et un ref de chaque region de la liste trié par subRole

    const referentsToNotify: any[] = [];

    const getRefListToNotify = (type, list, subRoles) => {
      for (let i = 0; i < list.length; i++) {
        //place = soit une region soit un departement
        const place = list[i];
        let referentsFromPlace: any = null;
        //on filtre les user du departement ou de la region
        if (type === "region") {
          referentsFromPlace = referents.filter((u) => u.region === place && u.role === "referent_region");
        }
        if (type === "department") {
          referentsFromPlace = referents.filter((u) => u.department.includes(place) && u.role === "referent_department");
        }
        for (const subRole of subRoles) {
          //on recupere le premier user filtré qui a le bon subRole (le premier subRole du tableau) si il y en a pas le 2eme subRole etc...
          const referentToNotifyInPlace = referentsFromPlace.find((u) => u.subRole === subRole);

          if (referentToNotifyInPlace) {
            //si on en trouve un on s'arrete la (on ne veut quún ref par departement/region)
            referentsToNotify.push(referentToNotifyInPlace);
            break;
          }
        }
      }
    };

    //on recupere la liste des ref regionnaux a prevenir
    getRefListToNotify("region", regionListToNotify, subRoleRefReg);
    //on recupere la liste des ref departementaux a prevenir
    getRefListToNotify("department", departmentListToNotify, subRoleRefDep);

    //on genere le tableau des referents selectionné pour etre notifié
    const uniqueUsersToNotify = [...new Set(referentsToNotify.map((obj) => JSON.stringify(obj)))].map((str) => JSON.parse(str));

    // send notification
    await sendTemplate(SENDINBLUE_TEMPLATES.PLAN_TRANSPORT.NOTIF_REF, {
      emailTo: uniqueUsersToNotify.map((referent) => ({
        name: `${referent.firstName} ${referent.lastName}`,
        email: referent.email,
      })),
      params: {
        lineName: ligne.busId,
        cta: `${config.ADMIN_URL}/ligne-de-bus/${ligne._id.toString()}`,
      },
    });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

function pathToKey(path) {
  if (path && path.length > 0) {
    let key = path[0] === "/" ? path.substring(1) : path;
    const idx = key.indexOf("/");
    if (idx >= 0) {
      key = key.substring(0, idx);
    }
    return key;
  } else {
    return path;
  }
}

function filterPatchWithQuery(p, query) {
  return (
    // bus
    p.refName?.toLowerCase()?.includes(query) ||
    // field
    translateBusPatchesField(pathToKey(p.path)).toLowerCase().includes(query) ||
    // original-value
    (p.originalValue && (isIsoDate(p.originalValue) ? formatStringLongDate(p.originalValue) : p.originalValue.toString())?.toLowerCase().includes(query)) ||
    // value
    (p.value && (isIsoDate(p.value) ? formatStringLongDate(p.value) : p.value.toString())?.toLowerCase().includes(query))
  );
}

function mergeArrayItems(array: any[], subProperty?: string | null | undefined) {
  let set = {};
  for (const item of array) {
    if (subProperty) {
      if (item[subProperty]) {
        const p = pathToKey(item[subProperty].toString());
        if (p) {
          set[p] = item;
        }
      }
    } else {
      const p = pathToKey(item);
      if (p) {
        set[p] = p;
      }
    }
  }
  return Object.values(set);
}

export default router;
