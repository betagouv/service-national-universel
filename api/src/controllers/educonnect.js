const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get("/login", passport.authenticate(["educonnect"], { successRedirect: "/", failureRedirect: "/login" }));

// Assert endpoint for when login completes
router.post("/callback", passport.authenticate("educonnect"), function (req, res) {
  const attributes = req.user.attributes;

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
  res.status(200).send({ ok: true, data: educonnect_data });
});

module.exports = router;
