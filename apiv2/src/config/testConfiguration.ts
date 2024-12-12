export default () => ({
    environment: "test",
    release: "test",
    httpServer: {
        port: 8086,
    },
    database: {
        url: "mongodb://localhost:27017/snu_dev",
    },
    broker: {
        url: "redis://127.0.0.1:6379",
        queuePrefix: "test",
    },
    email: {
        provider: "mock",
        apiKey: "",
        smtpHost: "",
        smtpPort: 1025,
    },
    urls: {
        admin: "config.ADMIN_URL",
        app: "config.APP_URL",
        api: "config.API_URL",
        apiv2: "config.APIV2_URL",
    },
    auth: {
        jwtSecret: "my-secret",
    },
});
