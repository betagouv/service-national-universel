const ENVIRONMENT = process.env.ENVIRONMENT || "development"
const LOCAL = process.env.LOCAL === "true";
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 8080;
const secret = process.env.SECRET || "not-so-secret";

let APP_URL = process.env.APP_URL || "http://localhost:8081";
let ADMIN_URL = process.env.ADMIN_URL || "http://localhost:8082";
let SUPPORT_URL = process.env.SUPPORT_URL || "http://localhost:3000";
let KNOWLEDGEBASE_URL = process.env.KNOWLEDGEBASE_URL || "http://localhost:8084";
const API_ANALYTICS_ENDPOINT = process.env.API_ANALYTICS_ENDPOINT || "http://localhost:8085";

const RELEASE = process.env.RELEASE || "";

const API_ANALYTICS_API_KEY = process.env.API_ANALYTICS_API_KEY || "api-key";

const API_ANTIVIRUS_ENDPOINT = process.env.API_ANTIVIRUS_ENDPOINT || "http://localhost:8089";
const API_ANTIVIRUS_TOKEN = process.env.API_ANTIVIRUS_TOKEN || "";

const ES_ENDPOINT = process.env.ES_ENDPOINT || "";

const SENDINBLUEKEY = process.env.SENDINBLUEKEY || "";

const SENTRY_URL = process.env.SENTRY_URL || "";
const SENTRY_TRACING_SAMPLE_RATE = process.env.SENTRY_TRACING_SAMPLE_RATE || "";
const SENTRY_PROFILE_SAMPLE_RATE = process.env.SENTRY_PROFILE_SAMPLE_RATE || "";

const CELLAR_ENDPOINT = process.env.CELLAR_ENDPOINT || "";
const CELLAR_KEYID = process.env.CELLAR_KEYID || "";
const CELLAR_KEYSECRET = process.env.CELLAR_KEYSECRET || "";
const BUCKET_NAME = process.env.BUCKET_NAME || "";
const PUBLIC_BUCKET_NAME = process.env.PUBLIC_BUCKET_NAME || "";

const CELLAR_ENDPOINT_SUPPORT = process.env.CELLAR_ENDPOINT_SUPPORT || "";
const CELLAR_KEYID_SUPPORT = process.env.CELLAR_KEYID_SUPPORT || "";
const CELLAR_KEYSECRET_SUPPORT = process.env.CELLAR_KEYSECRET_SUPPORT || "";
const PUBLIC_BUCKET_NAME_SUPPORT = process.env.PUBLIC_BUCKET_NAME_SUPPORT || "";
const FILE_ENCRYPTION_SECRET_SUPPORT = process.env.FILE_ENCRYPTION_SECRET_SUPPORT || "";

const FILE_ENCRYPTION_SECRET = process.env.FILE_ENCRYPTION_SECRET || "";
const QPV_USERNAME = process.env.QPV_USERNAME || "";
const QPV_PASSWORD = process.env.QPV_PASSWORD || "";

const API_ENGAGEMENT_URL = process.env.API_ENGAGEMENT_URL || "";
const API_ENGAGEMENT_KEY = process.env.API_ENGAGEMENT_KEY || "";

const API_ASSOCIATION_ES_ENDPOINT = process.env.API_ASSOCIATION_ES_ENDPOINT || "";
const API_ASSOCIATION_CELLAR_ENDPOINT = process.env.API_ASSOCIATION_CELLAR_ENDPOINT || "";
const API_ASSOCIATION_CELLAR_KEYID = process.env.API_ASSOCIATION_CELLAR_KEYID || "";
const API_ASSOCIATION_CELLAR_KEYSECRET = process.env.API_ASSOCIATION_CELLAR_KEYSECRET || "";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || "";
const SLACK_BOT_CHANNEL = process.env.SLACK_BOT_CHANNEL || "";

const JVA_TOKEN = process.env.JVA_TOKEN || "";
const JVA_API_KEY = process.env.JVA_API_KEY || "";

const REDIS_URL = process.env.REDIS_URL || "";

const PUBLIC_ROOTDIR = `${__dirname}/../public`;
const IMAGES_ROOTDIR = `${PUBLIC_ROOTDIR}/images`;
const FONT_ROOTDIR = `${__dirname}/assets/fonts`;

module.exports = {
  LOCAL,
  PORT,
  MONGO_URL,
  secret,
  APP_URL,
  ADMIN_URL,
  SUPPORT_URL,
  KNOWLEDGEBASE_URL,
  ENVIRONMENT,
  ES_ENDPOINT,
  CELLAR_KEYSECRET,
  CELLAR_KEYID,
  CELLAR_ENDPOINT,
  BUCKET_NAME,
  PUBLIC_BUCKET_NAME,
  CELLAR_ENDPOINT_SUPPORT,
  CELLAR_KEYID_SUPPORT,
  CELLAR_KEYSECRET_SUPPORT,
  PUBLIC_BUCKET_NAME_SUPPORT,
  FILE_ENCRYPTION_SECRET_SUPPORT,
  SENDINBLUEKEY,
  FILE_ENCRYPTION_SECRET,
  SENTRY_URL,
  SENTRY_TRACING_SAMPLE_RATE,
  SENTRY_PROFILE_SAMPLE_RATE,
  QPV_USERNAME,
  QPV_PASSWORD,
  API_ENGAGEMENT_KEY,
  API_ENGAGEMENT_URL,
  API_ASSOCIATION_ES_ENDPOINT,
  API_ASSOCIATION_CELLAR_ENDPOINT,
  API_ASSOCIATION_CELLAR_KEYID,
  API_ASSOCIATION_CELLAR_KEYSECRET,
  SLACK_BOT_TOKEN,
  SLACK_BOT_CHANNEL,
  JVA_TOKEN,
  JVA_API_KEY,
  API_ANALYTICS_ENDPOINT,
  API_ANALYTICS_API_KEY,
  API_ANTIVIRUS_ENDPOINT,
  API_ANTIVIRUS_TOKEN,
  REDIS_URL,
  PUBLIC_ROOTDIR,
  IMAGES_ROOTDIR,
  FONT_ROOTDIR,
  RELEASE,
};

function getEnvironment() {
  if (process.env.STAGING === "true") return "staging";
  else if (process.env.PRODUCTION === "true") return "production";
  else if (process.env.TESTING === "true" || process.env.NODE_ENV === "test") return "testing";
  return "development";
}
