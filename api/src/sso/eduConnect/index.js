// const fs = require("fs");
const samlStrategy = require("passport-saml").Strategy;
const { EDUCONNECT_CERT } = require("../../config.js");
// const { fetch, toPassportConfig, claimsToCamelCase } = require("passport-saml-metadata");
// const path = require("path");

// const MetadataReader = require("../reader");

const STRATEGY_NAME_USER = "educonnect";

function sso(passport) {
  const educonnectSamlStrategy = new samlStrategy(
    {
      entryPoint: "https://pr4.educonnect.phm.education.gouv.fr/idp/profile/SAML2/Redirect/SSO",
      issuer: "snu_young",
      callbackUrl: `https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io/${STRATEGY_NAME_USER}/callback/`,
      cert: EDUCONNECT_CERT,
    },
    async function (profile, done) {
      return done(null, profile);
    },
  );
  passport.use(STRATEGY_NAME_USER, educonnectSamlStrategy);

  // fs.writeFileSync(path.resolve(__dirname, "./SNU_STAGING-metadata.xml"), educonnectSamlStrategy.generateServiceProviderMetadata());
}

module.exports = sso;
