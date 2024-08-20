import request from "supertest";
import passport from "passport";
import { fakerFR as faker } from "@faker-js/faker";

import { InvitationType, ROLES, STATUS_CLASSE, SUB_ROLES, UserDto } from "snu-lib";

import { ClasseModel, EtablissementModel, ReferentModel } from "../../models";
import {
  deleteOldReferentClasse,
  DeletionResult,
  doInviteChefEtablissement,
  doInviteMultipleChefsEtablissements,
  doInviteMultipleReferentClasseVerifiee,
  InvitationResult,
} from "../../services/cle/referent";

import { dbClose, dbConnect } from "../helpers/db";
import getAppHelper from "../helpers/app";
import { createReferentHelper } from "../helpers/referent";
import getNewReferentFixture, { getNewSignupReferentFixture } from "../fixtures/referent";
import { createEtablissement } from "../helpers/etablissement";
import { createFixtureEtablissement } from "../fixtures/etablissement";
import { createFixtureClasse } from "../fixtures/classe";
import * as featureService from "../../featureFlag/featureFlagService";

jest.mock("../../brevo", () => ({
  ...jest.requireActual("../../brevo"),
  sendTemplate: () => Promise.resolve(true),
}));

const user = {} as UserDto;

describe("Cle Referent", () => {
  beforeAll(dbConnect);
  afterAll(dbClose);

  beforeEach(async () => {
    await ReferentModel.deleteMany();
    await EtablissementModel.deleteMany();
    await ClasseModel.deleteMany();
    jest.clearAllMocks();
  });

  describe("doInviteChefEtablissementToInscription", () => {
    it("should send an invitation to a valid Chef Etablissement with an existing email", async () => {
      const referent = await ReferentModel.create({
        email: "chef@etablissement.fr",
        firstName: "Chef",
        lastName: "Etablissement",
        role: ROLES.ADMINISTRATEUR_CLE,
      });

      const etablissement = await EtablissementModel.create({
        name: "Example School",
        referentEtablissementIds: [referent!._id],
        department: "Example Department",
        region: "Example Region",
        academy: "Example Academy",
        country: "France",
        city: "Example City",
        zip: "12345",
        uai: "UAI123",
      });

      await ClasseModel.create({
        name: "Mock Class",
        uniqueKeyAndId: "MOCK123",
        etablissementId: etablissement!._id,
        cohort: "2022",
        referentClasseIds: [referent!._id],
        uniqueKey: "UAI_DATE_123",
        uniqueId: "DATE_1234",
        estimatedSeats: 30,
        totalSeats: 30,
        department: "75",
        region: "11",
        academy: "Paris",
        schoolYear: "2021-2022",
        status: "CREATED",
        statusPhase1: "WAITING_AFFECTATION",
        type: "FULL",
      });

      await doInviteChefEtablissement(referent!, user);
      const updatedReferent = await ReferentModel.findOne({ email: referent!.email });

      expect(updatedReferent!.invitationToken).toBeDefined();
      expect(updatedReferent!.invitationToken.length).toBeGreaterThanOrEqual(36);
      expect(updatedReferent!.invitationExpires).toBeDefined();
    });
  });

  describe("doInviteMultipleChefsEtablissementsToInscription", () => {
    it("should send an invitation to multiple valid Chef Etablissements", async () => {
      const referents = await ReferentModel.create([
        {
          email: "chef1@etablissement.fr",
          firstName: "Chef1",
          lastName: "Etablissement1",
          role: ROLES.ADMINISTRATEUR_CLE,
          subRole: SUB_ROLES.referent_etablissement,
          metadata: { isFirstInvitationPending: true, invitationType: InvitationType.INSCRIPTION },
        },
        {
          email: "chef2@etablissement.fr",
          firstName: "Chef2",
          lastName: "Etablissement2",
          role: ROLES.ADMINISTRATEUR_CLE,
          subRole: SUB_ROLES.referent_etablissement,
          metadata: { isFirstInvitationPending: true, invitationType: InvitationType.CONFIRMATION },
        },
      ]);

      await EtablissementModel.create([
        {
          name: "Example School 1",
          referentEtablissementIds: [referents[0]._id],
          department: "Example Department",
          region: "Example Region",
          academy: "Example Academy",
          country: "France",
          city: "Example City",
          zip: "12345",
          uai: "UAI123",
        },
        {
          name: "Example School 2",
          referentEtablissementIds: [referents[1]._id],
          department: "Example Department",
          region: "Example Region",
          academy: "Example Academy",
          country: "France",
          city: "Example City",
          zip: "12345",
          uai: "UAI456",
        },
      ]);

      const expectedInvitation: InvitationResult[] = [
        {
          to: "chef1@etablissement.fr",
          status: "ok",
          type: InvitationType.INSCRIPTION,
        },
        {
          to: "chef2@etablissement.fr",
          status: "ok",
          type: InvitationType.CONFIRMATION,
        },
      ];

      const result = await doInviteMultipleChefsEtablissements(user);

      for (const referent of referents) {
        const updatedReferent = await ReferentModel.findOne({ email: referent.email });
        expect(updatedReferent!.invitationToken).toBeDefined();
        expect(updatedReferent!.invitationToken.length).toBeGreaterThanOrEqual(36);
        expect(updatedReferent!.invitationExpires).toBeDefined();
      }
      expect(result).toEqual(expect.arrayContaining(expectedInvitation));
    });
  });

  describe("doInviteMultipleReferentsClasseToInscription", () => {
    it("should send an invitation to multiple valid Referent Classe", async () => {
      const referentsWithInvitation = await ReferentModel.create([
        getNewReferentFixture({
          email: "referent1@classe.fr",
          role: ROLES.REFERENT_CLASSE,
          metadata: { isFirstInvitationPending: true, invitationType: InvitationType.INSCRIPTION },
        }),
        getNewReferentFixture({
          email: "referent2@classe.fr",
          role: ROLES.REFERENT_CLASSE,
          metadata: { isFirstInvitationPending: true, invitationType: InvitationType.CONFIRMATION },
        }),
      ]);

      const referentsWithoutInvitation = await ReferentModel.create([
        getNewReferentFixture({
          email: "referent3@classe.fr",
          role: ROLES.REFERENT_CLASSE,
          metadata: { isFirstInvitationPending: false, invitationType: InvitationType.CONFIRMATION },
        }),
        getNewReferentFixture({
          email: "referentClasse4NoMetadataIsFirstInvitationPending@classe.fr",
          role: ROLES.REFERENT_CLASSE,
        }),
        getNewReferentFixture({
          email: "referentClasse5NotVerified@classe.fr",
          role: ROLES.REFERENT_CLASSE,
          metadata: { isFirstInvitationPending: true, invitationType: InvitationType.INSCRIPTION },
        }),
      ]);

      const etablissements = await EtablissementModel.create([
        createFixtureEtablissement({ referentEtablissementIds: [referentsWithInvitation[0]._id] }),
        createFixtureEtablissement({ referentEtablissementIds: [referentsWithInvitation[1]._id] }),
      ]);

      await ClasseModel.create([
        createFixtureClasse({ name: "Classe 1", referentClasseIds: [referentsWithInvitation[0]._id], etablissementId: etablissements[0]._id, status: STATUS_CLASSE.VERIFIED }),
        createFixtureClasse({ name: "Classe 2", referentClasseIds: [referentsWithInvitation[1]._id], etablissementId: etablissements[1]._id, status: STATUS_CLASSE.VERIFIED }),
        createFixtureClasse({ name: "Classe 3", referentClasseIds: [referentsWithoutInvitation[0]._id], etablissementId: etablissements[1]._id, status: STATUS_CLASSE.VERIFIED }),
        createFixtureClasse({ name: "Classe 4", referentClasseIds: [referentsWithoutInvitation[1]._id], etablissementId: etablissements[1]._id, status: STATUS_CLASSE.VERIFIED }),
        createFixtureClasse({ name: "Classe 5", referentClasseIds: [referentsWithoutInvitation[2]._id], etablissementId: etablissements[1]._id, status: STATUS_CLASSE.CREATED }),
        createFixtureClasse({
          name: "Classe 6 with same referent",
          referentClasseIds: [referentsWithInvitation[0]._id],
          etablissementId: etablissements[0]._id,
          status: STATUS_CLASSE.VERIFIED,
        }),
      ]);

      const expectedInvitation: InvitationResult[] = [
        {
          to: "referent1@classe.fr",
          status: "ok",
          type: InvitationType.INSCRIPTION,
        },
        {
          to: "referent2@classe.fr",
          status: "ok",
          type: InvitationType.CONFIRMATION,
        },
      ];

      const result = await doInviteMultipleReferentClasseVerifiee(user);

      for (const referent of referentsWithInvitation) {
        const updatedReferent = await ReferentModel.findOne({ email: referent.email });
        expect(updatedReferent!.invitationToken).toBeDefined();
        expect(updatedReferent!.invitationToken.length).toBeGreaterThanOrEqual(36);
        expect(updatedReferent!.invitationExpires).toBeDefined();
      }

      for (const referent of referentsWithoutInvitation) {
        const updatedReferent = await ReferentModel.findOne({ email: referent.email });
        expect(updatedReferent!.invitationToken).toEqual("");
        expect(updatedReferent!.invitationExpires).toBeUndefined();
      }
      expect(result).toEqual(expect.arrayContaining(expectedInvitation));
    });
  });

  describe("deleteOldReferentClasse", () => {
    it("should delete referent not linked with 2024_2025 classe", async () => {
      await ReferentModel.create([
        {
          email: "referent1@classe.fr",
          firstName: "referent1",
          lastName: "Classe1",
          role: ROLES.REFERENT_CLASSE,
        },
        {
          email: "referent2@classe.fr",
          firstName: "referent2",
          lastName: "Classe2",
          role: ROLES.REFERENT_CLASSE,
        },
        {
          email: "referent3@classe.fr",
          firstName: "referent3",
          lastName: "Classe3",
          role: ROLES.REFERENT_CLASSE,
        },
      ]);

      const referent0 = (await ReferentModel.findOne({ email: "referent1@classe.fr" }))!;
      const referent1 = (await ReferentModel.findOne({ email: "referent2@classe.fr" }))!;
      const referent2 = (await ReferentModel.findOne({ email: "referent3@classe.fr" }))!;

      const etablissements = await EtablissementModel.create([
        createFixtureEtablissement({ referentEtablissementIds: [referent0._id] }),
        createFixtureEtablissement({ referentEtablissementIds: [referent1._id] }),
      ]);

      await ClasseModel.create([
        createFixtureClasse({ name: "Classe 1", referentClasseIds: [referent0._id], etablissementId: etablissements[0]._id, schoolYear: "2024-2025" }),
        createFixtureClasse({ name: "Classe 2", referentClasseIds: [referent1._id, referent2._id], etablissementId: etablissements[1]._id, schoolYear: "2023-2024" }),
      ]);

      const referentDeleted = await deleteOldReferentClasse(user);

      const expectedInvitation: DeletionResult[] = [
        {
          id: referent1._id,
          email: referent1.email,
          mailSent: true,
        },
        {
          id: referent2._id,
          email: referent2.email,
          mailSent: true,
        },
      ];

      const notDeletedReferent0 = await ReferentModel.findOne({ email: referent0.email });
      const deletedReferent1 = await ReferentModel.findOne({ email: referent1.email });
      const deletedReferent2 = await ReferentModel.findOne({ email: referent2.email });

      expect(notDeletedReferent0?.deletedAt).toBeUndefined();
      expect(deletedReferent1?.deletedAt).toBeDefined();
      expect(deletedReferent2?.deletedAt).toBeDefined();
      expect(referentDeleted).toEqual(expect.arrayContaining(expectedInvitation));
    });
  });
});

