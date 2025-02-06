import express from "express";
import passport from "passport";
import Joi from "joi";
import XLSX from "xlsx";
import { generateCSVStream, streamToBuffer } from "../services/fileService";

import { canUpdateInscriptionGoals, canViewInscriptionGoals, FUNCTIONAL_ERRORS, InscriptionGoalsRoutes, INSCRIPTION_GOAL_LEVELS, department2region, ROLES } from "snu-lib";

import { capture } from "../sentry";
import { YoungModel, InscriptionGoalModel, CohortModel, DepartmentServiceModel, ReferentModel } from "../models";
import { ERRORS } from "../utils";
import { getCompletionObjectifs } from "../services/inscription-goal";
import { RouteRequest, RouteResponse, UserRequest } from "./request";

const router = express.Router();

// Update all inscription goals for a cohort
router.post("/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    // Validate cohort...
    const { error: errorCohort, value } = Joi.object({ cohort: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
    if (errorCohort) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    // ... then body
    const { error, value: inscriptionsGoals } = Joi.array()
      .items({
        department: Joi.string().required(),
        region: Joi.string(),
        max: Joi.number().allow(null),
      })
      .validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canUpdateInscriptionGoals(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const promises = inscriptionsGoals.map((item) => {
      // 2021 can be empty in database. This could be removed once all data is migrated.
      return InscriptionGoalModel.find({ cohort: value.cohort === "2021" ? ["2021", null] : value.cohort, department: item.department }).then((data) => {
        const inscriptionsGoal = data[0];
        if (!inscriptionsGoal) return InscriptionGoalModel.create({ ...item, cohort: value.cohort });
        inscriptionsGoal.set({ ...item, cohort: value.cohort });
        return inscriptionsGoal.save({ fromUser: req.user });
      });
    });
    await Promise.all(promises);
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({ cohort: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canViewInscriptionGoals(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // 2021 can be empty in database. This could be removed once all data is migrated.
    const data = await InscriptionGoalModel.find({ cohort: value.cohort === "2021" ? ["2021", null] : value.cohort });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:department/current", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({ department: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canViewInscriptionGoals(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const y2020 = await YoungModel.find({ cohort: "2020", statusPhase1: "WAITING_AFFECTATION", department: value.department }).countDocuments();
    const y2021 = await YoungModel.find({ cohort: "2021", status: "VALIDATED", department: value.department }).countDocuments();
    const yWL = await YoungModel.find({ status: "WAITING_LIST", department: value.department }).countDocuments();
    const data = { registered: y2020 + y2021, waitingList: yWL };
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get(
  "/:cohort/department/:department",
  passport.authenticate("referent", { session: false, failWithError: true }),
  async (req: RouteRequest<InscriptionGoalsRoutes["GetTauxRemplissage"]>, res: RouteResponse<InscriptionGoalsRoutes["GetTauxRemplissage"]>) => {
    try {
      const { error, value: params } = Joi.object({ department: Joi.string().required(), cohort: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      if (!canViewInscriptionGoals(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      const { department, cohort } = params;

      const cohortDocument = await CohortModel.findOne({ name: cohort });
      if (!cohortDocument) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const completionObjectif = await getCompletionObjectifs(department, cohortDocument);

      return res.status(200).json({ ok: true, data: completionObjectif.tauxRemplissage });
    } catch (error) {
      capture(error);
      if (Object.keys(FUNCTIONAL_ERRORS).includes(error.message)) {
        res.status(400).send({ ok: false, code: error.message });
      } else {
        res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
      }
    }
  },
);

router.get("/:cohort/department/:department/reached", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({ department: Joi.string().required(), cohort: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { department, cohort } = value;

    const cohortDocument = await CohortModel.findOne({ name: cohort });
    if (!cohortDocument) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const completionObjectif = await getCompletionObjectifs(department, cohortDocument);

    return res.status(200).send({ ok: true, data: completionObjectif.isAtteint });
  } catch (error) {
    capture(error);
    if (Object.keys(FUNCTIONAL_ERRORS).includes(error.message)) {
      res.status(400).send({ ok: false, code: error.message });
    } else {
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }
});

router.get("/:cohortId/export", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ cohortId: Joi.string().required() }).validate(req.params, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const cohortDocument = await CohortModel.findById(value.cohortId);
    if (!cohortDocument) return res.status(404).json({ ok: false, code: ERRORS.NOT_FOUND, error: "Cohorte introuvable" });

    const cohortName = cohortDocument.name;
    const services = await DepartmentServiceModel.find({ department: { $in: cohortDocument.eligibility.zones } }).lean();

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const referentsRegion = await ReferentModel.find({ role: ROLES.REFERENT_REGION }).lean();
    const referentsDep = await ReferentModel.find({
      role: ROLES.REFERENT_DEPARTMENT,
      lastLoginAt: { $gte: twoWeeksAgo },
      subRole: { $nin: "manager_phase2" },
    })
      .sort({ lastLoginAt: -1 })
      .lean();

    const resultSansContact: Array<{
      Département: string | undefined;
      Région: string;
      "Email des Référents Départementaux": string;
      "Email des Référents Régionaux": string;
      "Contact convoquation renseigné": string;
    }> = [];
    const resultAvecContact: Array<{
      Département: string | undefined;
      Région: string;
      "Email des Référents Départementaux": string;
      "Email des Référents Régionaux": string;
      "Contact convoquation renseigné": string;
    }> = [];

    for (const service of services) {
      const refsRegion = referentsRegion.filter((r) => r.region === department2region[service.department ?? ""]).slice(0, 2);
      const refsDep = referentsDep.filter((r) => service.department.includes(r.department)).slice(0, 4);
      const contacts = service?.contacts;
      const contact = contacts?.find((c) => c.cohort === cohortName);

      const row = {
        Département: service.department,
        Région: department2region[service.department ?? ""] || "N/A",
        "Email des Référents Départementaux": refsDep.map((r) => r.email).join("; "),
        "Email des Référents Régionaux": refsRegion.map((r) => r.email).join("; "),
        "Contact convoquation renseigné": contact ? "OUI" : "NON",
      };

      if (!contact) {
        resultSansContact.push(row);
      } else {
        resultAvecContact.push(row);
      }
    }

    // Trier les résultats par région
    resultSansContact.sort((a, b) => a.Région.localeCompare(b.Région));
    resultAvecContact.sort((a, b) => a.Région.localeCompare(b.Région));

    return res.json({ resultSansContact, resultAvecContact, cohortName });
  } catch (error) {
    capture(error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
