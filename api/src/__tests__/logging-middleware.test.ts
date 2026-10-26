import { EventEmitter } from "events";
import { logger } from "../logger";
import { REDACTED } from "../utils/logRedaction";

jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));
jest.mock("../config", () => ({ config: { ENVIRONMENT: "development", LOG_LEVEL: "debug" } }));

/* eslint-disable @typescript-eslint/no-var-requires */
const { config: mockConfig } = require("../config");
const loggingMiddleware = require("../middlewares/loggingMiddleware");
/* eslint-enable @typescript-eslint/no-var-requires */

const TOKEN_40 = "a".repeat(40);
const OTHER_TOKEN_40 = "b".repeat(40);

type RequestOverrides = { body?: Record<string, unknown>; originalUrl?: string; params?: Record<string, string> };

async function runRequest({ body = {}, originalUrl = "/referent/forgot_password_reset", params }: RequestOverrides) {
  const infoSpy = jest.spyOn(logger, "info").mockImplementation(() => logger);
  const req: any = { method: "POST", originalUrl, body, params };
  const res: any = new EventEmitter();
  res.statusCode = 200;
  const next = jest.fn();
  try {
    loggingMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    res.emit("finish");
    await new Promise((resolve) => setImmediate(resolve));
    expect(infoSpy).toHaveBeenCalledTimes(1);
    const [label, log] = infoSpy.mock.calls[0] as unknown as [string, any];
    expect(label).toBe("api");
    return { req, log };
  } finally {
    infoSpy.mockRestore();
  }
}

beforeEach(() => {
  mockConfig.ENVIRONMENT = "development";
});

describe("loggingMiddleware — url", () => {
  it("masks a token carried as a path segment", async () => {
    const { log } = await runRequest({ originalUrl: `/contract/token/${TOKEN_40}` });

    expect(log.url).toBe("/contract/token/**********");
  });

  it("masks a route parameter whose name is sensitive and keeps the identifier", async () => {
    const { log } = await runRequest({
      originalUrl: `/young/validate_phase3/64a0f1c2b3d4e5f60718293a/${TOKEN_40}`,
      params: { young: "64a0f1c2b3d4e5f60718293a", token: TOKEN_40 },
    });

    expect(log.url).toBe("/young/validate_phase3/64a0f1c2b3d4e5f60718293a/**********");
  });

  it("masks a token and truncates an URL-encoded email in the query string", async () => {
    const jva = await runRequest({ originalUrl: "/jeveuxaider/signin?token_jva=eyJhbGciOiJIUzI1NiJ9.payload.sig" });
    expect(jva.log.url).toBe("/jeveuxaider/signin?token_jva=**********");

    const referent = await runRequest({ originalUrl: "/referent?email=jean.dupont%40example.org&role=admin" });
    expect(referent.log.url).toBe("/referent?email=j***@example.org&role=admin");
  });

  it("keeps an ordinary url untouched", async () => {
    const { log } = await runRequest({ originalUrl: "/young?page=1&cohort=2026" });

    expect(log.url).toBe("/young?page=1&cohort=2026");
  });
});

describe("loggingMiddleware — payload", () => {
  it("never logs the request body in production", async () => {
    mockConfig.ENVIRONMENT = "production";

    const { log } = await runRequest({
      body: { firstName: "Léa", lastName: "Martin", birthdateAt: "2008-04-12", allergies: "arachide", password: "Secret1!" },
    });

    expect(log.payload).toBeUndefined();
    expect(log.method).toBe("POST");
    expect(log.status).toBe(200);
    expect(JSON.stringify(log)).not.toContain("Martin");
    expect(JSON.stringify(log)).not.toContain("arachide");
  });

  it("masks every secret of the payload and truncates the email outside production", async () => {
    const { log } = await runRequest({
      body: {
        email: "jean.dupont@example.org",
        password: "Secret1!",
        newPassword: "Secret2!",
        token: OTHER_TOKEN_40,
        token_2fa: "123456",
        invitationToken: TOKEN_40,
        rememberMe: true,
      },
    });

    expect(log.payload).toEqual({
      email: "j***@example.org",
      password: REDACTED,
      newPassword: REDACTED,
      token: REDACTED,
      token_2fa: REDACTED,
      invitationToken: REDACTED,
      rememberMe: true,
    });
  });

  it("does not alter the request body itself", async () => {
    const { req } = await runRequest({ body: { email: "jean.dupont@example.org", password: "Secret1!", token: OTHER_TOKEN_40 } });

    expect(req.body).toEqual({ email: "jean.dupont@example.org", password: "Secret1!", token: OTHER_TOKEN_40 });
  });

  it("omits the payload when the body is empty", async () => {
    const { log } = await runRequest({ body: {} });

    expect(log.payload).toBeUndefined();
  });
});
