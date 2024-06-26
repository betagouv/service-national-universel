import { isSuperAdmin } from "snu-lib";
import { UserRequest } from "../request";
import { Response } from "express";
import { doInviteMultipleChefsEtablissements, InvitationType } from "../../services/cle/referent";

const express = require("express");
const passport = require("passport");
const router = express.Router();
const Joi = require("joi");
const { ROLES, SUB_ROLES, canInviteCoordinateur } = require("snu-lib");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const EtablissementModel = require("../../models/cle/etablissement");
const { findOrCreateReferent, inviteReferent } = require("../../services/cle/referent");

router.post("/invite-coordonnateur", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      email: Joi.string().lowercase().trim().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canInviteCoordinateur(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { email, firstName, lastName } = value;

    //for now, only one chef per etablissement
    const etablissement = await EtablissementModel.findOne({ referentEtablissementIds: req.user._id });
    if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

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
    await inviteReferent(referent, { role: SUB_ROLES.coordinateur_cle, user: req.user }, etablissement);

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post(
  "/send-invitation-chef-etablissement-inscription",
  passport.authenticate("referent", { session: false, failWithError: true }),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value: emails } = Joi.array().items(Joi.string().email().required()).validate(req.body, { stripUnknown: true });
      console.log("Controller - send-invitation-chef-etablissement-inscription - emails : ", emails);
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      if (!isSuperAdmin(req.user)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const referentInvitationSent = await doInviteMultipleChefsEtablissements(emails, req.user, InvitationType.INSCRIPTION);

      return res.status(200).send({ ok: true, data: referentInvitationSent });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.post(
  "/send-invitation-chef-etablissement-confirmation",
  passport.authenticate("referent", { session: false, failWithError: true }),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value: emails } = Joi.array().items(Joi.string().email().required()).validate(req.body, { stripUnknown: true });
      console.log("Controller - send-invitation-chef-etablissement-confirmation - emails : ", emails);

      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      if (!isSuperAdmin(req.user)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const referentInvitationSent = await doInviteMultipleChefsEtablissements(emails, req.user, InvitationType.CONFIRMATION);

      return res.status(200).send({ ok: true, data: referentInvitationSent });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

module.exports = router;
