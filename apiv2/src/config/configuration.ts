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
        url: _env(envStr, "DATABASE_URL", "mongodb://localhost:27017/local_app"), // MONGO_URL in v1
    },
    broker: {
        url: _env(envStr, "BROKER_URL", "redis://127.0.0.1:6379"), // REDIS_URL in v1
        queuePrefix: _env(envStr, "BROKER_QUEUE_PREFIX", environment), // TASK_QUEUE_PREFIX in v1
    },
    email: {
        provider: _env(envStr, "EMAIL_PROVIDER", "mock"), // MAIL_TRANSPORT in v1
        apiKey: _env(envStr, "EMAIL_SERVICE_API_KEY"), // SENDINBLUEKEY in v1
    },
    urls: {
        admin: _env(envStr, "ADMIN_URL", "http://localhost:8082"),
    },
    auth: {
        jwtSecret: _env(envStr, "JWT_SECRET"),
    },
});
