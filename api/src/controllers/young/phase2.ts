import express from "express";
import passport from "passport";
import Joi from "joi";
import { capture } from "../../sentry";
import { ERRORS, isYoung } from "../../utils";
import { validatePhase2Preference } from "../../utils/validator";
import { MILITARY_PREPARATION_FILES_STATUS, canViewYoungMilitaryPreparationFile } from "snu-lib";
import { serializeYoung } from "../../utils/serializer";
import { YoungPerimeterRequest } from "./youngPerimeterMiddleware";
import { notifyReferentMilitaryPreparationFilesSubmitted } from "../../application/applicationNotificationService";

const router = express.Router({ mergeParams: true });

router.use("/equivalence", require("../../equivalence/equivalenceController"));

router.put("/militaryPreparation/status", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req: YoungPerimeterRequest, res) => {
  try {
    const { error, value } = Joi.object({
      statusMilitaryPreparationFiles: Joi.string()
        .required()
        .valid(
          MILITARY_PREPARATION_FILES_STATUS.WAITING_VERIFICATION,
          MILITARY_PREPARATION_FILES_STATUS.WAITING_CORRECTION,
          MILITARY_PREPARATION_FILES_STATUS.VALIDATED,
          MILITARY_PREPARATION_FILES_STATUS.REFUSED,
        ),
    }).validate(
      {
        ...req.params,
        ...req.body,
      },
      { stripUnknown: true },
    );
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    // L'appartenance (jeune = lui-même, référent = son périmètre) est contrôlée par le middleware monté
    // sur /young/:id/phase2 ; la route ne faisait auparavant aucune vérification (constat C18).
    const young = req.targetYoung!;

    // Le volontaire dépose son dossier ; il ne peut pas le valider, le refuser ni le renvoyer en
    // correction. Ces décisions reviennent aux référents qui peuvent consulter les pièces du
    // dossier (cf. FM1 : la restriction n'existait que dans l'app volontaire).
    if (value.statusMilitaryPreparationFiles !== MILITARY_PREPARATION_FILES_STATUS.WAITING_VERIFICATION) {
      if (isYoung(req.user) || !canViewYoungMilitaryPreparationFile(req.user, young)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    young.set({ statusMilitaryPreparationFiles: value.statusMilitaryPreparationFiles });

    if (value.statusMilitaryPreparationFiles === MILITARY_PREPARATION_FILES_STATUS.WAITING_VERIFICATION) {
      await notifyReferentMilitaryPreparationFilesSubmitted(young);
    }

    await young.save({ fromUser: req.user });
    res.status(200).send({ ok: true, data: serializeYoung(young, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/preference", passport.authenticate("referent", { session: false, failWithError: true }), async (req: YoungPerimeterRequest, res) => {
  try {
    const { error: errorBody, value: checkedBody } = validatePhase2Preference(req.body);
    if (errorBody) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = req.targetYoung!;

    young.set(checkedBody);
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
