import * as youngService from "./youngService";
import {
  findYoungByIdOrThrow,
  shouldSwitchYoungByIdToLC,
  switchYoungByIdToLC,
  findYoungsByClasseId,
  getValidatedYoungsWithSession,
  getYoungsImageRight,
  getYoungsParentAllowSNU,
} from "./youngService";
import { generatePdfIntoBuffer } from "../utils/pdf-renderer";
import { YoungDocument, YoungModel } from "../models";
import { ERRORS, YOUNG_PHASE, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";

const mockBuffer = Buffer.from("pdf");

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock("../utils/pdf-renderer", () => ({
  ...jest.requireActual("../utils/pdf-renderer"),
  generatePdfIntoBuffer: jest.fn().mockReturnValue(Buffer.from("pdf")),
}));

describe("YoungService.generateConvocationsForMultipleYoungs", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should return one PDF convocations for 2 youngs", async () => {
    const young1 = {
      _id: "1",
      status: YOUNG_STATUS.VALIDATED,
      sessionPhase1Id: "session1",
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      transportInfoGivenByLocal: "true",
      source: "OTHER",
    };
    const young2 = { _id: "2", status: YOUNG_STATUS.VALIDATED, sessionPhase1Id: "session2", statusPhase1: YOUNG_STATUS_PHASE1.NOT_DONE, meetingPointId: "mp2", source: "CLE" };

    const youngsPdfCreated = await youngService.generateConvocationsForMultipleYoungs([young1, young2]);

    expect(youngsPdfCreated).toEqual(mockBuffer);
    expect(generatePdfIntoBuffer).toHaveBeenCalledTimes(1);
  });
  it("should return one PDF consentment for 2 youngs", async () => {
    const young1 = { _id: "1", name: "John Doe", status: YOUNG_STATUS.VALIDATED, parentAllowSNU: "true" };
    const young2 = { _id: "3", name: "Alice Brown", status: YOUNG_STATUS.VALIDATED, parentAllowSNU: "true" };

    const youngsPdfCreated = await youngService.generateConsentementForMultipleYoungs([young1, young2]);

    expect(youngsPdfCreated).toEqual(mockBuffer);
    expect(generatePdfIntoBuffer).toHaveBeenCalledTimes(1);
  });
  it("should return one PDF imageRight for 2 youngs", async () => {
    const young1 = { _id: "1", name: "John Doe", status: YOUNG_STATUS.VALIDATED, imageRight: "true" };
    const young2 = { _id: "2", name: "Jane Smith", status: YOUNG_STATUS.IN_PROGRESS, imageRight: "false" };

    const youngsPdfCreated = await youngService.generateImageRightForMultipleYoungs([young1, young2]);

    expect(youngsPdfCreated).toEqual(mockBuffer);
    expect(generatePdfIntoBuffer).toHaveBeenCalledTimes(1);
  });
});

describe("YoungService.findYoungsByClasseId", () => {
  it("should return an array of young objects when found", async () => {
    const mockYoungs = [
      { _id: "1", name: "John Doe", classeId: "classe1" },
      { _id: "2", name: "Jane Smith", classeId: "classe1" },
    ];
    // Mock the YoungModel.find method
    YoungModel.find = jest.fn().mockResolvedValue(mockYoungs);

    const result = await findYoungsByClasseId("classe1");
    expect(result).toEqual(mockYoungs);
    expect(YoungModel.find).toHaveBeenCalledWith({ classeId: "classe1" });
  });

  it("should return an empty array when no youngs are found", async () => {
    // Mock the YoungModel.find method to return an empty array
    YoungModel.find = jest.fn().mockResolvedValue([]);

    const result = await findYoungsByClasseId("classe2");
    expect(result).toEqual([]);
    expect(YoungModel.find).toHaveBeenCalledWith({ classeId: "classe2" });
  });
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

describe("YoungService.findYoungByIdOrThrow", () => {
  it("should return a young object when found", async () => {
    const mockYoung = {
      _id: "1",
      name: "John Doe",
      status: YOUNG_STATUS.VALIDATED,
    };
    YoungModel.findById = jest.fn().mockResolvedValue(mockYoung);

    const result = await findYoungByIdOrThrow("1");
    expect(result).toBe(mockYoung);
    expect(YoungModel.findById).toHaveBeenCalledWith("1");
  });

  it("should throw an error when young is not found", async () => {
    YoungModel.findById = jest.fn().mockResolvedValue(null);

    await expect(findYoungByIdOrThrow("2")).rejects.toThrow(ERRORS.YOUNG_NOT_FOUND);
    expect(YoungModel.findById).toHaveBeenCalledWith("2");
  });
});

describe("YoungService.switchYoungByIdToLC()", () => {
  it("should update the young's properties and save successfully", async () => {
    const mockYoung = {
      set: jest.fn(),
      save: jest.fn().mockResolvedValue("mocked saved young"),
    };
    jest.spyOn(youngService, "findYoungByIdOrThrow").mockResolvedValue(mockYoung as unknown as YoungDocument);

    const result = await switchYoungByIdToLC("123");

    expect(mockYoung.set).toHaveBeenCalledWith({
      cohesionCenterId: undefined,
      sessionPhase1Id: undefined,
      meetingPointId: undefined,
      ligneId: undefined,
      deplacementPhase1Autonomous: undefined,
      transportInfoGivenByLocal: undefined,
      cohesionStayPresence: undefined,
      presenceJDM: undefined,
      departInform: undefined,
      departSejourAt: undefined,
      departSejourMotif: undefined,
      departSejourMotifComment: undefined,
      youngPhase1Agreement: "false",
      hasMeetingInformation: undefined,
      cohesionStayMedicalFileReceived: undefined,
    });
    expect(mockYoung.save).toHaveBeenCalledTimes(1);
    expect(result).toBe("mocked saved young");
  });
});

describe("shouldSwitchYoungByIdToLC", () => {
  const mockYoung = {
    status: YOUNG_STATUS.VALIDATED,
    phase: YOUNG_PHASE.INSCRIPTION,
  };

  it("returns true if conditions are met for switching to LC", async () => {
    jest.spyOn(youngService, "findYoungByIdOrThrow").mockResolvedValue(mockYoung as any);
    const result = await shouldSwitchYoungByIdToLC("youngId", YOUNG_STATUS.WAITING_LIST);
    expect(result).toBe(true);
  });

  it("returns false if the status is not VALIDATED", async () => {
    jest.spyOn(youngService, "findYoungByIdOrThrow").mockResolvedValue({ ...mockYoung, status: YOUNG_STATUS.ABANDONED } as any);
    const result = await shouldSwitchYoungByIdToLC("youngId", YOUNG_STATUS.WAITING_LIST);
    expect(result).toBe(false);
  });

  it("returns false if the phase is not INSCRIPTION", async () => {
    jest.spyOn(youngService, "findYoungByIdOrThrow").mockResolvedValue({ ...mockYoung, phase: YOUNG_PHASE.COHESION_STAY } as any);
    const result = await shouldSwitchYoungByIdToLC("youngId", YOUNG_STATUS.WAITING_LIST);
    expect(result).toBe(false);
  });

  it("returns false if the new status is not WAITING_LIST", async () => {
    jest.spyOn(youngService, "findYoungByIdOrThrow").mockResolvedValue(mockYoung as any);
    const result = await shouldSwitchYoungByIdToLC("youngId", YOUNG_STATUS.VALIDATED);
    expect(result).toBe(false);
  });
});

const buildYoung = (id = "id") => ({ firstName: "firstName", lastName: "lastName", _id: id });
