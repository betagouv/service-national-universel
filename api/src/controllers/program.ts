import express, { Request, Response } from "express";
import Joi from "joi";
import passport from "passport";

import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES, canCreateOrUpdateProgram } from "snu-lib";

import { capture } from "../sentry";
import { logger } from "../logger";
import { ProgramModel } from "../models";
import { ERRORS, isYoung } from "../utils";
import { validateId, validateString, validateArray, validateProgram, idSchema } from "../utils/validator";
import { RouteRequest, RouteResponse, UserRequest } from "./request";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requestValidatorMiddleware } from "../middlewares/requestValidatorMiddleware";
import { permissionAccessControlMiddleware } from "../middlewares/permissionAccessControlMiddleware";

const router = express.Router();

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value: checkedProgram } = validateProgram(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    if (!canCreateOrUpdateProgram(req.user, checkedProgram)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await ProgramModel.create(checkedProgram);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error: errorProgram, value: checkedProgram } = validateProgram(req.body);
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorProgram || errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    if (!canCreateOrUpdateProgram(req.user, checkedProgram)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    let obj = checkedProgram;
    const data = await ProgramModel.findById(checkedId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    data.set(obj);
    await data.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get(
  "/:id",
  authMiddleware(["referent", "young"]),
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.PROGRAM, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  ],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      const data = await ProgramModel.findById(req.validatedParams.id);
      if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      return res.status(200).send({ ok: true, data });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get("/", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    let data = [];
    if (req.user.role === ROLES.ADMIN) data = await ProgramModel.find({});
    else if ([ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(req.user.role)) data = await ProgramModel.find({ visibility: "HEAD_CENTER" });
    else {
      let errorDepartement, checkedDepartement;
      if (isYoung(req.user)) {
        ({ error: errorDepartement, value: checkedDepartement } = validateString(req.user.department));
      } else {
        ({ error: errorDepartement, value: checkedDepartement } = validateArray(req.user.department));
      }
      const { error: errorRegion, value: checkedRegion } = validateString(req.user.region);
      if (errorDepartement || errorRegion) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      data = await ProgramModel.find({ $or: [{ visibility: "NATIONAL" }, { department: checkedDepartement }, { region: checkedRegion }] });
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/public/engagements", async (req: Request, res: Response) => {
  try {
    const data = await ProgramModel.aggregate([
      {
        $match: { visibility: "NATIONAL" },
      },
      {
        $addFields: {
          order: { $ifNull: ["$order", Number.MAX_SAFE_INTEGER] },
        },
      },
      {
        $sort: { order: 1 },
      },
    ]);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/public/engagement/:id", async (req: Request, res: Response) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const data = await ProgramModel.findById(checkedId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const program = await ProgramModel.findById(checkedId);
    if (!program) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!canCreateOrUpdateProgram(req.user, program)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    await program.deleteOne();
    logger.debug(`Program ${req.params.id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
