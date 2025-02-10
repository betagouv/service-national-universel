import express from "express";
import passport from "passport";
import Joi from "joi";
import { deleteFilesByList, listFiles, getFile, isYoung as isYoungFn } from "../../utils/index";
import { capture } from "../../sentry";
import { YoungModel, CohortModel, MissionEquivalenceModel } from "../../models";
import { ERRORS, updateYoungPhase2StatusAndHours } from "../../utils";
import { canApplyToPhase2, SENDINBLUE_TEMPLATES, canEditYoung, UNSS_TYPE, ENGAGEMENT_TYPES, ENGAGEMENT_LYCEEN_TYPES, EQUIVALENCE_STATUS } from "snu-lib";
import { validateId, validatePhase2Preference } from "../../utils/validator";
import { decrypt } from "../../cryptoUtils";
import { getMimeFromBuffer } from "../../utils/file";
import { PHASE2_TOTAL_HOURS } from "snu-lib";
import mime from "mime-types";
import { UserRequest } from "../request";
import {
  notifyReferentMilitaryPreparationFilesSubmitted,
  notifyReferentsEquivalenceSubmitted,
  notifyYoungChangementStatutEquivalence,
  notifyYoungEquivalenceSubmitted,
} from "../../application/applicationNotificationService";
import { MILITARY_PREPARATION_FILES_STATUS } from "snu-lib/src";

const router = express.Router({ mergeParams: true });

router.post("/equivalence", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      type: Joi.string()
        .trim()
        .valid(...ENGAGEMENT_TYPES)
        .required(),
      sousType: Joi.string()
        .trim()
        .valid(...UNSS_TYPE, ...ENGAGEMENT_LYCEEN_TYPES),
      desc: Joi.string().trim().when("type", { is: "Autre", then: Joi.required() }),
      structureName: Joi.string().trim().required(),
      address: Joi.string().trim().required(),
      zip: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      startDate: Joi.string().trim().required(),
      endDate: Joi.string().trim().required(),
      missionDuration: Joi.number().allow(null),
      contactFullName: Joi.string().trim().required(),
      contactEmail: Joi.string().trim().required(),
      files: Joi.array().items(Joi.string().required()).required().min(1),
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    const isYoung = isYoungFn(req.user);
    const cohort = await CohortModel.findById(young.cohortId);

    if (isYoung && !canApplyToPhase2(young, cohort)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const youngId = value.id;
    delete value.id;
    const data = await MissionEquivalenceModel.create({
      ...value,
      youngId,
      status: isYoung ? "WAITING_VERIFICATION" : "VALIDATED",
      // ajoute 84h à l'équivalence si c'est autre chose q'un type autre (ex: BAFA, etc..)
      missionDuration: value.missionDuration || PHASE2_TOTAL_HOURS,
    }); // Si c'est un jeune, on met à jour le statut d'équivalence
    if (isYoung) {
      young.set({ status_equivalence: "WAITING_VERIFICATION" });
    }

    // Mise à jour du statut de la phase 2 et des heures du jeune
    await updateYoungPhase2StatusAndHours(young, req.user);

    await young.save({ fromUser: req.user });

    await notifyYoungEquivalenceSubmitted(young);

    if (isYoung) {
      await notifyReferentsEquivalenceSubmitted(young);
    }

    res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

const updateEquivalenceValidator = Joi.object({
  id: Joi.string().required(),
  idEquivalence: Joi.string().required(),
  status: Joi.string().valid("WAITING_VERIFICATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED"),
  type: Joi.string()
    .trim()
    .valid(...ENGAGEMENT_TYPES),
  sousType: Joi.string()
    .trim()
    .valid(...UNSS_TYPE, ...ENGAGEMENT_LYCEEN_TYPES),
  desc: Joi.string().trim(),
  structureName: Joi.string().trim(),
  address: Joi.string().trim(),
  zip: Joi.string().trim(),
  city: Joi.string().trim(),
  startDate: Joi.string().trim(),
  endDate: Joi.string().trim(),
  contactFullName: Joi.string().trim(),
  missionDuration: Joi.number().allow(null),
  contactEmail: Joi.string().trim(),
  files: Joi.array().items(Joi.string()),
  message: Joi.string().trim(),
});

router.put("/equivalence/:idEquivalence", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = updateEquivalenceValidator.validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (!["Certification Union Nationale du Sport scolaire (UNSS)", "Engagements lycéens"].includes(value.type)) {
      value.sousType = undefined;
    }
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    }

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    const cohort = await CohortModel.findById(young.cohortId);

    if (!canApplyToPhase2(young, cohort)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const equivalence = await MissionEquivalenceModel.findById(value.idEquivalence);
    if (!equivalence) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    let missionDuration: string | number;
    if (value?.type === "Autre" || equivalence.type === "Autre") {
      // Priorité à la durée de mission dans `value` si elle existe, sinon utiliser celle de `equivalence`
      missionDuration = value?.missionDuration || equivalence.missionDuration;
    } else {
      // Si le type n'est pas "Autre", utiliser la valeur par défaut
      missionDuration = PHASE2_TOTAL_HOURS;
    }

    delete value.id;
    delete value.idEquivalence;
    equivalence.set({
      ...value,
      missionDuration: missionDuration,
    });
    const data = await equivalence.save({ fromUser: req.user });

    if ([EQUIVALENCE_STATUS.WAITING_CORRECTION, EQUIVALENCE_STATUS.VALIDATED, EQUIVALENCE_STATUS.REFUSED, EQUIVALENCE_STATUS.WAITING_VERIFICATION].includes(value.status)) {
      await updateYoungPhase2StatusAndHours(young, req.user);
    }

    young.set({ status_equivalence: value.status });

    await young.save({ fromUser: req.user });

    if (SENDINBLUE_TEMPLATES.young[`EQUIVALENCE_${value.status}`]) {
      await notifyYoungChangementStatutEquivalence(young, value.status, value.message);
    }

    res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/equivalences", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required() }).validate({ ...req.params }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    }

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    const equivalences = await MissionEquivalenceModel.find({ youngId: value.id }).sort({ createdAt: -1 });
    res.status(200).send({ ok: true, data: equivalences });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/equivalence/:idEquivalence", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required(), idEquivalence: Joi.string().required() }).validate({ ...req.params }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    }

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    const equivalence = await MissionEquivalenceModel.findById(value.idEquivalence);
    if (!equivalence) return res.status(404).send({ ok: false, code: ERRORS.EQUIVALENCE_NOT_FOUND });
    res.status(200).send({ ok: true, data: equivalence });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/equivalence/:idEquivalence", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required(), idEquivalence: Joi.string().required() }).validate({ ...req.params }, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error: error.details });
    }

    const equivalence = await MissionEquivalenceModel.findById(value.idEquivalence);

    if (!equivalence) {
      return res.status(404).send({ ok: false, code: ERRORS.EQUIVALENCE_NOT_FOUND, message: "Equivalence not found" });
    }

    if (!isYoungFn(req.user) || equivalence.youngId!.toString() !== req.user._id.toString() || equivalence.status !== EQUIVALENCE_STATUS.WAITING_VERIFICATION) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED, message: "Unauthorized to delete this equivalence" });
    }
    const files = await listFiles(`app/young/${req.user._id}/equivalenceFiles/`);
    const missionEquivalencesFiles = equivalence.files;
    const equivalenceFilesArray = files
      .filter((e) => missionEquivalencesFiles.includes(e.Key.split("/").pop()))
      .map((e) => {
        return { Key: e.Key };
      });
    if (equivalenceFilesArray.length !== 0) {
      await deleteFilesByList(equivalenceFilesArray);
    }
    await equivalence.deleteOne();

    return res.status(200).send({ ok: true, message: "Equivalence deleted successfully" });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, message: "An error occurred while deleting equivalence" });
  }
});

