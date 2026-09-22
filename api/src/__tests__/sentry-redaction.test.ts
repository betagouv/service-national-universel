import { REDACTED, redactSentryEvent } from "../utils/logRedaction";

const TOKEN_40 = "a".repeat(40);
// valeur factice, volontairement sans allure de mot de passe : les scanners de secrets analysent aussi les tests
const PASSWORD_FIXTURE = "redact-me";

jest.mock("@sentry/profiling-node", () => ({ nodeProfilingIntegration: () => ({ name: "profiling" }) }));
jest.mock("@sentry/node", () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  extraErrorDataIntegration: () => ({ name: "extraErrorData" }),
  rewriteFramesIntegration: () => ({ name: "rewriteFrames" }),
}));
jest.mock("../config", () => ({
  config: { ENABLE_SENTRY: true, ENVIRONMENT: "production", LOG_LEVEL: "error", SENTRY_DEBUG_MODE: false, RELEASE: "test" },
}));

describe("redactSentryEvent", () => {
  it("masks the request body, headers, cookies and url of an event", () => {
    const event: any = {
      event_id: "abc123",
      level: "error",
      message: "capture: Brevo contact sync failed",
      request: {
        url: `https://api.snu.gouv.fr/contract/token/${TOKEN_40}`,
        query_string: "email=jean.dupont%40example.org",
        method: "POST",
        data: { email: "jean.dupont@example.org", password: PASSWORD_FIXTURE, token_2fa: "123456" },
        headers: { authorization: "Bearer eyJhbGciOiJIUzI1NiJ9", cookie: "jwt_ref=eyJhbGciOiJIUzI1NiJ9", "user-agent": "jest" },
        cookies: { jwt_ref: "eyJhbGciOiJIUzI1NiJ9" },
      },
      user: { id: "64a0f1c2b3d4e5f60718293a", email: "jean.dupont@example.org" },
      extra: { options: { body: `{"attributes":{"INVITATIONTOKEN":"${TOKEN_40}"}}` } },
      contexts: { payload: { invitationToken: TOKEN_40 } },
      breadcrumbs: [{ category: "http", data: { url: `/auth/signup/invite?token=${TOKEN_40}` } }],
    };

    const out: any = redactSentryEvent(event);
    const serialized = JSON.stringify(out);

    expect(serialized).not.toContain(PASSWORD_FIXTURE);
    expect(serialized).not.toContain(TOKEN_40);
    expect(serialized).not.toContain("123456");
    expect(serialized).not.toContain("eyJhbGciOiJIUzI1NiJ9");
    expect(serialized).not.toContain("jean.dupont@example.org");

    expect(out.event_id).toBe("abc123");
    expect(out.level).toBe("error");
    expect(out.request.method).toBe("POST");
    expect(out.request.headers["user-agent"]).toBe("jest");
    expect(out.request.data.password).toBe(REDACTED);
    expect(out.request.data.email).toBe("j***@example.org");
    expect(out.request.url).toBe("https://api.snu.gouv.fr/contract/token/**********");
    expect(out.user.id).toBe("64a0f1c2b3d4e5f60718293a");
  });

  it("tolerates an event without request, extra nor user", () => {
    const event: any = { event_id: "x", exception: { values: [{ type: "Error", value: "boom" }] } };

    expect(() => redactSentryEvent(event)).not.toThrow();
    expect(redactSentryEvent(event).exception.values[0].value).toBe("boom");
  });
});

describe("initSentry", () => {
  it("installs the redaction as a beforeSend hook", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { initSentry } = require("../sentry");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { init } = require("@sentry/node");

    initSentry();

    expect(init).toHaveBeenCalledTimes(1);
    const options = (init as jest.Mock).mock.calls[0][0];
    expect(typeof options.beforeSend).toBe("function");

    const sent = options.beforeSend({ request: { data: { password: PASSWORD_FIXTURE } } });
    expect(sent.request.data.password).toBe(REDACTED);
  });
});
