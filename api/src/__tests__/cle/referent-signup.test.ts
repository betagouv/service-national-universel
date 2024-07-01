import request from "supertest";
import { addDays } from "date-fns";

import { ROLES, SUB_ROLES } from "snu-lib";

import { ReferentModel, CleEtablissementModel } from "../../models";
import { ReferentDocument } from "../../models/referentType";

import { dbConnect, dbClose } from "../helpers/db";

import { createReferentHelper } from "../helpers/referent";
import getAppHelper from "../helpers/app";
import { getNewReferentFixture, getNewSignupReferentFixture } from "../fixtures/referent";
import { createEtablissement } from "../helpers/etablissement";
import { createFixtureEtablissement } from "../fixtures/etablissement";
import { createFixtureClasse } from "../fixtures/classe";
import { createClasse } from "../helpers/classe";

beforeAll(dbConnect);
afterAll(dbClose);

// Import dependencies

describe("Referent Signup", () => {
  beforeEach(async () => {
    await ReferentModel.deleteMany();
    await CleEtablissementModel.deleteMany();
  });
  describe("GET /cle/referent-signup/token/:token", () => {
    it("should validate token and return referent and etablissement data for coordinateur", async () => {
      const referent = (await createReferentHelper(getNewSignupReferentFixture({ role: ROLES.ADMINISTRATEUR_CL, subRole: SUB_ROLES.coordinateur_cle }))) as ReferentDocument;
      await createEtablissement(createFixtureEtablissement({ coordinateurIds: [referent._id] }));
      const response = await request(getAppHelper()).get(`/cle/referent-signup/token/${referent.invitationToken}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty("referent");
      expect(response.body.data).toHaveProperty("etablissement");
    });

    it("should validate token and return referent and etablissement data for referent classe", async () => {
      const referent = (await createReferentHelper(getNewSignupReferentFixture({ role: ROLES.REFERENT_CLASSE }))) as ReferentDocument;
      const etablissement = await createEtablissement(createFixtureEtablissement());
      await createClasse(createFixtureClasse({ etablissementId: etablissement._id, referentClasseIds: [referent._id] }));
      const response = await request(getAppHelper()).get(`/cle/referent-signup/token/${referent.invitationToken}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty("referent");
      expect(response.body.data).toHaveProperty("etablissement");
    });

    it("should return 404 if referent not found", async () => {
      const response = await request(getAppHelper()).get("/cle/referent-signup/token/invalidToken");
      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });

    it("should return 404 if token expired", async () => {
      const referent = (await createReferentHelper(
        getNewReferentFixture({
          invitationToken: "testValidToken",
          invitationExpires: addDays(new Date(), -1),
        }),
      )) as ReferentDocument;
      const response = await request(getAppHelper()).get(`/cle/referent-signup/token/${referent.invitationToken}`);
      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });
  });

  describe("PUT /cle/referent-signup/request-confirmation-email", () => {
    it("should request confirmation email and return 2FA_REQUIRED", async () => {
      const referent = (await createReferentHelper(getNewSignupReferentFixture())) as ReferentDocument;
      const response = await request(getAppHelper()).put("/cle/referent-signup/request-confirmation-email").send({
        email: "valid@ac-paris.fr",
        confirmEmail: "valid@ac-paris.fr",
        invitationToken: referent.invitationToken,
      });
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toBe("2FA_REQUIRED");
    });

    it("should return 400 if emails do not match", async () => {
      const referent = (await createReferentHelper(getNewSignupReferentFixture())) as ReferentDocument;
      const response = await request(getAppHelper()).put("/cle/referent-signup/request-confirmation-email").send({
        email: "valid@ac-paris.fr",
        confirmEmail: "different@ac-paris.fr",
        invitationToken: referent.invitationToken,
      });
      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });
  });

  describe("POST /cle/referent-signup/confirm-email", () => {
    it("should confirm email and return referent data", async () => {
      const referent = (await createReferentHelper(getNewSignupReferentFixture({ token2FA: "1234", emailWaitingValidation: "valid@ac-paris.fr" }))) as ReferentDocument;
      await createEtablissement(createFixtureEtablissement({ coordinateurIds: [referent._id] }));
      const response = await request(getAppHelper()).post("/cle/referent-signup/confirm-email").send({
        code: referent.token2FA,
        invitationToken: referent.invitationToken,
      });
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty("email");
    });

    it("should return 400 if code is incorrect", async () => {
      const referent = (await createReferentHelper(getNewSignupReferentFixture())) as ReferentDocument;
      const response = await request(getAppHelper()).post("/cle/referent-signup/confirm-email").send({
        code: "invalidCode",
        invitationToken: referent.invitationToken,
      });
      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });
  });

  describe("POST /cle/referent-signup/confirm-signup", () => {
    it("should confirm signup for chef etablissement", async () => {
      const referent = (await createReferentHelper(getNewSignupReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement }))) as ReferentDocument;
      await createEtablissement(createFixtureEtablissement({ coordinateurIds: [referent._id] }));
      const response = await request(getAppHelper()).post("/cle/referent-signup/confirm-signup").send({
        invitationToken: referent.invitationToken,
      });
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });
    it("should confirm signup for coordinateur etablissement", async () => {
      const referent = (await createReferentHelper(getNewSignupReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.coordinateur_cle }))) as ReferentDocument;
      await createEtablissement(createFixtureEtablissement({ coordinateurIds: [referent._id] }));
      const response = await request(getAppHelper()).post("/cle/referent-signup/confirm-signup").send({
        invitationToken: referent.invitationToken,
      });
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });
    it("should confirm signup for referent classe", async () => {
      const referent = (await createReferentHelper(getNewSignupReferentFixture({ role: ROLES.REFERENT_CLASSE }))) as ReferentDocument;
      const etablissement = await createEtablissement(createFixtureEtablissement());
      await createClasse(createFixtureClasse({ etablissementId: etablissement._id, referentClasseIds: [referent._id] }));
      const response = await request(getAppHelper()).post("/cle/referent-signup/confirm-signup").send({
        invitationToken: referent.invitationToken,
      });
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });
    it("should return 404 if classe not found", async () => {
      const referent = (await createReferentHelper(getNewSignupReferentFixture({ role: ROLES.REFERENT_CLASSE }))) as ReferentDocument;
      await createEtablissement(createFixtureEtablissement());
      const response = await request(getAppHelper()).post("/cle/referent-signup/confirm-signup").send({
        invitationToken: referent.invitationToken,
      });
      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });
    it("should return 404 if etablissement not found", async () => {
      const referent = (await createReferentHelper(getNewSignupReferentFixture())) as ReferentDocument;
      const response = await request(getAppHelper()).post("/cle/referent-signup/confirm-signup").send({
        invitationToken: referent.invitationToken,
        schoolId: "invalidSchoolId",
      });
      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });
  });

  describe("POST /cle/referent-signup/", () => {
    it("should return 404 if referent not found", async () => {
      const response = await request(getAppHelper()).post("/cle/referent-signup").send({
        firstName: "John",
        lastName: "Doe",
        phone: "123456789",
        password: "strongPassword123!",
        invitationToken: "invalidToken",
      });
      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });
    it("should return 400 if password is not valid", async () => {
      const referent = (await createReferentHelper(getNewSignupReferentFixture())) as ReferentDocument;
      const response = await request(getAppHelper()).post("/cle/referent-signup").send({
        firstName: "John",
        lastName: "Doe",
        phone: "123456789",
        password: "weak",
        invitationToken: referent.invitationToken,
      });
      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });
    it("should update referent and return data (signup)", async () => {
      const referent = (await createReferentHelper(getNewSignupReferentFixture())) as ReferentDocument;
      const response = await request(getAppHelper()).post("/cle/referent-signup").send({
        firstName: "John",
        lastName: "Doe",
        phone: "123456789",
        password: "strongPassword123!",
        invitationToken: referent.invitationToken,
      });
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty("firstName", "John");
    });

    it("should update referent and return data (reinscription)", async () => {
      const referent = (await createReferentHelper(getNewReferentFixture({ invitationToken: "validToken" }))) as ReferentDocument;
      // le referent a déjà un mot de passe et lastLoginAt définie
      const response = await request(getAppHelper()).post("/cle/referent-signup").send({
        firstName: "John",
        lastName: "Doe",
        phone: "123456789",
        invitationToken: referent.invitationToken,
      });
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty("firstName", "John");
    });
  });
});
