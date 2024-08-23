import * as youngService from "./youngService";
import { findYoungByIdOrThrow, shouldSwitchYoungByIdToLC, switchYoungByIdToLC, findYoungsByClasseId } from "./youngService";
import { generatePdfIntoBuffer } from "../utils/pdf-renderer";
import { YoungDocument, YoungModel } from "../models";
import { ERRORS, YOUNG_PHASE, YOUNG_STATUS } from "snu-lib";

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
    const young1 = buildYoung("id_1");
    const young2 = buildYoung("id_2");

    const youngsPdfCreated = await youngService.generateConvocationsForMultipleYoungs([young1, young2]);

    expect(youngsPdfCreated).toEqual(mockBuffer);
    expect(generatePdfIntoBuffer).toHaveBeenCalledTimes(1);
  });
  it("should return one PDF consentment for 2 youngs", async () => {
    const young1 = buildYoung("id_1");
    const young2 = buildYoung("id_2");

    const youngsPdfCreated = await youngService.generateConsentementForMultipleYoungs([young1, young2]);

    expect(youngsPdfCreated).toEqual(mockBuffer);
    expect(generatePdfIntoBuffer).toHaveBeenCalledTimes(1);
  });
  it("should return one PDF imageRight for 2 youngs", async () => {
    const young1 = buildYoung("id_1");
    const young2 = buildYoung("id_2");

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
    YoungModel.find = jest.fn().mockResolvedValue(mockYoungs);

    const result = await findYoungsByClasseId("classe1");
    expect(result).toEqual(mockYoungs);
    expect(YoungModel.find).toHaveBeenCalledWith({ classeId: "classe1" });
  });

  it("should return an empty array when no youngs are found", async () => {
    YoungModel.find = jest.fn().mockResolvedValue([]);

    const result = await findYoungsByClasseId("classe2");
    expect(result).toEqual([]);
    expect(YoungModel.find).toHaveBeenCalledWith({ classeId: "classe2" });
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
