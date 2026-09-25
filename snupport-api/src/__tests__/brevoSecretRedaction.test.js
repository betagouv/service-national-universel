/* eslint-env jest */
/**
 * Non-régression H80 : le corps envoyé à Brevo (lien de réinitialisation de mot de passe,
 * contenu des réponses de tickets) ne doit jamais partir vers Sentry ni vers les logs.
 *
 * `snupport-api` n'a pas de transformation TypeScript dans sa configuration jest : on transpile
 * `src/brevo.ts` à la volée avec le compilateur déjà présent en devDependency, puis on l'évalue
 * avec des dépendances bouchonnées. Le module testé est donc bien le code de production.
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const TOKEN = "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
const RESET_LINK = `https://support.snu.gouv.fr/auth/reset?token=${TOKEN}`;
const HTML = `Une demande de réinitialisation a été faite, <a href="${RESET_LINK}">cliquer ici</a>`;

function loadBrevo({ environment = "staging", sendinblueKey = "xkeysib-fake", fetchImpl } = {}) {
  const source = fs.readFileSync(path.join(__dirname, "..", "brevo.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });

  const captured = { sentry: [], logs: [] };
  const record =
    (bucket) =>
    (...args) =>
      bucket.push(args);
  const stubs = {
    fs: { writeFileSync: jest.fn() },
    "node-fetch": fetchImpl,
    "./config": {
      config: { ENABLE_SENDINBLUE: true, SENDINBLUEKEY: sendinblueKey, MAIL_TRANSPORT: "BREVO", ENVIRONMENT: environment, SMTP_HOST: null, SMTP_PORT: null },
    },
    "./logger": { logger: { debug: record(captured.logs), warn: record(captured.logs), info: record(captured.logs), error: record(captured.logs) } },
    "./sentry": {
      capture: (error, context) => captured.sentry.push([error && error.message, context]),
      captureMessage: (message, context) => captured.sentry.push([message, context]),
    },
    "./mailcatcher": { sendMailCatcher: jest.fn() },
  };

  const module = { exports: {} };
  const requireStub = (id) => {
    if (!(id in stubs)) throw new Error(`dépendance non bouchonnée dans le test : ${id}`);
    return stubs[id];
  };
  // eslint-disable-next-line no-new-func
  new Function("exports", "require", "module", "__filename", "__dirname", outputText)(module.exports, requireStub, module, "brevo.js", __dirname);

  return { brevo: module.exports, captured };
}

const brevoError = () =>
  jest.fn(async () => ({
    headers: { raw: () => ({ "content-type": ["application/json"] }) },
    json: async () => ({ code: "unauthorized", message: "Key not found" }),
  }));

const networkError = () =>
  jest.fn(async () => {
    throw new Error("connect ECONNRESET");
  });

const dump = (captured) => JSON.stringify(captured);

describe("brevo — pas de contenu d'email dans Sentry ni dans les logs (H80)", () => {
  it("n'envoie pas le lien de réinitialisation à Sentry quand Brevo répond une erreur", async () => {
    const { brevo, captured } = loadBrevo({ fetchImpl: brevoError() });
    await brevo.sendEmail([{ email: "agent@snu.gouv.fr" }], "Réinitialiser votre mot de passe", HTML);

    expect(captured.sentry).toHaveLength(1);
    expect(captured.sentry[0][0]).toBe("Error sending an email");
    expect(dump(captured)).not.toContain(TOKEN);
    expect(dump(captured)).not.toContain("auth/reset");
    // le diagnostic utile reste présent
    expect(captured.sentry[0][1].extra).toMatchObject({ brevoCode: "unauthorized", recipientCount: 1 });
  });

  it("n'envoie pas le corps de la requête à Sentry quand l'appel réseau à Brevo échoue", async () => {
    const { brevo, captured } = loadBrevo({ fetchImpl: networkError() });
    await brevo.sendEmail([{ email: "agent@snu.gouv.fr" }], "Réinitialiser votre mot de passe", HTML);

    expect(dump(captured)).not.toContain(TOKEN);
    expect(captured.sentry.map(([message]) => message)).toContain("connect ECONNRESET");
    expect(captured.sentry[0][1].extra).toEqual({ path: "/smtp/email", method: "POST" });
  });

  it("n'écrit pas le contenu de l'email dans les logs d'un environnement déployé", async () => {
    const { brevo, captured } = loadBrevo({ environment: "staging", fetchImpl: brevoError() });
    await brevo.sendEmail([{ email: "agent@snu.gouv.fr" }], "Réinitialiser votre mot de passe", HTML);

    expect(JSON.stringify(captured.logs)).not.toContain(TOKEN);
  });

  it("garde le contenu complet dans les logs en développement local", async () => {
    const { brevo, captured } = loadBrevo({ environment: "development", fetchImpl: brevoError() });
    await brevo.sendEmail([{ email: "agent@snu.gouv.fr" }], "Réinitialiser votre mot de passe", HTML);

    expect(JSON.stringify(captured.logs)).toContain(TOKEN);
  });

  it("n'écrit pas le corps de la requête dans les logs quand la clé Brevo est absente", async () => {
    const { brevo, captured } = loadBrevo({ sendinblueKey: undefined, fetchImpl: brevoError() });
    await brevo.sendEmail([{ email: "agent@snu.gouv.fr" }], "Réinitialiser votre mot de passe", HTML);

    expect(dump(captured)).not.toContain(TOKEN);
  });

  it("n'envoie pas les paramètres d'un template à Sentry quand l'envoi échoue", async () => {
    const { brevo, captured } = loadBrevo({ fetchImpl: brevoError() });
    await brevo.sendTemplate("42", { emailTo: [{ email: "parent@example.org" }], params: { lien: RESET_LINK, prenom: "Camille" } });

    expect(captured.sentry[0][0]).toBe("Error sending a template");
    expect(dump(captured)).not.toContain(TOKEN);
    expect(dump(captured)).not.toContain("Camille");
    expect(captured.sentry[0][1].extra).toMatchObject({ templateId: 42, brevoCode: "unauthorized" });
  });
});
