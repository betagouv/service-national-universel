const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { capture } = require("../sentry");
const ReferentModel = require("../models/referent");
const config = require("../config");
const { ROLES } = require("snu-lib/constants");
const { JWT_MAX_AGE, cookieOptions } = require("../cookie-options");
const { ERRORS } = require("../utils");

router.get("/", async (req, res) => {
  try {
    // diable for the moment
    if (config.ENVIRONMENT === "production") return res.status(401).send({ ok: false, code: "TOKEN_OR_EMAIL_INVALID" });

    let { email, token } = req.query;

    // améliorer token ?
    if (!email || !token || token.toString() !== config.JVA_SIGNIN_TOKEN.toString()) {
      return res.status(401).send({ ok: false, code: "TOKEN_OR_EMAIL_INVALID" });
    }

    const user = await ReferentModel.findOne({ email, role: { $in: [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });

    // si l'utilisateur n'existe pas, on bloque
    if (!user || user.status === "DELETED") return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_PASSWORD_INVALID });

    // si l'utilisateur existe, on le connecte, et on le redirige vers la plateforme admin SNU
    if (user) {
      user.set({ lastLoginAt: Date.now() });
      await user.save();

      const token = jwt.sign({ _id: user.id }, config.secret, { expiresIn: JWT_MAX_AGE });
      res.cookie("jwt", token, cookieOptions());

      return res.redirect(config.ADMIN_URL);
    }
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
