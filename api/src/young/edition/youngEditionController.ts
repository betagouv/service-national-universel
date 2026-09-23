/**
 * /young-edition
 *
 * ROUTES
 *   PUT   /young-edition/:id/identite            -> Modifie les données du jeune qui se trouvent dans la première section de la page du jeune (informations générales).
 *   PUT   /young-edition/:id/situationparents    -> Modifie les données du jeune qui se trouvent dans la deuxième section de la page du jeune (Détails).
 *   PUT   /young-edition/:id/phasestatus         -> Permet de modifier le statut du jeune sur une phase.
 *   PUT   /young-edition/:id/parent-allow-snu    -> Permet de modifier le consentement d'un parent (utilisé pour l'instant uniquement pour refuser le SNU par le parent 2).
 *   PUT   /young-edition/:id/parent-image-rights-reset
 *                                                -> Remet à undefined le consentement de droit à l'image d'un parent en lui renvoyant une notification pour le redonner.
 *   PUT   /young-edition/:id/parent-allow-snu-reset
 *                                                -> Remet à undefined le consentement de participation des deux parents en leur renvoyant une notification pour le redonner.
 *   GET   /young-edition/:id/remider/:idParent   -> Relance la notification de consentement pour le parent 1 ou 2
 *   GET   /young-edition/:id/reminder-parent-image-rights/:idParent
 *                                                -> Relance la notification de consentement au droit à l'image pour le parent 1 ou 2
 */

import express, { Response } from "express";
import Joi from "joi";
import { YoungModel, LigneBusModel, SessionPhase1Model, CohortModel, ApplicationModel } from "../../models";
import { ERRORS, notifDepartmentChange, updateSeatsTakenInBusLine, updatePlacesSessionPhase1 } from "../../utils";
import { capture } from "../../sentry";
import { validateFirstName } from "../../utils/validator";
import { serializeYoung } from "../../utils/serializer";
import passport from "passport";
import { format } from "date-fns";
import {
  PHONE_ZONES_NAMES_ARR,
  formatPhoneNumberFromPhoneZone,
  YOUNG_SITUATIONS,
  GRADES,
  isInRuralArea,
  SENDINBLUE_TEMPLATES,
  canUserUpdateYoungStatus,
  YOUNG_STATUS,
  canAllowSNU,
  YoungType,
  getPhaseStatusOptions,
  FUNCTIONAL_ERRORS,
  YOUNG_SOURCE,
} from "snu-lib";
import { getDensity, getQPV } from "../../geo";
import { sendTemplate } from "../../brevo";

import { config } from "../../config";
import { logger } from "../../logger";
import { validateId, idSchema } from "../../utils/validator";
import { UserRequest } from "../../controllers/request";
import { canEditYoungConsent, notifyPreviousEmailOfChange, revokeAccessAfterEmailChange, updateYoungConsent } from "./youngEditionService";
import { canEditYoungInScope } from "../youngScope";

const router = express.Router({ mergeParams: true });

const youngEmployedSituationOptions = [YOUNG_SITUATIONS.EMPLOYEE, YOUNG_SITUATIONS.INDEPENDANT, YOUNG_SITUATIONS.SELF_EMPLOYED, YOUNG_SITUATIONS.ADAPTED_COMPANY];
const youngSchooledSituationOptions = [
  YOUNG_SITUATIONS.GENERAL_SCHOOL,
  YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL,
  YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL,
  YOUNG_SITUATIONS.SPECIALIZED_SCHOOL,
  YOUNG_SITUATIONS.APPRENTICESHIP,
];

