import express from "express";
import passport from "passport";
import Joi from "joi";
import mime from "mime-types";
import {
  canCreateEquivalences,
  EQUIVALENCE_STATUS,
  ERRORS,
  PHASE2_TOTAL_HOURS,
  SENDINBLUE_TEMPLATES,
  ROLES,
  canReferentCreateEquivalence,
  isReferent,
} from "snu-lib";
import { capture } from "../sentry";
import { MissionEquivalenceModel, YoungModel, CohortModel } from "../models";
import { deleteFilesByList, getFile, isYoung as isYoungFn, listFiles, updateYoungPhase2StatusAndHours } from "../utils";
import { UserRequest } from "../controllers/request";
import { notifyReferentsEquivalenceSubmitted, notifyYoungChangementStatutEquivalence, notifyYoungEquivalenceSubmitted } from "../application/applicationNotificationService";
import { decrypt } from "../cryptoUtils";
import { getMimeFromBuffer } from "../utils/file";
import { createEquivalenceValidator, updateEquivalenceValidator } from "./equivalenceValidator";

const router = express.Router({ mergeParams: true });

router.get("/", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res) => {
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

router.get("/file/:name", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res) => {
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

router.get("/:idEquivalence", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required(), idEquivalence: Joi.string().required() }).validate({ ...req.params }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    }

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    const equivalence = await MissionEquivalenceModel.findById(value.idEquivalence);
    if (!equivalence) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    res.status(200).send({ ok: true, data: equivalence });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = createEquivalenceValidator.validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    const isYoung = isYoungFn(req.user);
    const cohort = await CohortModel.findOne({ name: young.cohort });

    if (isYoung && !canCreateEquivalences(young, cohort)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    if (isReferent(req.user) && !canReferentCreateEquivalence(cohort)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

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

router.put("/:idEquivalence", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res) => {
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

    const cohort = await CohortModel.findOne({ name: young.cohort });

    if (!canCreateEquivalences(young, cohort)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
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

router.delete("/:idEquivalence", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required(), idEquivalence: Joi.string().required() }).validate({ ...req.params }, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error: error.details });
    }

    const equivalence = await MissionEquivalenceModel.findById(value.idEquivalence);

    if (!equivalence) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Equivalence not found" });
    }

    if (!isYoungFn(req.user) || equivalence.youngId!.toString() !== req.user._id.toString() || equivalence.status !== EQUIVALENCE_STATUS.WAITING_VERIFICATION) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED, message: "Unauthorized to delete this equivalence" });
    }

    const young = await YoungModel.findById(req.user._id);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Young not found" });
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

    young.set({ status_equivalence: undefined });
    await young.save({ fromUser: req.user });

    const mostRecentEquivalence = await MissionEquivalenceModel.findOne({
      youngId: young._id.toString(),
    }).sort({ createdAt: -1 });

    if (mostRecentEquivalence) {
      // on save 2 fois pour garder une trace dans l'historique
      young.set({ status_equivalence: mostRecentEquivalence.status });
      await young.save({ fromUser: req.user });
    }

    return res.status(200).send({ ok: true, message: "Equivalence deleted successfully" });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, message: "An error occurred while deleting equivalence" });
  }
});

module.exports = router;
