import { Writable } from "stream";
import { transports } from "winston";
import { logger } from "../logger";

const TOKEN_40 = "a".repeat(40);
const JWT = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.s1gn4tur3";
// valeur factice, volontairement sans allure de mot de passe : les scanners de secrets analysent aussi les tests
const PASSWORD_FIXTURE = "redact-me";

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

describe("logger redaction (filet de sécurité)", () => {
  it("masque les secrets d'un document agent dumpé dans un message d'erreur", async () => {
    const dump = JSON.stringify({
      _id: "64a0f1c2b3d4e5f60718293a",
      email: "agent.support@example.org",
      password: PASSWORD_FIXTURE,
      forgotPasswordResetToken: TOKEN_40,
      forgotPasswordResetExpires: "2026-09-22T10:00:00.000Z",
      role: "AGENT",
    });

    const output = await captureLogs(() => logger.error(`capture: Error: ${dump}`));

    expect(output).not.toContain(TOKEN_40);
    expect(output).not.toContain(PASSWORD_FIXTURE);
    expect(output).not.toContain("agent.support@example.org");
    // ce qui sert au debug est conservé
    expect(output).toContain("error: capture: Error:");
    expect(output).toContain('"_id":"64a0f1c2b3d4e5f60718293a"');
    expect(output).toContain('"role":"AGENT"');
    expect(output).toContain('"forgotPasswordResetExpires":"2026-09-22T10:00:00.000Z"');
  });

  it("masque les secrets portés par les meta d'un appel logger", async () => {
    const output = await captureLogs(() =>
      logger.debug("", { body: { to: "usager@example.org", token: TOKEN_40 }, headers: { cookie: `jwtzamoud=${JWT}` } }),
    );

    expect(output).not.toContain(TOKEN_40);
    expect(output).not.toContain(JWT);
    expect(output).not.toContain("usager@example.org");
  });

  it("masque le cookie de session de snupport, quelle que soit sa forme", async () => {
    const output = await captureLogs(() => logger.error("session", { cookies: { jwtzamoud: JWT }, jwtzamoud: JWT }));

    expect(output).not.toContain(JWT);
  });

  it("masque un token porté par l'URL d'un lien de réinitialisation", async () => {
    const output = await captureLogs(() => logger.error(`mail envoyé : https://admin-support.snu.gouv.fr/reset-password?token=${TOKEN_40}`));

    expect(output).not.toContain(TOKEN_40);
    expect(output).toContain("admin-support.snu.gouv.fr");
  });
});
