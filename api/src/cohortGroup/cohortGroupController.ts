import express from "express";
import { RouteRequest, RouteResponse } from "../controllers/request";
import { capture } from "../sentry";
import { COHORT_TYPE_LIST, CohortGroupRoutes, ERRORS, ROLES } from "snu-lib";
import { accessControlMiddleware } from "../middlewares/accessControlMiddleware";
import { CohortGroupModel } from "../models/cohortGroup";
import Joi from "joi";
import { requestValidatorMiddleware } from "../middlewares/requestValidatorMiddleware";
import { CohortModel } from "../models";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", async (_req: RouteRequest<CohortGroupRoutes["Get"]>, res: RouteResponse<CohortGroupRoutes["Get"]>) => {
  try {
    const data = await CohortGroupModel.find().sort({ year: 1, name: 1 });
    return res.json({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.use(authMiddleware("referent"));

router.post(
  "/",
  [
    requestValidatorMiddleware({
      body: Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid(...COHORT_TYPE_LIST),
        year: Joi.number(),
      }),
    }),
    accessControlMiddleware([ROLES.ADMIN]),
  ],
  async (req: RouteRequest<CohortGroupRoutes["Post"]>, res: RouteResponse<CohortGroupRoutes["Post"]>) => {
    try {
      const { name, type, year } = req.body;
      const data = new CohortGroupModel({ name, type, year });
      await data.save({ fromUser: req.user });
      return res.json({ ok: true, data });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.put(
  "/:id",
  [
    requestValidatorMiddleware({
      params: Joi.object({
        id: Joi.string().required(),
      }),
      body: Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid(...COHORT_TYPE_LIST),
        year: Joi.number(),
      }),
    }),
    accessControlMiddleware([ROLES.ADMIN]),
  ],
  async (req: RouteRequest<CohortGroupRoutes["Put"]>, res: RouteResponse<CohortGroupRoutes["Put"]>) => {
    try {
      const { id } = req.params;
      const data = await CohortGroupModel.findById(id);
      if (!data) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }
      data.set({ ...data, ...req.body });
      await data.save({ fromUser: req.user });
      return res.json({ ok: true, data });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.delete(
  "/:id",
  [
    requestValidatorMiddleware({
      params: Joi.object({
        id: Joi.string().required(),
      }),
    }),
    accessControlMiddleware([ROLES.ADMIN]),
  ],
  async (req: RouteRequest<CohortGroupRoutes["Delete"]>, res: RouteResponse<CohortGroupRoutes["Delete"]>) => {
    try {
      const { id } = req.params;
      const data = await CohortGroupModel.findById(id);
      if (!data) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }
      const exists = await CohortModel.exists({ cohortGroupId: id });
      if (exists) {
        return res.status(400).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }
      await data.deleteOne();
      return res.json({ ok: true });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

export default router;