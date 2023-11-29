const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");
const { validateId } = require("../../utils/validator");
const { ERRORS } = require("../../utils");
const { capture, captureMessage } = require("../../sentry");
const ClasseModel = require("../../models/cle/classe");
const YoungModel = require("../../models/young");
const EtablissementModel = require("../../models/cle/etablissement");
const { canSearchStudent, ROLES, SUB_ROLES } = require("snu-lib");

router.get("/by-classe/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (!canSearchStudent(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const classe = await ClasseModel.findOne({ _id: value })?.lean();
    if (!classe) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (req.user.role === ROLES.REFERENT_CLASSE && !classe.referentClasseIds.includes(req.user._id.toString()))
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    if (req.user.role === ROLES.ADMINISTRATEUR_CLE) {
      const etablissement = await EtablissementModel.findById(classe.etablissementId);
      if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      if (!etablissement.referentEtablissementIds.includes(req.user._id.toString()) && !etablissement.coordinateurIds.includes(req.user._id.toString())) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    const students = await YoungModel.find({ classeId: value })?.lean();

    return res.status(200).send({ ok: true, data: students });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
