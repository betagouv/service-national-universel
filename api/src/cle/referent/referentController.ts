import express from "express";
import passport from "passport";
import Joi from "joi";
import { Response } from "express";

import { ROLES, SUB_ROLES, isChefEtablissement, isReferentOrAdmin, isSuperAdmin } from "snu-lib";

import { doInviteMultipleChefsEtablissements } from "../../services/cle/referent";
import { uploadFile } from "../../utils";
import { UserRequest } from "../../controllers/request";
import { capture } from "../../sentry";
import { ERRORS } from "../../utils";
import { EtablissementModel } from "../../models";
import { findOrCreateReferent, inviteReferent } from "../../services/cle/referent";

const router = express.Router();

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

    // We send the email invitation once we are sure both the referent and the classe are created
    await inviteReferent(referent, { role: SUB_ROLES.coordinateur_cle, from: req.user }, etablissement);

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/send-invitation-chef-etablissement", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    console.log("Controller - send-invitation-chef-etablissement");

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

export default router;
