// PL6 (audit du 25/09/2026) : l'IP journalisée doit venir de req.ip (Express, fiable via
// `trust proxy`), jamais d'une valeur calculée par le package request-ip (req.ipInfo),
// falsifiable via X-Client-IP / X-Forwarded-For sans validation de la chaîne de proxies.
jest.mock("../logger", () => ({ logger: { info: jest.fn() } }));
jest.mock("../sentry", () => ({ capture: jest.fn() }));
jest.mock("../config", () => ({ config: { ENVIRONMENT: "test" } }));

const { logger } = require("../logger");
const loggingMiddleware = require("./loggingMiddleware");

function runMiddleware(req) {
  return new Promise((resolve) => {
    const res = {
      _finishHandler: null,
      on(event, handler) {
        if (event === "finish") this._finishHandler = handler;
      },
    };
    loggingMiddleware(req, res, () => {});
    res.statusCode = 200;
    res._finishHandler().then(resolve);
  });
}

describe("loggingMiddleware", () => {
  it("journalise req.ip, pas req.ipInfo, même si un attaquant a fait diverger les deux", async () => {
    const req = { method: "GET", originalUrl: "/api/young", params: {}, ip: "10.0.0.1", ipInfo: "203.0.113.9" };

    await runMiddleware(req);

    expect(logger.info).toHaveBeenCalledWith("api", expect.objectContaining({ ip: "10.0.0.1" }));
  });
});
