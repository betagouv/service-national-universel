/**
 * GOO-170 (V08a) : changement d'email d'un volontaire.
 *   - le code de confirmation part à la nouvelle adresse, jamais à l'adresse actuelle ;
 *   - le mot de passe demandé par POST /young/email est compté et verrouillé ;
 *   - signin-2fa, validation d'email et validation du nouvel email répondent 400 de façon identique.
 */
import request from "supertest";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose, clearDatabase } from "./helpers/db";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";
import { YoungModel } from "../models";
import { config } from "../config";
import { SENDINBLUE_TEMPLATES } from "snu-lib";
import { sendTemplate } from "../brevo";
import { MAX_EMAIL_VALIDATION_ATTEMPTS, MAX_2FA_ATTEMPTS, MAX_LOGIN_ATTEMPTS_BEFORE_DELAY } from "../services/auth/attemptCounters";

const PASSWORD = "SuperSecret1234!";
const WRONG_PASSWORD = "WrongSecret1234!";
const NEW_EMAIL = "nouvelle.adresse@example.com";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
  sendTemplate: jest.fn(() => Promise.resolve()),
  syncContact: () => Promise.resolve(),
  createContact: () => Promise.resolve(),
  updateContact: () => Promise.resolve(),
}));

let previous2FA;

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  previous2FA = config.ENABLE_2FA;
});

afterAll(async () => {
  (config as any).ENABLE_2FA = previous2FA;
  await dbClose();
});

afterEach(async () => {
  resetAppAuth();
  await clearDatabase();
  (sendTemplate as jest.Mock).mockClear();
});

jest.setTimeout(120000);

const inOneHour = () => new Date(Date.now() + 60 * 60 * 1000);
const oneHourAgo = () => new Date(Date.now() - 60 * 60 * 1000);

async function createYoung(fields: Record<string, any> = {}) {
  return createYoungHelper({ ...getNewYoungFixture(), password: PASSWORD, ...fields } as any);
}

const recipients = () => (sendTemplate as jest.Mock).mock.calls.flatMap(([, options]) => options.emailTo.map((to) => to.email));

describe("changement d'email : le code part à la nouvelle adresse", () => {
  it("n'envoie rien à l'adresse actuelle quand le code est redemandé après POST /young/email", async () => {
    const young = await createYoung({ emailVerified: "true" });
    const app = getAppHelper(young as any, "young");

    const first = await request(app).post("/young/email").send({ email: NEW_EMAIL, password: PASSWORD });
    expect(first.status).toBe(200);
    (sendTemplate as jest.Mock).mockClear();

    const res = await request(app).get("/young/email-validation/token");

    expect(res.status).toBe(200);
    expect(recipients()).toEqual([NEW_EMAIL]);
    expect(recipients()).not.toContain(young.email);
    expect((sendTemplate as jest.Mock).mock.calls[0][0]).toBe(SENDINBLUE_TEMPLATES.PROFILE_EMAIL_VALIDATION);
  });

  it("le code redemandé valide bien le changement, et seulement lui", async () => {
    const young = await createYoung({ emailVerified: "true" });
    const app = getAppHelper(young as any, "young");
    await request(app).post("/young/email").send({ email: NEW_EMAIL, password: PASSWORD });
    await request(app).get("/young/email-validation/token");

    const stored = await YoungModel.findById(young._id);
    const res = await request(app).post("/young/email-validation/new-email").send({ token_email_validation: String(stored!.tokenEmailValidation) });

    expect(res.status).toBe(200);
    const after = await YoungModel.findById(young._id);
    expect(after!.email).toBe(NEW_EMAIL);
    expect(after!.newEmail).toBeFalsy();
  });

  it("continue d'envoyer le code de validation à l'adresse du compte pour un email non validé", async () => {
    const young = await createYoung({ emailVerified: "false", newEmail: null });
    const app = getAppHelper(young as any, "young");

    const res = await request(app).get("/young/email-validation/token");

    expect(res.status).toBe(200);
    expect(recipients()).toEqual([young.email]);
    expect((sendTemplate as jest.Mock).mock.calls[0][0]).toBe(SENDINBLUE_TEMPLATES.SIGNUP_EMAIL_VALIDATION);
  });

  it("le plafond de 3 essais du code tient sous rafale pour le changement d'email", async () => {
    const young = await createYoung({
      emailVerified: "true",
      newEmail: NEW_EMAIL,
      tokenEmailValidation: "123456",
      attemptsEmailValidation: 0,
      tokenEmailValidationExpires: inOneHour(),
    });
    const app = getAppHelper(young as any, "young");

    await Promise.all(Array.from({ length: 10 }, () => request(app).post("/young/email-validation/new-email").send({ token_email_validation: "000000" })));

    const after = await YoungModel.findById(young._id);
    expect(after!.attemptsEmailValidation).toBe(MAX_EMAIL_VALIDATION_ATTEMPTS);
    expect(after!.email).toBe(young.email);
  });
});

