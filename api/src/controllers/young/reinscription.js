const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");

const { YoungModel } = require("../../models");
const { capture } = require("../../sentry");
const { serializeYoung } = require("../../utils/serializer");
const { ERRORS, STEPS2023 } = require("../../utils");
const { canUpdateYoungStatus, YOUNG_STATUS, YOUNG_STATUS_PHASE1, getCohortNames, hasAccessToReinscription } = require("snu-lib");
const { getFilteredSessions } = require("../../utils/cohort");

/**
 * ROUTES:
 *  PUT  /reinscription                => updates young who start a reinscription process
 *  PUT  /reinscription/not-eligible   => updates to young status to not eligible
 */

router.put("/", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungModel.findById(req.user._id);

    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // Check if the young has access to reinscription
    if (!hasAccessToReinscription(young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Validate request body
    const { error, value } = Joi.object({
      schooled: Joi.string().trim().required(),
      grade: Joi.string().trim().valid("4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre", "NOT_SCOLARISE").required(),
      schoolName: Joi.string().trim(),
      schoolType: Joi.string().trim().allow(null, ""),
      schoolAddress: Joi.string().trim().allow(null, ""),
      schoolZip: Joi.string().trim().allow(null, ""),
      schoolCity: Joi.string().trim().allow(null, ""),
      schoolDepartment: Joi.string().trim().allow(null, ""),
      schoolRegion: Joi.string().trim().allow(null, ""),
      schoolCountry: Joi.string().trim().allow(null, ""),
      schoolId: Joi.string().trim().allow(null, ""),
      zip: Joi.string().trim().allow(null, ""),
      cohort: Joi.string()
        .trim()
        .valid(...getCohortNames(true, false, false))
        .required(),
      source: Joi.string().required(),
    }).validate({ ...req.body }, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    // complete values
    value.status = YOUNG_STATUS.REINSCRIPTION;
    value.originalCohort = young.cohort;
    value.cohortChangeReason = "Réinscription à un nouveau séjour";
    value.zip = value.schooled === "true" ? young.zip : value.zip; //zip is only present in this request if the young is not schooled

    // Check if the young update his status
    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Check if the young can choose the given cohort
    const sessions = await getFilteredSessions({ birthdateAt: young.birthdateAt, ...value }, req.headers["x-user-timezone"] || null);
    const session = sessions.find(({ name }) => name === value.cohort);
    if (!session) return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    // Update young
    young.set({
      ...value,
      acceptCGU: undefined,
      consentment: undefined,
      inscriptionDoneDate: undefined,
      hasStartedReinscription: true,
      reinscriptionStep2023: STEPS2023.COORDONNEES,
      statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,

      rulesParent1: undefined,
      parent1AllowSNU: undefined,
      parentAllowSNU: undefined,
      parent1DataVerified: undefined,
      parent1AllowImageRights: undefined,
      parent2AllowImageRights: undefined,
      parent2AllowImageRightsReset: undefined,
      parent1OwnAddress: undefined,
      parent1ValidationDate: undefined,

      cohesionCenterId: undefined,
      sessionPhase1Id: undefined,
      meetingPointId: undefined,
      ligneId: undefined,
      deplacementPhase1Autonomous: undefined,
      transportInfoGivenByLocal: undefined,
      cohesionStayPresence: undefined,
      presenceJDM: undefined,
      departInform: undefined,
      departSejourAt: undefined,
      departSejourMotif: undefined,
      departSejourMotifComment: undefined,
      youngPhase1Agreement: "false",
      hasMeetingInformation: undefined,
      cohesionStayMedicalFileReceived: undefined,
    });

    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/not-eligible", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.status = YOUNG_STATUS.NOT_ELIGIBLE;

    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
