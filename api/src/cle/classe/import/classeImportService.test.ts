import {
  addCohortToClasse,
  addCohortToClasseByCohortSnuId,
  importClasseCohort,
  updateYoungsCohorts,
  processSessionPhasePdrAndCenter,
  updateClasseForNextCohortOrPdrAndCenter,
} from "./classeImportService";
import * as classeImportService from "./classeImportService";
import { CohortModel, CohortDocument, ClasseModel, ClasseDocument, YoungModel, CohesionCenterModel, PointDeRassemblementModel, SessionPhase1Model } from "../../../models";
import { ERRORS, FUNCTIONAL_ERRORS, STATUS_CLASSE, STATUS_PHASE1_CLASSE } from "snu-lib";
import mongoose from "mongoose";
import { ClasseCohortImportKey, ClasseCohortMapped, ClasseImportType } from "./classeCohortImport";
import { getFile } from "../../../utils";
import { readCSVBuffer } from "../../../services/fileService";
import { mapClassesCohortsForSept2024 } from "./classeCohortMapper";
import { findCohortBySnuIdOrThrow } from "../../../cohort/cohortService";
import { status } from "../../../../../admin/build/src/utils/index";
import classe from "../../../emails/cle/classe";

jest.mock("../../../models", () => ({
  CohortModel: { findById: jest.fn() },
  ClasseModel: { findById: jest.fn(), save: jest.fn() },
  YoungModel: { find: jest.fn(), save: jest.fn() },
  CohesionCenterModel: { findOne: jest.fn() },
  PointDeRassemblementModel: { findOne: jest.fn() },
  SessionPhase1Model: { findOne: jest.fn() },
}));

jest.mock("../../../utils", () => ({
  getFile: jest.fn(),
}));

jest.mock("../../../services/fileService", () => ({
  readCSVBuffer: jest.fn(),
}));

jest.mock("./classeCohortMapper", () => ({
  mapClassesCohortsForSept2024: jest.fn(),
}));

jest.mock("../../../cohort/cohortService", () => ({
  findCohortBySnuIdOrThrow: jest.fn(),
}));

describe("importClasseCohort", () => {
  beforeAll(() => {
    jest.spyOn(classeImportService, "addCohortToClasseByCohortSnuId").mockImplementationOnce(() => {
      return Promise.resolve({
        updatedClasse: {
          _id: "1",
          cohort: "Cohort 101",
          cohortId: "101",
          status: "OPEN",
          totalSeats: 1,
        } as ClasseDocument,
        updatedFields: ["cohort", "cohortId", "status", "totalSeats"],
      });
    });
    jest.spyOn(classeImportService, "addCohortToClasseByCohortSnuId").mockImplementationOnce(() => {
      throw new Error(ERRORS.COHORT_NOT_FOUND);
    });
  });

  const filePath = "path/to/a/file.csv";
  const importKey = ClasseCohortImportKey.SEPT_2024;

  it("should successfully import classe cohorts", async () => {
    const mockCSV = [
      { "Identifiant de la classe engagée": "1", "Session formule": "Cohort 101", "Effectif de jeunes concernés": "1" },
      { "Identifiant de la classe engagée": "2", "Session formule": "Cohort 102", "Effectif de jeunes concernés": "2" },
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
        importType: ClasseImportType.NEXT_CLASSE_COHORT,
      },
      { result: "error", classeId: "2", cohortCode: "IDF_102", error: ERRORS.COHORT_NOT_FOUND, classeTotalSeats: undefined, importType: ClasseImportType.NEXT_CLASSE_COHORT },
    ];

    (getFile as jest.Mock).mockResolvedValue({ Body: Buffer.from("some mock data").toString() });
    (readCSVBuffer as jest.Mock).mockResolvedValue(mockCSV);
    (mapClassesCohortsForSept2024 as jest.Mock).mockReturnValue(mappedClassesCohorts);

    const result = await importClasseCohort(filePath, importKey, ClasseImportType.NEXT_CLASSE_COHORT);

    expect(getFile).toHaveBeenCalledWith(filePath);
    expect(readCSVBuffer).toHaveBeenCalledWith(Buffer.from("some mock data"));
    expect(mapClassesCohortsForSept2024).toHaveBeenCalledWith(mockCSV, ClasseImportType.NEXT_CLASSE_COHORT);
    expect(addCohortToClasseByCohortSnuId).toHaveBeenCalledTimes(2);
    expect(addCohortToClasseByCohortSnuId).toHaveBeenCalledWith({ classeId: "1", cohortCode: "IDF_101" }, importKey, ClasseImportType.NEXT_CLASSE_COHORT);
    expect(addCohortToClasseByCohortSnuId).toHaveBeenCalledWith({ classeId: "2", cohortCode: "IDF_102" }, importKey, ClasseImportType.NEXT_CLASSE_COHORT);
    expect(result).toEqual(mockImportResult);
  });
});

