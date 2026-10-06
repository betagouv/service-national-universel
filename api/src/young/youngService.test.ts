import { getValidatedYoungsWithSession, getYoungsImageRight, getYoungsParentAllowSNU, mightAddInProgressStatus } from "./youngService";
import { YoungModel } from "../models";
import { UserDto, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";

afterEach(() => {
  jest.clearAllMocks();
});

describe("YoungService.getYoungsParentAllowSNU", () => {
  it("should return an array of young objects with valid status and parentAllowSNU true", () => {
    const youngs = [
      { _id: "1", name: "John Doe", status: YOUNG_STATUS.VALIDATED, parentAllowSNU: "true" },
      { _id: "2", name: "Jane Smith", status: YOUNG_STATUS.IN_PROGRESS, parentAllowSNU: "false" },
      { _id: "3", name: "Alice Brown", status: YOUNG_STATUS.WAITING_CORRECTION, parentAllowSNU: "true" },
      { _id: "4", name: "Bob Green", status: YOUNG_STATUS.WITHDRAWN, parentAllowSNU: "true" },
    ];

    const expected = [
      { _id: "1", name: "John Doe", status: YOUNG_STATUS.VALIDATED, parentAllowSNU: "true" },
      { _id: "3", name: "Alice Brown", status: YOUNG_STATUS.WAITING_CORRECTION, parentAllowSNU: "true" },
    ];

    const result = getYoungsParentAllowSNU(youngs);
    expect(result).toEqual(expected);
  });

  it("should return an empty array when no youngs have valid status or parentAllowSNU true", () => {
    const youngs = [
      { _id: "1", name: "John Doe", status: YOUNG_STATUS.WITHDRAWN, parentAllowSNU: "true" },
      { _id: "2", name: "Jane Smith", status: YOUNG_STATUS.IN_PROGRESS, parentAllowSNU: "false" },
    ];

    const result = getYoungsParentAllowSNU(youngs);
    expect(result).toEqual([]);
  });
});

describe("YoungService.getYoungsImageRight", () => {
  it("should return an array of young objects with valid status and imageRight set to true or false", () => {
    const youngs = [
      { _id: "1", name: "John Doe", status: YOUNG_STATUS.VALIDATED, imageRight: "true" },
      { _id: "2", name: "Jane Smith", status: YOUNG_STATUS.IN_PROGRESS, imageRight: "false" },
      { _id: "3", name: "Alice Brown", status: YOUNG_STATUS.WAITING_CORRECTION, imageRight: "true" },
      { _id: "4", name: "Bob Green", status: YOUNG_STATUS.WITHDRAWN, imageRight: "true" },
      { _id: "5", name: "Eve Black", status: YOUNG_STATUS.VALIDATED, imageRight: "undefined" },
    ];

    const expected = [
      { _id: "1", name: "John Doe", status: YOUNG_STATUS.VALIDATED, imageRight: "true" },
      { _id: "2", name: "Jane Smith", status: YOUNG_STATUS.IN_PROGRESS, imageRight: "false" },
      { _id: "3", name: "Alice Brown", status: YOUNG_STATUS.WAITING_CORRECTION, imageRight: "true" },
    ];

    const result = getYoungsImageRight(youngs);
    expect(result).toEqual(expected);
  });

  it("should return an empty array when no youngs have valid status or imageRight set to true or false", () => {
    const youngs = [
      { _id: "1", name: "John Doe", status: YOUNG_STATUS.WITHDRAWN, imageRight: "true" },
      { _id: "2", name: "Jane Smith", status: YOUNG_STATUS.WITHDRAWN, imageRight: "false" },
      { _id: "3", name: "Alice Brown", status: YOUNG_STATUS.VALIDATED, imageRight: "undefined" },
    ];

    const result = getYoungsImageRight(youngs);
    expect(result).toEqual([]);
  });
});

describe("YoungService.getValidatedYoungsWithSession", () => {
  it("should return an array of young objects that are validated, have a session, and meet the criteria", () => {
    const youngs = [
      {
        _id: "1",
        status: YOUNG_STATUS.VALIDATED,
        sessionPhase1Id: "session1",
        statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
        meetingPointId: "mp1",
        deplacementPhase1Autonomous: "true",
        source: "OTHER",
      },
      { _id: "2", status: YOUNG_STATUS.VALIDATED, sessionPhase1Id: "session2", statusPhase1: YOUNG_STATUS_PHASE1.DONE, transportInfoGivenByLocal: "true", source: "OTHER" },
      { _id: "3", status: YOUNG_STATUS.VALIDATED, sessionPhase1Id: "session3", statusPhase1: YOUNG_STATUS_PHASE1.NOT_DONE, meetingPointId: "mp2", source: "CLE" },
    ];

    const result = getValidatedYoungsWithSession(youngs);
    expect(result).toEqual(youngs);
  });

  it("should return an empty array when youngs do not have a valid session or do not meet the criteria", () => {
    const youngs = [
      { _id: "1", status: YOUNG_STATUS.VALIDATED, sessionPhase1Id: "session1", statusPhase1: YOUNG_STATUS_PHASE1.WITHDRAWN, meetingPointId: "mp1" },
      { _id: "2", status: YOUNG_STATUS.WITHDRAWN, sessionPhase1Id: "session2", statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED, transportInfoGivenByLocal: "true" },
      { _id: "3", status: YOUNG_STATUS.VALIDATED, sessionPhase1Id: undefined, statusPhase1: YOUNG_STATUS_PHASE1.DONE, deplacementPhase1Autonomous: "false" },
    ];

    const result = getValidatedYoungsWithSession(youngs);
    expect(result).toEqual([]);
  });
});

describe("addInProgressStatusToPatch", () => {
  let mockYoung;
  let mockUser;

  beforeEach(() => {
    mockYoung = {
      status: YOUNG_STATUS.WAITING_VALIDATION,
      save: jest.fn(),
      patches: {
        find: jest.fn().mockResolvedValue([{ ops: [{ path: "/status", value: YOUNG_STATUS.WAITING_CORRECTION }] }]),
      },
      set: jest.fn(),
    };
    mockUser = {} as UserDto;
    YoungModel.find = jest.fn().mockResolvedValue(mockYoung);
  });

  it("should add IN_PROGRESS status to patch if not already present", async () => {
    mockYoung.status = YOUNG_STATUS.VALIDATED;
    const findSpy = jest.spyOn(mockYoung.patches, "find");
    findSpy.mockReturnValue(Promise.resolve([{ ops: [{ path: "/status", value: YOUNG_STATUS.WAITING_CORRECTION }] }]));
    await mightAddInProgressStatus(mockYoung, mockUser);
    expect(findSpy).toHaveBeenCalled();
    expect(mockYoung.save).toHaveBeenCalledWith({ fromUser: mockUser });
    expect(mockYoung.save).toHaveBeenCalledTimes(2);
  });

  it("should not add IN_PROGRESS status to patch if already present", async () => {
    const findSpy = jest.spyOn(mockYoung.patches, "find");
    findSpy.mockReturnValue(Promise.resolve([{ ops: [{ path: "/status", value: YOUNG_STATUS.IN_PROGRESS }] }]));
    await mightAddInProgressStatus(mockYoung, mockUser);
    expect(findSpy).toHaveBeenCalled();
    expect(mockYoung.save).not.toHaveBeenCalled();
  });

  it("should not add IN_PROGRESS status to patch if status is IN_PROGRESS", async () => {
    mockYoung.status = YOUNG_STATUS.IN_PROGRESS;
    const findSpy = jest.spyOn(mockYoung.patches, "find");
    findSpy.mockReturnValue(Promise.resolve([{ ops: [{ path: "/status", value: YOUNG_STATUS.WAITING_CORRECTION }] }]));
    await mightAddInProgressStatus(mockYoung, mockUser);
    expect(findSpy).not.toHaveBeenCalled();
    expect(mockYoung.save).not.toHaveBeenCalled();
  });

  it("should not add IN_PROGRESS status if status is not VALIDATED", async () => {
    mockYoung.status = YOUNG_STATUS.WAITING_VALIDATION;
    const findSpy = jest.spyOn(mockYoung.patches, "find");
    findSpy.mockReturnValue(Promise.resolve([{ ops: [{ path: "/status", value: YOUNG_STATUS.WAITING_CORRECTION }] }]));
    await mightAddInProgressStatus(mockYoung, mockUser);
    expect(findSpy).toHaveBeenCalled();
    expect(mockYoung.save).not.toHaveBeenCalled();
  });
});

const buildYoung = (id = "id") => ({ firstName: "firstName", lastName: "lastName", _id: id });
