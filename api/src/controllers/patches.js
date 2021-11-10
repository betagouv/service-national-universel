const Joi = require("joi");
const { capture } = require("../sentry");
const { ERRORS } = require("../utils");
const { canViewPatchesHistory } = require("snu-lib/roles");

const get = async (req, res, model) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required() })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    if (!canViewPatchesHistory(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const elem = await model.findById(value.id);
    if (!elem) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const data = await elem.patches.find({ ref: elem.id }).sort("-date");
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
};

module.exports = { get };