router.put("/:id/identite", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error: error_id, value: id } = Joi.string().required().validate(req.params.id, { stripUnknown: true });
    if (error_id) {
      capture(error_id);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    // --- validate data
    const bodySchema = Joi.object().keys({
      firstName: validateFirstName().trim(),
      lastName: Joi.string().uppercase(),
      gender: Joi.string().valid("male", "female"),
      email: Joi.string().lowercase().trim(),
      phone: Joi.string().trim(),
      phoneZone: Joi.string()
        .trim()
        .valid(...PHONE_ZONES_NAMES_ARR)
        .allow("", null),
      latestCNIFileExpirationDate: Joi.date().allow(null),
      latestCNIFileCategory: Joi.string().trim(),
      frenchNationality: Joi.string().trim(),
      birthdateAt: Joi.date(),
      birthCity: Joi.string().trim().allow(""),
      birthCityZip: Joi.string().trim().allow(""),
      birthCountry: Joi.string().trim().allow(""),
      address: Joi.string().trim().allow(""),
      zip: Joi.string().trim().allow(""),
      city: Joi.string().trim().allow(""),
      country: Joi.string().trim().allow(""),
      cityCode: Joi.string().trim().allow(""),
      region: Joi.string().trim().allow(""),
      department: Joi.string().trim().allow(""),
      location: Joi.any(),
      addressVerified: Joi.boolean(),
      foreignAddress: Joi.string().trim().allow(""),
      foreignZip: Joi.string().trim().allow(""),
      foreignCity: Joi.string().trim().allow(""),
      foreignCountry: Joi.string().trim().allow(""),
    });
    const result = bodySchema.validate(req.body, { stripUnknown: true });
    const { error, value } = result;
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    value.phone = formatPhoneNumberFromPhoneZone(value.phone, value.phoneZone);

    // --- update young
    const young = await YoungModel.findById(id);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    if (!(await canEditYoungInScope(req.user, young))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    if (value.zip && value.city && value.address) {
      const qpv = await getQPV(value.zip, value.city, value.address);
      if (qpv === true) value.qpv = "true";
      else if (qpv === false) value.qpv = "false";
      else value.qpv = undefined;
    }

    // Check quartier prioritaires.
    if (value.cityCode) {
      const populationDensity = await getDensity(value.cityCode);
      if (populationDensity) {
        value.populationDensity = populationDensity;
      }
    }
    const isRegionRural = isInRuralArea({ ...young, ...value });
    if (isRegionRural !== null) {
      value.isRegionRural = isRegionRural;
    }

    if (value.birthdateAt) value.birthdateAt = value.birthdateAt.setUTCHours(11, 0, 0);

    if (value.latestCNIFileExpirationDate && young.cohort !== "à venir") {
      const cohort = await CohortModel.findById(young.cohortId);
      value.CNIFileNotValidOnStart = new Date(value.latestCNIFileExpirationDate) < new Date(cohort!.dateStart);
    }

    // test de déménagement.
    if (young.department !== value.department && value.department !== null && value.department !== undefined && young.department !== null && young.department !== undefined) {
      await notifDepartmentChange(value.department, SENDINBLUE_TEMPLATES.young.DEPARTMENT_IN, young, { previousDepartment: young.department });
      await notifDepartmentChange(young.department, SENDINBLUE_TEMPLATES.young.DEPARTMENT_OUT, young, { newDepartment: value.department });
    }

    //update applications
    const applications = await ApplicationModel.find({ youngId: young._id });

    const updatePromises = applications.map((application) => {
      application.set({ youngCity: value.city, youngDepartment: value.department });
      return application.save({ fromUser: req.user });
    });

    await Promise.all(updatePromises);

    // Le changement d'adresse email n'est pas une correction comme les autres : il déplace le
    // point d'entrée du compte (constat M73).
    const previousEmail = young.email;
    const emailChanged = !!value.email && value.email !== previousEmail;

    young.set(value);
    if (emailChanged) revokeAccessAfterEmailChange(young);
    await young.save({ fromUser: req.user });
    if (emailChanged) await notifyPreviousEmailOfChange(young, previousEmail);

    // --- result
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (err) {
    capture(err);
    if (err.code === 11000) {
      return res.status(400).send({ ok: false, code: ERRORS.ALREADY_EXISTS });
    }
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/situationparents", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error: error_id, value: id } = Joi.string().required().validate(req.params.id, { stripUnknown: true });
    if (error_id) {
      capture(error_id);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    // --- validate data
    const bodySchema = Joi.object().keys({
      situation: Joi.string().valid(...Object.keys(YOUNG_SITUATIONS)),
      schoolId: Joi.string().trim().allow(""),
      schoolName: Joi.string().trim().allow(""),
      schoolCity: Joi.string().trim().allow(""),
      schoolCountry: Joi.string().trim().allow(""),
      schoolType: Joi.string().trim().allow(""),
      schoolAddress: Joi.string().trim().allow(""),
      schoolComplementAdresse: Joi.string().trim().allow(""),
      schoolZip: Joi.string().trim().allow(""),
      schoolDepartment: Joi.string().trim().allow(""),
      schoolRegion: Joi.string().trim().allow(""),
      grade: Joi.string().valid(...Object.keys(GRADES), "CAP"),
      sameSchoolCLE: Joi.string().trim(),

      parent1Status: Joi.string().trim().allow(""),
      parent1LastName: Joi.string().trim().allow(""),
      parent1FirstName: Joi.string().trim().allow(""),
      parent1Email: Joi.string().trim().allow(""),
      parent1Phone: Joi.string().trim().allow(""),
      parent1PhoneZone: Joi.string()
        .trim()
        .valid(...PHONE_ZONES_NAMES_ARR)
        .allow("", null),
      parent1OwnAddress: Joi.string().trim().valid("true", "false").allow(""),
      parent1Address: Joi.string().trim().allow(""),
      parent1Zip: Joi.string().trim().allow(""),
      parent1City: Joi.string().trim().allow(""),
      parent1Country: Joi.string().trim().allow(""),

      parent2Status: Joi.string().trim().allow(""),
      parent2LastName: Joi.string().trim().allow(""),
      parent2FirstName: Joi.string().trim().allow(""),
      parent2Email: Joi.string().trim().allow(""),
      parent2Phone: Joi.string().trim().allow(""),
      parent2PhoneZone: Joi.string()
        .trim()
        .valid(...PHONE_ZONES_NAMES_ARR)
        .allow("", null),
      parent2OwnAddress: Joi.string().trim().valid("true", "false").allow(""),
      parent2Address: Joi.string().trim().allow(""),
      parent2Zip: Joi.string().trim().allow(""),
      parent2City: Joi.string().trim().allow(""),
      parent2Country: Joi.string().trim().allow(""),

      qpv: Joi.string().trim().valid("true", "false").allow("", null),
      handicap: Joi.string().trim().valid("true", "false").allow("", null),
      ppsBeneficiary: Joi.string().trim().valid("true", "false").allow("", null),
      paiBeneficiary: Joi.string().trim().valid("true", "false").allow("", null),
      specificAmenagment: Joi.string().trim().valid("true", "false").allow("", null),
      specificAmenagmentType: Joi.string().trim().allow(""),
      reducedMobilityAccess: Joi.string().trim().valid("true", "false").allow("", null),
      handicapInSameDepartment: Joi.string().trim().valid("true", "false").allow("", null),
      allergies: Joi.string().trim().valid("true", "false").allow("", null),
      psc1Info: Joi.string().trim().valid("true", "false").allow("", null),

      // old cohorts
      imageRightFilesStatus: Joi.string().trim().valid("TO_UPLOAD", "WAITING_VERIFICATION", "WAITING_CORRECTION", "VALIDATED"),
    });
    const result = bodySchema.validate(req.body, { stripUnknown: true });
    const { error, value } = result;
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    value.parent1Phone = formatPhoneNumberFromPhoneZone(value.parent1Phone, value.parent1PhoneZone);
    value.parent2Phone = formatPhoneNumberFromPhoneZone(value.parent2Phone, value.parent2PhoneZone);

    // --- update young
    const young = await YoungModel.findById(id);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    if (!(await canEditYoungInScope(req.user, young))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    young.set(value);
    young.set({
      employed: youngEmployedSituationOptions.includes(value.situation) ? "true" : "false",
      schooled: youngSchooledSituationOptions.includes(value.situation) ? "true" : "false",
    });
    await young.save({ fromUser: req.user });

    // --- result
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/phasestatus", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error: error_id, value: id } = Joi.string().required().validate(req.params.id, { stripUnknown: true });
    if (error_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // --- validate data
    const bodySchema = Joi.object().keys({
      statusPhase1: Joi.string().valid("AFFECTED", "WAITING_AFFECTATION", "WAITING_ACCEPTATION", "CANCEL", "EXEMPTED", "DONE", "NOT_DONE"), // "WAITING_LIST"
      statusPhase2: Joi.string().valid("WAITING_REALISATION", "IN_PROGRESS", "VALIDATED"),
      statusPhase3: Joi.string().valid("WAITING_REALISATION", "WAITING_VALIDATION", "VALIDATED"),
    });
    const result = bodySchema.validate(req.body, { stripUnknown: true });
    const { error, value } = result;
    if (error) {
      logger.debug(`joi error: ${error.message}`);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    for (const [key, val] of Object.entries(value)) {
      const phaseNumber = parseInt(key.replace("statusPhase", ""));
      const authorizedStatuses = getPhaseStatusOptions(req.user, phaseNumber);
      if (!authorizedStatuses.includes(val)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    // --- get young
    const young = await YoungModel.findById(id);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    if (!(await canEditYoungInScope(req.user, young))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- update dates
    const now = new Date();

    // reset cohesion/bus/meetingPoint center when new status is WAITING_AFFECTATION
    let oldSession;
    let oldBus;
    if (value.statusPhase1 === "WAITING_AFFECTATION") {
      if (young?.meetingPointId) oldBus = await LigneBusModel.findById(young.ligneId);
      if (young?.sessionPhase1Id) {
        oldSession = await SessionPhase1Model.findById(young.sessionPhase1Id);
        young.set({
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
        });
      }
    } else if (value.statusPhase1 === "AFFECTED" && young.statusPhase1 !== "AFFECTED") {
      if (young.hasMeetingInformation !== "true" || !young.cohesionCenterId || !young.meetingPointId || (young.source === YOUNG_SOURCE.VOLONTAIRE && !young.ligneId)) {
        return res.status(400).send({
          ok: false,
          code: FUNCTIONAL_ERRORS.MISSING_AFFECTATION_INFORMATIONS,
        });
      }
    }

    if (value.statusPhase1 === "DONE" && young.statusPhase1 !== "DONE") {
      value.statusPhase2OpenedAt = now;
    }

    if (value.statusPhase2) {
      value.statusPhase2UpdatedAt = now;
      if (value.statusPhase2 === "VALIDATED") {
        value.statusPhase2ValidatedAt = now;
      }
    }

    if (value.statusPhase3) {
      value.statusPhase3UpdatedAt = now;
      if (value.statusPhase3 === "VALIDATED") {
        value.statusPhase3ValidatedAt = now;
      }
    }

    value.lastStatusAt = now;

    // --- check rights
    if (!canUserUpdateYoungStatus(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- update young
    young.set(value);
    await young.save({ fromUser: req.user });

    // --- update statusPhase 1 deendencies
    // if they had a cohesion center, we check if we need to update the places taken / left
    if (oldSession) await updatePlacesSessionPhase1(oldSession, req.user);

    // if they had a bus, we check if we need to update the places taken / left in the bus
    if (oldBus) await updateSeatsTakenInBusLine(oldBus);

    // --- result
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/ref-allow-snu", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const result = Joi.object()
      .keys({
        youngIds: Joi.array().items(idSchema()).min(1).required(),
        consent: Joi.boolean(),
        imageRights: Joi.boolean(),
      })
      .validate(req.body, { stripUnknown: true });
    const { error, value: payload } = result;
    if (error || (payload.consent === undefined && payload.imageRights === undefined)) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canAllowSNU(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // multi-update uniquement pour les CLE
    const youngs = await YoungModel.find({ _id: { $in: payload.youngIds }, source: "CLE" });
    if (youngs.length !== payload.youngIds.length) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    // TODO: use transaction when ready for ES
    for (const young of youngs) {
      if (!(await canEditYoungConsent(young, req.user))) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }
    for (const young of youngs) {
      await updateYoungConsent(young, req.user, payload);
    }

    return res.status(200).send({ ok: true, data: payload.youngIds });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/ref-allow-snu", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error: error_id, value: id } = validateId(req.params.id);
    if (error_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // --- validate data
    const bodySchema = Joi.object().keys({
      consent: Joi.boolean().required(),
      imageRights: Joi.boolean().required(),
    });
    const result = bodySchema.validate(req.body, { stripUnknown: true });
    const { error, value } = result;
    if (error) {
      logger.debug(`joi error: ${error.message}`);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canAllowSNU(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // --- get young
    const young = await YoungModel.findById(id);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    if (!(await canEditYoungConsent(young, req.user))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    await updateYoungConsent(young, req.user, value);

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
