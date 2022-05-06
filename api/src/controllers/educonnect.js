const express = require("express");
const router = express.Router();
const passport = require("passport");
// const saml2 = require("saml2-js");
const fs = require("fs");
const { capture } = require("../sentry");

const fetch = require("node-fetch");
const { ERRORS } = require("../utils");

router.get("/login", passport.authenticate(["educonnect"], { successRedirect: "/", failureRedirect: "/login" }));

router.get("/callback", async (req, res) => {
  res.status(200).send("SNU ");
});

// router.get(
//   "/login/sso",
//   passport.authenticate("saml", {
//     successRedirect: "/",
//     failureRedirect: "/login", ???? Where ?
//   }),
// );

// router.get("/signup", async (req, res) => {
//   try {
//     // Create service provider
//     let sp_options = {
//       entity_id: "https://pr4.educonnect.phm.education.gouv.fr/idp",
//       private_key: fs.readFileSync(".crt").toString(),
//       certificate: fs.readFileSync(".crt").toString(),
//       assert_endpoint: "https://openidp.feide.no/",
//     };
//     let sp = new saml2.ServiceProvider(sp_options);

//     // Create identity provider
//     var idp_options = {
//       sso_login_url: "https://pr4.educonnect.phm.education.gouv.fr/idp/profile/SAML2/POST-SimpleSign/SSO",
//       sso_logout_url: "https://pr4.educonnect.phm.education.gouv.fr/idp/profile/SAML2/POST/SLO",
//       certificates: [fs.readFileSync("idp-signing.crt").toString(), fs.readFileSync("idp-encryption.crt").toString()],
//     };
//     var idp = new saml2.IdentityProvider(idp_options);

//     return res.status(200).send({
//       ok: true,
//       idp: idp,
//       sp: sp,
//     });
//   } catch (error) {
//     if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
//     capture(error);
//     return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
//   }
// });

module.exports = router;
