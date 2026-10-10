import process from "node:process";
import { envStr, envFloat, envBool, envInt } from "snu-lib";

import dotenv from "dotenv";

dotenv.config();

function _env<T>(callback: (value: any, fallback?: T) => T, key: string, fallback?: T) {
  try {
    return callback(process.env[key], fallback);
  } catch (error) {
    console.warn(`Environment ${key}: ${error.message}`);
  }
  return undefined;
}

const staticConfig = {
  IMAGES_ROOTDIR: `${__dirname}/../public/images`,
  // Fonds des attestations et convocations (signatures des ministres), téléchargés depuis le bucket au démarrage.
  // Hors de `public/`, que `express.static` sert sans authentification (M72 de l'audit du 21/09/2026).
  PDF_TEMPLATES_ROOTDIR: `${__dirname}/../pdf-templates`,
  FONT_ROOTDIR: `${__dirname}/assets/fonts`,
};

const KNOWN_ENVIRONMENTS = ["production", "staging", "ci", "custom", "test", "development"];
// Recettes éphémères : devops/scripts/cc-environment-name.sh fabrique "env-" + nom de branche.
const RECETTE_ENVIRONMENT_PATTERN = /^env-[a-z0-9-]+$/;

function isKnownEnvironment(value: unknown): value is string {
  return typeof value === "string" && (KNOWN_ENVIRONMENTS.includes(value) || RECETTE_ENVIRONMENT_PATTERN.test(value));
}

// NODE_ENV environment variable is used by :
// - jest : unit test (NODE_ENV == "test")
// PM7 (25/09/2026) : un repli silencieux sur "development" exposait le secret JWT public
// "dev-secret" (et désactivait les garde-fous de production) sur tout déploiement qui aurait
// oublié de positionner ENVIRONMENT. Seul jest a droit à un défaut implicite (via NODE_ENV) ;
// partout ailleurs, y compris le poste des développeurs, ENVIRONMENT doit être déclaré (.env).
const defaultEnv = process.env.NODE_ENV === "test" ? "test" : undefined;
const environment = _env(envStr, "ENVIRONMENT", defaultEnv);

if (!isKnownEnvironment(environment)) {
  throw new Error(`Missing or invalid required environment variable ENVIRONMENT (received: ${JSON.stringify(environment)})`);
}

// Les recettes (devops/scripts/cc-create-environment.sh) ne positionnent pas NODE_ENV de façon
// fiable : n'exiger qu'une absence, ou une égalité stricte avec ENVIRONMENT.
if (process.env.NODE_ENV && process.env.NODE_ENV !== environment) {
  throw new Error(`NODE_ENV (${process.env.NODE_ENV}) is inconsistent with ENVIRONMENT (${environment})`);
}

const jwtSecret =
  environment === "development" || environment === "test" ? _env(envStr, "JWT_SECRET", "dev-secret") : _env(envStr, "JWT_SECRET");

