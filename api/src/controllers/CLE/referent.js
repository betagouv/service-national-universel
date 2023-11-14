const express = require("express");
const passport = require("passport");
const router = express.Router();
const Joi = require("joi");
const crypto = require("crypto");
const { capture } = require("../../sentry");
const { SUB_ROLES, ROLES, SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ERRORS, inSevenDays } = require("../../utils");
const { sendTemplate } = require("../../sendinblue");
const config = require("../../config");
const EtablissementModel = require("../../models/ClasseEngagee/etablissement");
const ReferentModel = require("../../models/referent");

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

    const { email, firstName, lastName } = value;

    //for now, only one chef per etablissement
    const etablissement = await EtablissementModel.findOne({ chefIds: req.user._id });
    if (!etablissement) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    //for now, only one sous-chef per etablissement
    if (etablissement.sousChefIds.length > 0) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const invitation_token = crypto.randomBytes(20).toString("hex");

    const referent = await ReferentModel.create({
      email,
      firstName,
      lastName,
      role: ROLES.ADMINISTRATEUR_CLE,
      subRole: SUB_ROLES.coordinateur_cle,
      invitationToken: invitation_token,
      invitationExpires: inSevenDays(),
    });

    etablissement.set({
      sousChefIds: [referent._id.toString()],
    });

    await etablissement.save({ fromUser: req.user });

    const cta = `${config.ADMIN_URL}/auth/signup/invite?token=${invitation_token}`;
    const fromName = `${req.user.firstName} ${req.user.lastName}`;
    const toName = `${referent.firstName} ${referent.lastName}`;

    await sendTemplate(SENDINBLUE_TEMPLATES.invitationReferent[ROLES.ADMINISTRATEUR_CLE], {
      emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
      params: { cta, fromName, toName },
    });

    return res.status(200).send({ ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
