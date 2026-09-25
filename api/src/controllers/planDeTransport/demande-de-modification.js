const express = require("express");
const router = express.Router();
const passport = require("passport");
const { LigneBusModel } = require("../../models");
const { ModificationBusModel } = require("../../models");
const { ERRORS } = require("../../utils");
const { capture } = require("../../sentry");
const Joi = require("joi");
const { ligneBusCanViewDemandeDeModification } = require("snu-lib");
const { canActOnLigneBus } = require("../../services/sejourAccess");

// Les écritures sur les demandes de modification (création, statut, avis, message, étiquettes) ont été
// supprimées le 2026-09-24 : plus aucune modification du plan de transport n'est possible.

router.get("/ligne/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().hex().length(24).required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!ligneBusCanViewDemandeDeModification(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id } = value;

    const line = await LigneBusModel.findById(id);
    if (!line) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!(await canActOnLigneBus(req.user, line))) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const lines = await ModificationBusModel.find({ lineId: line._id.toString() });

    return res.status(200).send({ ok: true, data: lines });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
