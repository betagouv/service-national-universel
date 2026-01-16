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

import { syncMission } from "../../../crons/missionsJVA/JVAService";
import { MissionModel, ReferentModel, StructureModel } from "../../../models";
import { fetchStructureById } from "../../../crons/missionsJVA/JVARepository";
import { jest } from "@jest/globals";
import { MISSION_STATUS } from "snu-lib";

jest.mock("../../../models", () => ({
  MissionModel: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  StructureModel: {
    findOne: jest.fn(),
  },
  ReferentModel: {
    findOne: jest.fn(),
    exists: jest.fn(),
    find: jest.fn(),
  },
}));

const JVA_MISSION_MOCK = {
  clientId: "123",
  title: "Test mission",
  startAt: "2027-01-01T00:00:00.000Z",
  endAt: "2027-01-31T00:00:00.000Z",
  organizationClientId: "456",
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
      region: "Île-de-France",
      country: "FR",
      location: { lat: 48.8566, lon: 2.3522 },
    },
  ],
  updatedAt: new Date().toISOString(),
  postedAt: new Date().toISOString(),
  _id: "jva-mission-id",
};

describe("syncMission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should cancel existing mission if start date is after limit", async () => {
    const saveMock = (jest.fn() as any).mockResolvedValue(null);
    const existingMission = {
      _id: "snu-mission-id",
      status: MISSION_STATUS.VALIDATED,
      save: saveMock,
    };
    (MissionModel.findOne as any).mockResolvedValue(existingMission);
    (StructureModel.findOne as any).mockResolvedValue({ _id: "structure-id" });
    (ReferentModel.findOne as any).mockResolvedValue({ _id: "referent-id" });

    const missionToSync = {
      ...JVA_MISSION_MOCK,
      startAt: "2026-07-16T00:00:00.000Z",
    };

    const mission = await syncMission(missionToSync as any);

    expect(MissionModel.findOne).toHaveBeenCalledWith({ jvaMissionId: "123" });
    expect(saveMock).toHaveBeenCalled();
    expect(existingMission.status).toBe(MISSION_STATUS.CANCEL);
  });

  it("should not create new mission if start date is after limit", async () => {
    (MissionModel.findOne as any).mockResolvedValue(null);
    (StructureModel.findOne as any).mockResolvedValue({ _id: "structure-id" });
    (ReferentModel.findOne as any).mockResolvedValue({ _id: "referent-id" });

    const missionToSync = {
      ...JVA_MISSION_MOCK,
      startAt: "2026-07-16T00:00:00.000Z",
    };

    await syncMission(missionToSync as any);

    expect(MissionModel.findOne).toHaveBeenCalledWith({ jvaMissionId: "123" });
    expect(MissionModel.create).not.toHaveBeenCalled();
  });

  it("should update end date if it is after limit", async () => {
    const setMock = jest.fn();
    const saveMock = (jest.fn() as any).mockResolvedValue(null);
    const existingMission = {
      _id: "snu-mission-id",
      status: MISSION_STATUS.VALIDATED,
      set: setMock,
      save: saveMock,
      placesLeft: 10,
      placesTotal: 10,
    };

    (MissionModel.findOne as any).mockResolvedValue(existingMission);
    (StructureModel.findOne as any).mockResolvedValue({ _id: "structure-id" });
    (ReferentModel.findOne as any).mockResolvedValue({ _id: "referent-id", firstName: "John", lastName: "Doe" });

    const missionToSync = {
      ...JVA_MISSION_MOCK,
      startAt: "2026-01-01T00:00:00.000Z",
      endAt: "2026-11-10T00:00:00.000Z",
      snuPlaces: 10,
    };

    await syncMission(missionToSync as any);

    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        endAt: new Date("2026-11-09T00:00:00.000Z"),
      }),
    );
  });

  it("should set default end date if it is missing", async () => {
    const setMock = jest.fn();
    const saveMock = (jest.fn() as any).mockResolvedValue(null);
    const existingMission = {
      _id: "snu-mission-id",
      status: MISSION_STATUS.VALIDATED,
      set: setMock,
      save: saveMock,
      placesLeft: 10,
      placesTotal: 10,
    };
    (MissionModel.findOne as any).mockResolvedValue(existingMission);
    (StructureModel.findOne as any).mockResolvedValue({ _id: "structure-id" });
    (ReferentModel.findOne as any).mockResolvedValue({ _id: "referent-id", firstName: "John", lastName: "Doe" });

    const missionToSync = {
      ...JVA_MISSION_MOCK,
      startAt: "2026-01-01T00:00:00.000Z",
      endAt: undefined,
      snuPlaces: 10,
    };

    await syncMission(missionToSync as any);

    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        endAt: new Date("2026-11-09T00:00:00.000Z"),
      }),
    );
  });

  it("should create mission if it does not exist", async () => {
    (MissionModel.findOne as any).mockResolvedValue(null);
    (MissionModel.create as any).mockResolvedValue({ _id: "new-mission-id" });
    (StructureModel.findOne as any).mockResolvedValue({ _id: "structure-id" });
    (ReferentModel.exists as any).mockResolvedValue(true);
    (ReferentModel.findOne as any).mockResolvedValue({ _id: "referent-id", firstName: "John", lastName: "Doe" });
    (ReferentModel.find as any).mockResolvedValue([]);

    const missionToSync = {
      ...JVA_MISSION_MOCK,
      startAt: "2026-01-01T00:00:00.000Z",
      endAt: "2026-02-01T00:00:00.000Z",
    };

    await syncMission(missionToSync as any);

    expect(MissionModel.create).toHaveBeenCalled();
  });

  it("should reuse existing structure when found", async () => {
    const existingStructure = { _id: "structure-id", id: "structure-id", jvaStructureId: 456 };

    // Structure déjà existante
    (StructureModel.findOne as any).mockResolvedValue(existingStructure);
    (ReferentModel.exists as any).mockResolvedValue(true);
    (ReferentModel.findOne as any).mockResolvedValue({ _id: "referent-id", firstName: "John", lastName: "Doe" });
    (ReferentModel.find as any).mockResolvedValue([]);
    (MissionModel.findOne as any).mockResolvedValue(null);
    (MissionModel.create as any).mockResolvedValue({ _id: "new-mission-id" });

    const missionToSync = {
      ...JVA_MISSION_MOCK,
      startAt: "2026-01-01T00:00:00.000Z",
      endAt: "2026-02-01T00:00:00.000Z",
    };

    await syncMission(missionToSync as any);

    // Vérifier que findOne a été appelé pour chercher la structure par jvaStructureId
    expect(StructureModel.findOne).toHaveBeenCalledWith({ jvaStructureId: "456" });
    // fetchStructureById ne doit PAS être appelé car la structure existe déjà
    expect(fetchStructureById).not.toHaveBeenCalled();
    // La mission doit être créée
    expect(MissionModel.create).toHaveBeenCalled();
  });
});

describe("Structure schema", () => {
  it("should have unique sparse index on jvaStructureId to prevent duplicates", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { StructureSchema } = require("snu-lib");

    const jvaStructureIdField = StructureSchema.jvaStructureId;

    expect(jvaStructureIdField).toBeDefined();
    expect(jvaStructureIdField.unique).toBe(true);
    expect(jvaStructureIdField.sparse).toBe(true);
  });
});
