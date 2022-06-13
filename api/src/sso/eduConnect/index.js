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

const STRATEGY_NAME_USER = "educonnect";

function sso(passport) {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  const educonnectSamlStrategy = new SamlStrategy(
    {
      entryPoint: EDUCONNECT_ENTRY_POINT,
      issuer: EDUCONNECT_ISSUER,
      callbackUrl: EDUCONNECT_CALLBACK_URL,
      cert: [EDUCONNECT_IDP_SIGN_CERT, EDUCONNECT_IDP_ENCR_CERT],
      privateKey: EDUCONNECT_SP_KEY,
      decryptionPvk: `-----BEGIN PRIVATE KEY-----\n${EDUCONNECT_SP_KEY}\n-----END PRIVATE KEY-----`,
      identifierFormat: null,
      disableRequestedAuthnContext: true,
      validateInResponseTo: false,
      logoutUrl: EDUCONNECT_LOGOUT_POINT,
      // logoutCallbackUrl: EDUCONNECT_LOGOUT_CALLBACK_URL,
    },
    async function (profile, done) {
      console.log("Signon profile :", profile);

      return done(null, profile);
    },
    async function (profile, done) {
      console.log("Logout profile :", profile);

      return done(null, profile);
    },
  );
  passport.use(STRATEGY_NAME_USER, educonnectSamlStrategy);
}

module.exports = sso;
