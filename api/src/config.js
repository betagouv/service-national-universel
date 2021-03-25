const ENVIRONMENT = getEnvironment();
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 3000;
const secret = process.env.SECRET || "not-so-secret";

let APP_URL = process.env.APP_URL || "http://localhost:8081";
let ADMIN_URL = process.env.ADMIN_URL || "http://localhost:8082";

const ES_ENDPOINT = process.env.ES_ENDPOINT || "";

const SENDINBLUEKEY = process.env.SENDINBLUEKEY || "";
const SENTRY_URL = process.env.SENTRY_URL || "";

const CELLAR_ENDPOINT = process.env.CELLAR_ENDPOINT || "";
const CELLAR_KEYID = process.env.CELLAR_KEYID || "";
const CELLAR_KEYSECRET = process.env.CELLAR_KEYSECRET || "";
const FILE_ENCRYPTION_SECRET = process.env.FILE_ENCRYPTION_SECRET || "";
const BUCKET_NAME = process.env.BUCKET_NAME || "";
const QPV_USERNAME = process.env.QPV_USERNAME || "";
const QPV_PASSWORD = process.env.QPV_PASSWORD || "";

module.exports = {
  PORT,
  MONGO_URL,
  secret,
  APP_URL,
  ADMIN_URL,
  ENVIRONMENT,
  ES_ENDPOINT,
  CELLAR_KEYSECRET,
  CELLAR_KEYID,
  CELLAR_ENDPOINT,
  SENDINBLUEKEY,
  FILE_ENCRYPTION_SECRET,
  BUCKET_NAME,
  SENTRY_URL,
  QPV_USERNAME,
  QPV_PASSWORD,
};

console.log("CELLAR_ENDPOINT", CELLAR_ENDPOINT);
console.log("CELLAR_KEYID", CELLAR_KEYID);
console.log("CELLAR_KEYSECRET", CELLAR_KEYSECRET);
console.log("FILE_ENCRYPTION_SECRET", FILE_ENCRYPTION_SECRET);
console.log("BUCKET_NAME", BUCKET_NAME);
console.log("SENDINBLUEKEY", SENDINBLUEKEY);
console.log("SENTRY_URL", SENTRY_URL);

function getEnvironment() {
  if (process.env.STAGING === "true") return "staging";
  else if (process.env.PRODUCTION === "true") return "production";
  return "development";
}
