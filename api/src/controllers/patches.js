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
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
};

const deletePatches = async ({ req, model }) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required() })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    console.log(error);
    if (error) return { ok: false, code: ERRORS.INVALID_PARAMS, codeError: 400 };
    if (!canViewPatchesHistory(req.user)) return { ok: false, code: ERRORS.OPERATION_UNAUTHORIZED, codeError: 403 };

    const elem = await model.findById(value.id);
    if (!elem) return { ok: false, code: ERRORS.NOT_FOUND, codeError: 404 };

    const fieldToKeep = [
      "status",
      "birthdateAt",
      "cohort",
      "gender",
      "situation",
      "grade",
      "qpv",
      "populationDensity",
      "handicap",
      "ppsBeneficiary",
      "paiBeneficiary",
      "highSkilledActivity",
      "statusPhase1",
      "statusPhase2",
      "phase2ApplicationStatus",
      "statusPhase3",
      "department",
      "region",
      "zip",
      "city",
    ];

    const data = await elem.patches.find({ ref: elem.id });
    for (const patch of data) {
      let updatedOps = patch.ops.filter((op) => {
        if (fieldToKeep.find((val) => val === op.path.split("/")[1])) {
          return true;
        } else {
          return false;
        }
      });

      if (updatedOps.length === 0) {
        patch.remove();
      } else {
        patch.set({ ops: updatedOps });
        if (patch.user !== undefined && patch.user["role"] === undefined) {
          patch.set({ user: undefined });
        }
        await patch.save();
      }
    }

    return { ok: true };
  } catch (error) {
    capture(error);
    return { ok: false, code: ERRORS.SERVER_ERROR };
  }
};

module.exports = { get, deletePatches };
