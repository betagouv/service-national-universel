jest.mock("../../../application/applicationService", () => ({
  __esModule: true,
  updateApplicationTutor: jest.fn(),
  updateApplicationStatus: jest.fn(),
}));

import { syncMission } from "../../../crons/missionsJVA/JVAService";
import { MissionModel, ReferentModel, StructureModel } from "../../../models";
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
    jest.restoreAllMocks();
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
    (ReferentModel.findOne as any).mockResolvedValue({ _id: "referent-id", firstName: "John", lastName: "Doe" });

    const missionToSync = {
      ...JVA_MISSION_MOCK,
      startAt: "2026-01-01T00:00:00.000Z",
      endAt: "2026-02-01T00:00:00.000Z",
    };

    await syncMission(missionToSync as any);

    expect(MissionModel.create).toHaveBeenCalled();
  });
});
