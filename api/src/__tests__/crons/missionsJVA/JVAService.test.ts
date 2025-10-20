jest.mock("../../../application/applicationService");

import { syncMission } from "../../../crons/missionsJVA/JVAService";
import { MissionModel, ReferentModel, StructureModel } from "../../../models";
import { jest } from "@jest/globals";
import { MISSION_STATUS } from "snu-lib";

jest.mock("../../../models");
jest.mock("../../../crons/missionsJVA/JVARepository");
jest.mock("../../../brevo");
jest.mock("../../../sentry");
jest.mock("../../../slack");

const mockedMissionModel = jest.mocked(MissionModel);
const mockedStructureModel = jest.mocked(StructureModel);
const mockedReferentModel = jest.mocked(ReferentModel);

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
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should have at least one test", () => {
    expect(true).toBe(true);
  });

  it("should cancel existing mission if start date is after limit", async () => {
    const existingMission = {
      _id: "snu-mission-id",
      status: MISSION_STATUS.VALIDATED,
      save: jest.fn(),
    };
    mockedMissionModel.findOne.mockResolvedValue(existingMission as any);
    mockedStructureModel.findOne.mockResolvedValue({ _id: "structure-id" } as any);
    mockedReferentModel.findOne.mockResolvedValue({ _id: "referent-id" } as any);

    const missionToSync = {
      ...JVA_MISSION_MOCK,
      startAt: "2026-07-16T00:00:00.000Z",
    };

    await syncMission(missionToSync as any);

    expect(mockedMissionModel.findOne).toHaveBeenCalledWith({ jvaMissionId: "123" });
    expect(existingMission.save).toHaveBeenCalled();
    expect(existingMission.status).toBe(MISSION_STATUS.CANCEL);
  });

  it("should not create new mission if start date is after limit", async () => {
    mockedMissionModel.findOne.mockResolvedValue(null);

    const missionToSync = {
      ...JVA_MISSION_MOCK,
      startAt: "2026-07-16T00:00:00.000Z",
    };

    await syncMission(missionToSync as any);

    expect(mockedMissionModel.findOne).toHaveBeenCalledWith({ jvaMissionId: "123" });
    expect(MissionModel.create).not.toHaveBeenCalled();
  });

  it("should update end date if it is after limit", async () => {
    const createdMission = {};
    mockedMissionModel.findOne.mockResolvedValue(null);
    mockedMissionModel.create.mockResolvedValue(createdMission as any);
    mockedStructureModel.findOne.mockResolvedValue({ _id: "structure-id" } as any);
    mockedReferentModel.findOne.mockResolvedValue({ _id: "referent-id", firstName: "John", lastName: "Doe" } as any);

    const missionToSync = {
      ...JVA_MISSION_MOCK,
      startAt: "2026-01-01T00:00:00.000Z",
      endAt: "2026-11-10T00:00:00.000Z",
    };

    await syncMission(missionToSync as any);

    expect(mockedMissionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        endAt: new Date("2026-11-09T00:00:00.000Z"),
      }),
    );
  });

  it("should set default end date if it is missing", async () => {
    const createdMission = {};
    mockedMissionModel.findOne.mockResolvedValue(null);
    mockedMissionModel.create.mockResolvedValue(createdMission as any);
    mockedStructureModel.findOne.mockResolvedValue({ _id: "structure-id" } as any);
    mockedReferentModel.findOne.mockResolvedValue({ _id: "referent-id", firstName: "John", lastName: "Doe" } as any);

    const missionToSync = {
      ...JVA_MISSION_MOCK,
      startAt: "2026-01-01T00:00:00.000Z",
      endAt: undefined,
    };

    await syncMission(missionToSync as any);

    expect(mockedMissionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        endAt: new Date("2026-11-09T00:00:00.000Z"),
      }),
    );
  });
});
