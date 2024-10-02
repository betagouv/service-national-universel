import { addCohortToClasse, addCohortToClasseByCohortSnuId, importClasseCohort } from "./classeImportService";
import * as classeImportService from "./classeImportService";
import { CohortModel, ClasseModel, ClasseDocument } from "../../../models";
import { ERRORS, FUNCTIONAL_ERRORS, STATUS_CLASSE } from "snu-lib";
import mongoose from "mongoose";
import { ClasseCohortImportKey, ClasseCohortMapped } from "./classeCohortImport";
import { getFile } from "../../../utils";
import { readCSVBuffer } from "../../../services/fileService";
import { mapClassesCohortsForSept2024 } from "./classeCohortMapper";
import { findCohortBySnuIdOrThrow } from "../../../cohort/cohortService";

jest.mock("../../../models", () => ({
  CohortModel: { findById: jest.fn() },
  ClasseModel: { findById: jest.fn(), save: jest.fn() },
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
      return new Promise((resolve) => {
        resolve({
          _id: "1",
          cohort: "Cohort 101",
          cohortId: "101",
        } as ClasseDocument);
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
      { result: "success", classeId: "1", cohortCode: "IDF_101", cohortId: "101", cohortName: "Cohort 101" },
      { result: "error", classeId: "2", cohortCode: "IDF_102", error: ERRORS.COHORT_NOT_FOUND },
    ];

    (getFile as jest.Mock).mockResolvedValue({ Body: Buffer.from("some mock data").toString() });
    (readCSVBuffer as jest.Mock).mockResolvedValue(mockCSV);
    (mapClassesCohortsForSept2024 as jest.Mock).mockReturnValue(mappedClassesCohorts);

    const result = await importClasseCohort(filePath, importKey);

    expect(getFile).toHaveBeenCalledWith(filePath);
    expect(readCSVBuffer).toHaveBeenCalledWith(Buffer.from("some mock data"), true);
    expect(mapClassesCohortsForSept2024).toHaveBeenCalledWith(mockCSV);
    expect(addCohortToClasseByCohortSnuId).toHaveBeenCalledTimes(2);
    expect(addCohortToClasseByCohortSnuId).toHaveBeenCalledWith({ classeId: "1", cohortCode: "IDF_101" }, importKey);
    expect(addCohortToClasseByCohortSnuId).toHaveBeenCalledWith({ classeId: "2", cohortCode: "IDF_102" }, importKey);
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
    classeEstimatedSeats: 1,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
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

    await addCohortToClasse(classeCohortMapped, cohortId, importKey);

    expect(CohortModel.findById).toHaveBeenCalledWith(cohortId);
    expect(ClasseModel.findById).toHaveBeenCalledWith(classeId);
    expect(setMock).toHaveBeenCalledWith({ cohortId: cohortId, cohort: cohortName, estimatedSeats: 1, status: STATUS_CLASSE.ASSIGNED });
    expect(saveMock).toHaveBeenCalledWith({ fromUser: { firstName: `IMPORT_CLASSE_COHORT_${importKey}` } });
  });

  it("should throw an error if the cohort is not found", async () => {
    (CohortModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(addCohortToClasse(classeCohortMapped, cohortId, importKey)).rejects.toThrow(ERRORS.COHORT_NOT_FOUND);
  });

  it("should throw an error if the classe is not found", async () => {
    (CohortModel.findById as jest.Mock).mockResolvedValue({ _id: cohortId, name: "Cohort 2024" });
    (ClasseModel.findById as jest.Mock)(null);

    await expect(addCohortToClasse(classeCohortMapped, cohortId, importKey)).rejects.toThrow(ERRORS.CLASSE_NOT_FOUND);
  });
});

describe("addCohortToClasseByCohortSnuId", () => {
  const classeId = "1";
  const cohortSnuId = "101";
  const importKey = ClasseCohortImportKey.SEPT_2024;
  const classeCohortMapped: ClasseCohortMapped = {
    cohortCode: cohortSnuId,
    classeId: classeId,
    classeEstimatedSeats: 42,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("should add a cohort to a classe successfully", async () => {
    const cohortId = "201";
    (findCohortBySnuIdOrThrow as jest.Mock).mockResolvedValue({ _id: cohortId });
    jest.spyOn(classeImportService, "addCohortToClasse").mockResolvedValueOnce({
      _id: classeId,
      cohort: "Cohort 101",
      cohortId: cohortId,
    } as ClasseDocument);

    await addCohortToClasseByCohortSnuId(classeCohortMapped, importKey);

    expect(findCohortBySnuIdOrThrow).toHaveBeenCalledWith(cohortSnuId);
    expect(classeImportService.addCohortToClasse).toHaveBeenCalledWith(classeCohortMapped, cohortId, importKey);
  });

  it("should throw an error if the cohortSnuId is undefined", async () => {
    const classeCohortMapped: ClasseCohortMapped = {
      cohortCode: undefined,
      classeId: classeId,
      classeEstimatedSeats: 1,
    };
    await expect(addCohortToClasseByCohortSnuId(classeCohortMapped, importKey)).rejects.toThrow(FUNCTIONAL_ERRORS.NO_COHORT_CODE_PROVIDED);
  });
});
