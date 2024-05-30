import { dbConnect, dbClose } from "@/__tests__/helpers/db";
import { LigneBusModel } from "@/models";

import { syncMergedBus } from "./ligneDeBusService";

beforeAll(dbConnect);
afterAll(dbClose);
afterEach(() => {
  jest.clearAllMocks();
});

const findOneBusSpy = jest.spyOn(LigneBusModel, "findOne");

describe("ligneDeBusService", () => {
  it("should syncMergedBus all bus line", async () => {
    const ligneBus = { busId: "#1", cohort: "cohort", set: () => null, save: () => () => Promise.resolve() } as any;
    const busSaveSpy = jest.spyOn(ligneBus, "save");
    const busSetSpy = jest.spyOn(ligneBus, "set");
    const ligneBus2 = { busId: "#1", cohort: "cohort", set: () => null, save: () => () => Promise.resolve() } as any;

    // ligneBus found
    findOneBusSpy.mockResolvedValue(null);
    await syncMergedBus({ ligneBus, busIdsToUpdate: ["#1", "#2"], newMergedBusIds: [] });

    expect(busSetSpy).toHaveBeenCalledTimes(1);
    expect(busSaveSpy).toHaveBeenCalledTimes(1);
    expect(findOneBusSpy).toHaveBeenCalledTimes(1);

    // ligneBus not found
    jest.clearAllMocks();
    findOneBusSpy.mockResolvedValue(ligneBus2);
    await syncMergedBus({ ligneBus, busIdsToUpdate: ["#2", "#3"], newMergedBusIds: [] });
    expect(busSetSpy).toHaveBeenCalledTimes(0);
    expect(busSaveSpy).toHaveBeenCalledTimes(0);
    expect(findOneBusSpy).toHaveBeenCalledTimes(2);
  });
});
