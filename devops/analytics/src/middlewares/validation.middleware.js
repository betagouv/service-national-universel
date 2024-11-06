const Joi = require("joi");
const { capture } = require("../sentry");

module.exports = (data) => {
  return (req, res, next) => {
    try {
      if (typeof data.validate !== "function") data = Joi.object(data);
      const { error, value } = data.validate(req.body);

      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });
      }

      req.prevBody = req.body;
      req.body = value;

      next();
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: "Error in validate" });
    }
  };
};
