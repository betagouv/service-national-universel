const express = require("express");
const queryString = require("querystring");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const config = require("../../config");

router.get("/login", passport.authenticate(["educonnect"], { successRedirect: "/", failureRedirect: "/login" }));

// Assert endpoint for when login completes
router.post("/callback", passport.authenticate("educonnect"), function (req, res) {
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
    const query = {
      prenom: educonnect_data.givenName,
      nom: educonnect_data.sn,
      dateNaissance: educonnect_data.FrEduCtDateNaissance,
      INEHash: educonnect_data.FrEduCtEleveINEHash,
    };
    const url = `${config.APP_URL}/inscription/profil?${queryString.stringify(query)}`;
    return res.redirect(url);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false });
  }
});

router.get("/test-input", async (req, res) => {
  return res.redirect("./test-output");
});

router.get("/test-output", async (req, res) => {
  try {
    const attributes = {
      "urn:oid:1.3.6.1.4.1.20326.10.999.1.7": "eleve2d",
      "urn:oid:1.3.6.1.4.1.20326.10.999.1.67": "2005-11-13",
      "urn:oid:2.5.4.4": "LECOMTE02545",
      "urn:oid:1.3.6.1.4.1.20326.10.999.1.64": "0278dd38a2de195c7f0598fca359033e",
      "urn:oid:2.5.4.42": "Tiago",
      "urn:oid:1.3.6.1.4.1.20326.10.999.1.5":
        "https://pr4.educonnect.phm.education.gouv.fr/Shibboleth.sso/Logout?return=https://moncompte-pr4.educonnect.phm.education.gouv.fr/Shibboleth.sso/Logout?return=https://pr4.educonnect.phm.education.gouv.fr/idp/profile/Logout",
      "urn:oid:1.3.6.1.4.1.20326.10.999.1.6": "2022-05-11 11:42:25.475",
      "urn:oid:1.3.6.1.4.1.20326.10.999.1.72": "0254222C",
      "urn:oid:1.3.6.1.4.1.20326.10.999.1.73": "2382",
      "urn:oid:1.3.6.1.4.1.20326.10.999.1.57": "16c1f69261c389bdf4b8c09d5aaba904008e0d503b30dea551d18aae04a6224354dec1a65c461d59de42412d51473b4e",
    };
    const educonnect = {
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

    // const { error, value } = Joi.object({ callback: Joi.string().required() }).unknown().validate(req.body, { stripUnknown: true });
    // if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const query = {
      prenom: educonnect.givenName,
      nom: educonnect.sn,
      dateNaissance: educonnect.FrEduCtDateNaissance,
      INEHash: educonnect.FrEduCtEleveINEHash,
    };
    const url = `${config.APP_URL}/inscription/profil?${queryString.stringify(query)}`;
    return res.redirect(url);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false });
  }
});

module.exports = router;
