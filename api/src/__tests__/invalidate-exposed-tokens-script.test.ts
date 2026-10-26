import { Effect } from "effect";
import { ROLES, ReferentStatus, SENDINBLUE_TEMPLATES, YOUNG_STATUS, YOUNG_STATUS_PHASE3 } from "snu-lib";

import { program, parseArgs, mailDeliveryProblem, HASH_EXPOSURE_CLOSED_AT, TOKEN_EXPOSURE_CLOSED_AT } from "../scripts/invalidateExposedTokens.effect";
import { ReferentModel, YoungModel } from "../models";
import { config } from "../config";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import { dbConnect, dbClose, clearDatabase } from "./helpers/db";

// sendTemplate ne lève jamais : il renvoie la réponse de Brevo, ou undefined quand rien n'est parti.
const mockSendTemplate = jest.fn((..._args: any[]): Promise<any> => Promise.resolve({ messageId: "<id@brevo>" }));
jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
  sendTemplate: (...args: any[]) => mockSendTemplate(...args),
}));

const DAY = 86400000;
const NOW = new Date("2026-09-28T08:00:00Z");
const BEFORE_HASH_CUT = new Date(HASH_EXPOSURE_CLOSED_AT.getTime() - 30 * DAY);
const AFTER_HASH_CUT = new Date(HASH_EXPOSURE_CLOSED_AT.getTime() + DAY);
// Invitation émise avant la fermeture de la fuite, encore valable à NOW.
const EXPOSED_INVITATION_EXPIRES = new Date(TOKEN_EXPOSURE_CLOSED_AT.getTime() - DAY + 7 * DAY);

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(async () => {
  await dbClose();
});
beforeEach(() => mockSendTemplate.mockClear());
afterEach(async () => {
  await clearDatabase();
});

jest.setTimeout(60000);

const run = (steps: Parameters<typeof program>[0]["steps"], apply = true) => Effect.runPromise(program({ steps, apply, now: NOW }));
const raw = (model: any, id) => model.collection.findOne({ _id: id });

async function createYoung(fields: Record<string, any> = {}) {
  const fixture = getNewYoungFixture();
  const young = await YoungModel.create({ ...fixture, email: (fixture.email as string).toLowerCase(), password: "SuperSecret1234!" });
  await YoungModel.collection.updateOne({ _id: young._id }, { $set: { createdAt: BEFORE_HASH_CUT, passwordChangedAt: null, ...fields } });
  return young;
}

async function createReferent(fields: Record<string, any> = {}) {
  const fixture = getNewReferentFixture();
  const referent = await ReferentModel.create({ ...fixture, email: fixture.email!.toLowerCase(), password: "SuperSecret1234!", role: ROLES.REFERENT_DEPARTMENT });
  await ReferentModel.collection.updateOne({ _id: referent._id }, { $set: { createdAt: BEFORE_HASH_CUT, passwordChangedAt: null, ...fields } });
  return referent;
}

