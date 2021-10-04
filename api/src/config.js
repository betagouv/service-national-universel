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
const ZAMMAD_TOKEN = process.env.ZAMMAD_TOKEN || "";
const ZAMMAD_URL = process.env.ZAMMAD_URL || "";

const API_ENGAGEMENT_KEY = process.env.API_ENGAGEMENT_KEY || "";

const API_ASSOCIATION_ES_ENDPOINT = process.env.API_ASSOCIATION_ES_ENDPOINT || "";
const API_ASSOCIATION_AWS_ACCESS_KEY_ID = process.env.API_ASSOCIATION_AWS_ACCESS_KEY_ID || "";
const API_ASSOCIATION_AWS_SECRET_ACCESS_KEY = process.env.API_ASSOCIATION_AWS_SECRET_ACCESS_KEY || "";
const API_ASSOCIATION_CELLAR_ENDPOINT = process.env.API_ASSOCIATION_CELLAR_ENDPOINT || "";
const API_ASSOCIATION_CELLAR_KEYID = process.env.API_ASSOCIATION_CELLAR_KEYID || "";
const API_ASSOCIATION_CELLAR_KEYSECRET = process.env.API_ASSOCIATION_CELLAR_KEYSECRET || "";

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
  API_ENGAGEMENT_KEY,
  ZAMMAD_TOKEN,
  ZAMMAD_URL,
  API_ASSOCIATION_ES_ENDPOINT,
  API_ASSOCIATION_AWS_ACCESS_KEY_ID,
  API_ASSOCIATION_AWS_SECRET_ACCESS_KEY,
  API_ASSOCIATION_CELLAR_ENDPOINT,
  API_ASSOCIATION_CELLAR_KEYID,
  API_ASSOCIATION_CELLAR_KEYSECRET,
};

function getEnvironment() {
  if (process.env.STAGING === "true") return "staging";
  else if (process.env.PRODUCTION === "true") return "production";
  else if (process.env.TESTING === "true" || process.env.NODE_ENV === "test") return "testing";
  return "development";
}
