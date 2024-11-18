/*
Use SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_RELEASE
*/

export default () => ({
    httpServer: {
        port: parseInt(process.env.PORT || "3000"),
    },
    database: {
        url: process.env.DATABASE_URL || "mongodb://localhost:27017/local_app",
    },
    broker: {
        url: process.env.BROKER_URL || "redis://127.0.0.1:6379",
    },
    email: {
        provider: process.env.EMAIL_PROVIDER || "mock",
    },
});
