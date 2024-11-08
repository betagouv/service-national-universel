import { updateYoungsCohorts, updateClasseFromExport, updateClasse } from "./classeImportAutoService";
import * as classeImportService from "./classeImportAutoService";
import { CohortDocument, ClasseModel, ClasseDocument, YoungModel, CohesionCenterModel, PointDeRassemblementModel, SessionPhase1Model } from "../../../models";
import { ERRORS, FUNCTIONAL_ERRORS, STATUS_CLASSE, STATUS_PHASE1_CLASSE } from "snu-lib";
import mongoose from "mongoose";
import { ClasseMapped, ClasseUpdateFileResult } from "./classeImportAutoType";
import { mapClassesForUpdate } from "./classeImportAutoMapper";
import { findCohortBySnuIdOrThrow } from "../../../cohort/cohortService";

jest.mock("../../../models", () => ({
  CohortModel: { findById: jest.fn() },
  ClasseModel: { findById: jest.fn(), save: jest.fn() },
  YoungModel: { find: jest.fn(), save: jest.fn() },
  CohesionCenterModel: { findOne: jest.fn() },
  PointDeRassemblementModel: { findOne: jest.fn() },
  SessionPhase1Model: { findOne: jest.fn() },
}));

jest.mock("./classeImportAutoMapper", () => ({
  mapClassesForUpdate: jest.fn(),
}));

jest.mock("../../../cohort/cohortService", () => ({
  findCohortBySnuIdOrThrow: jest.fn(),
}));

describe("updateClasseFromExport", () => {
  beforeAll(() => {
    jest.spyOn(classeImportService, "updateClasse").mockImplementationOnce(() => {
      return Promise.resolve({
        updatedClasse: {
          _id: "1",
          cohort: "Cohort 101",
          cohortId: "101",
          status: "OPEN",
          totalSeats: 1,
        } as ClasseDocument,
        updatedFields: ["cohort", "cohortId", "status", "totalSeats"],
        error: [],
      });
    });
    jest.spyOn(classeImportService, "updateClasse").mockImplementationOnce(() => {
      throw new Error(ERRORS.COHORT_NOT_FOUND);
    });
  });

  it("should successfully import classe cohorts", async () => {
    const mockCSV = [
      { "Identifiant de la classe engagée": "1", "Session formule": "Cohort 101", "Effectif de jeunes concernés": 1 },
      { "Identifiant de la classe engagée": "2", "Session formule": "Cohort 102", "Effectif de jeunes concernés": 2 },
    ];
    const mappedClassesCohorts = [
      { classeId: "1", cohortCode: "IDF_101" },
      { classeId: "2", cohortCode: "IDF_102" },
    ];
    const mockImportResult = [
      {
        result: "success",
        classeId: "1",
        cohortCode: "IDF_101",
        cohortId: "101",
        cohortName: "Cohort 101",
        classeStatus: "OPEN",
        classeTotalSeats: 1,
        updated: "cohort, cohortId, status, totalSeats",
      },
      { result: "error", classeId: "2", cohortCode: "IDF_102", error: ERRORS.COHORT_NOT_FOUND, classeTotalSeats: undefined },
    ];

    (mapClassesForUpdate as jest.Mock).mockReturnValue(mappedClassesCohorts);

    const result = await updateClasseFromExport(mockCSV);

    expect(mapClassesForUpdate).toHaveBeenCalledWith(mockCSV);
    expect(updateClasse).toHaveBeenCalledTimes(2);
    expect(updateClasse).toHaveBeenCalledWith({ classeId: "1", cohortCode: "IDF_101" });
    expect(updateClasse).toHaveBeenCalledWith({ classeId: "2", cohortCode: "IDF_102" });
    expect(result).toEqual(mockImportResult);
  });
});

describe("updateYoungsCohorts", () => {
  const classeId = new mongoose.Types.ObjectId().toString();
  const cohortId = new mongoose.Types.ObjectId().toString();
  const cohortName = "Cohort 2024";
  const cohortMock: CohortDocument = {
    _id: cohortId,
    name: cohortName,
  } as CohortDocument;
  const youngId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("should update youngs with new cohort information", async () => {
    const youngMock = {
      _id: youngId,
      cohortId: "originalCohortId",
      cohort: "Original Cohort Name",
      set: jest.fn().mockReturnThis(),
      save: jest.fn(),
    };

    (YoungModel.find as jest.Mock).mockResolvedValue([youngMock]);

    await updateYoungsCohorts(classeId, cohortMock);

    expect(YoungModel.find).toHaveBeenCalledWith({ classeId });
    expect(youngMock.set).toHaveBeenCalledWith({
      cohort: cohortName,
      cohortId: cohortId,
      originalCohort: "Original Cohort Name",
      originalCohortId: "originalCohortId",
      cohortChangeReason: "Import SI-SNU",
    });
    expect(youngMock.save).toHaveBeenCalledWith(
      expect.objectContaining({
        fromUser: expect.objectContaining({
          firstName: expect.stringContaining("UPDATE_CLASSE_COHORT"),
        }),
      }),
    );
  });

  it("should not throw an error if no youngs are found", async () => {
    (YoungModel.find as jest.Mock).mockResolvedValue([]);

    await expect(updateYoungsCohorts(classeId, cohortMock)).resolves.not.toThrow();

    expect(YoungModel.find).toHaveBeenCalledWith({ classeId });
  });
});