describe("POST /cle/referent/send-invitation-chef-etablissement", () => {
  beforeAll(dbConnect);
  afterAll(dbClose);
  beforeEach(async () => {
    jest.clearAllMocks();
    // @ts-ignore
    passport.user.subRole = null;
    jest.mock("../../services/cle/referent", () => ({
      ...jest.requireActual("../../services/cle/referent"),
      doInviteMultipleChefsEtablissements: jest.fn(() => Promise.resolve([])),
    }));
    jest.mock("../../utils", () => ({
      ...jest.requireActual("../../utils"),
      uploadFile: () => Promise.resolve(),
    }));
  });

  it("should return 200 OK and the list of sent invitations", async () => {
    // @ts-ignore
    passport.user.role = ROLES.ADMIN;
    // @ts-ignore
    passport.user.subRole = "god";

    const res = await request(getAppHelper()).post("/cle/referent/send-invitation-chef-etablissement").send();

    expect(res.statusCode).toEqual(200);
  });

  it("should return 403 Forbidden if the user is not a super admin", async () => {
    const res = await request(getAppHelper()).post("/cle/referent/send-invitation-chef-etablissement").send();

    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual({ ok: false, code: "OPERATION_UNAUTHORIZED" });
  });
});

describe("POST /cle/referent/send-invitation-referent-classe", () => {
  beforeAll(dbConnect);
  afterAll(dbClose);
  beforeEach(async () => {
    jest.clearAllMocks();
    // @ts-ignore
    passport.user.subRole = null;
    jest.mock("../../services/cle/referent", () => ({
      ...jest.requireActual("../../services/cle/referent"),
      doInviteMultipleChefsEtablissements: jest.fn(() => Promise.resolve([])),
    }));
    jest.mock("../../utils", () => ({
      ...jest.requireActual("../../utils"),
      uploadFile: () => Promise.resolve(),
    }));
    await ReferentModel.deleteMany();
    await EtablissementModel.deleteMany();
    await ClasseModel.deleteMany();
  });

  jest.spyOn(featureService, "isFeatureAvailable").mockResolvedValueOnce(true);

  it("should return 200 OK and the list of sent invitations", async () => {
    // @ts-ignore
    passport.user.role = ROLES.ADMIN;
    // @ts-ignore
    passport.user.subRole = "god";

    const res = await request(getAppHelper()).post("/cle/referent/send-invitation-referent-classe-verifiee").send();

    expect(res.statusCode).toEqual(200);
  });

  it("should return 403 Forbidden if the user is not a super admin", async () => {
    const res = await request(getAppHelper()).post("/cle/referent/send-invitation-referent-classe-verifiee").send();

    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual({ ok: false, code: "OPERATION_UNAUTHORIZED" });
  });
});

