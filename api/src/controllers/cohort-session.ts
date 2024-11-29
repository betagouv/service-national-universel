import express from "express";
import { config } from "../config";

import { CohortsRoutes, ROLES } from "snu-lib";

import { capture } from "../sentry";
import { ERRORS } from "../utils";
import { YoungModel, CohortModel } from "../models";
import { RouteRequest, RouteResponse } from "./request";
import { requestValidatorMiddleware } from "../middlewares/requestValidatorMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";

import { CohortsRoutesSchema } from "../cohort/cohortValidator";
import { getAllSessions, getFilteredSessionsForCLE, getFilteredSessionsForInscription } from "../utils/cohort";
import { isReInscriptionOpen, isInscriptionOpen } from "../cohort/cohortService";

const router = express.Router();

// Takes either a young ID in route parameter or young data in request body (for edition or signup pages).
// Minimum data required: birthdateAt, zip || department and (if schooled) grade.
// If user is an admin, returns all sessions.
// If not, returns an array of session objects filtered by eligibility rules and inscription dates.
// Provides updated number of places in the given region for frontend filtering and backend coherence checks.

router.post(
  "/eligibility/2023/:id?",
  authMiddleware(["young", "referent"]),
  requestValidatorMiddleware({ ...CohortsRoutesSchema.PostEligibility, body: undefined }),
  async function (req: RouteRequest<CohortsRoutes["PostEligibility"]>, res: RouteResponse<CohortsRoutes["PostEligibility"]>) {
    try {
      let young: NonNullable<CohortsRoutes["PostEligibility"]["payload"]>;
      const { id } = req.validatedParams;
      if (id) {
        const youngDocument = await YoungModel.findById(id).lean();
        if (!youngDocument) {
          return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        }
        // deparment and zip not required in the schema...
        young = youngDocument as typeof young;
      } else {
        const { value: body, error: bodyError } = CohortsRoutesSchema.PostEligibility.body.validate(req.body, { stripUnknown: true });
        if (bodyError) {
          return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
        }
        young = body!;
      }

      let sessions: CohortsRoutes["PostEligibility"]["response"]["data"];
      if ([ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(req.user?.role)) {
        sessions = await getFilteredSessionsForCLE();
      } else if (
        (req.user?.role === ROLES.ADMIN && req.get("origin") === config.ADMIN_URL) ||
        ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(req.user?.role) && req.validatedQuery.getAllSessions)
      ) {
        sessions = await getAllSessions(young);
      } else {
        sessions = await getFilteredSessionsForInscription(young, Number(req.headers["x-user-timezone"]) || null);
      }

      return res.json({ ok: true, data: sessions });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/isReInscriptionOpen",
  authMiddleware(["young"]),
  async (req: RouteRequest<CohortsRoutes["GetIsReincriptionOpen"]>, res: RouteResponse<CohortsRoutes["GetIsReincriptionOpen"]>) => {
    try {
      const user = req.user;
      const cohort = await CohortModel.findById(user.cohortId);
      if (!cohort) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }
      const isOpen = await isReInscriptionOpen(cohort.cohortGroupId);

      return res.json({
        ok: true,
        data: isOpen,
      });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/isInscriptionOpen",
  requestValidatorMiddleware(CohortsRoutesSchema.GetIsIncriptionOpen),
  async (req: RouteRequest<CohortsRoutes["GetIsIncriptionOpen"]>, res: RouteResponse<CohortsRoutes["GetIsIncriptionOpen"]>) => {
    try {
      const isOpen = await isInscriptionOpen(req.validatedQuery.sessionName);

      return res.json({
        ok: true,
        data: isOpen,
      });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

export default router;
