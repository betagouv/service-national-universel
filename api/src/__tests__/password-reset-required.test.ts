import request from "supertest";
import { fakerFR as faker } from "@faker-js/faker";
import { ROLES, SENDINBLUE_TEMPLATES, type YoungType } from "snu-lib";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose, clearDatabase } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import { createReferentHelper } from "./helpers/referent";
import { createYoungHelper } from "./helpers/young";
import { ReferentModel, YoungModel } from "../models";
import { config } from "../config";

const PASSWORD = "SuperSecret1234!";
// Généré à l'exécution : un littéral est signalé comme secret par GitGuardian.
const NEW_PASSWORD = faker.internet.password(16, false, /^[a-z]*$/, "AZ12/+");

const mockSendTemplate = jest.fn((..._args: any[]) => Promise.resolve());
jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
  sendTemplate: (...args: any[]) => mockSendTemplate(...args),
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

beforeEach(() => {
  (config as any).ENABLE_2FA = false;
  mockSendTemplate.mockClear();
});

afterEach(async () => {
  resetAppAuth();
  await clearDatabase();
});

jest.setTimeout(60000);

function createFlaggedYoung(overrides: Partial<YoungType> = {}) {
  return createYoungHelper(getNewYoungFixture({ password: PASSWORD, passwordResetRequired: true, ...overrides }));
}

function createFlaggedReferent(passwordResetRequired = true) {
  return createReferentHelper(getNewReferentFixture({ password: PASSWORD, role: ROLES.ADMIN, passwordResetRequired }));
}

const sessionCookies = (res) => ((res.headers["set-cookie"] || []) as string[]).filter((c) => /^jwt_(young|ref)=[^;]/.test(c));
const resetEmails = () => mockSendTemplate.mock.calls.filter(([template]) => template === SENDINBLUE_TEMPLATES.FORGOT_PASSWORD);

