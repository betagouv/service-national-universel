import { REDACTED } from "@snu/log-redaction";

const TOKEN_40 = "a".repeat(40);
const JWT = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.s1gn4tur3";
// valeur factice, volontairement sans allure de mot de passe : les scanners de secrets analysent aussi les tests
const PASSWORD_FIXTURE = "redact-me";

jest.mock("@sentry/integrations", () => ({
  ExtraErrorData: jest.fn(() => ({ name: "extraErrorData" })),
  RewriteFrames: jest.fn(() => ({ name: "rewriteFrames" })),
}));
jest.mock("@sentry/tracing", () => ({ Integrations: { Mongo: jest.fn(), Express: jest.fn() } }));
jest.mock("@sentry/node", () => ({
  addGlobalEventProcessor: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  Integrations: { Http: jest.fn(), Modules: jest.fn() },
  init: jest.fn(),
  Handlers: { requestHandler: () => jest.fn(), tracingHandler: () => jest.fn(), errorHandler: () => jest.fn() },
}));
jest.mock("../config", () => ({
  config: { ENABLE_SENTRY: true, ENVIRONMENT: "production", LOG_LEVEL: "error", SENTRY_DEBUG_MODE: false, RELEASE: "test" },
}));

/* eslint-disable @typescript-eslint/no-var-requires */
const { initSentry, capture } = require("../sentry");
const { init } = require("@sentry/node");
const { logger } = require("../logger");
/* eslint-enable @typescript-eslint/no-var-requires */

describe("initSentry", () => {
  it("installe la redaction comme hook beforeSend", () => {
    initSentry({ use: jest.fn() });

    expect(init).toHaveBeenCalledTimes(1);
    const options = (init as jest.Mock).mock.calls[0][0];
    expect(typeof options.beforeSend).toBe("function");

    const event = {
      request: {
        url: `https://api-support.snu.gouv.fr/agent/reset-password/${TOKEN_40}`,
        query_string: "email=agent.support%40example.org",
        method: "POST",
        data: { email: "agent.support@example.org", password: PASSWORD_FIXTURE, forgotPasswordResetToken: TOKEN_40 },
        headers: { authorization: `Bearer ${JWT}`, cookie: `jwtzamoud=${JWT}`, "user-agent": "jest" },
        cookies: { jwtzamoud: JWT },
      },
      user: { id: "64a0f1c2b3d4e5f60718293a", email: "agent.support@example.org" },
    };

    const sent = options.beforeSend(event);
    const serialized = JSON.stringify(sent);

    expect(serialized).not.toContain(PASSWORD_FIXTURE);
    expect(serialized).not.toContain(TOKEN_40);
    expect(serialized).not.toContain(JWT);
    expect(serialized).not.toContain("agent.support@example.org");

    // ce qui sert au debug est conservé
    expect(sent.request.method).toBe("POST");
    expect(sent.request.headers["user-agent"]).toBe("jest");
    // PH18/PM36 : request.data est supprimé entièrement, pas seulement redacté champ par champ.
    expect(sent.request.data).toBeUndefined();
    expect(sent.user.id).toBe("64a0f1c2b3d4e5f60718293a");
  });

  it("PH18 : installe la même redaction comme hook beforeSendTransaction", () => {
    initSentry({ use: jest.fn() });

    const options = (init as jest.Mock).mock.calls[0][0];
    expect(typeof options.beforeSendTransaction).toBe("function");

    const sent = options.beforeSendTransaction({ request: { data: { password: PASSWORD_FIXTURE }, cookies: { jwtzamoud: JWT } } });
    expect(sent.request.data).toBeUndefined();
    expect(sent.request.cookies.jwtzamoud).toBe(REDACTED);
  });

  it("PM36 : limite Handlers.requestHandler() à method/url", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Handlers } = require("@sentry/node");
    const requestHandlerSpy = jest.spyOn(Handlers, "requestHandler");

    initSentry({ use: jest.fn() });

    expect(requestHandlerSpy).toHaveBeenCalledWith({ request: ["method", "url"] });
    requestHandlerSpy.mockRestore();
  });
});

describe("capture", () => {
  it("journalise par le logger redacté et non par console", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
    const loggerSpy = jest.spyOn(logger, "error").mockImplementation(() => logger);

    try {
      capture(new Error(`Brevo sync failed: {"email":"agent.support@example.org","forgotPasswordResetToken":"${TOKEN_40}"}`));

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledTimes(1);
      // la redaction elle-même est appliquée par le format winston, couvert par logger-redaction.test.ts
      expect(String(loggerSpy.mock.calls[0][0])).toContain("capture:");
    } finally {
      consoleSpy.mockRestore();
      loggerSpy.mockRestore();
    }
  });
});
