import { dbClose, dbConnect } from "../helpers/db";
import { CleEtablissementModel, ReferentModel } from "../../models";
import { ROLES } from "snu-lib";
import getAppHelper from "../helpers/app";
import request from "supertest";
import { doInviteMultipleChefsEtablissementsToInscription, doInviteChefEtablissementToInscription } from "../../services/cle/referent";
import passport from "passport";

jest.mock("../../sendinblue", () => ({
  ...jest.requireActual("../../sendinblue"),
  sendTemplate: () => Promise.resolve(true),
}));

describe("Referent Service", () => {
  beforeAll(dbConnect);
  afterAll(dbClose);

  beforeEach(async () => {
    await ReferentModel.deleteMany();
    await CleEtablissementModel.deleteMany();
  });

  afterEach(async () => {
    await ReferentModel.deleteMany();
    await CleEtablissementModel.deleteMany();
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

      await CleEtablissementModel.create({
        name: "Example School",
        referentEtablissementIds: [referent._id],
        department: "Example Department",
        region: "Example Region",
        academy: "Example Academy",
        country: "France",
        city: "Example City",
        zip: "12345",
        uai: "UAI123",
      });

      await doInviteChefEtablissementToInscription(referent.email);
      const updatedReferent = await ReferentModel.findOne({ email: referent.email });

      expect(updatedReferent.invitationToken).toBeDefined();
      expect(updatedReferent.invitationToken.length).toBeGreaterThanOrEqual(36);
      expect(updatedReferent.invitationExpires).toBeDefined();
    });

    it("should throw if the referent email does not exist", async () => {
      await expect(doInviteChefEtablissementToInscription("nonexistent@mail.com")).rejects.toThrow("Referent not found");
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
        },
        {
          email: "chef2@etablissement.fr",
          firstName: "Chef2",
          lastName: "Etablissement2",
          role: ROLES.ADMINISTRATEUR_CLE,
        },
      ]);

      await CleEtablissementModel.create([
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

      const emails = referents.map((referent) => referent.email);
      emails.push("nonexistent@mail.com");

      const result = await doInviteMultipleChefsEtablissementsToInscription(emails);

      for (const referent of referents) {
        const updatedReferent = await ReferentModel.findOne({ email: referent.email });
        expect(updatedReferent.invitationToken).toBeDefined();
        expect(updatedReferent.invitationToken.length).toBeGreaterThanOrEqual(36);
        expect(updatedReferent.invitationExpires).toBeDefined();
      }
    });
  });
});

describe("POST /api/cle/referent/send-invitation-inscription-chef-etablissement", () => {
  beforeAll(dbConnect);
  afterAll(dbClose);
  beforeEach(async () => {
    jest.clearAllMocks();
    passport.user.subRole = null;
    jest.mock("../../services/cle/referent", () => ({
      ...jest.requireActual("../../services/cle/referent"),
      doInviteMultipleChefsEtablissementsToInscription: jest.fn(() => Promise.resolve()),
    }));
  });

  it("should return 200 OK and the list of sent invitations", async () => {
    passport.user.role = ROLES.ADMIN;
    passport.user.subRole = "god";

    const res = await request(getAppHelper()).post("/cle/referent/send-invitation-chef-etablissement-inscription").send(["test1@example.com", "test2@example.com"]);

    expect(res.statusCode).toEqual(200);
  });

  it("should return 403 Forbidden if the user is not a super admin", async () => {
    const res = await request(getAppHelper()).post("/cle/referent/send-invitation-chef-etablissement-inscription").send(["test1@example.com", "test2@example.com"]);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual({ ok: false, code: "OPERATION_UNAUTHORIZED" });
  });
});
