const fs = require("fs");
const SamlStrategy = require("passport-saml").Strategy;
const {
  EDUCONNECT_ENTRY_POINT,
  EDUCONNECT_LOGOUT_POINT,
  EDUCONNECT_ISSUER,
  EDUCONNECT_CALLBACK_URL,
  EDUCONNECT_SP_CERT,
  EDUCONNECT_SP_KEY,
  EDUCONNECT_IDP_CERT,
} = require("../config.js");
const { fetch, toPassportConfig, claimsToCamelCase } = require("passport-saml-metadata");
const path = require("path");

const MetadataReader = require("../reader");

const STRATEGY_NAME_USER = "educonnect";

function sso(passport) {
  const educonnectSamlStrategy = new SamlStrategy(
    {
      entryPoint: EDUCONNECT_ENTRY_POINT,
      issuer: EDUCONNECT_ISSUER,
      callbackUrl: EDUCONNECT_CALLBACK_URL,
      cert: EDUCONNECT_IDP_CERT,
      // privateKey: fs.readFileSync(path.resolve(__dirname, "./metadata/sp-privatekey.pem"), "utf-8").toString(),
      // protocol: "https://",
      identifierFormat: "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
      signatureAlgorithm: "sha256",
    },
    async function (profile, done) {
      return done(null, profile);
    },
  );
  passport.use(STRATEGY_NAME_USER, educonnectSamlStrategy);

  // fs.writeFileSync(path.resolve(__dirname, "./SNU_STAGING-metadata.xml"), educonnectSamlStrategy.generateServiceProviderMetadata());
}

module.exports = sso;
