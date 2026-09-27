import request from "supertest";
import { ROLES, SENDINBLUE_TEMPLATES } from "snu-lib";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose, clearDatabase } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import { createReferentHelper } from "./helpers/referent";
import { createYoungHelper } from "./helpers/young";
import { ReferentModel, YoungModel } from "../models";
import { config } from "../config";

const PASSWORD = "SuperSecret1234!";
const NEW_PASSWORD = "AutreSecret5678?";

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

async function createFlaggedYoung(overrides = {}) {
  const fixture = getNewYoungFixture();
  return await createYoungHelper({ ...fixture, email: (fixture.email as string).toLowerCase(), password: PASSWORD, passwordResetRequired: true, ...overrides } as any);
}

async function createFlaggedReferent(overrides = {}) {
  const fixture = getNewReferentFixture();
  return await createReferentHelper({ ...fixture, email: fixture.email!.toLowerCase(), password: PASSWORD, role: ROLES.ADMIN, passwordResetRequired: true, ...overrides } as any);
}

const sessionCookies = (res) => ((res.headers["set-cookie"] || []) as string[]).filter((c) => /^jwt_(young|ref)=[^;]/.test(c));
const resetEmails = () => mockSendTemplate.mock.calls.filter(([template]) => template === SENDINBLUE_TEMPLATES.FORGOT_PASSWORD);

describe("Réinitialisation de mot de passe imposée (empreintes exposées)", () => {
  describe.each([
    { label: "volontaire", path: "/young", model: YoungModel as any, create: createFlaggedYoung, url: () => config.APP_URL },
    { label: "référent", path: "/referent", model: ReferentModel as any, create: createFlaggedReferent, url: () => config.ADMIN_URL },
  ])("$label", ({ path, model, create, url }) => {
    it("refuse la session et envoie le lien de réinitialisation quand le mot de passe est bon", async () => {
      const user = await create();

      const res = await request(getAppHelper()).post(`${path}/signin`).send({ email: user.email, password: PASSWORD });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("PASSWORD_RESET_REQUIRED");
      expect(sessionCookies(res)).toEqual([]);

      const updated: any = await model.findById(user._id);
      expect(updated.forgotPasswordResetToken).toBeTruthy();
      expect(new Date(updated.forgotPasswordResetExpires).getTime()).toBeGreaterThan(Date.now());

      const emails = resetEmails();
      expect(emails).toHaveLength(1);
      expect(emails[0][1].emailTo[0].email).toBe(user.email);
      expect(emails[0][1].params.cta).toBe(`${url()}/auth/reset?token=${updated.forgotPasswordResetToken}`);
    });

    it("ne révèle rien et n'envoie rien quand le mot de passe est faux", async () => {
      const user = await create();

      const res = await request(getAppHelper()).post(`${path}/signin`).send({ email: user.email, password: "Mauvais1234!!" });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("EMAIL_OR_PASSWORD_INVALID");
      expect(resetEmails()).toHaveLength(0);
      const updated: any = await model.findById(user._id);
      expect(updated.forgotPasswordResetToken || "").toBe("");
    });

    it("n'envoie pas un second email si le lien vient d'être envoyé", async () => {
      const user = await create();

      await request(getAppHelper()).post(`${path}/signin`).send({ email: user.email, password: PASSWORD });
      const first: any = await model.findById(user._id);
      const res = await request(getAppHelper()).post(`${path}/signin`).send({ email: user.email, password: PASSWORD });

      expect(res.body.code).toBe("PASSWORD_RESET_REQUIRED");
      expect(resetEmails()).toHaveLength(1);
      const second: any = await model.findById(user._id);
      expect(second.forgotPasswordResetToken).toBe(first.forgotPasswordResetToken);
    });

    it("lève l'obligation une fois le mot de passe réinitialisé", async () => {
      const user = await create();
      await request(getAppHelper()).post(`${path}/signin`).send({ email: user.email, password: PASSWORD });
      const { forgotPasswordResetToken }: any = await model.findById(user._id);

      const reset = await request(getAppHelper()).post(`${path}/forgot_password_reset`).send({ token: forgotPasswordResetToken, password: NEW_PASSWORD });
      expect(reset.status).toBe(200);
      expect(((await model.findById(user._id)) as any).passwordResetRequired).toBe(false);

      const res = await request(getAppHelper()).post(`${path}/signin`).send({ email: user.email, password: NEW_PASSWORD });
      expect(res.status).toBe(200);
      expect(sessionCookies(res)).toHaveLength(1);
    });

    it("refuse aussi la session à l'étape 2FA (code émis avant la pose du drapeau)", async () => {
      (config as any).ENABLE_2FA = true;
      const user = await create({ passwordResetRequired: false });
      const first = await request(getAppHelper()).post(`${path}/signin`).send({ email: user.email, password: PASSWORD });
      expect(first.body.code).toBe("2FA_REQUIRED");
      await model.updateOne({ _id: user._id }, { $set: { passwordResetRequired: true } });
      const { token2FA }: any = await model.findById(user._id);

      const res = await request(getAppHelper()).post(`${path}/signin-2fa`).send({ email: user.email, token_2fa: String(token2FA), rememberMe: false });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("PASSWORD_RESET_REQUIRED");
      expect(sessionCookies(res)).toEqual([]);
    });
  });
});
