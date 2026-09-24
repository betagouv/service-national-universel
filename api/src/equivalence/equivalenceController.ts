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
  COHORT_STATUS,
  isAdmin,
  YOUNG_STATUS_PHASE1,
} from "snu-lib";
import { capture } from "../sentry";
import { MissionEquivalenceModel, YoungModel, CohortModel } from "../models";
import { deleteFilesByList, getFile, isYoung as isYoungFn, isReferent, listFiles, updateYoungPhase2StatusAndHours } from "../utils";
import { UserRequest } from "../controllers/request";
import { notifyReferentsEquivalenceSubmitted, notifyYoungChangementStatutEquivalence, notifyYoungEquivalenceSubmitted } from "../application/applicationNotificationService";
import { decrypt } from "../cryptoUtils";
import { getMimeFromBuffer } from "../utils/file";
import { createEquivalenceValidator, updateEquivalenceValidator } from "./equivalenceValidator";
import { YoungPerimeterRequest } from "../controllers/young/youngPerimeterMiddleware";

const router = express.Router({ mergeParams: true });

/**
 * Seuls ces rôles instruisent une équivalence (création directement VALIDATED, changement de statut).
 * Auparavant tout référent authentifié — responsable de structure, visiteur, chef de centre — pouvait
 * valider la phase 2 de n'importe quel volontaire en un appel (constats H51 à H54).
 */
const EQUIVALENCE_INSTRUCTOR_ROLES: string[] = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION];

/**
 * La durée déclarée par un volontaire (type « Autre ») alimente directement le compteur d'heures de
 * phase 2 : elle est bornée côté serveur, le validateur ne posant aucune limite.
 */
function boundMissionDuration(duration: string | number | undefined | null, isYoung: boolean) {
  if (!isYoung) return duration;
  const parsed = Number(duration);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(parsed, PHASE2_TOTAL_HOURS);
}

router.get("/", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required() }).validate({ ...req.params }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

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
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const equivalence = await MissionEquivalenceModel.findById(value.idEquivalence);
    if (!equivalence) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (equivalence.youngId?.toString() !== value.id) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    res.status(200).send({ ok: true, data: equivalence });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: YoungPerimeterRequest, res) => {
  try {
    const { error, value } = createEquivalenceValidator.validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const young = req.targetYoung!;

    const isYoung = isYoungFn(req.user);
    const cohort = await CohortModel.findOne({ name: young.cohort });

    if (isYoung && !canCreateEquivalences(young, cohort || undefined)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (isReferent(req.user)) {
      if (!EQUIVALENCE_INSTRUCTOR_ROLES.includes(req.user.role)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      if (isAdmin(req.user)) {
        const hasValidatedOrExemptedPhase1 = [YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(young.statusPhase1 as any);
        if (!hasValidatedOrExemptedPhase1) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      } else {
        if (!canReferentCreateEquivalence(cohort || undefined)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    const youngId = value.id;
    delete value.id;
    const data = await MissionEquivalenceModel.create({
      ...value,
      youngId,
      status: isYoung ? "WAITING_VERIFICATION" : "VALIDATED",
      // ajoute 84h à l'équivalence si c'est autre chose q'un type autre (ex: BAFA, etc..)
      missionDuration: boundMissionDuration(value.missionDuration || PHASE2_TOTAL_HOURS, isYoung),
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

router.put("/:idEquivalence", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: YoungPerimeterRequest, res) => {
  try {
    const { error, value } = updateEquivalenceValidator.validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (!["Certification Union Nationale du Sport scolaire (UNSS)", "Engagements lycéens"].includes(value.type)) {
      value.sousType = undefined;
    }
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const young = req.targetYoung!;

    const cohort = await CohortModel.findOne({ name: young.cohort });

    const isYoung = isYoungFn(req.user);

    if (isYoung && !canCreateEquivalences(young, cohort || undefined)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    if (isReferent(req.user)) {
      if (!EQUIVALENCE_INSTRUCTOR_ROLES.includes(req.user.role)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      if (isAdmin(req.user)) {
        const hasValidatedOrExemptedPhase1 = [YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(young.statusPhase1 as any);
        if (!hasValidatedOrExemptedPhase1) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      } else {
        if (!canReferentCreateEquivalence(cohort || undefined)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    const equivalence = await MissionEquivalenceModel.findById(value.idEquivalence);
    if (!equivalence) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    // L'équivalence doit bien appartenir au volontaire de l'URL : sinon un jeune écrasait le
    // `status_equivalence` d'un tiers depuis sa propre URL (constat H54).
    if (equivalence.youngId?.toString() !== young._id.toString()) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Un jeune ne pilote ni le statut d'instruction ni le message du référent : sa mise à jour est une
    // correction, qui repart systématiquement en vérification (constats H53 / H54).
    if (isYoung) {
      delete value.message;
      value.status = EQUIVALENCE_STATUS.WAITING_VERIFICATION;
    }

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
      missionDuration: boundMissionDuration(missionDuration, isYoung),
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
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
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
