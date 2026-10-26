// PL20 (audit du 25/09/2026) : morgan écrivait directement sur la console, hors du pipeline
// winston + redactLogInfo. morganLogStream doit router chaque ligne d'accès à travers ce pipeline,
// où la redaction s'applique déjà (voir packages/log-redaction).
jest.mock("../config", () => ({ config: { ENVIRONMENT: "production", LOG_LEVEL: "http" } }));

describe("morganLogStream", () => {
  it("route les lignes de morgan vers logger.http plutôt que la console", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { morganLogStream } = require("./morganLogStream");

    morganLogStream.write("GET /ticket/42 200 15 - 3.210 ms\n");

    // La ligne doit atteindre la console via le transport winston (donc redactée), jamais
    // directement via un console.log brut de morgan.
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.mock.calls[0].join(" ")).toContain("GET /ticket/42 200 15 - 3.210 ms");
    consoleSpy.mockRestore();
  });

  it("redige un jeton porté par la query string d'une ligne d'accès", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { morganLogStream } = require("./morganLogStream");

    morganLogStream.write("GET /v0/sso?token=abcd1234efgh5678secret 200 15 - 3.210 ms\n"); // gitleaks:allow

    const logged = consoleSpy.mock.calls.map((call) => call.join(" ")).join("\n");
    expect(logged).not.toContain("abcd1234efgh5678secret");
    consoleSpy.mockRestore();
  });
});
