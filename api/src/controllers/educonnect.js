const express = require("express");
const router = express.Router();
const passport = require("passport");
const saml2 = require("saml2-js");
const Saml2js = require("saml2js");
const fs = require("fs");
const { capture } = require("../sentry");
const path = require("path");
const fetch = require("node-fetch");
const { ERRORS } = require("../utils");

const {
  EDUCONNECT_ENTRY_POINT,
  EDUCONNECT_LOGOUT_POINT,
  EDUCONNECT_ISSUER,
  EDUCONNECT_CALLBACK_URL,
  EDUCONNECT_SP_CERT,
  EDUCONNECT_SP_KEY,
  EDUCONNECT_IDP_SIGN_CERT,
  EDUCONNECT_IDP_ENCR_CERT,
} = require("../config.js");

const sp_options = {
  entity_id: EDUCONNECT_ISSUER,
  certificate: EDUCONNECT_SP_CERT,
  private_key: EDUCONNECT_SP_KEY,
  assert_endpoint: EDUCONNECT_CALLBACK_URL,
};
const sp = new saml2.ServiceProvider(sp_options);

// Create identity provider
const idp_options = {
  sso_login_url: EDUCONNECT_ENTRY_POINT,
  sso_logout_url: EDUCONNECT_LOGOUT_POINT,
  certificates: [EDUCONNECT_IDP_SIGN_CERT, EDUCONNECT_IDP_ENCR_CERT],
};
const idp = new saml2.IdentityProvider(idp_options);

router.get(
  "/login",
  function (req, res, next) {
    console.log("-----------------------------");
    console.log("/Start login handler");
    next();
  },
  passport.authenticate(["educonnect"], { successRedirect: "/", failureRedirect: "/login" }),
);

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
router.post(
  "/callback",
  function (req, res, next) {
    console.log("-----------------------------");
    console.log("/Start login callback ");
    next();
  },
  passport.authenticate("educonnect"),
  function (req, res) {
    console.log("-----------------------------");
    console.log("login call back dumps");
    console.log(req.user);
    console.log("-----------------------------");

    console.log("-----------------------------");
    console.log(req);
    console.log("-----------------------------");
    const xmlResponse = req.body.SAMLResponse;
    console.log("-----------------------------");
    console.log(xmlResponse);
    console.log("-----------------------------");
    const parser = new Saml2js(xmlResponse);
    console.log("-----------------------------");
    console.log(parser);
    console.log("-----------------------------");
    req.samlUserObject = parser.toObject();

    res.send("Callback sucess");
  },
);

module.exports = router;