describe("updateClasse", () => {
  let mockClasse: any;
  let mockCohort: any;
  let mockSession: any;
  let mockCohesionCenter: any;
  let mockPDR: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClasse = {
      _id: "mockClasseId",
      status: STATUS_CLASSE.VERIFIED,
      set: jest.fn(),
      save: jest.fn(),
      cohortId: "oldCohortId",
    };

    mockCohort = { _id: "newCohortId", name: "New Cohort" };
    mockSession = { _id: "mockSessionId" };
    mockCohesionCenter = { _id: "mockCohesionCenterId" };
    mockPDR = { _id: "mockPdrId" };

    ClasseModel.findById = jest.fn().mockResolvedValue(mockClasse);
    (findCohortBySnuIdOrThrow as jest.Mock).mockResolvedValue(mockCohort);
    SessionPhase1Model.findOne = jest.fn().mockResolvedValue(mockSession);
    CohesionCenterModel.findOne = jest.fn().mockResolvedValue(mockCohesionCenter);
    PointDeRassemblementModel.findOne = jest.fn().mockResolvedValue(mockPDR);
  });

  it("should throw an error if no classeId is provided", async () => {
    const classeToUpdateMapped = {} as ClasseMapped;

    await expect(updateClasse(classeToUpdateMapped)).rejects.toThrow(FUNCTIONAL_ERRORS.NO_CLASSE_ID_PROVIDED);
  });

  it("should throw an error if classe is not found", async () => {
    ClasseModel.findById = jest.fn().mockResolvedValue(null);

    const classeToUpdateMapped = { classeId: "invalidClasseId" } as ClasseMapped;

    await expect(updateClasse(classeToUpdateMapped)).rejects.toThrow(ERRORS.CLASSE_NOT_FOUND);
  });

  it("should update cohort, status, and fields when all valid fields are provided", async () => {
    const classeToUpdateMapped: ClasseMapped = {
      classeId: "mockClasseId",
      cohortCode: "newCohortCode",
      classeTotalSeats: 30,
      sessionCode: "session123",
      centerCode: "center456",
      pdrCode: "pdr789",
    };

    const result: ClasseUpdateFileResult = await updateClasse(classeToUpdateMapped);

    expect(ClasseModel.findById).toHaveBeenCalledWith(classeToUpdateMapped.classeId);
    expect(findCohortBySnuIdOrThrow).toHaveBeenCalledWith(classeToUpdateMapped.cohortCode);
    expect(updateYoungsCohorts).toHaveBeenCalledWith(mockClasse._id, mockCohort);

    // Check the fields that should have been updated
    expect(mockClasse.set).toHaveBeenCalledWith({
      cohortId: mockCohort._id,
      cohort: mockCohort.name,
      totalSeats: classeToUpdateMapped.classeTotalSeats,
    });
    expect(mockClasse.set).toHaveBeenCalledWith({
      status: STATUS_CLASSE.ASSIGNED,
    });
    expect(mockClasse.set).toHaveBeenCalledWith({
      sessionId: mockSession._id,
    });
    expect(mockClasse.set).toHaveBeenCalledWith({
      cohesionCenterId: mockCohesionCenter._id,
    });
    expect(mockClasse.set).toHaveBeenCalledWith({
      pointDeRassemblementId: mockPDR._id,
      statusPhase1: STATUS_PHASE1_CLASSE.AFFECTED,
    });

    // Ensure save is called
    expect(mockClasse.save).toHaveBeenCalledWith({
      fromUser: expect.objectContaining({
        firstName: expect.stringContaining("UPDATE_CLASSE_COHORT_"),
      }),
    });

    // Check result
    expect(result.updatedFields).toEqual(
      expect.arrayContaining(["cohortId", "cohort", "totalSeats", "status", "sessionId", "cohesionCenterId", "pointDeRassemblementId", "statusPhase1"]),
    );
    expect(result.error).toEqual([]);
  });

  it("should add errors if session or cohesion center is not found", async () => {
    SessionPhase1Model.findOne = jest.fn().mockResolvedValue(null);
    CohesionCenterModel.findOne = jest.fn().mockResolvedValue(null);

    const classeToUpdateMapped: ClasseMapped = {
      classeId: "mockClasseId",
      cohortCode: "newCohortCode",
      classeTotalSeats: 30,
      sessionCode: "session123",
      centerCode: "center456",
    };

    const result = await updateClasse(classeToUpdateMapped);

    expect(result.error).toEqual([ERRORS.SESSION_NOT_FOUND, ERRORS.COHESION_CENTER_NOT_FOUND]);
  });

  it("should handle missing PDR and add error if PDR is not found", async () => {
    PointDeRassemblementModel.findOne = jest.fn().mockResolvedValue(null);

    const classeToUpdateMapped: ClasseMapped = {
      classeId: "mockClasseId",
      cohortCode: "newCohortCode",
      classeTotalSeats: 30,
      sessionCode: "session123",
      centerCode: "center456",
      pdrCode: "pdr789",
    };

    const result = await updateClasse(classeToUpdateMapped);

    expect(result.error).toEqual([ERRORS.PDR_NOT_FOUND]);
    expect(result.updatedFields).toEqual(expect.arrayContaining(["cohortId", "cohort", "totalSeats", "status", "sessionId", "cohesionCenterId"]));
  });
});
