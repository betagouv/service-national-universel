/*
Use SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_RELEASE
*/
import { envStr, envInt, envBool, envFloat } from "snu-lib";

function _env<T>(callback: (value: any, fallback?: T) => T, key: string, fallback?: T) {
    try {
        return callback(process.env[key], fallback);
    } catch (error) {
        console.warn(`Environment ${key}: ${error}`);
    }
    return undefined;
}

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
// Même correctif que api/src/config.ts.
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
    environment === "development" || environment === "test"
        ? _env(envStr, "JWT_SECRET", "dev-secret")
        : _env(envStr, "JWT_SECRET");

const isDeployedEnvironment = ["production", "staging", "ci", "custom"].includes(environment ?? "");

const configuration = () => ({
    environment,
    release: _env(envStr, "RELEASE", "development"),
    sentry: {
        debugMode: _env(envBool, "SENTRY_DEBUG_MODE", false),
        dsn: _env(envStr, "SENTRY_DSN", ""),
        tracingSampleRate: _env(envFloat, "SENTRY_TRACING_SAMPLE_RATE", 0.01),
    },
    httpServer: {
        port: _env(envInt, "PORT", 8086),
        // Même réglage que la v1 (api/src/config.ts) : sans lui, req.ip désigne le reverse proxy
        // et le rate limiting compterait toutes les requêtes sur une seule IP.
        trustProxyHops: _env(envInt, "TRUST_PROXY_HOPS", isDeployedEnvironment ? 1 : 0),
        // Contrôle d'hôte : actif sur les environnements déployés. L'hôte de APIV2_URL est
        // toujours accepté ; ALLOWED_HOSTS ajoute des hôtes (liste séparée par des virgules).
        enforceHost: isDeployedEnvironment,
        allowedHosts: _env(envStr, "ALLOWED_HOSTS", ""),
    },
    database: {
        url: _env(envStr, "DATABASE_URL", "mongodb://localhost:27017/snu_dev?directConnection=true"), // MONGO_URL in v1
    },
    broker: {
        url: _env(envStr, "BROKER_URL", "redis://127.0.0.1:6379"), // REDIS_URL in v1
        queuePrefix: _env(envStr, "BROKER_QUEUE_PREFIX", environment), // TASK_QUEUE_PREFIX in v1
        monitorUser: _env(envStr, "BROKER_MONITOR_USER"),
        monitorSecret: _env(envStr, "BROKER_MONITOR_SECRET"),
        // Bull Board : IP autorisées (liste séparée par des virgules). Sur un environnement
        // déployé, une liste vide ferme le tableau de bord.
        monitorAllowedIps: _env(envStr, "BROKER_MONITOR_ALLOWED_IPS", ""),
    },
    email: {
        provider: _env(envStr, "EMAIL_PROVIDER", "mock"), // MAIL_TRANSPORT in v1
        apiKey: _env(envStr, "EMAIL_SERVICE_API_KEY"), // SENDINBLUEKEY in v1
        smtpHost: _env(envStr, "SMTP_HOST", "localhost"),
        smtpPort: _env(envInt, "SMTP_PORT", 1025),
        sender: {
            noreply: {
                email: _env(envStr, "EMAIL_SENDER_NOREPLY_ADDRESS", "no_reply-mailauto@snu.gouv.fr"),
                name: _env(envStr, "EMAIL_SENDER_NOREPLY_NAME", "Service National Universel"),
            },
        },
    },
    urls: {
        admin: _env(envStr, "ADMIN_URL", "http://localhost:8082"),
        app: _env(envStr, "APP_URL", "http://localhost:8081"),
        api: _env(envStr, "API_URL", "http://localhost:8080"),
        apiv2: _env(envStr, "APIV2_URL", "http://localhost:8086"),
    },
    auth: {
        jwtSecret,
    },
    bucket: {
        name: _env(envStr, "BUCKET_NAME", "BUCKET_NAME"),
        endpoint: _env(envStr, "CELLAR_ENDPOINT", "CELLAR_ENDPOINT"),
        accessKeyId: _env(envStr, "CELLAR_KEYID", "CELLAR_KEYID"),
        secretAccessKey: _env(envStr, "CELLAR_KEYSECRET", "CELLAR_KEYSECRET"),
    },
    marketing: {
        folderId: _env(envInt, "MARKETING_FOLDER_ID", 1886),
    },
    elastic: {
        url: _env(envStr, "ES_ENDPOINT", "http://localhost:9200"),
    },
});

const config = configuration();

// PM7 : couvre aussi les recettes (env-*) — l'ancienne liste fermée les laissait démarrer sans
// JWT_SECRET, dev-secret n'étant lui-même réservé qu'à development/test.
if (config.environment !== "development" && config.environment !== "test" && !config.auth.jwtSecret) {
    throw new Error("Missing required environment variable JWT_SECRET");
}

export default configuration;