router.put("/militaryPreparation/status", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      statusMilitaryPreparationFiles: Joi.string().required().valid(Object.values(MILITARY_PREPARATION_FILES_STATUS)),
    }).validate(
      {
        ...req.params,
        ...req.body,
      },
      { stripUnknown: true },
    );
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    }

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    young.set({ statusMilitaryPreparationFiles: value.statusMilitaryPreparationFiles });

    if (value.statusMilitaryPreparationFiles === MILITARY_PREPARATION_FILES_STATUS.WAITING_VERIFICATION) {
      await notifyReferentMilitaryPreparationFilesSubmitted(young);
    }

    await young.save({ fromUser: req.user });
    res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/preference", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    const { error: errorBody, value: checkedBody } = validatePhase2Preference(req.body);
    if (errorId || errorBody) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungModel.findById(checkedId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canEditYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    young.set(checkedBody);
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/equivalence-file/:name", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({ name: Joi.string().required() })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { name } = value;

    const downloaded = await getFile(`app/young/${req.user._id.toString()}/equivalenceFiles/${name}`);
    const decryptedBuffer = decrypt(downloaded.Body);

    const mimeFromFile = await getMimeFromBuffer(decryptedBuffer);

    return res.status(200).send({
      data: Buffer.from(decryptedBuffer, "base64"),
      mimeType: mimeFromFile ? mimeFromFile : mime.lookup(name),
      fileName: name,
      ok: true,
    });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
