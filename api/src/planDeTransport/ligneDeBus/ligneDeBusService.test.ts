import { ERRORS, UserDto } from "snu-lib";
import { dbConnect, dbClose } from "../../__tests__/helpers/db";
import { LigneBusDocument, LigneBusModel, SessionPhase1Document, SessionPhase1Model } from "../../models";

import { syncMergedBus, updateSessionForLine } from "./ligneDeBusService";

beforeAll(dbConnect);
afterAll(dbClose);
afterEach(() => {
  jest.clearAllMocks();
});

const findOneBusSpy = jest.spyOn(LigneBusModel, "findOne");
const sessionPhase1ModelFindByIdSpy = jest.spyOn(SessionPhase1Model, "findById");

describe("ligneDeBusService.syncMergedBus", () => {
  it("should syncMergedBus all bus line", async () => {
    const ligneBus = { busId: "#1", cohort: "cohort", set: () => null, save: () => Promise.resolve() } as any;
    const busSaveSpy = jest.spyOn(ligneBus, "save");
    const busSetSpy = jest.spyOn(ligneBus, "set");
    const ligneBus2 = { busId: "#1", cohort: "cohort", set: () => null, save: () => Promise.resolve() } as any;

    // ligneBus found
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

describe("ligneDeBusService.updateSessionForLine", () => {
  const sessionPhase1 = { _id: "oldSessionId", placesLeft: 10 };
  sessionPhase1ModelFindByIdSpy.mockResolvedValue(sessionPhase1);

  it("should throw an error if the new session does not have enough places left", async () => {
    const user = { _id: "userId" } as UserDto;
    const newSession = { _id: "newSessionId", placesLeft: 5 } as SessionPhase1Document;
    const ligne = { _id: "busId", sessionId: "oldSessionId", youngSeatsTaken: 23 } as any;

    try {
      await updateSessionForLine({ ligne, session: newSession, actor: user, sendCampaign: false });
    } catch (e) {
      expect(e.message).toBe(ERRORS.OPERATION_NOT_ALLOWED);
    }
  });
});
