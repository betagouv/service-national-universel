const express = require("express");
const router = express.Router();
const passport = require("passport");
const saml2 = require("saml2-js");
const fs = require("fs");
const { capture } = require("../sentry");
const path = require("path");
const fetch = require("node-fetch");
const { ERRORS } = require("../utils");

const { EDUCONNECT_SP_CERT, EDUCONNECT_SP_KEY, EDUCONNECT_IDP_CERT } = require("../config.js");

let sp_options = {
  entity_id: "SNU",
  certificate: EDUCONNECT_SP_CERT,
  private_key: EDUCONNECT_SP_KEY,
  assert_endpoint: "https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io/educonnect/callback",
};
let sp = new saml2.ServiceProvider(sp_options);

// Create identity provider
var idp_options = {
  sso_login_url: "https://pr4.educonnect.phm.education.gouv.fr/idp/profile/SAML2/Redirect/SSO",
  sso_logout_url: "https://pr4.educonnect.phm.education.gouv.fr/idp/profile/SAML2/POST/SLO",
  certificates: [EDUCONNECT_IDP_CERT],
};
var idp = new saml2.IdentityProvider(idp_options);

router.get("/login", passport.authenticate(["educonnect"], { successRedirect: "/", failureRedirect: "/login" }));

// router.get("/callback", async (req, res) => {
//   res.status(200).send("SNU ");
// });

router.get("/signup", async (req, res) => {
  // Create service provider

  sp.create_login_request_url(idp, {}, function (err, login_url, request_id) {
    if (err != null) return res.send(500);
    res.redirect(login_url);
  });
});

// Assert endpoint for when login completes
router.post("/callback", function (req, res) {
  var options = { request_body: req.body };
  sp.post_assert(idp, options, function (err, saml_response) {
    if (err != null) return res.send(500);

    // Save name_id and session_index for logout
    // Note:  In practice these should be saved in the user session, not globally.
    name_id = saml_response.user.name_id;
    session_index = saml_response.user.session_index;

    res.send("Hello #{saml_response.user.name_id}!");
  });
});

module.exports = router;
