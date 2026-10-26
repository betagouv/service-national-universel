describe("configuration ENVIRONMENT/JWT_SECRET fail-fast (PM7)", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("throws at boot in production when JWT_SECRET is missing/empty", async () => {
        delete process.env.NODE_ENV;
        process.env.ENVIRONMENT = "production";
        process.env.JWT_SECRET = "";

        await expect(import("./configuration")).rejects.toThrow(/JWT_SECRET/);
    });

    it("does not throw in test environment when JWT_SECRET is missing/empty", async () => {
        process.env.ENVIRONMENT = "test";
        process.env.JWT_SECRET = "";

        await expect(import("./configuration")).resolves.toBeDefined();
    });

    it("throws at boot when ENVIRONMENT is absent (no silent fallback to development)", async () => {
        delete process.env.ENVIRONMENT;
        delete process.env.NODE_ENV;
        process.env.JWT_SECRET = "a-real-secret";

        await expect(import("./configuration")).rejects.toThrow(/ENVIRONMENT/);
    });

    it("throws at boot when ENVIRONMENT is misspelled/unknown", async () => {
        delete process.env.NODE_ENV;
        process.env.ENVIRONMENT = "producdion";
        process.env.JWT_SECRET = "a-real-secret";

        await expect(import("./configuration")).rejects.toThrow(/ENVIRONMENT/);
    });

    it("accepts a recette environment (env-<branche>) with a real JWT_SECRET", async () => {
        delete process.env.NODE_ENV;
        process.env.ENVIRONMENT = "env-fix-goo-80";
        process.env.JWT_SECRET = "a-real-secret";

        await expect(import("./configuration")).resolves.toBeDefined();
    });

    it("throws for a recette environment (env-<branche>) without JWT_SECRET (no more bypass)", async () => {
        delete process.env.NODE_ENV;
        process.env.ENVIRONMENT = "env-fix-goo-80";
        delete process.env.JWT_SECRET;

        await expect(import("./configuration")).rejects.toThrow(/JWT_SECRET/);
    });

    it("throws when NODE_ENV is set and inconsistent with ENVIRONMENT", async () => {
        process.env.NODE_ENV = "production";
        process.env.ENVIRONMENT = "staging";
        process.env.JWT_SECRET = "a-real-secret";

        await expect(import("./configuration")).rejects.toThrow(/NODE_ENV/);
    });

    it("does not serve dev-secret outside development/test even when ENVIRONMENT is known", async () => {
        delete process.env.NODE_ENV;
        process.env.ENVIRONMENT = "custom";
        process.env.JWT_SECRET = "a-real-secret";

        const { default: configuration } = await import("./configuration");
        expect(configuration().auth.jwtSecret).toBe("a-real-secret");
    });
});
