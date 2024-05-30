import { deleteClasse } from './classe.service';
const youngService = require("../young/young.service");
const classService = require("./classe.service");

const findYoungsByClasseIdSpy = jest.spyOn(youngService, "findYoungsByClasseId");
const generateConvocationsForMultipleYoungsSpy = jest.spyOn(youngService, "generateConvocationsForMultipleYoungs");

const ClasseStateManager = require("../states/models/classe");
const ClasseModel = require("../models/cle/classe");
const YoungModel = require("../models/young");

describe("ClasseService", () => {
  it("should return a pdf", async () => {
    const youngBuffer = Buffer.from("pdf");

    findYoungsByClasseIdSpy.mockReturnValue(Promise.resolve(new Array(50).fill({})));
    generateConvocationsForMultipleYoungsSpy.mockReturnValue(Promise.resolve(youngBuffer));

    const resultPdf = await classService.generateConvocationsByClasseId("classeId");

    expect(findYoungsByClasseIdSpy).toHaveBeenCalledTimes(1);
    expect(generateConvocationsForMultipleYoungsSpy).toHaveBeenCalledTimes(1);
    expect(resultPdf).toEqual(youngBuffer);
  });
});

describe("ClasseStateManager", () => {
  describe("withdraw", () => {
    it("should throw an error if YoungModel is not provided", async () => {
      await expect(ClasseStateManager.withdraw("classId", null, { YoungModel: null })).rejects.toThrow("YoungModel is required");
    });

    it("should throw an error if class is not found", async () => {
      const mockFindById = jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(null);

      await expect(ClasseStateManager.withdraw("classId", {})).rejects.toThrow("Classe not found");

      expect(mockFindById).toHaveBeenCalledWith("classId");
      mockFindById.mockRestore();
    });

    it("should throw an error if class is already withdrawn", async () => {
      const mockFindById = jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce({ status: "withdrawn" });

      await expect(ClasseStateManager.withdraw("classId", {})).rejects.toThrow("Classe already withdrawn");

      expect(mockFindById).toHaveBeenCalledWith("classId");
      mockFindById.mockRestore();
    });

    it("should withdraw the class and update associated students", async () => {
      const classId = "classId";
      const fakeClass = { _id: classId, status: "pending" };
      const fakeStudents = [
        { _id: "studentId1", status: "in_progress" },
        { _id: "studentId2", status: "waiting_correction" },
      ];
      const mockFindById = jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(fakeClass);
      const mockFind = jest.spyOn(YoungModel, "find").mockResolvedValueOnce(fakeStudents);
      const mockSave = jest.spyOn(YoungModel.prototype, "save").mockImplementation(() => Promise.resolve());

      const result = await ClasseStateManager.withdraw(classId, {});

      expect(mockFindById).toHaveBeenCalledWith(classId);
      expect(result._id).toBe(classId);
      expect(result.status).toBe("withdrawn");
      expect(mockFind).toHaveBeenCalledWith({
        classeId: classId,
        status: { $in: ["in_progress", "waiting_correction", "waiting_validation", "validated"] },
      });
      expect(mockSave).toHaveBeenCalledTimes(fakeStudents.length);
      expect(result).toEqual(fakeClass);

      mockFindById.mockRestore();
      mockFind.mockRestore();
      mockSave.mockRestore();
    });
  });
});

describe("deleteClasse function", () => {
  it("should delete a classe and update the status of associated students", async () => {
    const mockedClasse = { 
      _id: "classId",
      deletedAt: null,
      cohesionCenterId: null,
      sessionId: null,
      ligneId: null,
    };

    const mockedStudents = [
      { _id: "student1", status: "validated" },
      { _id: "student2", status: "in_progress" },
    ];

    const mockedFromUser = { userId: "user123" };

    const findByIdMock = jest.fn().mockResolvedValueOnce(mockedClasse);
    const findMock = jest.fn().mockResolvedValueOnce(mockedStudents);
    const saveMock = jest.fn().mockImplementation((fromUser) => {
      return { ...mockedClasse, deletedAt: Date.now() };
    });

    const saveStudentMock = jest.fn().mockImplementation((fromUser) => {
      return { ...mockedStudents[0], status: "abandoned" };
    });

    jest.mock("../models/cle/classe", () => ({
      findById: findByIdMock,
    }));

    jest.mock("../models/young", () => ({
      find: findMock,
    }));

    const deletedClasse = await deleteClasse("classId", mockedFromUser);

    expect(findByIdMock).toHaveBeenCalledTimes(1);
    expect(findByIdMock).toHaveBeenCalledWith("classId");

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith({
      classeId: "classId",
      status: {
        $in: ["in_progress", "waiting_correction", "waiting_validation", "validated"]
      }
    });

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith(mockedFromUser);

    expect(saveStudentMock).toHaveBeenCalledTimes(2);
    expect(saveStudentMock).toHaveBeenCalledWith(mockedFromUser);

    // Additional assertions if necessary
    expect(deletedClasse.deletedAt).toBeTruthy();
  });
});