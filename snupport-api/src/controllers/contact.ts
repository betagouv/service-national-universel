import express, { Response } from "express";
import Joi from "joi";
import { UserRequest } from "./request";
import ContactModel from "../models/contact";
import AgentModel from "../models/agent";
import { diacriticSensitiveRegex } from "../utils";
import { agentGuard } from "../middlewares/authenticationGuards";
import { validateParams, validateBody, validateQuery, idSchema } from "../middlewares/validation";
import { ERRORS } from "../errors";
import { SCHEMA_EMAIL } from "../schemas";
import escapeStringRegexp from "escape-string-regexp";

const router = express.Router();

const SCHEMA_FIRSTNAME = Joi.string().trim();
const SCHEMA_LASTNAME = Joi.string().trim();

router.use(agentGuard);

function autocomplete_regex(query) {
  const pattern = diacriticSensitiveRegex(escapeStringRegexp(query));
  return `^${pattern}.*$`;
}

router.get(
  "/search",
  validateQuery(
    Joi.object({
      q: Joi.string().trim(),
    }).prefs({ presence: "required" })
  ),
  async (req: UserRequest, res: Response) => {
    if (req.cleanQuery.q.length < 3) {
      res.status(200).send({
        ok: true,
        data: [],
      });
      return;
    }
    const regex = {
      $regex: autocomplete_regex(req.cleanQuery.q),
      $options: "i",
    };
    let query: any = {
      $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
    };
    if (req.user.role === "REFERENT_DEPARTMENT") {
      query = {
        $and: [
          { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] },
          {
            $or: [{ role: "young", department: { $in: req.user.departments } }, { role: { $ne: "young" } }],
          },
        ],
      };
    } else if (req.user.role === "REFERENT_REGION") {
      query = {
        $and: [
          { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] },
          {
            $or: [{ role: "young", region: { $in: req.user.region } }, { role: { $ne: "young" } }],
          },
        ],
      };
    }
    const contacts = await ContactModel.find(query).limit(6);
    res.status(200).send({
      ok: true,
      data: contacts,
    });
  }
);

router.get("/:id", validateParams(idSchema), async (req: UserRequest, res: Response) => {
  const id = req.cleanParams.id;
  let data = await ContactModel.findById(id);
  if (!data) data = await AgentModel.findById(id);
  if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
  return res.status(200).send({ ok: true, data });
});

// WARNING check if exist, if no create it, does not send error if already exists but return the contact
router.post(
  "/",
  validateBody(
    Joi.object({
      email: SCHEMA_EMAIL,
      firstName: SCHEMA_FIRSTNAME,
      lastName: SCHEMA_LASTNAME,
    }).prefs({ presence: "required" })
  ),
  async (req: UserRequest, res: Response) => {
    let contact = await ContactModel.findOne({ email: req.cleanBody.email });
    if (!contact) contact = await AgentModel.findOne({ email: req.cleanBody.email });
    if (!contact) contact = await ContactModel.create(req.cleanBody);
    if (!contact) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true });
  }
);

module.exports = router;
