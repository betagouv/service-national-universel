import { dbClose, dbConnect } from "../helpers/db";
import { ClasseModel, EtablissementModel, ReferentModel } from "../../models";
import { ROLES, InvitationType } from "snu-lib";
import { UserDto } from "snu-lib/src/dto";
import getAppHelper from "../helpers/app";
import request from "supertest";
import { doInviteMultipleChefsEtablissements, doInviteChefEtablissement, InvitationResult } from "../../services/cle/referent";
import passport from "passport";
import { SUB_ROLES } from "snu-lib";

jest.mock("../../sendinblue", () => ({
  ...jest.requireActual("../../sendinblue"),
  sendTemplate: () => Promise.resolve(true),
}));

const user = {} as UserDto;

describe("Referent Service", () => {
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
        referentEtablissementIds: [referent._id],
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
        etablissementId: etablissement._id,
        cohort: "2022",
        referentClasseIds: [referent._id],
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

      await doInviteChefEtablissement(referent, user);
      const updatedReferent = await ReferentModel.findOne({ email: referent.email });

      expect(updatedReferent.invitationToken).toBeDefined();
      expect(updatedReferent.invitationToken.length).toBeGreaterThanOrEqual(36);
      expect(updatedReferent.invitationExpires).toBeDefined();
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
        expect(updatedReferent.invitationToken).toBeDefined();
        expect(updatedReferent.invitationToken.length).toBeGreaterThanOrEqual(36);
        expect(updatedReferent.invitationExpires).toBeDefined();
      }
      expect(result).toEqual(expect.arrayContaining(expectedInvitation));
    });
  });
});

describe("POST /api/cle/referent/send-invitation-chef-etablissement", () => {
  beforeAll(dbConnect);
  afterAll(dbClose);
  beforeEach(async () => {
    jest.clearAllMocks();
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
    passport.user.role = ROLES.ADMIN;
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
