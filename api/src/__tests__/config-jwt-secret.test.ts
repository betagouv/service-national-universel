describe("config JWT_SECRET fail-fast", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("throws at boot in production when JWT_SECRET is missing/empty", async () => {
    process.env.ENVIRONMENT = "production";
    process.env.JWT_SECRET = "";

    await expect(import("../config")).rejects.toThrow(/JWT_SECRET/);
  });

  it("does not throw in test environment when JWT_SECRET is missing/empty", async () => {
    process.env.ENVIRONMENT = "test";
    process.env.JWT_SECRET = "";

    await expect(import("../config")).resolves.toBeDefined();
  });
});

