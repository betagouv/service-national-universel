/*
Use SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_RELEASE
*/
import { envStr, envInt } from "snu-lib";

function _env<T>(callback: (value: any, fallback?: T) => T, key: string, fallback?: T) {
    try {
        return callback(process.env[key], fallback);
    } catch (error) {
        console.warn(`Environment ${key}: ${error}`);
    }
    return undefined;
}

// NODE_ENV environment variable is used by :
// - jest : unit test (NODE_ENV == "test")
const defaultEnv = process.env.NODE_ENV === "test" ? "test" : "development";
const environment = _env(envStr, "ENVIRONMENT", defaultEnv);

export default () => ({
    environment,
    release: _env(envStr, "RELEASE", "development"),
    httpServer: {
        port: _env(envInt, "PORT", 8086),
    },
    database: {
        url: _env(envStr, "DATABASE_URL", "mongodb://localhost:27017/snu_dev?directConnection=true"), // MONGO_URL in v1
    },
    broker: {
        url: _env(envStr, "BROKER_URL", "redis://127.0.0.1:6379"), // REDIS_URL in v1
        queuePrefix: _env(envStr, "BROKER_QUEUE_PREFIX", environment), // TASK_QUEUE_PREFIX in v1
        monitorUser: _env(envStr, "BROKER_MONITOR_USER"),
        monitorSecret: _env(envStr, "BROKER_MONITOR_SECRET"),
    },
    email: {
        provider: _env(envStr, "EMAIL_PROVIDER", "mock"), // MAIL_TRANSPORT in v1
        apiKey: _env(envStr, "EMAIL_SERVICE_API_KEY"), // SENDINBLUEKEY in v1
        smtpHost: _env(envStr, "SMTP_HOST", "localhost"),
        smtpPort: _env(envInt, "SMTP_PORT", 1025),
    },
    urls: {
        admin: _env(envStr, "ADMIN_URL", "http://localhost:8082"),
        app: _env(envStr, "APP_URL", "http://localhost:8081"),
        api: _env(envStr, "API_URL", "http://localhost:8080"),
        apiv2: _env(envStr, "APIV2_URL", "http://localhost:8086"),
    },
    auth: {
        jwtSecret: _env(envStr, "JWT_SECRET", "my-secret"),
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
