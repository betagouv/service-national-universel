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

const express = require("express");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");
const YoungModel = require("../models/young");
const ClasseModel = require("../models/cle/classe");
const ApplicationObject = require("../models/application");
const { ERRORS, notifDepartmentChange, updateSeatsTakenInBusLine, updatePlacesSessionPhase1 } = require("../utils");
const { capture } = require("../sentry");
const { validateFirstName } = require("../utils/validator");
const { serializeYoung } = require("../utils/serializer");
const passport = require("passport");
const {
  PHONE_ZONES_NAMES_ARR,
  formatPhoneNumberFromPhoneZone,
  YOUNG_SITUATIONS,
  GRADES,
  isInRuralArea,
  SENDINBLUE_TEMPLATES,
  canUserUpdateYoungStatus,
  YOUNG_STATUS,
  canEditYoung,
  canAllowSNU,
} = require("snu-lib");
const { getDensity, getQPV } = require("../geo");
const { sendTemplate } = require("../sendinblue");
const { format } = require("date-fns");
const config = require("../config");
const YoungObject = require("../models/young");
const LigneDeBusModel = require("../models/PlanDeTransport/ligneBus");
const SessionPhase1Model = require("../models/sessionPhase1");
const CohortModel = require("../models/cohort");
const { APP_URL } = require("../config");

const youngEmployedSituationOptions = [YOUNG_SITUATIONS.EMPLOYEE, YOUNG_SITUATIONS.INDEPENDANT, YOUNG_SITUATIONS.SELF_EMPLOYED, YOUNG_SITUATIONS.ADAPTED_COMPANY];
const youngSchooledSituationOptions = [
  YOUNG_SITUATIONS.GENERAL_SCHOOL,
  YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL,
  YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL,
  YOUNG_SITUATIONS.SPECIALIZED_SCHOOL,
  YOUNG_SITUATIONS.APPRENTICESHIP,
];

