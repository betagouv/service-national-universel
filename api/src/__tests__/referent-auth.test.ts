import request from "supertest";
import { ROLES, DECOMMISSIONED_ROLES, ERRORS as SNU_ERRORS, FeatureFlagName } from "snu-lib";
import getAppHelper, { resetAppAuth } from "./helpers/app";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewStructureFixture from "./fixtures/structure";
import { createReferentHelper, getReferentByIdHelper } from "./helpers/referent";
import { dbConnect, dbClose } from "./helpers/db";
import { FeatureFlagModel, ReferentModel, StructureModel } from "../models";
import { fakerFR as faker } from "@faker-js/faker";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const VALID_PASSWORD = faker.internet.password(16, false, /^[a-z]*$/, "AZ12/+");

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(async () => {
  await dbClose();
});
afterEach(() => {
  resetAppAuth();
});

describe("Referent", () => {
  let res;
  describe("POST /referent/signin", () => {
    it("should return 400 when no email, no password or wrong email", async () => {
      res = await request(getAppHelper()).post("/referent/signin").send({});
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/referent/signin").send({ email: "foo@bar.fr" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/referent/signin").send({ email: "foo", password: "bar" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/referent/signin").send({ password: "foo" });
      expect(res.status).toBe(400);
    });
    it("should return 401 when user does not exists", async () => {
      const res = await request(getAppHelper()).post("/referent/signin").send({ email: "foo@bar.fr", password: "bar" });
      expect(res.status).toBe(401);
    });
    it("should return 401 if password does not match", async () => {
      const user = await createReferentHelper({ ...getNewReferentFixture(), password: "bar" });
      const res = await request(getAppHelper()).post("/referent/signin").send({ email: user.email, password: "foo" });
      expect(res.status).toBe(401);
    });
    it("should return 200 and a token when user exists and password match", async () => {
      const fixture = getNewReferentFixture();
      const user = await createReferentHelper({ ...fixture, password: "bar", email: fixture.email?.toLowerCase() });
      const res = await request(getAppHelper()).post("/referent/signin").send({ email: user.email, password: "bar" });
      expect(res.status).toBe(200);
      expect(res.body.redirect).toBeUndefined();
    });
    // Rôle décommissionné (GOO-56, lot P24, audit du 25/09/2026) : ADMINISTRATEUR_CLE est décommissionné,
    // la branche VERIFICATION_REQUIRED (qui renvoyait l'invitationToken en clair, H62) est supprimée.
    it("should return 401 when user has a decommissioned role, even with a valid password", async () => {
      for (const role of DECOMMISSIONED_ROLES) {
        const user = await createReferentHelper(getNewReferentFixture({ password: "bar", role }));
        const res = await request(getAppHelper()).post("/referent/signin").send({ email: user.email, password: "bar" });
        expect(res.status).toBe(401);
        expect(res.body.ok).toBe(false);
        expect(res.body.token).toBeUndefined();
        expect(res.headers["set-cookie"]).toBeUndefined();
      }
    });
  });
  describe("POST /referent/signin-2fa", () => {
    // Rôle décommissionné (GOO-56, P24) : un code 2FA a pu être émis avant la décommission (ou avant
    // que le compte ne passe INACTIVE) ; il ne doit plus permettre d'ouvrir de session.
    it("should return 401 for a decommissioned role even with a valid 2FA code", async () => {
      const referent = await createReferentHelper(
        getNewReferentFixture({ password: "bar", role: ROLES.HEAD_CENTER, token2FA: "123456", token2FAExpires: new Date(Date.now() + 60000), attempts2FA: 0 }),
      );
      const res = await request(getAppHelper()).post("/referent/signin-2fa").send({ email: referent.email, token_2fa: "123456", rememberMe: false });
      expect(res.status).toBe(401);
      expect(res.body.token).toBeUndefined();
      expect(res.headers["set-cookie"]).toBeUndefined();
    });
  });
  // Verrouillage temporaire : seuls les référents de `allowedReferentIds` peuvent se connecter.
  describe("ADMIN_ACCESS_RESTRICTED à la connexion", () => {
    const activerVerrouillage = (allowedReferentIds: string[]) =>
      FeatureFlagModel.create({ name: FeatureFlagName.ADMIN_ACCESS_RESTRICTED, description: "verrouillage", enabled: true, allowedReferentIds });

    afterEach(async () => {
      await FeatureFlagModel.deleteMany({ name: FeatureFlagName.ADMIN_ACCESS_RESTRICTED });
    });

    it("refuse la connexion d'un référent hors liste, sans ouvrir de session", async () => {
      const user = await createReferentHelper(getNewReferentFixture({ password: "bar", role: ROLES.ADMIN }));
      await activerVerrouillage([]);

      const res = await request(getAppHelper()).post("/referent/signin").send({ email: user.email, password: "bar" });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(SNU_ERRORS.ADMIN_ACCESS_RESTRICTED);
      expect(res.headers["set-cookie"]).toBeUndefined();
    });

    it("n'oppose pas le code de verrouillage à un mauvais mot de passe", async () => {
      const user = await createReferentHelper(getNewReferentFixture({ password: "bar", role: ROLES.ADMIN }));
      await activerVerrouillage([]);

      const res = await request(getAppHelper()).post("/referent/signin").send({ email: user.email, password: "foo" });

      expect(res.status).toBe(401);
      expect(res.body.code).not.toBe(SNU_ERRORS.ADMIN_ACCESS_RESTRICTED);
    });

    it("laisse se connecter un référent de la liste", async () => {
      const user = await createReferentHelper(getNewReferentFixture({ password: "bar", role: ROLES.ADMIN }));
      await activerVerrouillage([user._id.toString()]);

      const res = await request(getAppHelper()).post("/referent/signin").send({ email: user.email, password: "bar" });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it("refuse un code 2FA émis avant le verrouillage pour un référent hors liste", async () => {
      const referent = await createReferentHelper(
        getNewReferentFixture({ password: "bar", role: ROLES.ADMIN, token2FA: "123456", token2FAExpires: new Date(Date.now() + 60000), attempts2FA: 0 }),
      );
      await activerVerrouillage([]);

      const res = await request(getAppHelper()).post("/referent/signin-2fa").send({ email: referent.email, token_2fa: "123456", rememberMe: false });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(SNU_ERRORS.ADMIN_ACCESS_RESTRICTED);
      expect(res.headers["set-cookie"]).toBeUndefined();
    });
  });
  describe("POST /referent/signup", () => {
    const structureFixture = getNewStructureFixture();
    it("should reject public registrations without creating a referent or structure", async () => {
      const fixture = getNewReferentFixture();
      const email = fixture.email?.toLowerCase();
      const referentCount = await ReferentModel.countDocuments();
      const structureCount = await StructureModel.countDocuments();

      const [emptyPayloadResponse, validPayloadResponse] = await Promise.all([
        request(getAppHelper()).post("/referent/signup"),
        request(getAppHelper())
          .post("/referent/signup")
          .send({ email, password: VALID_PASSWORD, firstName: "foo", lastName: "bar", acceptCGU: "true", phone: "0606060606", ...structureFixture }),
      ]);

      for (const response of [emptyPayloadResponse, validPayloadResponse]) {
        expect(response.status).toBe(403);
        expect(response.body).toEqual({ ok: false, code: "OPERATION_NOT_ALLOWED" });
        expect(response.body.token).toBeUndefined();
        expect(response.headers["set-cookie"]).toBeUndefined();
      }
      expect(await ReferentModel.countDocuments()).toBe(referentCount);
      expect(await StructureModel.countDocuments()).toBe(structureCount);
    });
  });
  describe("POST /referent/logout", () => {
    it("should return 200", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());

      const res = await request(getAppHelper(referent)).post("/referent/logout");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /referent/signin_token", () => {
    it("should return 200", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());

      referent.set = jest.fn();
      referent.save = jest.fn();
      jest.spyOn(jwt, "verify").mockImplementation(() => ({
        _id: referent._id,
      }));

      const res = await request(getAppHelper(referent)).get("/referent/signin_token").set("Cookie", ["jwt_ref=blah"]);
      expect(res.status).toBe(200);
      expect(referent.set).toHaveBeenCalled();
      expect(referent.save).toHaveBeenCalled();
    });
  });

  describe("POST /referent/reset_password", () => {
    it("should return return 400 when missing password", async () => {
      res = await request(getAppHelper()).post("/referent/reset_password");
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/referent/reset_password").send({ password: "bar" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/referent/reset_password").send({ password: "bar", newPassword: "baz" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/referent/reset_password").send({ verifyPassword: "bar", newPassword: "baz" });
      expect(res.status).toBe(400);
    });

    it("should return return 400 when password does not meet security requirement", async () => {
      res = await request(getAppHelper()).post("/referent/reset_password").send({ password: "bar", verifyPassword: "baz", newPassword: "baz" });
      expect(res.status).toBe(400);
    });

    it("should return 401 when new password is identical as last password", async () => {
      const young = await createReferentHelper({ ...getNewReferentFixture(), password: VALID_PASSWORD });

      res = await request(getAppHelper(young)).post("/referent/reset_password").send({ password: VALID_PASSWORD, verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD });
      expect(res.status).toBe(401);
    });

    it("should return return 401 when original password does not match", async () => {
      const young = await createReferentHelper({ ...getNewReferentFixture(), password: "foo" });

      res = await request(getAppHelper(young)).post("/referent/reset_password").send({ password: "bar", verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD });
      expect(res.status).toBe(401);
    });

    it("should return return 422 when verifyPassword !== newPassword", async () => {
      const young = await createReferentHelper({ ...getNewReferentFixture(), password: "foo" });

      res = await request(getAppHelper(young))
        .post("/referent/reset_password")
        .send({ password: "foo", verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD + "HOP" });
      expect(res.status).toBe(422);
    });

    it("should return return 200 when password is changed", async () => {
      const young = await createReferentHelper({ ...getNewReferentFixture(), password: "foo" });

      res = await request(getAppHelper(young)).post("/referent/reset_password").send({ password: "foo", verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /referent/forgot_password", () => {
    it("should return return 404 when missing email", async () => {
      res = await request(getAppHelper()).post("/referent/forgot_password");
      expect(res.status).toBe(404);
    });
    it("should return 200 when user does not exist", async () => {
      const res = await request(getAppHelper()).post("/referent/forgot_password").send({ email: "foo@bar.fr" });
      expect(res.status).toBe(200);
    });
    it("should return return 200 when user exists", async () => {
      const fixture = getNewReferentFixture();
      const young = await createReferentHelper({ ...fixture, email: fixture.email?.toLowerCase() });
      const res = await request(getAppHelper()).post("/referent/forgot_password").send({ email: young.email });
      expect(res.status).toBe(200);
    });
    // Rôle décommissionné (GOO-56, P24) : même réponse neutre qu'un compte inexistant/désactivé,
    // et surtout pas de jeton de réinitialisation émis pour ce compte (M66).
    it("should return 200 without issuing a reset token for a decommissioned role", async () => {
      const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.TRANSPORTER }));
      const res = await request(getAppHelper()).post("/referent/forgot_password").send({ email: referent.email });
      expect(res.status).toBe(200);
      const referentAfter = await getReferentByIdHelper(referent._id);
      expect(referentAfter?.forgotPasswordResetToken).toBeFalsy();
    });
  });

  describe("POST /referent/forgot_password_reset", () => {
    it("should return return 400 when missing token or password", async () => {
      res = await request(getAppHelper()).post("/referent/forgot_password_reset").send({ token: "foo" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/referent/forgot_password_reset").send({ password: "bar" });
      expect(res.status).toBe(400);
    });
    it("should return return 400 when password is not secure", async () => {
      const res = await request(getAppHelper()).post("/referent/forgot_password_reset").send({ password: "bar", token: "foo" });
      expect(res.status).toBe(400);
    });
    it("should return return 400 when user is not found", async () => {
      const res = await request(getAppHelper()).post("/referent/forgot_password_reset").send({ password: VALID_PASSWORD, token: "foo" });
      expect(res.status).toBe(400);
    });
    it("should return return 400 when forgotPasswordResetExpires is expired", async () => {
      const fixture = getNewReferentFixture();
      const token = await crypto.randomBytes(20).toString("hex");
      await createReferentHelper({
        ...fixture,
        email: fixture.email?.toLowerCase(),
        forgotPasswordResetExpires: Date.now() - 1000 * 60 * 60 * 24 * 7,
        forgotPasswordResetToken: token,
      });
      const res = await request(getAppHelper()).post("/referent/forgot_password_reset").send({ password: VALID_PASSWORD, token: token });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe("PASSWORD_TOKEN_EXPIRED_OR_INVALID");
    });

    it("should return 401 when new password is identical as last password", async () => {
      const fixture = getNewReferentFixture();
      const token = await crypto.randomBytes(20).toString("hex");
      await createReferentHelper({
        ...fixture,
        email: fixture.email?.toLowerCase(),
        forgotPasswordResetExpires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        forgotPasswordResetToken: token,
        password: VALID_PASSWORD,
      });
      const res = await request(getAppHelper()).post("/referent/forgot_password_reset").send({ password: VALID_PASSWORD, token });
      expect(res.status).toBe(401);
    });

    it("should return return 200 otherwise", async () => {
      const fixture = getNewReferentFixture();
      const token = await crypto.randomBytes(20).toString("hex");
      const young = await createReferentHelper({
        ...fixture,
        email: fixture.email?.toLowerCase(),
        forgotPasswordResetExpires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        forgotPasswordResetToken: token,
      });
      const res = await request(getAppHelper()).post("/referent/forgot_password_reset").send({ password: VALID_PASSWORD, token });
      expect(res.status).toBe(200);

      const updatedYoung = await getReferentByIdHelper(young.id);
      expect(updatedYoung?.forgotPasswordResetExpires).toBeFalsy();
      expect(updatedYoung?.forgotPasswordResetToken).toBeFalsy();
    });
  });
});
