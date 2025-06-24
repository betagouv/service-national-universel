import express, { Response } from "express";
import passport from "passport";
import { region2department, canEditTableDeRepartitionDepartment, canEditTableDeRepartitionRegion, PERMISSION_RESOURCES, PERMISSION_ACTIONS } from "snu-lib";
import { ERRORS } from "../../utils";
import { TableDeRepartitionModel } from "../../models";
import { capture } from "../../sentry";
import Joi from "joi";
import { UserRequest } from "../request";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { permissionAccessControlMiddleware } from "../../middlewares/permissionAccessControlMiddleware";

const router = express.Router();

router.post("/region", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
      fromRegion: Joi.string().required(),
      toRegion: Joi.string().required(),
    }).validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canEditTableDeRepartitionRegion(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { cohort, fromRegion, toRegion } = value;
    const exist = await TableDeRepartitionModel.findOne(value);
    if (exist) return res.status(409).send({ ok: false, code: ERRORS.ALREADY_EXISTS });
    await TableDeRepartitionModel.create({ cohort, fromRegion, toRegion });
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/delete/region", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
      fromRegion: Joi.string().required(),
      toRegion: Joi.string().required(),
    }).validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canEditTableDeRepartitionRegion(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const toRemove = await TableDeRepartitionModel.find({ ...value });
    await TableDeRepartitionModel.deleteMany({ _id: { $in: toRemove.map((e) => e._id) } });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/department", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
      fromRegion: Joi.string().required(),
      toRegion: Joi.string().required(),
      fromDepartment: Joi.string().required(),
      toDepartment: Joi.string().required(),
    }).validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canEditTableDeRepartitionDepartment(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { cohort, fromRegion, toRegion, fromDepartment, toDepartment } = value;

    const existing = await TableDeRepartitionModel.find({ cohort, fromRegion, toRegion });

    if (existing.length === 0) return res.status(400).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (existing.length === 1 && !existing[0].toDepartment && !existing[0].fromDepartment) {
      await TableDeRepartitionModel.updateOne({ _id: existing[0]._id }, { $set: { fromDepartment, toDepartment } });
    } else {
      const doublon = await TableDeRepartitionModel.findOne({ cohort, fromRegion, toRegion, fromDepartment, toDepartment });
      if (doublon) return res.status(400).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      TableDeRepartitionModel.create({ cohort, fromRegion, toRegion, fromDepartment, toDepartment });
    }
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/delete/department", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
      fromRegion: Joi.string().required(),
      toRegion: Joi.string().required(),
      fromDepartment: Joi.string().required(),
      toDepartment: Joi.string().required(),
    }).validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canEditTableDeRepartitionDepartment(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { cohort, fromRegion, toRegion, fromDepartment, toDepartment } = value;

    const toDelete = await TableDeRepartitionModel.findOne({ cohort, fromRegion, toRegion, fromDepartment, toDepartment });
    const existing = await TableDeRepartitionModel.find({ cohort, fromRegion, toRegion });

    if (!toDelete) return res.status(400).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (existing.length === 1) {
      if (toDelete._id.toString() === existing[0]._id.toString()) {
        await TableDeRepartitionModel.updateOne({ _id: existing[0]._id }, { $set: { fromDepartment: undefined, toDepartment: undefined } });
      } else {
        return res.status(400).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    } else {
      toDelete.deleteOne();
    }

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get(
  "/national/:cohort",
  authMiddleware("referent"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.TABLE_DE_REPARTITION, action: PERMISSION_ACTIONS.READ }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value } = Joi.object({ cohort: Joi.string().required() }).validate(req.params, { stripUnknown: true });
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const { cohort } = value;
      const data = await TableDeRepartitionModel.find({ cohort });

      const filteredData = data.filter((e, i) => {
        return i === data.findIndex((a) => a.fromRegion === e.fromRegion && a.toRegion === e.toRegion);
      });

      for (const dataToEdit of filteredData) {
        let avancement =
          (region2department[dataToEdit.fromRegion].reduce((acc, department) => {
            if (!data.find((e) => e.fromDepartment === department)) return acc;
            return (acc += 1);
          }, 0) /
            region2department[dataToEdit.fromRegion].length) *
            100 || 0;
        // @ts-ignore
        dataToEdit._doc.avancement = Math.trunc(avancement);
      }

      return res.status(200).send({ ok: true, data: filteredData });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/fromRegion/:cohort/:region",
  authMiddleware("referent"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.TABLE_DE_REPARTITION, action: PERMISSION_ACTIONS.READ }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value } = Joi.object({
        cohort: Joi.string().required(),
        region: Joi.string().required(),
      }).validate(req.params, { stripUnknown: true });
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const { cohort, region } = value;
      const data = await TableDeRepartitionModel.find({ cohort, fromRegion: region });

      return res.status(200).send({ ok: true, data });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/toRegion/:cohort/:region",
  authMiddleware("referent"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.TABLE_DE_REPARTITION, action: PERMISSION_ACTIONS.READ }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value } = Joi.object({
        cohort: Joi.string().required(),
        region: Joi.string().required(),
      }).validate(req.params, { stripUnknown: true });
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const { cohort, region } = value;
      const data = await TableDeRepartitionModel.find({ cohort, toRegion: region });

      return res.status(200).send({ ok: true, data });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

export default router;
