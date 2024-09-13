import express, { Response } from "express";
import Joi from "joi";
import { capture } from "../sentry";
import { ERRORS } from "../utils";
import { getFilteredSessions, getAllSessions, getFilteredSessionsForCLE, CohortDocumentWithPlaces } from "../utils/cohort";
import { validateId } from "../utils/validator";
import { YoungModel, YoungType } from "../models";
import passport from "passport";
import { ROLES } from "snu-lib";
import config from "config";
import { isReInscriptionOpen, isInscriptionOpen } from "../cohort/cohortService";
import { UserRequest } from "./request";

const router = express.Router();

// Takes either a young ID in route parameter or young data in request body (for edition or signup pages).
// Minimum data required: birthdateAt, zip || department and (if schooled) grade.
// If user is an admin, returns all sessions.
// If not, returns an array of session objects filtered by eligibility rules and inscription dates.
// Provides updated number of places in the given region for frontend filtering and backend coherence checks.

router.post("/eligibility/2023/:id?", passport.authenticate("referent"), async function (req: UserRequest, res: Response) {
  try {
    let young: YoungType;
    const { value: id } = validateId(req.params.id);
    if (id) {
      const youngDocument = await YoungModel.findById(id);
      if (!youngDocument) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }
      young = youngDocument;
    } else {
      const { error: bodyError, value: body } = Joi.object({
        schoolDepartment: Joi.string().allow("", null),
        department: Joi.string(),
        region: Joi.string(),
        schoolRegion: Joi.string().allow("", null),
        birthdateAt: Joi.date().required(),
        grade: Joi.string(),
        status: Joi.string(),
        zip: Joi.string().allow("", null),
      })
        .unknown()
        .validate(req.body);
      if (bodyError) {
        capture(bodyError);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      young = body;
    }
    const { error: errorQuery, value: query } = Joi.object({
      getAllSessions: Joi.boolean().default(false),
    })
      .unknown()
      .validate(req.query, { stripUnknown: true });

    if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    let sessions: CohortDocumentWithPlaces[];
    if ([ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(req.user?.role)) {
      sessions = await getFilteredSessionsForCLE();
    } else if (
      (req.user?.role === ROLES.ADMIN && req.get("origin") === config.ADMIN_URL) ||
      ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(req.user?.role) && query.getAllSessions)
    ) {
      sessions = await getAllSessions(young);
    } else {
      sessions = await getFilteredSessions(young, Number(req.headers["x-user-timezone"]) || null);
    }

    if (sessions.length === 0) {
      return res.send({ ok: true, data: [], message: "no_session_found" });
    }
    return res.send({ ok: true, data: sessions });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/isReInscriptionOpen", async (req: UserRequest, res: Response) => {
  try {
    const data = await isReInscriptionOpen();

    return res.send({
      ok: true,
      data,
    });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/isInscriptionOpen", async (req: UserRequest, res: Response) => {
  const { error, value } = Joi.object({
    sessionName: Joi.string(),
  })
    .unknown()
    .validate(req.query, { stripUnknown: true });

  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
  const { sessionName } = value;

  try {
    const data = await isInscriptionOpen(sessionName);

    return res.send({
      ok: true,
      data,
    });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
