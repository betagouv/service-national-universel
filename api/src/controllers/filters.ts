import express, { Response } from "express";
import { ERRORS } from "../utils";
import { capture } from "../sentry";
import Joi from "joi";
import { FiltersModel } from "../models";
import { authMiddleware } from "../middlewares/authMiddleware";
import { UserRequest } from "./request";

const router = express.Router();

interface FilterBody {
  page: string;
  url: string;
  name: string;
}

interface FilterParams {
  id?: string;
  page?: string;
}

interface Filter {
  userId: string;
  deleteOne: () => Promise<void>;
}

router.post("/", authMiddleware(["referent"]), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      page: Joi.string().required(),
      url: Joi.string().required(),
      name: Joi.string().required(),
    }).validate(req.body);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const { page, url, name } = value as FilterBody;

    //check if filter already exists
    const filter = await FiltersModel.findOne({ page, name, userId: req.user._id });
    if (filter) return res.status(400).send({ ok: false, code: ERRORS.ALREADY_EXISTS });

    const newFilter = await FiltersModel.create({ page, url, userId: req.user._id, name });

    return res.status(200).send({ ok: true, data: newFilter });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:page", authMiddleware(["referent"]), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      page: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const { page } = value as FilterParams;

    const filters = await FiltersModel.find({ page, userId: req.user._id });

    return res.status(200).send({ ok: true, data: filters });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id", authMiddleware(["referent"]), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const { id } = value as FilterParams;

    const filter = (await FiltersModel.findById(id)) as Filter | null;
    if (!filter) return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (filter.userId.toString() !== req.user._id.toString()) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    await filter.deleteOne();

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