router.put("/:id/identite", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
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
      birthCity: Joi.string().trim(),
      birthCityZip: Joi.string().trim(),
      birthCountry: Joi.string().trim(),
      address: Joi.string().trim(),
      zip: Joi.string().trim(),
      city: Joi.string().trim(),
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

    if (!canEditYoung(req.user, young)) {
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
      const cohort = await CohortModel.findOne({ name: young.cohort });
      value.CNIFileNotValidOnStart = new Date(value.latestCNIFileExpirationDate) < new Date(cohort.dateStart);
    }

    // test de déménagement.
    if (young.department !== value.department && value.department !== null && value.department !== undefined && young.department !== null && young.department !== undefined) {
      await notifDepartmentChange(value.department, SENDINBLUE_TEMPLATES.young.DEPARTMENT_IN, young, { previousDepartment: young.department });
      await notifDepartmentChange(young.department, SENDINBLUE_TEMPLATES.young.DEPARTMENT_OUT, young, { newDepartment: value.department });
    }

    //update applications
    const applications = await ApplicationObject.find({ youngId: young._id });

    const updatePromises = applications.map((application) => {
      application.set({ youngCity: value.city, youngDepartment: value.department });
      return application.save();
    });

    await Promise.all(updatePromises);

    young.set(value);
    await young.save({ fromUser: req.user });

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

router.put("/:id/situationparents", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
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
      grade: Joi.string().valid(...Object.keys(GRADES)),
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

      // old cohorts
      imageRightFilesStatus: Joi.string().trim().valid("TO_UPLOAD", "WAITING_VERIFICATION", "WAITING_CORRECTION", "VALIDATED"),
    });
    const result = bodySchema.validate(req.body, { stripUnknown: true });
    const { error, value } = result;
    console.log("🚀 ~ file: young-edition.js:191 ~ router.put ~ value:", value);
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

    if (!canEditYoung(req.user, young)) {
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

router.put("/:id/phasestatus", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
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
      console.log("joi error: ", error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    // --- get young
    const young = await YoungModel.findById(id);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    if (!canEditYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- update dates
    const now = new Date();

    // reset cohesion/bus/meetingPoint center when new status is WAITING_AFFECTATION
    let oldSession;
    let oldBus;
    if (value.statusPhase1 === "WAITING_AFFECTATION") {
      if (young?.meetingPointId) oldBus = await LigneDeBusModel.findById(young.ligneId);
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

router.put("/:id/parent-allow-snu", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: error_id, value: id } = Joi.string().required().validate(req.params.id, { stripUnknown: true });
    if (error_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // --- validate data
    const bodySchema = Joi.object().keys({
      parent: Joi.number().valid(1, 2).required(),
      allow: Joi.boolean().required(),
    });
    const result = bodySchema.validate(req.body, { stripUnknown: true });
    const { error, value } = result;
    if (error) {
      console.log("joi error: ", error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    // --- get young
    const young = await YoungModel.findById(id);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    if (!canEditYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    let changes = {
      [`parent${value.parent}AllowSNU`]: value.allow ? "true" : "false",
    };

    let notification = null;
    const futureYoung = { ...young, ...changes };
    if (futureYoung.parent1AllowSNU === "false" || futureYoung.parent2AllowSNU === "false") {
      if (young.parentAllowSNU !== "false") {
        changes.parentAllowSNU = "false";
        changes.status = YOUNG_STATUS.NOT_AUTORISED;
        notification = "rejected";
      }
    } else if (futureYoung.parent1AllowSNU === "true" && futureYoung.parent2AllowSNU !== "false") {
      if (young.parentAllowSNU !== "true") {
        // TODO: on ne traite pas ce cas là pour l'instant la route n'étant appelée QUE pour un rejet du parent2.
        // body.parentAllowSNU = "true";
        // notification = "accepted";
      }
    }
    if (value.parent === 2 && value.allow === false) {
      changes.parent2RejectSNUComment = `Renseigné par ${req.user.firstName} ${req.user.lastName} le ${format(new Date(), "dd/MM/yyyy à HH:mm")}`;
    }

    // --- update young
    young.set(changes);
    await young.save({ fromUser: req.user });

    if (notification === "rejected") {
      await sendTemplate(SENDINBLUE_TEMPLATES.young.PARENT2_DID_NOT_CONSENT, {
        emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
      });
    }
    // else if (notification === "accepted") {
    //   // on ne traite pas ce cas là pour l'instant la route n'étant appelée QUE pour un rejet du parent2.
    // }

    // --- result
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/ref-allow-snu", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: error_id, value: id } = Joi.string().required().validate(req.params.id, { stripUnknown: true });
    if (error_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // --- validate data
    const bodySchema = Joi.object().keys({
      consent: Joi.boolean().required(),
      imageRights: Joi.boolean().required(),
    });
    const result = bodySchema.validate(req.body, { stripUnknown: true });
    const { error, value } = result;
    if (error) {
      console.log("joi error: ", error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canAllowSNU(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // --- get young
    const young = await YoungModel.findById(id);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    if (!canEditYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const classe = await ClasseModel.findById(young.classeId).populate({
      path: "etablissement",
      options: { select: { coordinateurIds: 1, referentEtablissementIds: 1 } },
    });

    if (!classe) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    //check si le ref est bien lié au jeune
    if (
      !classe.referentClasseIds.includes(req.user._id) &&
      !classe.etablissement.coordinateurIds.includes(req.user._id) &&
      !classe.etablissement.referentEtablissementIds.includes(req.user._id)
    ) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const changes = generateChanges(value, young);

    young.set(changes);
    await young.save({ fromUser: req.user });

    if (value.consent) {
      try {
        const emailTo = [{ name: `${young.firstName} ${young.lastName}`, email: young.email }];
        await sendTemplate(SENDINBLUE_TEMPLATES.young.PARENT_CONSENTED, {
          emailTo,
          params: {
            cta: `${APP_URL}/`,
            SOURCE: young.source,
          },
        });
      } catch (e) {
        capture(e);
      }
    }

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

function generateChanges(value, young) {
  const changes = {};

  const setIfTrue = (condition, field, value) => {
    if (condition) {
      changes[field] = value;
    }
  };

  setIfTrue(value.consent, "status", YOUNG_STATUS.WAITING_VALIDATION);
  setIfTrue(value.consent && young.inscriptionStep2023 === "WAITING_CONSENT", "inscriptionStep2023", "DONE");
  setIfTrue(value.consent && young.reinscriptionStep2023 === "WAITING_CONSENT", "reinscriptionStep2023", "DONE");
  setIfTrue(value.consent, "parentAllowSNU", "true");

  //Parent 1
  setIfTrue(value.consent, "parent1AllowSNU", "true");
  setIfTrue(value.consent, "parent1ValidationDate", new Date());
  setIfTrue(value.imageRights, "parent1AllowImageRights", "true");
  //Parent 2
  setIfTrue(young.parent2Status && value.consent, "parent2AllowSNU", "true");
  setIfTrue(young.parent2Status && value.imageRights, "parent2AllowImageRights", "true");
  setIfTrue(young.parent2Status && value.imageRights, "parent2ValidationDate", new Date());

  return changes;
}

router.get("/:id/remider/:idParent", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: error_id, value: id } = Joi.string().required().validate(req.params.id, { stripUnknown: true });
    if (error_id) {
      capture(error_id);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { error: error_parent_id, value: parentId } = Joi.number().valid(1, 2).required().validate(req.params.idParent, { stripUnknown: true });
    if (error_parent_id) {
      capture(error_parent_id);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungModel.findById(id);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (!young.inscriptionDoneDate) {
      return res.status(400).send({ ok: false, code: ERRORS.BAD_REQUEST });
    }

    // parent 1
    if (parentId === 1) {
      if (young.parent1AllowSNU || young.parentAllowSNU) {
        return res.status(400).send({ ok: false, code: ERRORS.BAD_REQUEST });
      }
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT1_CONSENT, {
        emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
        params: {
          cta: `${config.APP_URL}/representants-legaux/presentation?token=${young.parent1Inscription2023Token}&parent=1%?utm_campaign=transactionnel+replegal1+donner+consentement&utm_source=notifauto&utm_medium=mail+605+donner`,
          youngFirstName: young.firstName,
          youngName: young.lastName,
        },
      });
      // parent 2
    } else {
      if (
        !young.parent2Status ||
        !young.parent1AllowSNU ||
        young.parent1AllowSNU === "false" ||
        young.parent2AllowSNU === "false" ||
        young.parentAllowSNU === "false" ||
        young.parent1AllowImageRights === "false" ||
        young.parent2AllowImageRights
      ) {
        return res.status(400).send({ ok: false, code: ERRORS.BAD_REQUEST });
      }
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT2_CONSENT, {
        emailTo: [{ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email }],
        params: {
          cta: `${config.APP_URL}/representants-legaux/presentation-parent2?token=${young.parent2Inscription2023Token}`,
          youngFirstName: young.firstName,
          youngName: young.lastName,
        },
      });
    }

    return res.status(200).send({ ok: true });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/parent-image-rights-reset", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // checks data
    const { error: paramError, value: paramValue } = Joi.object({ id: Joi.string().required() }).validate(req.params, { stripUnknown: true });
    if (paramError) {
      capture(paramError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const youngId = paramValue.id;

    const { error: bodyError, value: bodyValue } = Joi.object({ parentId: Joi.number().valid(1, 2).required() }).validate(req.body, { stripUnknown: true });
    if (bodyError) {
      capture(bodyError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const parentId = bodyValue.parentId;

    // --- get young & verify rights
    const young = await YoungObject.findById(youngId);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });
    }

    if (!canEditYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- reset parent image rights
    young[`parent${parentId}AllowImageRights`] = undefined;
    if (parentId === 2) {
      young.set({ parent2AllowImageRightsReset: "true" });
    }
    await young.save();

    // --- send notification
    await sendTemplate(SENDINBLUE_TEMPLATES.parent[`PARENT${parentId}_RESEND_IMAGERIGHT`], {
      emailTo: [{ name: young[`parent${parentId}FirstName`] + " " + young[`parent${parentId}LastName`], email: young[`parent${parentId}Email`] }],
      params: {
        cta: `${config.APP_URL}/representants-legaux/droits-image${parentId === 2 ? "2" : ""}?parent=${parentId}&token=` + young[`parent${parentId}Inscription2023Token`],
        youngFirstName: young.firstName,
        youngName: young.lastName,
      },
    });

    // --- return updated young
    res.status(200).send({ ok: true, data: serializeYoung(young, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/parent-allow-snu-reset", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // checks data
    const { error: paramError, value: paramValue } = Joi.object({ id: Joi.string().required() }).validate(req.params, { stripUnknown: true });
    if (paramError) {
      capture(paramError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const youngId = paramValue.id;

    // --- get young & verify rights
    const young = await YoungObject.findById(youngId);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });
    }

    if (!canEditYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- reset parent allow snu
    young.set({ parentAllowSNU: undefined, parent1AllowSNU: undefined, status: YOUNG_STATUS.IN_PROGRESS, parent1ValidationDate: undefined });
    if (young.parent2Id) young.set({ parent2AllowSnu: undefined, parent2ValidationDate: undefined });
    await young.save();

    // --- send notification
    // parent 1
    await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT1_CONSENT, {
      emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
      params: {
        cta: `${config.APP_URL}/representants-legaux/presentation?token=${young.parent1Inscription2023Token}&parent=1%?utm_campaign=transactionnel+replegal1+donner+consentement&utm_source=notifauto&utm_medium=mail+605+donner`,
        youngFirstName: young.firstName,
        youngName: young.lastName,
      },
    });
    // parent 2
    if (young.parent2Id) {
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT2_CONSENT, {
        emailTo: [{ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email }],
        params: {
          cta: `${config.APP_URL}/representants-legaux/presentation-parent2?token=${young.parent2Inscription2023Token}`,
          youngFirstName: young.firstName,
          youngName: young.lastName,
        },
      });
    }

    // --- return updated young
    res.status(200).send({ ok: true, data: serializeYoung(young, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/reminder-parent-image-rights", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // checks data
    const { error: paramError, value: paramValue } = Joi.object({ id: Joi.string().required() }).validate(req.params, { stripUnknown: true });
    if (paramError) {
      capture(paramError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const youngId = paramValue.id;

    const { error: bodyError, value: bodyValue } = Joi.object({ parentId: Joi.number().valid(1, 2).required() }).validate(req.body, { stripUnknown: true });
    if (bodyError) {
      capture(bodyError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const parentId = bodyValue.parentId;

    // --- get young & verify rights
    const young = await YoungObject.findById(youngId);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });
    }

    if (!canEditYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- Check and resend notification
    if (young[`parent${parentId}AllowImageRights`] === "true" || young[`parent${parentId}AllowImageRights`] === "false") {
      return res.status(400).send({ ok: false, code: ERRORS.BAD_REQUEST });
    }

    // --- send notification
    await sendTemplate(SENDINBLUE_TEMPLATES.parent[`PARENT${parentId}_RESEND_IMAGERIGHT`], {
      emailTo: [{ name: young[`parent${parentId}FirstName`] + " " + young[`parent${parentId}LastName`], email: young[`parent${parentId}Email`] }],
      params: {
        cta: `${config.APP_URL}/representants-legaux/droits-image${parentId === 2 ? "2" : ""}?parent=${parentId}&token=` + young[`parent${parentId}Inscription2023Token`],
        youngFirstName: young.firstName,
        youngName: young.lastName,
      },
    });

    return res.status(200).send({ ok: true });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
