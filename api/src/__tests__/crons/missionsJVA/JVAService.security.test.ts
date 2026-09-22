jest.mock("../../../application/applicationService", () => ({
  __esModule: true,
  updateApplicationTutor: jest.fn(),
  updateApplicationStatus: jest.fn(),
}));

jest.mock("../../../crons/missionsJVA/JVARepository", () => ({
  __esModule: true,
  fetchMissions: jest.fn(),
  fetchStructureById: jest.fn(),
}));

jest.mock("../../../brevo", () => ({
  __esModule: true,
  sendTemplate: jest.fn(),
}));

jest.mock("../../../slack", () => ({
  __esModule: true,
  default: { info: jest.fn() },
}));

const mockCreatedReferents: any[] = [];
const mockCreatedStructures: any[] = [];

jest.mock("../../../models", () => {
  function ReferentModel(this: any, payload: any) {
    mockCreatedReferents.push(payload);
    Object.assign(this, payload, { _id: "new-referent-id", id: "new-referent-id" });
    this.save = jest.fn().mockImplementation(() => Promise.resolve(this));
  }
  (ReferentModel as any).exists = jest.fn();
  (ReferentModel as any).findOne = jest.fn();
  (ReferentModel as any).find = jest.fn();

  function StructureModel(this: any, payload: any) {
    mockCreatedStructures.push(payload);
    Object.assign(this, payload, { _id: "new-structure-id", id: "new-structure-id" });
    this.save = jest.fn().mockImplementation(() => Promise.resolve(this));
  }
  (StructureModel as any).findOne = jest.fn();

  return {
    __esModule: true,
    MissionModel: { findOne: jest.fn(), create: jest.fn() },
    ReferentModel,
    StructureModel,
  };
});

import { jest } from "@jest/globals";
import { ReferentStatus, ReferentSchema, ROLES } from "snu-lib";
import { syncMission } from "../../../crons/missionsJVA/JVAService";
import { MissionModel, ReferentModel, StructureModel } from "../../../models";
import { fetchStructureById } from "../../../crons/missionsJVA/JVARepository";

const ATTACKER_EMAIL = "attacker@example.com";

const JVA_ORGANISATION_MOCK = {
  id: 456,
  name: "Association pirate",
  description: "Une organisation moderee cote JVA",
  address: {
    address: "1 rue de Rivoli",
    zip: "75001",
    city: "Paris",
    department: "75",
    country: "FR",
    longitude: "2.3522",
    latitude: "48.8566",
  },
  responsables: [{ first_name: "Eve", last_name: "Attacker", email: ATTACKER_EMAIL, phone: "null", mobile: "null" }],
};

const JVA_MISSION_MOCK = {
  clientId: "123",
  title: "Test mission",
  startAt: "2026-10-01T00:00:00.000Z",
  endAt: "2026-11-01T00:00:00.000Z",
  organizationClientId: 456,
  descriptionHtml: "Description",
  domain: "health",
  snuPlaces: 1,
  schedule: "Flexible",
  addresses: [
    {
      postalCode: "75001",
      street: "1 rue de Rivoli",
      city: "Paris",
      departmentName: "Paris",
      region: "Ile-de-France",
      country: "FR",
      location: { lat: 48.8566, lon: 2.3522 },
    },
  ],
  updatedAt: new Date().toISOString(),
  postedAt: new Date().toISOString(),
  _id: "jva-mission-id",
};

/**
 * H49 : la synchronisation JVA cree des comptes referent a partir de donnees externes
 * (les `responsables` d'une organisation moderee sur jeveuxaider.gouv.fr).
 * Un compte cree ACTIVE sans mot de passe est activable en self-service par le titulaire
 * de l'adresse : POST /referent/forgot_password puis POST /referent/forgot_password_reset
 * puis POST /referent/signin.
 */
describe("H49 - comptes RESPONSIBLE crees par la synchro JVA", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreatedReferents.length = 0;
    mockCreatedStructures.length = 0;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("le schema referent cree les comptes ACTIVE par defaut : la synchro doit donc fixer le statut explicitement", () => {
    // Documente la raison du correctif : omettre `status` ne cree pas un compte neutre.
    expect((ReferentSchema as any).status.default).toBe(ReferentStatus.ACTIVE);
  });

  it("ne cree pas un compte immediatement utilisable lors de la creation d'une structure JVA", async () => {
    jest.setSystemTime(new Date("2026-05-01T00:00:00.000Z"));

    (StructureModel as any).findOne.mockResolvedValue(null);
    (fetchStructureById as any).mockResolvedValue(JVA_ORGANISATION_MOCK);
    (ReferentModel as any).exists.mockResolvedValue(null);
    (ReferentModel as any).findOne.mockResolvedValue({ _id: "new-referent-id", id: "new-referent-id", firstName: "Eve", lastName: "Attacker", email: ATTACKER_EMAIL });
    (ReferentModel as any).find.mockResolvedValue([]);
    (MissionModel as any).findOne.mockResolvedValue(null);
    (MissionModel as any).create.mockResolvedValue({ _id: "new-mission-id", name: "Test mission" });

    await syncMission(JVA_MISSION_MOCK as any);

    expect(mockCreatedReferents).toHaveLength(1);
    const createdReferent = mockCreatedReferents[0];
    expect(createdReferent.email).toBe(ATTACKER_EMAIL);
    expect(createdReferent.role).toBe(ROLES.RESPONSIBLE);
    // Le compte ne doit pas pouvoir etre active sans intervention d'un agent SNU :
    // `Auth.forgotPassword` et `Auth.signin` refusent les referents INACTIVE.
    expect(createdReferent.status).toBe(ReferentStatus.INACTIVE);
  });

  it("ne cree pas un compte immediatement utilisable pour une structure JVA existante sans referent", async () => {
    // Chemin toujours atteignable apres la date limite de depot des missions (15/07/2026),
    // car la mission existe deja cote SNU.
    jest.setSystemTime(new Date("2026-09-22T00:00:00.000Z"));

    const existingStructure = { _id: "structure-id", id: "structure-id", jvaStructureId: 456, name: "Association pirate" };
    const existingMission = {
      _id: "snu-mission-id",
      status: "VALIDATED",
      tutorId: "new-referent-id",
      placesLeft: 1,
      placesTotal: 1,
      set: jest.fn(),
      save: jest.fn().mockImplementation(() => Promise.resolve(null)),
    };

    (StructureModel as any).findOne.mockResolvedValue(existingStructure);
    (fetchStructureById as any).mockResolvedValue(JVA_ORGANISATION_MOCK);
    (ReferentModel as any).exists.mockResolvedValue(null);
    (ReferentModel as any).findOne.mockResolvedValue({ _id: "new-referent-id", id: "new-referent-id", firstName: "Eve", lastName: "Attacker", email: ATTACKER_EMAIL });
    (ReferentModel as any).find.mockResolvedValue([]);
    (MissionModel as any).findOne.mockResolvedValue(existingMission);

    await syncMission(JVA_MISSION_MOCK as any);

    expect(mockCreatedReferents).toHaveLength(1);
    expect(mockCreatedReferents[0].status).toBe(ReferentStatus.INACTIVE);
  });
});
