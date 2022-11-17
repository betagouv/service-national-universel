/**
 * ROUTES:
 *  GET /schema-de-repartition/:cohort                      => get National data
 *  GET /schema-de-repartition/:region/:cohort              => get Regional data
 *  GET /schema-de-repartition/:region/:department/:cohort  => get Department data
 */

const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const { canViewSchemaDeRepartition, YOUNG_STATUS, regionList } = require("snu-lib");
const Joi = require("joi");
const cohesionCenterModel = require("../../models/cohesionCenter");
const youngModel = require("../../models/young");
const schemaRepartitionModel = require("../../models/PlanDeTransport/schemaDeRepartition");

router.get("/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ cohort: Joi.string().required() }).validate(req.params, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { cohort } = value;

    if (!canViewSchemaDeRepartition(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- capacities & centers
    const centerResult = await cohesionCenterModel
      .aggregate([
        // TODO: pour l'instant j'ai viré la relation sur les cohorts car sinon on n'a aucune données.
        // {
        //   $match: { cohorts: cohort },
        // },
        {
          $group: {
            _id: "$region",
            centers: { $sum: 1 },
            capacity: { $sum: "$placesTotal" },
          },
        },
      ])
      .exec();
    let centerSet = {};
    for (const line of centerResult) {
      centerSet[line._id] = { centers: line.centers, capacity: line.capacity };
    }

    // --- volontaires
    const youngResult = await youngModel
      .aggregate([
        // TODO: véfifier la liste des jeunes
        { $match: { cohort, status: { $in: [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.IN_PROGRESS] } } },
        {
          $group: {
            _id: "$region",
            total: { $sum: 1 },
            intradepartmental: {
              $sum: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$handicapInSameDepartment", "true"] },
                      then: 1,
                    },
                  ],
                  default: 0,
                },
              },
            },
          },
        },
      ])
      .exec();

    let youngSet = {};
    for (const line of youngResult) {
      youngSet[line._id] = { total: line.total, intradepartmental: line.intradepartmental };
    }

    // --- assigned
    const repartitionResult = await schemaRepartitionModel
      .aggregate([
        { $match: { cohort } },
        {
          $group: {
            _id: "$fromRegion",
            assigned: { $sum: "$youngsVolume" },
            intradepartmentalAssigned: {
              $sum: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$intradepartmental", "true"] },
                      then: 1,
                    },
                  ],
                  default: 0,
                },
              },
            },
          },
        },
      ])
      .exec();
    let repartitionSet = {};
    for (const line of repartitionResult) {
      repartitionSet[line._id] = { assigned: line.assigned, intradepartmentalAsigned: line.intradepartmentalAsigned };
    }

    // --- Format result
    let data = regionList.map((region) => {
      return {
        name: region,
        centers: 0,
        capacity: 0,
        ...centerSet[region],
        total: 0,
        intradepartmental: 0,
        ...youngSet[region],
        assigned: 0,
        intradepartmentalAssigned: 0,
        ...repartitionSet[region],
      };
    });

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
