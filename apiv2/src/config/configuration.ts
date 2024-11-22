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

export default () => ({
    httpServer: {
        port: _env(envInt, "PORT", 8086),
    },
    database: {
        url: _env(envStr, "DATABASE_URL", "mongodb://localhost:27017/local_app"),
    },
    broker: {
        url: _env(envStr, "BROKER_URL", "redis://127.0.0.1:6379"),
    },
    email: {
        provider: _env(envStr, "EMAIL_PROVIDER", "mock"),
    },
});
