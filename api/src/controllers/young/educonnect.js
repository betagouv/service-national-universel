const express = require("express");
const queryString = require("querystring");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const config = require("../../config");
const Young = require("../../models/young");
const { cookieOptions, JWT_MAX_AGE } = require("../../cookie-options");

const YoungObject = require("../../models/young");
const AuthObject = require("../../auth");
const YoungAuth = new AuthObject(YoungObject);

router.get("/login", passport.authenticate(["educonnect"], { successRedirect: "/", failureRedirect: "/login" }));

// Assert endpoint for when login completes
router.post("/callback", passport.authenticate("educonnect"), async (req, res) => {
  try {
    const attributes = req.user.attributes;
    console.log(attributes);

    const educonnect_data = {
      FrEduCtDateConnexion: attributes["urn:oid:1.3.6.1.4.1.20326.10.999.1.6"],
      FrEduCtld: attributes["urn:oid:1.3.6.1.4.1.20326.10.999.1.57"],
      FrEduCtPersonAffiliation: attributes["urn:oid:1.3.6.1.4.1.20326.10.999.1.7"],
      FrEduCtEleveUAI: attributes["urn:oid:1.3.6.1.4.1.20326.10.999.1.72"],
      sn: attributes["urn:oid:2.5.4.4"],
      givenName: attributes["urn:oid:2.5.4.42"],
      FrEduCtEleveINEHash: attributes["urn:oid:1.3.6.1.4.1.20326.10.999.1.64"],
      FrEduCtEleveNiveau: attributes["urn:oid:1.3.6.1.4.1.20326.10.999.1.73"],
      FrEduCtDateNaissance: attributes["urn:oid:1.3.6.1.4.1.20326.10.999.1.67"],
      FrEduUrlRetour: attributes["urn:oid:1.3.6.1.4.1.20326.10.999.1.5"],
    };
    const { error, value } = Joi.object({
      FrEduCtPersonAffiliation: Joi.string().trim().valid("eleve1d", "eleve2d", "resp1d", "resp2d").required(),
      sn: Joi.string().trim().required(),
      givenName: Joi.string().trim().required(),
      FrEduCtEleveINEHash: Joi.string().trim().length(32).allow().required(),
      FrEduCtEleveUAI: Joi.string().trim().required(),
      FrEduCtDateNaissance: Joi.string().trim().required(),
      FrEduCtEleveNiveau: Joi.string().trim().required(),
      FrEduUrlRetour: Joi.string().trim().required(),
    })
      .unknown()
      .validate(educonnect_data, { stripUnknown: true });

    if (error) throw error;

    if (value.FrEduCtPersonAffiliation.includes("resp")) {
      const query = {
        errorCode: ERRORS.EDUCONNECT_RESP_AUTH,
      };
      const url_error = `${config.APP_URL}/inscription/profil?${queryString.stringify(query)}`;
      return res.redirect(url_error);
    }

    const user = await Young.findOne({ INEHash: value.FrEduCtEleveINEHash });
    if (user) {
      user.set({ lastLoginAt: Date.now() });
      await user.save();

      const token = jwt.sign({ _id: user._id }, config.secret, { expiresIn: JWT_MAX_AGE });
      res.cookie("jwt", token, cookieOptions());
      const url_signin = `${config.APP_URL}`;
      return res.redirect(url_signin);
    }

    const query = {
      prenom: value.givenName,
      nom: value.sn,
      dateNaissance: value.FrEduCtDateNaissance,
      INEHash: value.FrEduCtEleveINEHash,
      codeUAI: value.FrEduCtEleveUAI,
      niveau: value.FrEduCtEleveNiveau,
      urlLogOut: value.FrEduUrlRetour,
      affiliation: value.FrEduCtPersonAffiliation,
    };
    const url_signup = `${config.APP_URL}/inscription/profil?${queryString.stringify(query)}`;
    return res.redirect(url_signup);
  } catch (error) {
    capture(error);
    console.log(error);
    const query = {
      errorCode: ERRORS.EDUCONNECT_LOGIN_ERROR,
    };
    const url_error = `${config.APP_URL}/inscription/profil?${queryString.stringify(query)}`;
    return res.redirect(url_error);
  }
});

router.post("/signup", passport.authenticate(["educonnect"]), (req, res) => YoungAuth.signUp(req, res));

module.exports = router;