describe("Réinitialisation de mot de passe imposée (empreintes exposées)", () => {
  describe("référent", () => {
    it("refuse la session et envoie le lien de réinitialisation quand le mot de passe est bon", async () => {
      const user = await createFlaggedReferent();

      const res = await request(getAppHelper()).post("/referent/signin").send({ email: user.email, password: PASSWORD });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("PASSWORD_RESET_REQUIRED");
      expect(sessionCookies(res)).toEqual([]);

      const updated = await ReferentModel.findById(user._id);
      expect(updated?.forgotPasswordResetToken).toBeTruthy();
      expect(updated?.forgotPasswordResetExpires?.getTime()).toBeGreaterThan(Date.now());

      const emails = resetEmails();
      expect(emails).toHaveLength(1);
      expect(emails[0][1].emailTo[0].email).toBe(user.email);
      expect(emails[0][1].params.cta).toBe(`${config.ADMIN_URL}/auth/reset?token=${updated?.forgotPasswordResetToken}`);
    });

    it("ne révèle rien et n'envoie rien quand le mot de passe est faux", async () => {
      const user = await createFlaggedReferent();

      const res = await request(getAppHelper()).post("/referent/signin").send({ email: user.email, password: "Mauvais1234!!" });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("EMAIL_OR_PASSWORD_INVALID");
      expect(resetEmails()).toHaveLength(0);
      const updated = await ReferentModel.findById(user._id);
      expect(updated!.forgotPasswordResetToken || "").toBe("");
    });

    it("n'envoie pas un second email si le lien vient d'être envoyé", async () => {
      const user = await createFlaggedReferent();
      const app = getAppHelper();

      const first = await request(app).post("/referent/signin").send({ email: user.email, password: PASSWORD });
      expect(first.body.code).toBe("PASSWORD_RESET_REQUIRED");
      const before = await ReferentModel.findById(user._id);
      const res = await request(app).post("/referent/signin").send({ email: user.email, password: PASSWORD });

      expect(res.body.code).toBe("PASSWORD_RESET_REQUIRED");
      expect(resetEmails()).toHaveLength(1);
      const after = await ReferentModel.findById(user._id);
      expect(after!.forgotPasswordResetToken).toBe(before!.forgotPasswordResetToken);
    });

    it("lève l'obligation une fois le mot de passe réinitialisé", async () => {
      const user = await createFlaggedReferent();
      const app = getAppHelper();
      const first = await request(app).post("/referent/signin").send({ email: user.email, password: PASSWORD });
      expect(first.body.code).toBe("PASSWORD_RESET_REQUIRED");
      const updated = await ReferentModel.findById(user._id);

      const reset = await request(app).post("/referent/forgot_password_reset").send({ token: updated!.forgotPasswordResetToken, password: NEW_PASSWORD });
      expect(reset.status).toBe(200);
      expect((await ReferentModel.findById(user._id))?.passwordResetRequired).toBe(false);

      const res = await request(app).post("/referent/signin").send({ email: user.email, password: NEW_PASSWORD });
      expect(res.status).toBe(200);
      expect(sessionCookies(res)).toHaveLength(1);
    });

    it("refuse aussi la session à l'étape 2FA (code émis avant la pose du drapeau)", async () => {
      (config as any).ENABLE_2FA = true;
      const user = await createFlaggedReferent(false);
      const app = getAppHelper();
      const first = await request(app).post("/referent/signin").send({ email: user.email, password: PASSWORD });
      expect(first.body.code).toBe("2FA_REQUIRED");
      await ReferentModel.updateOne({ _id: user._id }, { $set: { passwordResetRequired: true } });
      const updated = await ReferentModel.findById(user._id);

      const res = await request(app).post("/referent/signin-2fa").send({ email: user.email, token_2fa: updated!.token2FA, rememberMe: false });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("PASSWORD_RESET_REQUIRED");
      expect(sessionCookies(res)).toEqual([]);
    });
  });

  describe("volontaire (accès fermé)", () => {
    it.each([
      ["correct", PASSWORD],
      ["incorrect", "Mauvais1234!!"],
    ])("refuse un mot de passe %s sans révéler l'obligation de réinitialisation", async (_label, password) => {
      (config as any).ENABLE_2FA = true;
      const user = await createFlaggedYoung();

      const res = await request(getAppHelper()).post("/young/signin").send({ email: user.email, password });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("EMAIL_OR_PASSWORD_INVALID");
      expect(sessionCookies(res)).toEqual([]);
      expect(mockSendTemplate).not.toHaveBeenCalled();
      const updated = await YoungModel.findById(user._id);
      expect(updated!.forgotPasswordResetToken || "").toBe("");
      expect(updated!.token2FA || "").toBe("");
    });

    it("refuse un lien de réinitialisation encore valide sans modifier le mot de passe", async () => {
      const token = faker.string.uuid();
      const user = await createFlaggedYoung({ forgotPasswordResetToken: token, forgotPasswordResetExpires: new Date(Date.now() + 60_000) });
      const before = await YoungModel.findById(user._id).select("+password");

      const res = await request(getAppHelper()).post("/young/forgot_password_reset").send({ token, password: NEW_PASSWORD });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("PASSWORD_TOKEN_EXPIRED_OR_INVALID");
      expect(sessionCookies(res)).toEqual([]);
      const updated = await YoungModel.findById(user._id).select("+password");
      expect(updated!.forgotPasswordResetToken).toBe(token);
      expect(updated!.passwordResetRequired).toBe(true);
      expect(before!.password).toBeTruthy();
      expect(updated!.password).toBe(before!.password);
    });

    it("refuse un code 2FA encore valide sans le consommer ni envoyer de lien", async () => {
      (config as any).ENABLE_2FA = true;
      const token = "123456";
      const user = await createFlaggedYoung({ token2FA: token, token2FAExpires: new Date(Date.now() + 60_000) });

      const res = await request(getAppHelper()).post("/young/signin-2fa").send({ email: user.email, token_2fa: token, rememberMe: false });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("EMAIL_OR_PASSWORD_INVALID");
      expect(sessionCookies(res)).toEqual([]);
      expect(mockSendTemplate).not.toHaveBeenCalled();
      const updated = await YoungModel.findById(user._id);
      expect(updated!.token2FA).toBe(token);
      expect(updated!.attempts2FA).toBe(0);
    });
  });
});
