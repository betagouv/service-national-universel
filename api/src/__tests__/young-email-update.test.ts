/**
 * GOO-170 (V08a) : changement d'email d'un volontaire.
 *   - le code de confirmation part à la nouvelle adresse, jamais à l'adresse actuelle ;
 *   - le mot de passe demandé par POST /young/email est compté et verrouillé ;
 *   - les codes de connexion et de validation initiale n'ouvrent plus de session jeune ;
 *   - la validation du nouvel email garde une réponse 400 uniforme pour les codes invalides.
 */
import request from "supertest";
import mongoose from "mongoose";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose, clearDatabase } from "./helpers/db";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";
import { YoungDocument, YoungModel } from "../models";
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
  it("n'envoie pas le code à l'adresse actuelle quand il est redemandé après POST /young/email", async () => {
    const young = await createYoung({ emailVerified: "true" });
    const app = getAppHelper(young as any, "young");

    const first = await request(app).post("/young/email").send({ email: NEW_EMAIL, password: PASSWORD });
    expect(first.status).toBe(200);
    expect(recipients()).toEqual([NEW_EMAIL]);
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

    const responses = await Promise.all(Array.from({ length: 10 }, () => request(app).post("/young/email-validation/new-email").send({ token_email_validation: "000000" })));

    responses.forEach((res) => expect(res.status).toBe(400));
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
    expect(after!.loginAttempts).toBe(MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 1);

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

  it("le 6e essai avec le bon mot de passe aboutit", async () => {
    const young = await createYoung({ loginAttempts: MAX_LOGIN_ATTEMPTS_BEFORE_DELAY, nextLoginAttemptIn: new Date() });
    const res = await requestChange(getAppHelper(young as any, "young"), PASSWORD);

    expect(res.status).toBe(200);
    expect((await YoungModel.findById(young._id))!.loginAttempts).toBe(0);
  });

  it("un compte verrouillé répond TOO_MANY_REQUESTS, même si la nouvelle adresse est déjà prise", async () => {
    await createYoung({ email: NEW_EMAIL });
    const young = await createYoung({ loginAttempts: 12, nextLoginAttemptIn: new Date(Date.now() + 30 * 60 * 1000) });
    const res = await requestChange(getAppHelper(young as any, "young"), PASSWORD);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("TOO_MANY_REQUESTS");
  });

  it("des essais simultanés ne produisent aucune erreur serveur et le compteur reste borné", async () => {
    const young = await createYoung();
    const app = getAppHelper(young as any, "young");

    const responses = await Promise.all(Array.from({ length: 10 }, () => requestChange(app, WRONG_PASSWORD)));

    responses.forEach((res) => expect(res.status).toBe(400));
    expect((await YoungModel.findById(young._id))!.loginAttempts).toBe(MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 1);
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

describe("validation des codes", () => {
  const invalidToken = { status: 400, code: "PASSWORD_TOKEN_EXPIRED_OR_INVALID" };
  const accessClosed = { status: 401, code: "EMAIL_OR_PASSWORD_INVALID" };
  const countPatches = () => mongoose.connection.db!.collection("young_patches").countDocuments();

  function expectRefused(res: request.Response, expected: { status: number; code: string }) {
    expect(res.status).toBe(expected.status);
    expect(res.body).toEqual({ ok: false, code: expected.code });
    expect(res.headers["set-cookie"]).toBeUndefined();
  }

  it("POST /young/signin-2fa refuse uniformément sans consommer d'essai, même avec un code valide", async () => {
    (config as any).ENABLE_2FA = true;
    const expired = await createYoung({ token2FA: "123456", attempts2FA: 0, token2FAExpires: oneHourAgo() });
    const capped = await createYoung({ token2FA: "123456", attempts2FA: MAX_2FA_ATTEMPTS, token2FAExpires: inOneHour() });
    const active = await createYoung({ token2FA: "123456", attempts2FA: 0, token2FAExpires: inOneHour() });
    const app = getAppHelper();
    const attempt = (email: string, token_2fa = "000000") => request(app).post("/young/signin-2fa").send({ email, token_2fa, rememberMe: true });
    const patchesBefore = await countPatches();

    for (const email of ["inconnu@example.com", expired.email, capped.email]) {
      expectRefused(await attempt(email), accessClosed);
    }
    expectRefused(await attempt(active.email), accessClosed);
    expectRefused(await attempt(active.email, "123456"), accessClosed);
    const after = await YoungModel.findById(active._id);
    expect(after!.token2FA).toBe(active.token2FA);
    expect(after!.attempts2FA).toBe(active.attempts2FA);
    expect(await countPatches()).toBe(patchesBefore);
  });

  it("POST /young/email-validation ne valide pas le compte, même avec un code encore valide", async () => {
    const base = { emailVerified: "false", tokenEmailValidation: "123456" };
    const expired = await createYoung({ ...base, attemptsEmailValidation: 0, tokenEmailValidationExpires: oneHourAgo() });
    const capped = await createYoung({ ...base, attemptsEmailValidation: MAX_EMAIL_VALIDATION_ATTEMPTS, tokenEmailValidationExpires: inOneHour() });
    const active = await createYoung({ ...base, attemptsEmailValidation: 0, tokenEmailValidationExpires: inOneHour() });
    const unknown = new YoungModel({ ...getNewYoungFixture(), emailVerified: "false" });
    const attempt = (user: YoungDocument, token_email_validation = "000000") => request(getAppHelper(user, "young")).post("/young/email-validation").send({ token_email_validation });
    const patchesBefore = await countPatches();

    for (const user of [unknown, expired, capped]) {
      expectRefused(await attempt(user), invalidToken);
    }
    expectRefused(await attempt(active), accessClosed);
    expectRefused(await attempt(active, "123456"), accessClosed);
    const after = await YoungModel.findById(active._id);
    expect(after!.emailVerified).toBe("false");
    expect(after!.tokenEmailValidation).toBe("123456");
    expect(await countPatches()).toBe(patchesBefore);
  });

  it("POST /young/email-validation/new-email répond 400 pour un code expiré, un email inconnu, un plafond dépassé ou un mauvais code", async () => {
    const base = { newEmail: NEW_EMAIL, tokenEmailValidation: "123456" };
    const expired = await createYoung({ ...base, attemptsEmailValidation: 0, tokenEmailValidationExpires: oneHourAgo() });
    const capped = await createYoung({ ...base, email: "plafond@example.com", attemptsEmailValidation: MAX_EMAIL_VALIDATION_ATTEMPTS, tokenEmailValidationExpires: inOneHour() });
    const active = await createYoung({ ...base, email: "actif@example.com", attemptsEmailValidation: 0, tokenEmailValidationExpires: inOneHour() });
    const unknown = new YoungModel({ ...getNewYoungFixture(), newEmail: NEW_EMAIL });
    const attempt = (user: YoungDocument) =>
      request(getAppHelper(user, "young"))
        .post("/young/email-validation/new-email")
        .send({ token_email_validation: "000000" });

    const patchesBefore = await countPatches();
    for (const user of [unknown, expired, capped, active]) {
      expectRefused(await attempt(user), invalidToken);
    }
    expect(await countPatches()).toBe(patchesBefore);
  });
});
