const ENVIRONMENT = getEnvironment();
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 3000;
const secret = process.env.SECRET || "not-so-secret";

let APP_URL = process.env.APP_URL || "http://localhost:8081";
let ADMIN_URL = process.env.ADMIN_URL || "http://localhost:8082";
let SUPPORT_URL = process.env.SUPPORT_URL || "http://localhost:3000";
let KNOWLEDGEBASE_URL = process.env.KNOWLEDGEBASE_URL || "http://localhost:8084";
let ZAMMAD_IP = process.env.ZAMMAD_IP || "";
let ZAMMAD_PLATEFORME_USER = process.env.ZAMMAD_PLATEFORME_USER || "";
let ZAMMAD_PLATEFORME_USER_ID = process.env.ZAMMAD_PLATEFORME_USER_ID || "";

const ES_ENDPOINT = process.env.ES_ENDPOINT || "";

const SENDINBLUEKEY = process.env.SENDINBLUEKEY || "";
const SENTRY_URL = process.env.SENTRY_URL || "";

const CELLAR_ENDPOINT = process.env.CELLAR_ENDPOINT || "";
const CELLAR_KEYID = process.env.CELLAR_KEYID || "";
const CELLAR_KEYSECRET = process.env.CELLAR_KEYSECRET || "";
const FILE_ENCRYPTION_SECRET = process.env.FILE_ENCRYPTION_SECRET || "";
const BUCKET_NAME = process.env.BUCKET_NAME || "";
const PUBLIC_BUCKET_NAME = process.env.PUBLIC_BUCKET_NAME || "";
const QPV_USERNAME = process.env.QPV_USERNAME || "";
const QPV_PASSWORD = process.env.QPV_PASSWORD || "";
const ZAMMAD_TOKEN = process.env.ZAMMAD_TOKEN || "";
const ZAMMAD_URL = process.env.ZAMMAD_URL || "";

const API_ENGAGEMENT_KEY = process.env.API_ENGAGEMENT_KEY || "";

const API_ASSOCIATION_ES_ENDPOINT = process.env.API_ASSOCIATION_ES_ENDPOINT || "";
const API_ASSOCIATION_CELLAR_ENDPOINT = process.env.API_ASSOCIATION_CELLAR_ENDPOINT || "";
const API_ASSOCIATION_CELLAR_KEYID = process.env.API_ASSOCIATION_CELLAR_KEYID || "";
const API_ASSOCIATION_CELLAR_KEYSECRET = process.env.API_ASSOCIATION_CELLAR_KEYSECRET || "";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || "";
const SLACK_BOT_CHANNEL = process.env.SLACK_BOT_CHANNEL || "";

const JVA_TOKEN = process.env.JVA_TOKEN || "";
const JVA_API_KEY = process.env.JVA_API_KEY || "";

const EDUCONNECT_ENTRY_POINT = process.env.EDUCONNECT_ENTRY_POINT || "";
const EDUCONNECT_LOGOUT_POINT = process.env.EDUCONNECT_LOGOUT_POINT || "";
const EDUCONNECT_ISSUER = process.env.EDUCONNECT_ISSUER || "";
const EDUCONNECT_CALLBACK_URL = process.env.EDUCONNECT_CALLBACK_URL || "";
const EDUCONNECT_SP_CERT = process.env.EDUCONNECT_SP_CERT || "";
const EDUCONNECT_SP_KEY = process.env.EDUCONNECT_SP_KEY || "";
const EDUCONNECT_IDP_SIGN_CERT = process.env.EDUCONNECT_IDP_SIGN_CERT || " ";
const EDUCONNECT_IDP_ENCR_CERT = process.env.EDUCONNECT_IDP_ENCR_CERT || " ";

module.exports = {
  PORT,
  MONGO_URL,
  secret,
  APP_URL,
  ADMIN_URL,
  SUPPORT_URL,
  KNOWLEDGEBASE_URL,
  ZAMMAD_IP,
  ENVIRONMENT,
  ES_ENDPOINT,
  CELLAR_KEYSECRET,
  CELLAR_KEYID,
  CELLAR_ENDPOINT,
  SENDINBLUEKEY,
  FILE_ENCRYPTION_SECRET,
  BUCKET_NAME,
  PUBLIC_BUCKET_NAME,
  SENTRY_URL,
  QPV_USERNAME,
  QPV_PASSWORD,
  API_ENGAGEMENT_KEY,
  ZAMMAD_TOKEN,
  ZAMMAD_URL,
  ZAMMAD_PLATEFORME_USER,
  ZAMMAD_PLATEFORME_USER_ID,
  API_ASSOCIATION_ES_ENDPOINT,
  API_ASSOCIATION_CELLAR_ENDPOINT,
  API_ASSOCIATION_CELLAR_KEYID,
  API_ASSOCIATION_CELLAR_KEYSECRET,
  SLACK_BOT_TOKEN,
  SLACK_BOT_CHANNEL,
  JVA_TOKEN,
  JVA_API_KEY,
  EDUCONNECT_ENTRY_POINT,
  EDUCONNECT_LOGOUT_POINT,
  EDUCONNECT_ISSUER,
  EDUCONNECT_CALLBACK_URL,
  EDUCONNECT_SP_CERT,
  EDUCONNECT_SP_KEY,
  EDUCONNECT_IDP_SIGN_CERT,
  EDUCONNECT_IDP_ENCR_CERT,
};

function getEnvironment() {
  if (process.env.STAGING === "true") return "staging";
  else if (process.env.PRODUCTION === "true") return "production";
  else if (process.env.TESTING === "true" || process.env.NODE_ENV === "test") return "testing";
  return "development";
}
