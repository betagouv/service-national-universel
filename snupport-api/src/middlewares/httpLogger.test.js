// PL20 (lot P32, audit du 25/09/2026) : morgan("dev") journalisait req.originalUrl brut, hors du
// filet de redaction winston (logger.ts, redactLogInfo) — l'email du volontaire consultant sa
// messagerie (GET /v0/ticket?email=<email>) ou le SSO (snuReferentId) en clair dans les journaux.
const request = require("supertest");
const express = require("express");

jest.mock("../logger", () => ({ logger: { http: jest.fn() } }));

const { logger } = require("../logger");
const { httpLogger } = require("./httpLogger");

describe("httpLogger", () => {
  const buildApp = () => {
    const app = express();
    app.use(httpLogger);
    app.get("/v0/ticket", (req, res) => res.status(200).json({ ok: true }));
    return app;
  };

  beforeEach(() => jest.clearAllMocks());

  it("journalise la requête sans écrire directement sur stdout", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    await request(buildApp()).get("/v0/ticket?email=usager@example.org");

    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(logger.http).toHaveBeenCalledTimes(1);
    consoleLogSpy.mockRestore();
  });

  it("masque l'email porté par la query string", async () => {
    await request(buildApp()).get("/v0/ticket?email=usager@example.org");

    const [message] = logger.http.mock.calls[0];
    expect(message).not.toContain("usager@example.org");
    expect(message).toContain("/v0/ticket");
  });
});
