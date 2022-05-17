const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get(
  "/login",
  // function (req, res, next) {
  //   console.log("-----------------------------");
  //   console.log("/Start login ");
  //   console.log("-----------------------------");
  //   next();
  // },
  passport.authenticate(["educonnect"], { successRedirect: "/", failureRedirect: "/login" }),
  // function (req, res, next) {
  //   console.log("-----------------------------");
  //   console.log("Test");
  //   console.log(req);
  //   console.log("-----------------------------");
  //   next();
  // },
);

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

router.get("/test", async (req, res) => {
  try {
    const attributes = {
      "urn:oid:1.3.6.1.4.1.20326.10.999.1.7": "eleve2d",
      "urn:oid:1.3.6.1.4.1.20326.10.999.1.67": "2000-11-13",
      "urn:oid:2.5.4.4": "LECOMTE025",
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
    return res.status(200).send({ ok: true, data: educonnect });
  } catch (error) {
    // capture(error);
    res.status(500).send({ ok: false });
  }
});

module.exports = router;