describe("POST /young/email : le mot de passe est compté", () => {
  const requestChange = (app, password: string) => request(app).post("/young/email").send({ email: NEW_EMAIL, password });

  it("compte les échecs par compte et verrouille au-delà du plafond, même avec le bon mot de passe", async () => {
    const young = await createYoung();
    const app = getAppHelper(young as any, "young");

    for (let i = 0; i < MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 1; i++) await requestChange(app, WRONG_PASSWORD);

    const after = await YoungModel.findById(young._id);
    expect(after!.loginAttempts).toBeGreaterThan(1);

    const locked = await requestChange(app, PASSWORD);
    expect(locked.status).toBe(400);
    expect(locked.body.code).toBe("TOO_MANY_REQUESTS");
    expect(recipients()).toEqual([]);
    expect((await YoungModel.findById(young._id))!.newEmail).toBeFalsy();
  });

  it("un mauvais mot de passe sous le plafond répond comme avant", async () => {
    const young = await createYoung();
    const res = await requestChange(getAppHelper(young as any, "young"), WRONG_PASSWORD);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("PASSWORD_INVALID");
    expect((await YoungModel.findById(young._id))!.loginAttempts).toBe(1);
  });

  it("remet le compteur à zéro après un mot de passe juste", async () => {
    const young = await createYoung({ loginAttempts: 3, nextLoginAttemptIn: new Date() });
    const res = await requestChange(getAppHelper(young as any, "young"), PASSWORD);

    expect(res.status).toBe(200);
    expect((await YoungModel.findById(young._id))!.loginAttempts).toBe(0);
  });

  it("un compte verrouillé ne voit pas son verrou prolongé", async () => {
    const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    const young = await createYoung({ loginAttempts: 12, nextLoginAttemptIn: lockedUntil });
    const res = await requestChange(getAppHelper(young as any, "young"), WRONG_PASSWORD);

    expect(res.body.code).toBe("TOO_MANY_REQUESTS");
    const after = await YoungModel.findById(young._id);
    expect(after!.loginAttempts).toBe(12);
    expect(after!.nextLoginAttemptIn!.getTime()).toBe(lockedUntil.getTime());
  });
});

describe("réponse 400 identique pour un code expiré, un email inconnu et un plafond dépassé", () => {
  const outcome = (res: request.Response) => ({ status: res.status, body: res.body });

  async function expectUniform(cases: Array<() => Promise<request.Response>>) {
    const outcomes: Array<{ status: number; body: any }> = [];
    for (const run of cases) outcomes.push(outcome(await run()));
    for (const result of outcomes) {
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ ok: false, code: "PASSWORD_TOKEN_EXPIRED_OR_INVALID" });
    }
  }

  it("POST /young/signin-2fa", async () => {
    (config as any).ENABLE_2FA = true;
    const expired = await createYoung({ token2FA: "123456", attempts2FA: 0, token2FAExpires: oneHourAgo() });
    const capped = await createYoung({ token2FA: "123456", attempts2FA: MAX_2FA_ATTEMPTS, token2FAExpires: inOneHour() });
    const active = await createYoung({ token2FA: "123456", attempts2FA: 0, token2FAExpires: inOneHour() });
    const app = getAppHelper();
    const attempt = (email: string) => request(app).post("/young/signin-2fa").send({ email, token_2fa: "000000", rememberMe: false });

    await expectUniform([() => attempt("inconnu@example.com"), () => attempt(expired.email), () => attempt(capped.email), () => attempt(active.email)]);
  });

  it("POST /young/email-validation", async () => {
    const base = { emailVerified: "false", tokenEmailValidation: "123456" };
    const expired = await createYoung({ ...base, attemptsEmailValidation: 0, tokenEmailValidationExpires: oneHourAgo() });
    const capped = await createYoung({ ...base, attemptsEmailValidation: MAX_EMAIL_VALIDATION_ATTEMPTS, tokenEmailValidationExpires: inOneHour() });
    const active = await createYoung({ ...base, attemptsEmailValidation: 0, tokenEmailValidationExpires: inOneHour() });
    const unknown = new YoungModel({ ...getNewYoungFixture(), emailVerified: "false" });
    const attempt = (user) => request(getAppHelper(user as any, "young")).post("/young/email-validation").send({ token_email_validation: "000000" });

    await expectUniform([() => attempt(unknown), () => attempt(expired), () => attempt(capped), () => attempt(active)]);
  });

  it("POST /young/email-validation/new-email", async () => {
    const base = { newEmail: NEW_EMAIL, tokenEmailValidation: "123456" };
    const expired = await createYoung({ ...base, attemptsEmailValidation: 0, tokenEmailValidationExpires: oneHourAgo() });
    const capped = await createYoung({ ...base, email: "plafond@example.com", attemptsEmailValidation: MAX_EMAIL_VALIDATION_ATTEMPTS, tokenEmailValidationExpires: inOneHour() });
    const active = await createYoung({ ...base, email: "actif@example.com", attemptsEmailValidation: 0, tokenEmailValidationExpires: inOneHour() });
    const unknown = new YoungModel({ ...getNewYoungFixture(), newEmail: NEW_EMAIL });
    const attempt = (user) => request(getAppHelper(user as any, "young")).post("/young/email-validation/new-email").send({ token_email_validation: "000000" });

    await expectUniform([() => attempt(unknown), () => attempt(expired), () => attempt(capped), () => attempt(active)]);
  });

  it("un code juste sous le plafond fonctionne toujours (validation d'email et 2FA)", async () => {
    (config as any).ENABLE_2FA = true;
    const young = await createYoung({ emailVerified: "false", tokenEmailValidation: "123456", attemptsEmailValidation: 1, tokenEmailValidationExpires: inOneHour() });
    const res = await request(getAppHelper(young as any, "young")).post("/young/email-validation").send({ token_email_validation: "123456" });
    expect(res.status).toBe(200);
    const after = await YoungModel.findById(young._id);
    expect(after!.emailVerified).toBe("true");
    expect(after!.attemptsEmailValidation).toBe(0);

    const young2fa = await createYoung({ token2FA: "654321", attempts2FA: 1, token2FAExpires: inOneHour() });
    const res2 = await request(getAppHelper()).post("/young/signin-2fa").send({ email: young2fa.email, token_2fa: "654321", rememberMe: false });
    expect(res2.status).toBe(200);
    expect((await YoungModel.findById(young2fa._id))!.attempts2FA).toBe(0);
  });
});
