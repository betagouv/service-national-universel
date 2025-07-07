import express from "express";
import Joi from "joi";

import { PERMISSION_RESOURCES, PERMISSION_ACTIONS } from "snu-lib";

import { capture } from "../../sentry";
import { serializeAlerteMessage } from "../../utils/serializer";
import { AlerteMessageModel } from "../../models";
import { ERRORS } from "../../utils";
import { validateId } from "../../utils/validator";
import { UserRequest } from "../request";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { permissionAccessControlMiddleware } from "../../middlewares/permissionAccessControlMiddleware";

interface AlerteMessageBody {
  priority: string;
  to_role: string[];
  title: string;
  content: string;
}

const router = express.Router();

router.get(
  "/all",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.ALERTE_MESSAGE, action: PERMISSION_ACTIONS.FULL, ignorePolicy: true }]),
  async (req: UserRequest, res) => {
    try {
      const data = await AlerteMessageModel.find({ deletedAt: { $exists: false } });
      return res.status(200).send({ ok: true, data: data.map(serializeAlerteMessage) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/:id",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.ALERTE_MESSAGE, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  async (req: UserRequest, res) => {
    try {
      const { error, value: id } = validateId(req.params.id);
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const data = await AlerteMessageModel.findById(id);
      if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      return res.status(200).send({ ok: true, data: serializeAlerteMessage(data) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

// ici on ne prend que les messages destinés à un role précis
router.get(
  "/",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.ALERTE_MESSAGE, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  async (req: UserRequest, res) => {
    try {
      const data = await AlerteMessageModel.find({ to_role: { $in: [req.user.role] }, deletedAt: { $exists: false } });
      return res.status(200).send({ ok: true, data: data.map(serializeAlerteMessage) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.post(
  "/",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.ALERTE_MESSAGE, action: PERMISSION_ACTIONS.CREATE, ignorePolicy: true }]),
  async (req: UserRequest, res) => {
    try {
      const { error, value } = Joi.object({
        priority: Joi.string().required(),
        to_role: Joi.array().items(Joi.string()).required(),
        title: Joi.string().required().max(100),
        content: Joi.string().required().max(500),
      }).validate({ ...req.params, ...req.body }, { stripUnknown: true });

      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const { priority, to_role, title, content } = value as AlerteMessageBody;

      const message = await AlerteMessageModel.create({ priority, to_role, title, content });

      return res.status(200).send({ ok: true, data: serializeAlerteMessage(message) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.put(
  "/:id",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.ALERTE_MESSAGE, action: PERMISSION_ACTIONS.WRITE, ignorePolicy: true }]),
  async (req: UserRequest, res) => {
    try {
      const { error, value } = Joi.object({
        id: Joi.string().required(),
        priority: Joi.string().required(),
        to_role: Joi.array().items(Joi.string()).required(),
        title: Joi.string().required().max(100),
        content: Joi.string().required().max(500),
      }).validate({ ...req.params, ...req.body }, { stripUnknown: true });

      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const { priority, to_role, title, content } = value as AlerteMessageBody & { id: string };

      const message = await AlerteMessageModel.findById(value.id);
      if (!message) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      message.set({ priority, to_role, title, content });
      await message.save({ fromUser: req.user });
      return res.status(200).send({ ok: true, data: serializeAlerteMessage(message) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.delete(
  "/:id",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.ALERTE_MESSAGE, action: PERMISSION_ACTIONS.DELETE, ignorePolicy: true }]),
  async (req: UserRequest, res) => {
    try {
      const { error, value: id } = validateId(req.params.id);
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const message = await AlerteMessageModel.findById(id);
      if (!message) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const now = new Date();
      message.set({ deletedAt: now });
      await message.save({ fromUser: req.user });

      res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

export default router;
