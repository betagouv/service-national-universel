import express from "express";
import passport from "passport";
import Joi from "joi";
import { Response } from "express";
import { logger } from "../../logger";

import { ROLES, SUB_ROLES, isChefEtablissement, isReferentOrAdmin, isSuperAdmin, FeatureFlagName, ReferentsRoutes } from "snu-lib";

import { deleteOldReferentClasse, doInviteMultipleChefsEtablissements, doInviteMultipleReferentClasseVerifiee } from "../../services/cle/referent";
import { uploadFile } from "../../utils";
import { RouteRequest, RouteResponse, UserRequest } from "../../controllers/request";
import { capture } from "../../sentry";
import { ERRORS } from "../../utils";
import { EtablissementModel } from "../../models";
import { findOrCreateReferent, inviteReferent, inviteReferentClasseAsCoordinator } from "../../services/cle/referent";
import { generateCSVStream } from "../../services/fileService";
import { isFeatureAvailable } from "../../featureFlag/featureFlagService";
import { GetReferentsByIdsSchema } from "./referentValidator";
import { getReferentsByIds } from "./referentService";
import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { accessControlMiddleware } from "../../middlewares/accessControlMiddleware";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = express.Router();
router.use(authMiddleware("referent"));

router.post("/invite-coordonnateur", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      email: Joi.string().lowercase().trim().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      etablissementId: Joi.string(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    let etablissement;
    if (isChefEtablissement(req.user)) {
      //for now, only one chef per etablissement
      etablissement = await EtablissementModel.findOne({ referentEtablissementIds: req.user._id });
    } else if (isReferentOrAdmin(req.user)) {
      if (!value.etablissementId) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      etablissement = await EtablissementModel.findById(value.etablissementId);
    } else {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const { email, firstName, lastName } = value;

    //for now, only 2 coordinateurs per etablissement
    if (etablissement.coordinateurIds.length >= 2) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const referent = await findOrCreateReferent({ email, firstName, lastName }, { etablissement, role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.coordinateur_cle });
    if (!referent) {
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
    if (referent === ERRORS.USER_ALREADY_REGISTERED) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });

    etablissement.set({
      coordinateurIds: [...etablissement.coordinateurIds, referent._id.toString()],
    });

    await etablissement.save({ fromUser: req.user });

    if (referent.role === ROLES.REFERENT_CLASSE) {
      referent.set({
        role: ROLES.ADMINISTRATEUR_CLE,
        subRole: SUB_ROLES.coordinateur_cle,
        roles: [ROLES.ADMINISTRATEUR_CLE, SUB_ROLES.coordinateur_cle],
      });
      await referent.save({ fromUser: req.user });
      await inviteReferentClasseAsCoordinator(referent, { from: req.user }, etablissement);
    } else {
      await inviteReferent(referent, { role: SUB_ROLES.coordinateur_cle, from: req.user }, etablissement);
    }

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/send-invitation-chef-etablissement", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    logger.debug("Controller - send-invitation-chef-etablissement");

    if (!isSuperAdmin(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
    const referentInvitationSent = await doInviteMultipleChefsEtablissements(req.user);
    const file = {
      data: Buffer.from(JSON.stringify(referentInvitationSent)),
      encoding: "",
      mimetype: "application/json",
    };
    uploadFile(`file/appelAProjet/${timestamp}-send-invitation-chef-etablissement.json`, file);

    return res.status(200).send({ ok: true, data: referentInvitationSent });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/send-invitation-referent-classe-verifiee", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    logger.debug("Controller - send-invitation-referent-classe-verifiee");

    if (!isSuperAdmin(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    if (!(await isFeatureAvailable(FeatureFlagName.INVITE_REFERENT_CLASSE))) {
      return res.status(422).send({ ok: false, code: ERRORS.FEATURE_NOT_AVAILABLE });
    }

    const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;

    const referentInvitationSent = await doInviteMultipleReferentClasseVerifiee(req.user);
    uploadFile(`file/appelAProjet/${timestamp}-send-invitation-referent-classe.csv`, {
      data: generateCSVStream(referentInvitationSent),
      encoding: "",
      mimetype: "text/csv",
    });

    return res.status(200).send({ ok: true, data: { referentInvitationSent } });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/delete-old-referent-classe", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    logger.debug("Controller - send-invitation-referent-classe");

    if (!isSuperAdmin(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    if (!(await isFeatureAvailable(FeatureFlagName.INVITE_REFERENT_CLASSE))) {
      return res.status(422).send({ ok: false, code: ERRORS.FEATURE_NOT_AVAILABLE });
    }

    const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;

    const referentDeleted = await deleteOldReferentClasse(req.user);
    uploadFile(`file/appelAProjet/${timestamp}-delete-old-referent-classe.csv`, {
      data: generateCSVStream(referentDeleted),
      encoding: "",
      mimetype: "text/csv",
    });

    return res.status(200).send({ ok: true, data: { referentDeleted } });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post(
  "/getMany",
  accessControlMiddleware([ROLES.ADMIN]),
  requestValidatorMiddleware({ body: GetReferentsByIdsSchema.payload }),
  async (req: RouteRequest<ReferentsRoutes["GetMany"]>, res: RouteResponse<ReferentsRoutes["GetMany"]>) => {
    try {
      const payload = req.validatedBody;

      const ids = payload.ids;
      const referents = await getReferentsByIds(ids);

      return res.status(200).send({ ok: true, data: referents });
    } catch (error) {
      if (error.message.includes("Referents not found")) {
        return res.status(404).send({
          ok: false,
          code: ERRORS.NOT_FOUND,
          message: error.message,
        });
      }

      capture(error);
      res.status(500).send({ ok: false, code: error.message });
    }
  },
);

export default router;