describe("addCohortToClasse", () => {
  const classeId = new mongoose.Types.ObjectId().toString();
  const cohortId = new mongoose.Types.ObjectId().toString();
  const importKey = ClasseCohortImportKey.SEPT_2024;
  const classeCohortMapped: ClasseCohortMapped = {
    cohortCode: cohortId,
    classeId: classeId,
    classeTotalSeats: 1,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("should throw an error if the cohort is not found", async () => {
    (CohortModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(addCohortToClasse(classeCohortMapped, cohortId, importKey, ClasseImportType.NEXT_CLASSE_COHORT)).rejects.toThrow(ERRORS.COHORT_NOT_FOUND);
  });

  it("should throw an error if the classe is not found", async () => {
    (CohortModel.findById as jest.Mock).mockResolvedValue({ _id: cohortId, name: "Cohort 2024" });
    (ClasseModel.findById as jest.Mock)(null);

    await expect(addCohortToClasse(classeCohortMapped, cohortId, importKey, ClasseImportType.NEXT_CLASSE_COHORT)).rejects.toThrow(ERRORS.CLASSE_NOT_FOUND);
  });

  it("should add a cohort to a classe successfully", async () => {
    const cohortName = "Cohort 2024";
    (CohortModel.findById as jest.Mock).mockResolvedValue({ _id: cohortId, name: cohortName });
    const setMock = jest.fn().mockReturnThis();
    const saveMock = jest.fn();
    (ClasseModel.findById as jest.Mock).mockResolvedValue({
      _id: classeId,
      set: setMock,
      save: saveMock,
    });

    const result = await addCohortToClasse(classeCohortMapped, cohortId, importKey, ClasseImportType.FIRST_CLASSE_COHORT);

    expect(CohortModel.findById).toHaveBeenCalledWith(cohortId);
    expect(ClasseModel.findById).toHaveBeenCalledWith(classeId);
    expect(setMock).toHaveBeenCalledWith({ cohortId: cohortId, cohort: cohortName, totalSeats: 1, status: STATUS_CLASSE.ASSIGNED });
    expect(saveMock).toHaveBeenCalledWith({ fromUser: { firstName: `IMPORT_CLASSE_COHORT_${importKey}` } });
    expect(result.updatedFields).toEqual(["cohortId", "cohort", "status", "totalSeats"]);
  });
  it("should call updateClasseForNextCohortOrPdrAndCenter if importType is NEXT_CLASSE_COHORT", async () => {
    const updateSpy = jest.spyOn(classeImportService, "updateClasseForNextCohortOrPdrAndCenter").mockImplementation(jest.fn());

    const cohortName = "Cohort 2024";
    (CohortModel.findById as jest.Mock).mockResolvedValue({ _id: cohortId, name: cohortName });
    const setMock = jest.fn().mockReturnThis();
    const saveMock = jest.fn();
    (ClasseModel.findById as jest.Mock).mockResolvedValue({
      _id: classeId,
      set: setMock,
      save: saveMock,
    });

    await addCohortToClasse(classeCohortMapped, cohortId, importKey, ClasseImportType.NEXT_CLASSE_COHORT);
    expect(updateSpy).toHaveBeenCalled();
    updateSpy.mockRestore();
  });

  it("should call updateClasseForNextCohortOrPdrAndCenter AND processSessionPhasePdrAndCenter if importType is PDR_AND_CENTER", async () => {
    const updateSpy = jest.spyOn(classeImportService, "updateClasseForNextCohortOrPdrAndCenter").mockImplementation(jest.fn());
    const processSpy = jest.spyOn(classeImportService, "processSessionPhasePdrAndCenter").mockImplementation(jest.fn());
    const cohortName = "Cohort 2024";
    (CohortModel.findById as jest.Mock).mockResolvedValue({ _id: cohortId, name: cohortName });
    const setMock = jest.fn().mockReturnThis();
    const saveMock = jest.fn();
    (ClasseModel.findById as jest.Mock).mockResolvedValue({
      _id: classeId,
      set: setMock,
      save: saveMock,
    });

    await addCohortToClasse(classeCohortMapped, cohortId, importKey, ClasseImportType.NEXT_CLASSE_COHORT);
    expect(updateSpy).toHaveBeenCalled();
    expect(processSpy).not.toHaveBeenCalled();
    updateSpy.mockRestore();
    processSpy.mockRestore();
  });
});

describe("addCohortToClasseByCohortSnuId", () => {
  const classeId = "1";
  const cohortSnuId = "101";
  const importKey = ClasseCohortImportKey.SEPT_2024;
  const classeCohortMapped: ClasseCohortMapped = {
    cohortCode: cohortSnuId,
    classeId: classeId,
    classeTotalSeats: 42,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("should add a cohort to a classe successfully", async () => {
    const cohortId = "201";
    (findCohortBySnuIdOrThrow as jest.Mock).mockResolvedValue({ _id: cohortId });
    jest.spyOn(classeImportService, "addCohortToClasse").mockResolvedValueOnce({
      updatedClasse: {
        _id: classeId,
        cohort: "Cohort 101",
        cohortId: cohortId,
      } as ClasseDocument,
      updatedFields: ["cohort", "cohortId", "status", "totalSeats"],
    });

    await addCohortToClasseByCohortSnuId(classeCohortMapped, importKey, ClasseImportType.NEXT_CLASSE_COHORT);

    expect(findCohortBySnuIdOrThrow).toHaveBeenCalledWith(cohortSnuId);
    expect(classeImportService.addCohortToClasse).toHaveBeenCalledWith(classeCohortMapped, cohortId, importKey, ClasseImportType.NEXT_CLASSE_COHORT);
  });

  it("should throw an error if the cohortSnuId is undefined", async () => {
    const classeCohortMapped: ClasseCohortMapped = {
      cohortCode: undefined,
      classeId: classeId,
      classeTotalSeats: 1,
    };
    await expect(addCohortToClasseByCohortSnuId(classeCohortMapped, importKey, ClasseImportType.NEXT_CLASSE_COHORT)).rejects.toThrow(FUNCTIONAL_ERRORS.NO_COHORT_CODE_PROVIDED);
  });
});

describe("updateYoungsCohorts", () => {
  const classeId = new mongoose.Types.ObjectId().toString();
  const cohortId = new mongoose.Types.ObjectId().toString();
  const cohortName = "Cohort 2024";
  const importKey = ClasseCohortImportKey.SEPT_2024;
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

    await updateYoungsCohorts(classeId, cohortMock, importKey);

    expect(YoungModel.find).toHaveBeenCalledWith({ classeId });
    expect(youngMock.set).toHaveBeenCalledWith({
      cohort: cohortName,
      cohortId: cohortId,
      originalCohort: "Original Cohort Name",
      originalCohortId: "originalCohortId",
      cohortChangeReason: "Import SI-SNU",
    });
    expect(youngMock.save).toHaveBeenCalledWith({
      fromUser: { firstName: `IMPORT_CLASSE_COHORT_${importKey}` },
    });
  });

  it("should not throw an error if no youngs are found", async () => {
    (YoungModel.find as jest.Mock).mockResolvedValue([]);

    await expect(updateYoungsCohorts(classeId, cohortMock, importKey)).resolves.not.toThrow();

    expect(YoungModel.find).toHaveBeenCalledWith({ classeId });
  });
});

describe("updateClasseForNextCohortOrPdrAndCenter", () => {
  const classeId = new mongoose.Types.ObjectId().toString();
  const cohortId = new mongoose.Types.ObjectId().toString();
  const importKey = ClasseCohortImportKey.SEPT_2024;
  const setMock = jest.fn().mockReturnThis();
  let classeMock;
  let cohortMock;
  let updatedFields: string[];
  let classeCohortMapped: ClasseCohortMapped;
  beforeEach(() => {
    classeMock = {
      cohortId: cohortId,
      set: setMock,
    };
    cohortMock = {
      _id: cohortId,
      name: "New Cohort",
    };
    classeCohortMapped = {
      cohortCode: cohortId,
      classeId: classeId,
      classeTotalSeats: 1,
    };

    updatedFields = [];
  });

  it("should add a cohort to a classe successfully", async () => {
    await updateClasseForNextCohortOrPdrAndCenter(classeMock as any, cohortMock as any, classeCohortMapped, importKey, updatedFields);
    expect(setMock).toHaveBeenCalledWith({ cohortId: cohortMock._id, cohort: cohortMock.name, totalSeats: 1 });
    expect(updatedFields).toEqual(["cohortId", "cohort", "totalSeats"]);
  });

  it("should add a cohort to a classe successfully and change status if status is VERIFIED", async () => {
    classeMock.status = STATUS_CLASSE.VERIFIED;
    await updateClasseForNextCohortOrPdrAndCenter(classeMock as any, cohortMock as any, classeCohortMapped, importKey, updatedFields);
    expect(setMock).toHaveBeenCalledWith({ status: STATUS_CLASSE.ASSIGNED });
    expect(setMock).toHaveBeenCalledWith({ cohortId: cohortMock._id, cohort: cohortMock.name, totalSeats: 1 });
    expect(updatedFields).toEqual(["cohortId", "cohort", "totalSeats", "status"]);
  });
  it("should call updateYoungsCohorts if cohort change", async () => {
    const updateYoungsCohortsSpy = jest.spyOn(classeImportService, "updateYoungsCohorts").mockImplementation(jest.fn());

    classeMock.cohortId = "oldCohortId";
    await updateClasseForNextCohortOrPdrAndCenter(classeMock as any, cohortMock as any, classeCohortMapped, importKey, updatedFields);
    expect(setMock).toHaveBeenCalledWith({ cohortId: cohortMock._id, cohort: cohortMock.name, totalSeats: 1 });
    expect(updatedFields).toEqual(["cohortId", "cohort", "totalSeats", "youngsCohorts"]);
    expect(updateYoungsCohortsSpy).toHaveBeenCalled();
    updateYoungsCohortsSpy.mockRestore();
  });
});

describe("processSessionPhasePdrAndCenter", () => {
  const classeId = new mongoose.Types.ObjectId().toString();
  const cohortId = new mongoose.Types.ObjectId().toString();
  const centerId = new mongoose.Types.ObjectId().toString();
  const pdrId = new mongoose.Types.ObjectId().toString();
  const sessionId = new mongoose.Types.ObjectId().toString();
  const cohesionCenterMock = { _id: centerId, matricule: "Center 001" };
  const pdrMock = { _id: pdrId, matricule: "PDR 001" };
  const sessionMock = { _id: sessionId, sejourSnuId: "Session 001" };
  let classeMock;
  let updatedFields: string[];
  let classeCohortMapped: ClasseCohortMapped;
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  beforeEach(() => {
    const setMock = jest.fn().mockImplementation((update) => {
      Object.assign(classeMock, update);
    });
    classeMock = {
      cohortId: cohortId,
      set: setMock,
    };
    classeCohortMapped = {
      cohortCode: cohortId,
      classeId: classeId,
      classeTotalSeats: 1,
      centerCode: "Center 001",
      pdrCode: "PDR 001",
      sessionCode: "Session 001",
    };

    updatedFields = [];
  });

  it("should update classe with cohesionCenterId, pointDeRassemblementId, sessionId and statusPhase1", async () => {
    (CohesionCenterModel.findOne as jest.Mock).mockResolvedValue(cohesionCenterMock);
    (PointDeRassemblementModel.findOne as jest.Mock).mockResolvedValue(pdrMock);
    (SessionPhase1Model.findOne as jest.Mock).mockResolvedValue(sessionMock);

    await processSessionPhasePdrAndCenter(classeCohortMapped, classeMock as any, updatedFields);

    expect(SessionPhase1Model.findOne).toHaveBeenCalledWith({ sejourSnuId: classeCohortMapped.sessionCode });
    expect(classeMock.set).toHaveBeenNthCalledWith(1, { sessionId: sessionMock._id });

    expect(CohesionCenterModel.findOne).toHaveBeenCalledWith({ matricule: classeCohortMapped.centerCode });
    expect(classeMock.set).toHaveBeenNthCalledWith(2, { cohesionCenterId: cohesionCenterMock._id });

    expect(PointDeRassemblementModel.findOne).toHaveBeenCalledWith({ matricule: classeCohortMapped.pdrCode });
    expect(classeMock.set).toHaveBeenNthCalledWith(3, { pointDeRassemblementId: pdrMock._id });

    expect(classeMock.set).toHaveBeenNthCalledWith(4, { statusPhase1: STATUS_PHASE1_CLASSE.AFFECTED });
    expect(updatedFields).toEqual(["sessionId", "cohesionCenterId", "pointDeRassemblementId", "statusPhase1"]);
  });

  it("should update classe with sessionId and NOT statusPhase1", async () => {
    (SessionPhase1Model.findOne as jest.Mock).mockResolvedValue(sessionMock);
    classeCohortMapped.centerCode = undefined;
    classeCohortMapped.pdrCode = undefined;

    await processSessionPhasePdrAndCenter(classeCohortMapped, classeMock as any, updatedFields);

    expect(SessionPhase1Model.findOne).toHaveBeenCalledWith({ sejourSnuId: classeCohortMapped.sessionCode });
    expect(classeMock.set).toHaveBeenCalledWith({ sessionId: sessionMock._id });

    expect(CohesionCenterModel.findOne).toHaveBeenCalledTimes(0);
    expect(PointDeRassemblementModel.findOne).toHaveBeenCalledTimes(0);

    expect(classeMock.set).not.toHaveBeenCalledWith({ statusPhase1: STATUS_PHASE1_CLASSE.AFFECTED });
    expect(updatedFields).toEqual(["sessionId"]);
  });

  it("should update classe with cohesionCenterId and pdrId and NOT statusPhase1", async () => {
    (SessionPhase1Model.findOne as jest.Mock).mockResolvedValue(sessionMock);
    (CohesionCenterModel.findOne as jest.Mock).mockResolvedValue(cohesionCenterMock);
    (PointDeRassemblementModel.findOne as jest.Mock).mockResolvedValue(pdrMock);
    classeCohortMapped.sessionCode = undefined;

    await processSessionPhasePdrAndCenter(classeCohortMapped, classeMock as any, updatedFields);

    expect(SessionPhase1Model.findOne).toHaveBeenCalledTimes(0);
    expect(CohesionCenterModel.findOne).toHaveBeenCalledWith({ matricule: classeCohortMapped.centerCode });
    expect(classeMock.set).toHaveBeenNthCalledWith(1, { cohesionCenterId: cohesionCenterMock._id });

    expect(PointDeRassemblementModel.findOne).toHaveBeenCalledWith({ matricule: classeCohortMapped.pdrCode });
    expect(classeMock.set).toHaveBeenNthCalledWith(2, { pointDeRassemblementId: pdrMock._id });

    expect(classeMock.set).not.toHaveBeenCalledWith({ statusPhase1: STATUS_PHASE1_CLASSE.AFFECTED });
    expect(updatedFields).toEqual(["cohesionCenterId", "pointDeRassemblementId"]);
  });

  it("should throw an error if sessionCode is provided and session is not found", async () => {
    (SessionPhase1Model.findOne as jest.Mock).mockResolvedValue(null);

    await expect(processSessionPhasePdrAndCenter(classeCohortMapped, classeMock as any, updatedFields)).rejects.toThrow(ERRORS.SESSION_NOT_FOUND);
  });

  it("should throw an error if centerCode is provided and cohesion center is not found", async () => {
    (SessionPhase1Model.findOne as jest.Mock).mockResolvedValue(sessionMock);
    (CohesionCenterModel.findOne as jest.Mock).mockResolvedValue(null);

    await expect(processSessionPhasePdrAndCenter(classeCohortMapped, classeMock as any, updatedFields)).rejects.toThrow(ERRORS.COHESION_CENTER_NOT_FOUND);
  });

  it("should throw an error if pdrCode is provided adn PDR is not found", async () => {
    (SessionPhase1Model.findOne as jest.Mock).mockResolvedValue(sessionMock);
    (CohesionCenterModel.findOne as jest.Mock).mockResolvedValue(cohesionCenterMock);
    (PointDeRassemblementModel.findOne as jest.Mock).mockResolvedValue(null);

    await expect(processSessionPhasePdrAndCenter(classeCohortMapped, classeMock as any, updatedFields)).rejects.toThrow(ERRORS.PDR_NOT_FOUND);
  });
});