export const config = {
  ...staticConfig,
  ENVIRONMENT: environment,
  RELEASE: _env(envStr, "RELEASE", "development"),
  PORT: _env(envInt, "PORT", 8080),
  RUN_CRONS: _env(envBool, "RUN_CRONS", false),
  RUN_TASKS: _env(envBool, "RUN_TASKS", false),
  RUN_API_AND_TASKS: _env(envBool, "RUN_API_AND_TASKS", false),
  ENABLE_SENTRY: _env(envBool, "ENABLE_SENTRY", false),
  ENABLE_SENDINBLUE: _env(envBool, "ENABLE_SENDINBLUE", false),
  MAIL_TRANSPORT: _env(envStr, "MAIL_TRANSPORT", null), // BREVO / SMTP / null (pas d'envoi d'email)
  SMTP_HOST: _env(envStr, "SMTP_HOST", "localhost"),
  SMTP_PORT: _env(envInt, "SMTP_PORT", 1025),
  ENABLE_ANTIVIRUS: _env(envBool, "ENABLE_ANTIVIRUS", false),
  // PM23 (06/10/2026) : bascule progressive du chiffrement des pièces S3 vers un format versionné
  // AES-256-GCM (authentifié) — voir api/src/cryptoUtils.ts. À false, `encrypt` continue d'écrire
  // l'ancien format AES-256-CTR (non authentifié) ; `decrypt` lit toujours les deux formats, quel
  // que soit l'état du flag, pour ne jamais casser la lecture des objets déjà stockés.
  ENABLE_FILE_ENCRYPTION_V1: _env(envBool, "ENABLE_FILE_ENCRYPTION_V1", false),
  // PM23 : coupe-circuit pour fermer complètement le constat une fois tous les objets existants
  // rechiffrés en AES-256-GCM. À true (défaut), `decrypt` lit encore l'ancien format CTR non
  // authentifié ; un objet altéré dont l'en-tête versionné a été retiré ou remplacé se déchiffre
  // alors silencieusement, sans authentification (constat PM23 toujours ouvert tant que ce flag
  // reste à true — relecture A). À false, tout objet non versionné fait lever `decrypt` : à
  // n'activer qu'après avoir rechiffré tous les objets existants en V1 (script de migration hors
  // périmètre de cette PR).
  ENABLE_FILE_ENCRYPTION_LEGACY_READ: _env(envBool, "ENABLE_FILE_ENCRYPTION_LEGACY_READ", true),
  ENABLE_FLATTEN_ERROR_LOGS: _env(envBool, "ENABLE_FLATTEN_ERROR_LOGS", false), // Print error stack without newlines on stderr
  API_URL: _env(envStr, "API_URL", "http://localhost:8080"),
  APIV2_URL: _env(envStr, "APIV2_URL", "http://localhost:8086"),
  APP_URL: _env(envStr, "APP_URL", "http://localhost:8081"),
  ADMIN_URL: _env(envStr, "ADMIN_URL", "http://localhost:8082"),
  // PH18 (25/09/2026) : défaut abaissé de 1 à 0.01, aligné sur apiv2 et snupport-api — tant que la
  // redaction des transactions n'était pas systématique (beforeSendTransaction, cf. sentry.js),
  // échantillonner 100% des requêtes envoyait cookies, en-têtes et corps en clair sur chacune.
  SENTRY_TRACING_SAMPLE_RATE: _env(envFloat, "SENTRY_TRACING_SAMPLE_RATE", 0.01),
  SENTRY_PROFILE_SAMPLE_RATE: _env(envFloat, "SENTRY_PROFILE_SAMPLE_RATE", 1),
  SENTRY_DEBUG_MODE: _env(envBool, "SENTRY_DEBUG_MODE", false),
  MONGO_URL: _env(envStr, "MONGO_URL", "mongodb://localhost:27017/snu_dev?directConnection=true"),
  JWT_SECRET: jwtSecret,
  SUPPORT_URL: _env(envStr, "SUPPORT_URL", "http://localhost:8090"),
  SUPPORT_FRONT_URL: _env(envStr, "SUPPORT_FRONT_URL", "http://localhost:8083"),
  SUPPORT_APIKEY: _env(envStr, "SUPPORT_APIKEY"),
  KNOWLEDGEBASE_URL: _env(envStr, "KNOWLEDGEBASE_URL", "https://support.beta-snu.dev"),
  API_ANALYTICS_ENDPOINT: _env(envStr, "API_ANALYTICS_ENDPOINT", "http://localhost:8085"),
  API_ANALYTICS_API_KEY: _env(envStr, "API_ANALYTICS_API_KEY"),
  ES_ENDPOINT: _env(envStr, "ES_ENDPOINT", "http://localhost:9200"),
  SENDINBLUEKEY: _env(envStr, "SENDINBLUEKEY"),
  DIAGORIENTE_URL: _env(envStr, "DIAGORIENTE_URL", "https://api-ql-dev.projetttv.org/graphql"),
  DIAGORIENTE_TOKEN: _env(envStr, "DIAGORIENTE_TOKEN"),
  CELLAR_ENDPOINT: _env(envStr, "CELLAR_ENDPOINT"),
  CELLAR_KEYID: _env(envStr, "CELLAR_KEYID"),
  CELLAR_KEYSECRET: _env(envStr, "CELLAR_KEYSECRET"),
  BUCKET_NAME: _env(envStr, "BUCKET_NAME"),
  PUBLIC_BUCKET_NAME: _env(envStr, "PUBLIC_BUCKET_NAME"),
  CELLAR_ENDPOINT_SUPPORT: _env(envStr, "CELLAR_ENDPOINT_SUPPORT"),
  CELLAR_KEYID_SUPPORT: _env(envStr, "CELLAR_KEYID_SUPPORT"),
  CELLAR_KEYSECRET_SUPPORT: _env(envStr, "CELLAR_KEYSECRET_SUPPORT"),
  PUBLIC_BUCKET_NAME_SUPPORT: _env(envStr, "PUBLIC_BUCKET_NAME_SUPPORT"),
  FILE_ENCRYPTION_SECRET_SUPPORT: _env(envStr, "FILE_ENCRYPTION_SECRET_SUPPORT"),
  FILE_ENCRYPTION_SECRET: _env(envStr, "FILE_ENCRYPTION_SECRET"),
  QPV_USERNAME: _env(envStr, "QPV_USERNAME"),
  QPV_PASSWORD: _env(envStr, "QPV_PASSWORD"),
  API_ENGAGEMENT_URL: _env(envStr, "API_ENGAGEMENT_URL", "https://api.api-engagement.beta.gouv.fr"),
  API_ENGAGEMENT_KEY: _env(envStr, "API_ENGAGEMENT_KEY"),
  API_ASSOCIATION_CELLAR_ENDPOINT: _env(envStr, "API_ASSOCIATION_CELLAR_ENDPOINT"),
  API_ASSOCIATION_CELLAR_KEYID: _env(envStr, "API_ASSOCIATION_CELLAR_KEYID"),
  API_ASSOCIATION_CELLAR_KEYSECRET: _env(envStr, "API_ASSOCIATION_CELLAR_KEYSECRET"),
  SLACK_BOT_TOKEN: _env(envStr, "SLACK_BOT_TOKEN"),
  SLACK_BOT_CHANNEL: _env(envStr, "SLACK_BOT_CHANNEL"),
  // Canal dedie aux comptes responsables crees par la synchro JeVeuxAider et laisses inactifs.
  // Non defini, les messages retombent sur SLACK_BOT_CHANNEL.
  SLACK_JVA_CHANNEL: _env(envStr, "SLACK_JVA_CHANNEL"),
  JVA_TOKEN: _env(envStr, "JVA_TOKEN"),
  JVA_API_KEY: _env(envStr, "JVA_API_KEY"),
  REDIS_URL: _env(envStr, "REDIS_URL", "redis://127.0.0.1:6379"),
  /**
   * Nombre de reverse proxies devant l'API. Express ne retient alors que le
   * dernier saut non fiable de X-Forwarded-For : sans ce réglage, le rate
   * limiting se contourne en forgeant l'en-tête. À ajuster si la chaîne de
   * proxies change.
   */
  TRUST_PROXY_HOPS: _env(envInt, "TRUST_PROXY_HOPS", ["production", "staging", "ci", "custom"].includes(environment) ? 1 : 0),
  API_DEMARCHE_SIMPLIFIEE_TOKEN: _env(envStr, "API_DEMARCHE_SIMPLIFIEE_TOKEN"),
  PM2_SLACK_URL: _env(envStr, "PM2_SLACK_URL"),
  TASK_QUEUE_PREFIX: _env(envStr, "TASK_QUEUE_PREFIX", environment),
  TASK_MONITOR_USER: _env(envStr, "TASK_MONITOR_USER"),
  TASK_MONITOR_SECRET: _env(envStr, "TASK_MONITOR_SECRET"),
  ENABLE_2FA: _env(envBool, "ENABLE_2FA", false),
  LOG_LEVEL: _env(envStr, "LOG_LEVEL", "debug"), // error, warn, info, http, debug
  DO_MIGRATION: _env(envBool, "DO_MIGRATION", false),
};

// PM7 : couvre aussi les recettes (env-*) — l'ancienne liste fermée les laissait démarrer sans
// JWT_SECRET, dev-secret n'étant lui-même réservé qu'à development/test.
if (config.ENVIRONMENT !== "development" && config.ENVIRONMENT !== "test" && !config.JWT_SECRET) {
  throw new Error("Missing required environment variable JWT_SECRET");
}