describe("script invalidateExposedTokens", () => {
  describe("parseArgs", () => {
    it("lit par défaut toutes les étapes, sans rien écrire", () => {
      expect(parseArgs([])).toEqual({ apply: false, steps: ["invitations", "phase3", "passwords", "purge"] });
    });

    it("n'écrit qu'avec --apply et accepte une sélection d'étapes", () => {
      expect(parseArgs(["--apply", "--step", "passwords", "--step", "purge"])).toEqual({ apply: true, steps: ["passwords", "purge"] });
    });

    it("refuse une étape inconnue", () => {
      expect(() => parseArgs(["--step", "tout"])).toThrow(/tout/);
    });
  });

  describe("mailDeliveryProblem", () => {
    it("bloque les étapes qui envoient des emails si Brevo n'enverra rien", () => {
      const ok = { MAIL_TRANSPORT: "BREVO", ENABLE_SENDINBLUE: true, SENDINBLUEKEY: "cle", APP_URL: "https://moncompte.snu.gouv.fr", ADMIN_URL: "https://admin.snu.gouv.fr" };
      expect(mailDeliveryProblem(ok, ["invitations"])).toBeNull();
      expect(mailDeliveryProblem({ ...ok, ENABLE_SENDINBLUE: false }, ["invitations"])).toMatch(/ENABLE_SENDINBLUE/);
      expect(mailDeliveryProblem({ ...ok, MAIL_TRANSPORT: "SMTP" }, ["invitations"])).toMatch(/MAIL_TRANSPORT/);
      expect(mailDeliveryProblem({ ...ok, SENDINBLUEKEY: "" }, ["invitations"])).toMatch(/SENDINBLUEKEY/);
      expect(mailDeliveryProblem({ ...ok, ADMIN_URL: "http://localhost:8082" }, ["invitations"])).toMatch(/ADMIN_URL/);
      expect(mailDeliveryProblem({ ...ok, APP_URL: undefined }, ["invitations"])).toMatch(/APP_URL/);
      expect(mailDeliveryProblem({ ...ok, ENABLE_SENDINBLUE: false }, ["phase3", "passwords", "purge"])).toBeNull();
    });
  });

  describe("passwords", () => {
    it("impose la réinitialisation et coupe les sessions des comptes dont l'empreinte a été exposée", async () => {
      const young = await createYoung({ passwordChangedAt: BEFORE_HASH_CUT });
      const referent = await createReferent();

      const report = await run(["passwords"]);

      expect(report.passwords).toEqual({ young: 1, referent: 1 });
      for (const [model, id] of [
        [YoungModel, young._id],
        [ReferentModel, referent._id],
      ]) {
        const doc = await raw(model, id);
        expect(doc.passwordResetRequired).toBe(true);
        expect(doc.passwordChangedAt).toEqual(NOW);
      }
    });

    it("épargne les empreintes qui n'ont pas pu fuiter, les comptes sans mot de passe et les comptes supprimés", async () => {
      const changedAfter = await createYoung({ passwordChangedAt: AFTER_HASH_CUT });
      const createdAfter = await createYoung({ createdAt: AFTER_HASH_CUT });
      const noPassword = await createReferent({ password: "" });
      const deleted = await createYoung({ status: YOUNG_STATUS.DELETED });
      const anonymized = await createYoung({ anonymized: true });

      const report = await run(["passwords"]);

      expect(report.passwords).toEqual({ young: 0, referent: 0 });
      for (const [model, doc] of [
        [YoungModel, changedAfter],
        [YoungModel, createdAfter],
        [ReferentModel, noPassword],
        [YoungModel, deleted],
        [YoungModel, anonymized],
      ] as const) {
        expect((await raw(model, doc._id)).passwordResetRequired).not.toBe(true);
      }
    });

    it("compte sans écrire en dry-run, et ne recoupe pas les sessions à la seconde exécution", async () => {
      const young = await createYoung();

      expect((await run(["passwords"], false)).passwords).toEqual({ young: 1, referent: 0 });
      expect((await raw(YoungModel, young._id)).passwordResetRequired).not.toBe(true);

      await run(["passwords"]);
      expect((await run(["passwords"])).passwords).toEqual({ young: 0, referent: 0 });
    });
  });

  describe("invitations", () => {
    it("réémet et renvoie les invitations en cours émises pendant l'exposition", async () => {
      const referent = await createReferent({ password: "", invitationToken: "ancien-ref", invitationExpires: EXPOSED_INVITATION_EXPIRES });
      const young = await createYoung({ password: "", invitationToken: "ancien-young", invitationExpires: EXPOSED_INVITATION_EXPIRES });

      const report = await run(["invitations"]);

      expect(report.invitations).toMatchObject({ reissued: 2, expired: 0, failed: [] });
      const ref = await raw(ReferentModel, referent._id);
      const yg = await raw(YoungModel, young._id);
      for (const doc of [ref, yg]) {
        expect(doc.invitationToken).toMatch(/^[0-9a-f]{40}$/);
        expect(doc.invitationExpires.getTime()).toBe(NOW.getTime() + 7 * DAY);
      }
      expect(mockSendTemplate).toHaveBeenCalledWith(
        SENDINBLUE_TEMPLATES.invitationReferent[ROLES.REFERENT_DEPARTMENT],
        expect.objectContaining({
          emailTo: [expect.objectContaining({ email: referent.email })],
          params: expect.objectContaining({ cta: `${config.ADMIN_URL}/auth/signup/invite?token=${ref.invitationToken}` }),
        }),
      );
      expect(mockSendTemplate).toHaveBeenCalledWith(
        SENDINBLUE_TEMPLATES.INVITATION_YOUNG,
        expect.objectContaining({
          emailTo: [expect.objectContaining({ email: young.email })],
          params: expect.objectContaining({ cta: expect.stringContaining(`${config.APP_URL}/auth/signup/invite?token=${yg.invitationToken}`) }),
        }),
      );
    });

    it("signale les emails non partis, le jeton restant réémis", async () => {
      const referent = await createReferent({ invitationToken: "ancien", invitationExpires: EXPOSED_INVITATION_EXPIRES });
      mockSendTemplate.mockResolvedValueOnce(undefined);

      const report = await run(["invitations"]);

      expect(report.invitations).toMatchObject({ reissued: 1, failed: [`referent:${referent._id}`] });
      expect((await raw(ReferentModel, referent._id)).invitationToken).not.toBe("ancien");
    });

    it("fait expirer sans renvoi l'invitation d'un compte désactivé", async () => {
      const referent = await createReferent({ status: ReferentStatus.INACTIVE, invitationToken: "ancien", invitationExpires: EXPOSED_INVITATION_EXPIRES });

      const report = await run(["invitations"]);

      expect(report.invitations).toMatchObject({ reissued: 0, expired: 1 });
      const doc = await raw(ReferentModel, referent._id);
      expect(doc.invitationToken).toBe("ancien");
      expect(doc.invitationExpires).toEqual(NOW);
      expect(mockSendTemplate).not.toHaveBeenCalled();
    });

    it("laisse les invitations émises après la fermeture de la fuite, et les invitations déjà expirées", async () => {
      const recent = await createReferent({ invitationToken: "recent", invitationExpires: new Date(NOW.getTime() + 7 * DAY - 3600000) });
      const expired = await createReferent({ invitationToken: "expire", invitationExpires: new Date(NOW.getTime() - DAY) });

      const report = await run(["invitations"]);

      expect(report.invitations).toMatchObject({ reissued: 0, expired: 0 });
      expect((await raw(ReferentModel, recent._id)).invitationToken).toBe("recent");
      expect((await raw(ReferentModel, expired._id)).invitationToken).toBe("expire");
    });

    it("n'écrit ni n'envoie rien en dry-run", async () => {
      const referent = await createReferent({ invitationToken: "ancien", invitationExpires: EXPOSED_INVITATION_EXPIRES });

      const report = await run(["invitations"], false);

      expect(report.invitations).toMatchObject({ reissued: 1 });
      expect((await raw(ReferentModel, referent._id)).invitationToken).toBe("ancien");
      expect(mockSendTemplate).not.toHaveBeenCalled();
    });
  });

  describe("phase3", () => {
    // La phase 3 n'existe plus : aucun tuteur n'est relancé, tous les liens deviennent inutilisables.
    it("efface tous les jetons tuteur, validation en attente comprise, sans email ni changement de statut", async () => {
      const waiting = await createYoung({
        phase3Token: "ancien",
        statusPhase3: YOUNG_STATUS_PHASE3.WAITING_VALIDATION,
        phase3TutorEmail: "tuteur@example.org",
      });
      const validated = await createYoung({ phase3Token: "residuel", statusPhase3: YOUNG_STATUS_PHASE3.VALIDATED });

      const report = await run(["phase3"]);

      expect(report.phase3).toEqual({ cleared: 2 });
      const doc = await raw(YoungModel, waiting._id);
      expect(doc.phase3Token).toBe("");
      expect(doc.statusPhase3).toBe(YOUNG_STATUS_PHASE3.WAITING_VALIDATION);
      expect((await raw(YoungModel, validated._id)).phase3Token).toBe("");
      expect(mockSendTemplate).not.toHaveBeenCalled();
    });

    it("compte sans effacer en dry-run", async () => {
      const young = await createYoung({ phase3Token: "ancien", statusPhase3: YOUNG_STATUS_PHASE3.WAITING_VALIDATION });

      expect((await run(["phase3"], false)).phase3).toEqual({ cleared: 1 });
      expect((await raw(YoungModel, young._id)).phase3Token).toBe("ancien");
    });
  });

  describe("purge", () => {
    it("efface les jetons expirés et les jetons des représentants légaux, garde un lien de réinitialisation valable", async () => {
      const past = new Date(NOW.getTime() - 3600000);
      const future = new Date(NOW.getTime() + 3600000);
      const young = await createYoung({
        token2FA: "123456",
        token2FAExpires: past,
        tokenEmailValidation: "654321",
        tokenEmailValidationExpires: past,
        forgotPasswordResetToken: "valable",
        forgotPasswordResetExpires: future,
        parent1Inscription2023Token: "p1",
        parent2Inscription2023Token: "p2",
      });
      const referent = await createReferent({ token2FA: "111111", token2FAExpires: past, forgotPasswordResetToken: "expire", forgotPasswordResetExpires: past });

      const report = await run(["purge"]);

      expect(report.purge).toEqual({ young: 1, referent: 1 });
      const yg = await raw(YoungModel, young._id);
      expect(yg.token2FA).toBeNull();
      expect(yg.tokenEmailValidation).toBeNull();
      expect(yg.forgotPasswordResetToken).toBe("valable");
      expect(yg.parent1Inscription2023Token).toBeUndefined();
      expect(yg.parent2Inscription2023Token).toBeUndefined();
      const ref = await raw(ReferentModel, referent._id);
      expect(ref.token2FA).toBeNull();
      expect(ref.forgotPasswordResetToken).toBe("");
    });
  });
});
