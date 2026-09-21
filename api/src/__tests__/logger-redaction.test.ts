import { Writable } from "stream";
import { transports } from "winston";
import { logger } from "../logger";

const TOKEN_40 = "a".repeat(40);
const OTHER_TOKEN_40 = "b".repeat(40);

async function captureLogs(emit: () => void): Promise<string> {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk.toString());
      callback();
    },
  });
  const transport = new transports.Stream({ stream });
  const consoleTransports = logger.transports.filter((t) => t instanceof transports.Console);
  consoleTransports.forEach((t) => (t.silent = true));
  const previousLevel = logger.level;
  logger.level = "debug";
  logger.add(transport);
  try {
    emit();
    await new Promise((resolve) => setImmediate(resolve));
  } finally {
    logger.remove(transport);
    logger.level = previousLevel;
    consoleTransports.forEach((t) => (t.silent = false));
  }
  return chunks.join("");
}

describe("logger redaction (safety net)", () => {
  it("never writes secret values even when a whole referent document is dumped in an error message", async () => {
    const dump = JSON.stringify({
      res: { code: "invalid_parameter", message: "email is invalid" },
      email: "jean.dupont@example.org",
      attributes: { TOKEN2FA: "123456", INVITATIONTOKEN: TOKEN_40, FORGOTPASSWORDRESETTOKEN: OTHER_TOKEN_40, REGION: "Bretagne" },
      listIds: [1448],
    });

    const output = await captureLogs(() => logger.error(`capture: Error: ${dump}`));

    expect(output).not.toContain(TOKEN_40);
    expect(output).not.toContain(OTHER_TOKEN_40);
    expect(output).not.toContain("123456");
    expect(output).not.toContain("jean.dupont");
    expect(output).toContain("error: capture: Error:");
    expect(output).toContain('"code":"invalid_parameter"');
    expect(output).toContain('"REGION":"Bretagne"');
    expect(output).toContain('"email":"j***@example.org"');
  });

  it("redacts secrets nested in log meta such as a request payload", async () => {
    const output = await captureLogs(() =>
      logger.info("api", {
        method: "POST",
        url: "/referent/forgot_password_reset",
        status: 200,
        payload: { email: "jean.dupont@example.org", password: "Secret1!", token: OTHER_TOKEN_40 },
        userID: "64a0f1c2b3d4e5f60718293a",
      }),
    );

    expect(output).not.toContain("Secret1!");
    expect(output).not.toContain(OTHER_TOKEN_40);
    expect(output).not.toContain("jean.dupont");
    expect(output).toContain("info: api");
    expect(output).toContain('"url":"/referent/forgot_password_reset"');
    expect(output).toContain('"userID":"64a0f1c2b3d4e5f60718293a"');
    expect(output).toContain('"password":"**********"');
    expect(output).toContain('"token":"**********"');
  });

  it("redacts an Error passed directly to the logger", async () => {
    const output = await captureLogs(() => logger.error(new Error("boom jean.dupont@example.org")));

    expect(output).toContain("error: boom j***@example.org");
    expect(output).not.toContain("jean.dupont");
  });

  it("redacts a sensitive key placed at the top level of an object passed to the logger", async () => {
    const output = await captureLogs(() => logger.info({ message: "object message", token: "abc", userID: "1" } as any));

    expect(output).toContain("info: object message");
    expect(output).toContain('"token":"**********"');
    expect(output).not.toContain("abc");
  });

  it("keeps an Error with an empty message printable", async () => {
    const output = await captureLogs(() => logger.error(new Error("")));

    expect(output).toContain("error: Error");
    expect(output).not.toContain("[object Object]");
  });

  it("writes the redacted url of a request log without any secret", async () => {
    const token = "a".repeat(40);
    const output = await captureLogs(() =>
      logger.info("api", {
        method: "GET",
        url: `/contract/token/${token}`,
        status: 200,
        userID: "64a0f1c2b3d4e5f60718293a",
      }),
    );

    expect(output).toContain("info: api");
    expect(output).toContain('"userID":"64a0f1c2b3d4e5f60718293a"');
    expect(output).not.toContain(token);
  });

  it("does not throw when a meta breaks the redaction", async () => {
    const wrapper: any = {};
    wrapper.toJSON = () => ({ toJSON: wrapper.toJSON });

    await expect(captureLogs(() => logger.info("x", { wrapper }))).resolves.toBeDefined();
  });
});
