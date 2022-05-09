const fs = require("fs");
const SamlStrategy = require("passport-saml").Strategy;
const { EDUCONNECT_IDP_CERT } = require("../../config.js");
const { fetch, toPassportConfig, claimsToCamelCase } = require("passport-saml-metadata");
const path = require("path");

const MetadataReader = require("../reader");

const STRATEGY_NAME_USER = "educonnect";

function sso(passport) {
  const educonnectSamlStrategy = new SamlStrategy(
    {
      entryPoint: "https://pr4.educonnect.phm.education.gouv.fr/idp/profile/SAML2/Redirect/SSO",
      issuer: "SNU",
      callbackUrl: `https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io/${STRATEGY_NAME_USER}/callback/`,
      cert: EDUCONNECT_IDP_CERT,
      // privateKey: fs.readFileSync(path.resolve(__dirname, "./metadata/sp-privatekey.pem"), "utf-8").toString(),
      // privateKey:
      //   "MIIEfTCCAuWgAwIBAgIUOQWudAYcn9bLlVC14jRQQNbyAnowDQYJKoZIhvcNAQELBQAwLzEtMCsGA1UEAwwkcHI0LmVkdWNvbm5lY3QucGhtLmVkdWNhdGlvbi5nb3V2LmZyMB4XDTIwMDQxNzA4NDY1MFoXDTQwMDQxNzA4NDY1MFowLzEtMCsGA1UEAwwkcHI0LmVkdWNvbm5lY3QucGhtLmVkdWNhdGlvbi5nb3V2LmZyMIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEA99IJsA17KzoitP1pTmIQn1+TX0cdFLRY8RXC328vrV9qTV9K9ae/kxP4Sl6OLqrUCuIkRjYnaCDywAxfw7veV6JZvvMKS8BeL7dVLpfysFQrRRv2ZqKTPsoZ8Aq/ZR5fYQRRx47mxfox0XrTkj951gBVaezbHvEmjB9rAT3PlVtPGls/jMtY9ZCq5gVjXOt8cgltylKVEPbheMMtFl2xCXTTQaGisMNkwlNBM2mrkpgpjYZGR0kOtgQwJCFwlWeSJ0LoCwzG19tpE5ZgMFPc3p1x1FkOebgAsNCrh8BAK2d/+xoheuMwK3X62t5MbdsiZB4HQ2W1z9fD+1u4SOAwZiww17wQRKZvyzWGKh+lWfhbSspwDa62Ho8Q2CLdL+FIM4Pr3J4j/sKstz9lFYlkI71Wie4iAScRX/WA3yJoZY84LEuYHldBzr6fbrGyJSikpUOu8DEC81cLFEchSSx1tpH71hrSPxa9uEOKWV/VFlJUwSHzBxEpxMXq5BxYQzf9AgMBAAGjgZAwgY0wHQYDVR0OBBYEFAHniJbWWGhUdVE6R+6795s03aqKMGwGA1UdEQRlMGOCJHByNC5lZHVjb25uZWN0LnBobS5lZHVjYXRpb24uZ291di5mcoY7aHR0cHM6Ly9wcjQuZWR1Y29ubmVjdC5waG0uZWR1Y2F0aW9uLmdvdXYuZnIvaWRwL3NoaWJib2xldGgwDQYJKoZIhvcNAQELBQADggGBAJbsfjHpdgCH85gtgpU3jcC+BP7KKpJW2T/8aFjvLrhGpPrE/ovTIBlJtraF//xw4KCeKnPDJPreNeUUcYnQMxCFjrnAJfev/SfcGLbWqaAsKM5udemW2PKjs99ZcNdjAsDt/o3veGF9K1XwXBuz+WzfCpggyTvPg6N1khAbzZce5Voe3ZMtnfAqiXLe+TGnNYl3Dk4jxKZkEbDKoySKEnsS3Ynx6+q41SCIV3rrQYobgJIX+kZjKcRKSSyn+TVfTboDkTOn20JxcUJZx9pBBeZGlAVm0t3JiwUnK7zuu0OITscgKTK4iL8uCWx0hLCID22BGqS8fAmkRMg3IjwXsKoYYcQ37qZ6jM2EFaya07cXd19fefVbwIETD1dqxPsQMUWoGJTT8HdGqKrzcA1lx6ia7AQBvqjgbCVk3UuYK94f93DnS56Kez/hPTfZ3gjQPeEu1sxTN/8vtBCNJNiijghJbcie9q4Jql8l13qtKIcJp6zcGwKm3hcE0zcdNEK81Q==",
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
