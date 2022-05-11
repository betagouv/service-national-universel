const fs = require("fs");
const SamlStrategy = require("passport-saml").Strategy;
const {
  EDUCONNECT_ENTRY_POINT,
  EDUCONNECT_LOGOUT_POINT,
  EDUCONNECT_ISSUER,
  EDUCONNECT_CALLBACK_URL,
  EDUCONNECT_SP_CERT,
  EDUCONNECT_SP_KEY,
  EDUCONNECT_IDP_SIGN_CERT,
  EDUCONNECT_IDP_ENCR_CERT,
} = require("../../config");
const { fetch, toPassportConfig, claimsToCamelCase } = require("passport-saml-metadata");
const path = require("path");

const MetadataReader = require("../reader");

const STRATEGY_NAME_USER = "educonnect";

function sso(passport) {
  passport.serializeUser(function (user, done) {
    console.log("-----------------------------");
    console.log("serialize user");
    console.log(user);
    console.log("-----------------------------");
    done(null, user);
  });
  passport.deserializeUser(function (user, done) {
    console.log("-----------------------------");
    console.log("deserialize user");
    console.log(user);
    console.log("-----------------------------");
    done(null, user);
  });

  const educonnectSamlStrategy = new SamlStrategy(
    {
      entryPoint: EDUCONNECT_ENTRY_POINT,
      issuer: EDUCONNECT_ISSUER,
      callbackUrl: EDUCONNECT_CALLBACK_URL,
      cert: [EDUCONNECT_IDP_SIGN_CERT, EDUCONNECT_IDP_ENCR_CERT],
      privateKey: EDUCONNECT_SP_KEY,
      decryptionPvk: EDUCONNECT_SP_KEY,
      // privateKey: fs.readFileSync(path.resolve(__dirname, "./metadata/sp-privatekey.pem"), "utf-8").toString(),
      // protocol: "https://",
      identifierFormat: null,
      // signatureAlgorithm: "sha256",
      // digestAlgorithm: "sha256",
      // attributeConsumingServiceIndex: 1,
      // xmlSignatureTransforms: ['http://www.w3.org/2000/09/xmldsig#enveloped-signature', 'http://www.w3.org/2001/10/xml-exc-c14n#' ]
      // authnRequestBinding: "HTTP-POST",
      // wantAssertionsSigned: false,
      disableRequestedAuthnContext: true,
      validateInResponseTo: false,
    },
    async function (profile, done) {
      return done(null, profile);
    },
  );
  passport.use(STRATEGY_NAME_USER, educonnectSamlStrategy);

  // fs.writeFileSync(path.resolve(__dirname, "./SNU_STAGING-metadata.xml"), educonnectSamlStrategy.generateServiceProviderMetadata());
}

module.exports = sso;
