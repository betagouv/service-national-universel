import { logger } from "../logger";

jest.mock("../logger");
jest.mock("../sentry", () => ({ capture: jest.fn() }));

const loggingMiddleware = require("./loggingMiddleware");

describe("loggingMiddleware", () => {
  const buildRes = () => {
    let finishHandler: () => void = () => {};
    return {
      statusCode: 200,
      on: (event: string, handler: () => void) => {
        if (event === "finish") finishHandler = handler;
      },
      emitFinish: async () => {
        await finishHandler();
      },
    };
  };

  // PL6 : req.ipInfo (requestIp.getClientIp) retient x-client-ip / la première entrée de
  // x-forwarded-for, deux en-têtes fournis par le client — falsifiable. req.ip (trust proxy,
  // TRUST_PROXY_HOPS) est la même source que le rate limiting et n'est pas falsifiable au-delà
  // du nombre de sauts de confiance configuré.
  it("journalise req.ip plutôt que req.ipInfo (PL6 : IP falsifiable par X-Client-IP/X-Forwarded-For)", async () => {
    const req: any = { method: "GET", originalUrl: "/public/cohorts", ip: "203.0.113.7", ipInfo: "8.8.8.8", params: {} };
    const res = buildRes();
    const next = jest.fn();

    loggingMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    await res.emitFinish();

    expect(logger.info).toHaveBeenCalledWith("api", expect.objectContaining({ ip: "203.0.113.7" }));
  });
});