describe("POST /cle/referent/invite-coordonnateur", () => {
  beforeAll(dbConnect);
  afterAll(dbClose);
  it("should return 200 OK when invite is successful (chef etablissement)", async () => {
    const referent = await createReferentHelper(getNewSignupReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement }));
    await createEtablissement(createFixtureEtablissement({ referentEtablissementIds: [referent._id] }));
    const res = await request(getAppHelper({ _id: referent._id, role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement }))
      .post("/cle/referent/invite-coordonnateur")
      .send({
        email: faker.internet.email().toLowerCase(),
        firstName: "Chef",
        lastName: "Etab",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("ok", true);
  });

  it("should return 200 OK when invite is successful (admin)", async () => {
    const referent = await createReferentHelper(getNewSignupReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement }));
    const etablissement = await createEtablissement(createFixtureEtablissement({ referentEtablissementIds: [referent._id] }));
    const res = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post("/cle/referent/invite-coordonnateur")
      .send({
        email: faker.internet.email().toLowerCase(),
        firstName: "Admin",
        lastName: "Admin",
        etablissementId: etablissement._id,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("ok", true);
  });

  it("should return 400 Bad Request when request body is invalid", async () => {
    let res = await request(getAppHelper()).post("/cle/referent/invite-coordonnateur").send({
      invalid: "invalid",
    });
    expect(res.statusCode).toEqual(400);

    res = await request(getAppHelper()).post("/cle/referent/invite-coordonnateur").send({
      firstName: "firstName",
      lastName: "lastName",
      email: "invalid-email",
    });
    expect(res.statusCode).toEqual(400);

    res = await request(getAppHelper()).post("/cle/referent/invite-coordonnateur").send({
      lastName: "lastName",
      email: faker.internet.email().toLowerCase(),
    });
    expect(res.statusCode).toEqual(400);
  });
});
