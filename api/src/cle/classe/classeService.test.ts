import { buildUniqueClasseId, buildUniqueClasseKey, deleteClasse, getEstimatedSeatsByEtablissement } from "./classeService";
const youngService = require("../../young/young.service");
const classService = require("./classeService");

const findYoungsByClasseIdSpy = jest.spyOn(youngService, "findYoungsByClasseId");
const generateConvocationsForMultipleYoungsSpy = jest.spyOn(youngService, "generateConvocationsForMultipleYoungs");

import ClasseStateManager from "./stateManager";
const ClasseModel = require("../../models/cle/classe");
const CohortModel = require("../../models/cohort");
import YoungModel from "../../models/young";
const { ObjectId } = require("mongoose").Types;

import { ROLES, LIMIT_DATE_ESTIMATED_SEATS, LIMIT_DATE_TOTAL_SEATS, STATUS_CLASSE, isNowBetweenDates, canEditEstimatedSeats, canEditTotalSeats } from "snu-lib";
import { EtablissementDocument, IEtablissement } from "../../models/cle/etablissementType";
import { CleClasseModel } from "../../models";

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

describe("ClasseStateManager.withdraw function", () => {
  const classId = new ObjectId();
  const fromUser = { userId: "user123" };
  const options = { YoungModel: YoungModel }; // Mocked YoungModel

  const saveMock = jest.fn().mockImplementation(() => {
    return { status: "WITHDRAWN" }; // Simulating the saved state after withdrawal
  });

  const saveStudentMock = jest.fn().mockImplementation(() => {
    return { status: "ABANDONED" }; // Simulating the saved state after updating student status
  });

  it("should throw an error if YoungModel is not provided", async () => {
    await expect(ClasseStateManager.withdraw(classId, fromUser, {})).rejects.toThrow("YoungModel is required");
  });

  it("should throw an error if class is not found", async () => {
    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(null);

    await expect(ClasseStateManager.withdraw(classId, fromUser, options)).rejects.toThrow("Classe not found");
  });

  it("should throw an error if class is already withdrawn", async () => {
    const mockedClasse = {
      _id: classId,
      status: "WITHDRAWN",
    };

    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(mockedClasse);

    await expect(ClasseStateManager.withdraw(classId, fromUser, options)).rejects.toThrow("Classe already withdrawn");
  });

  it("should withdraw a class and update the status of associated students", async () => {
    const mockedClasse = {
      _id: classId,
      status: "IN_PROGRESS", // Assuming the class is in progress
      save: saveMock,
      set: jest.fn(function (data) {
        Object.assign(this, data);
      }),
    };

    const mockedYoungs = [
      {
        _id: "student1",
        status: "IN_PROGRESS", // Assuming student is in progress
        save: saveStudentMock,
        set: jest.fn(function (data) {
          Object.assign(this, data);
        }),
      },
      {
        _id: "student2",
        status: "WAITING_CORRECTION", // Assuming student is waiting for correction
        save: saveStudentMock,
        set: jest.fn(function (data) {
          Object.assign(this, data);
        }),
      },
      // Add more mocked students as needed
    ];

    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(mockedClasse);
    jest.spyOn(YoungModel, "find").mockResolvedValueOnce(mockedYoungs);

    const withdrawnClasse = await ClasseStateManager.withdraw(classId, fromUser, options);

    // Assert that classe status is updated to withdrawn
    expect(saveMock).toHaveBeenCalledWith({ fromUser });
    // Assert that each student's status is updated to abandoned
    mockedYoungs.forEach((mockedYoung) => {
      expect(mockedYoung.set).toHaveBeenCalledWith({
        status: "ABANDONED",
        lastStatusAt: expect.any(Number),
        withdrawnMessage: "classe désistée",
        withdrawnReason: "other",
      });
      expect(mockedYoung.save).toHaveBeenCalledWith({ fromUser });
    });
    // Assert the returned classe object
    expect(withdrawnClasse.status).toEqual("WITHDRAWN");
  });
});

describe("deleteClasse function", () => {
  const classId = new ObjectId();
  const mockedFromUser = { userId: "user123" };

  const saveMock = jest.fn().mockImplementation(() => {
    return { deletedAt: Date.now() };
  });

  const saveStudentMock = jest.fn().mockImplementation(() => {
    return { status: "ABANDONNED" };
  });

  it("should throw an error if class is not found", async () => {
    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(null);

    await expect(deleteClasse(classId, mockedFromUser)).rejects.toThrow("Classe not found");
  });

  it("should throw an error if class is already deleted", async () => {
    const mockedClasse = {
      _id: classId,
      deletedAt: Date.now(),
      cohesionCenterId: null,
      sessionId: null,
      ligneId: null,
    };

    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(mockedClasse);

    await expect(deleteClasse(classId, mockedFromUser)).rejects.toThrow("Classe already deleted");
  });

  it("should throw an error if class is already linked to a cohesion center", async () => {
    const mockedClasse = {
      _id: classId,
      deletedAt: null,
      cohesionCenterId: new ObjectId(), // Assuming cohesionCenterId is set
      sessionId: null,
      ligneId: null,
    };

    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(mockedClasse);

    await expect(deleteClasse(classId, mockedFromUser)).rejects.toThrow("Classe already linked to a cohesion center");
  });

  it("should throw an error if class is already linked to a session", async () => {
    const mockedClasse = {
      _id: classId,
      deletedAt: null,
      cohesionCenterId: null,
      sessionId: new ObjectId(), // Assuming sessionId is set
      ligneId: null,
    };

    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(mockedClasse);

    await expect(deleteClasse(classId, mockedFromUser)).rejects.toThrow("Classe already linked to a session");
  });

  it("should throw an error if class is already linked to a bus line", async () => {
    const mockedClasse = {
      _id: classId,
      deletedAt: null,
      cohesionCenterId: null,
      sessionId: null,
      ligneId: new ObjectId(), // Assuming ligneId is set
    };

    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(mockedClasse);

    await expect(deleteClasse(classId, mockedFromUser)).rejects.toThrow("Classe already linked to a bus line");
  });

  it("should throw an error if there are validated students", async () => {
    const mockedClasse = {
      _id: classId,
      deletedAt: null,
      cohesionCenterId: null,
      sessionId: null,
      ligneId: null,
      save: saveMock,
      set: jest.fn(function (data) {
        Object.assign(this, data);
      }),
    };
    const mockedYoungs = [
      {
        _id: "student1",
        status: "VALIDATED",
        save: saveStudentMock,
        set: jest.fn(function (data) {
          Object.assign(this, data);
        }),
      },
      {
        _id: "student2",
        status: "IN_PROGRESS",
        save: saveStudentMock,
        set: jest.fn(function (data) {
          Object.assign(this, data);
        }),
      },
    ];

    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(mockedClasse);
    jest.spyOn(YoungModel, "find").mockResolvedValueOnce(mockedYoungs);

    await expect(deleteClasse(classId, mockedFromUser)).rejects.toThrow("Classe has validated students");

    expect(mockedClasse.set).not.toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();
    expect(saveStudentMock).not.toHaveBeenCalled();
  });

  it("should delete a classe and update the status of associated students", async () => {
    const mockedClasse = {
      _id: classId,
      deletedAt: null,
      cohesionCenterId: null,
      sessionId: null,
      ligneId: null,
      save: saveMock,
      set: jest.fn(function (data) {
        Object.assign(this, data);
      }),
    };
    const mockedYoungs = [
      {
        _id: "student2",
        status: "IN_PROGRESS",
        save: saveStudentMock,
        set: jest.fn(function (data) {
          Object.assign(this, data);
        }),
      },
    ];

    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(mockedClasse);
    jest.spyOn(YoungModel, "find").mockResolvedValueOnce(mockedYoungs);

    const deletedClasse = await deleteClasse(classId, mockedFromUser);

    expect(mockedClasse.set).toHaveBeenCalledWith({ deletedAt: expect.any(Number) });
    expect(saveMock).toHaveBeenCalled();
    expect(saveStudentMock).toHaveBeenCalled();
    mockedYoungs.forEach((mockedYoung) => {
      expect(mockedYoung.set).toHaveBeenCalledWith({
        lastStatusAt: expect.any(Number),
        status: "ABANDONED", // Update the expected status value
        withdrawnMessage: "classe supprimée",
        withdrawnReason: "other",
      });
    });
    expect(deletedClasse.deletedAt).toBeDefined();
  });
});

describe("canEditEstimatedSeats", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });
  it("should return true if user is ADMIN", () => {
    const user = { role: ROLES.ADMIN };
    expect(canEditEstimatedSeats(user)).toBe(true);
  });

  it("should return true if user is ADMINISTRATEUR_CLE, and date is before LIMIT_DATE_ESTIMATED_SEATS", () => {
    const user = { role: ROLES.ADMINISTRATEUR_CLE };
    jest.setSystemTime(new Date(LIMIT_DATE_ESTIMATED_SEATS.getTime() - 24 * 60 * 60 * 1000));
    expect(canEditEstimatedSeats(user)).toBe(true);
  });

  it("should return false if user is ADMINISTRATEUR_CLE and date is after LIMIT_DATE_ESTIMATED_SEATS", () => {
    const user = { role: ROLES.ADMINISTRATEUR_CLE };
    jest.setSystemTime(new Date(LIMIT_DATE_ESTIMATED_SEATS.getTime() + 24 * 60 * 60 * 1000));
    expect(canEditEstimatedSeats(user)).toBe(false);
  });
  it("should return false if user is not ADMIN or ADMINISTRATEUR_CLE", () => {
    const user = { role: ROLES.RESPONSIBLE };
    expect(canEditEstimatedSeats(user)).toBe(false);
  });
});

describe("canEditTotalSeats", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should return false if user is ADMIN and date is before LIMIT_DATES_ESTIMATED_SEATS", () => {
    const user = { role: ROLES.ADMIN };
    jest.setSystemTime(new Date(LIMIT_DATE_ESTIMATED_SEATS.getTime() - 24 * 60 * 60 * 1000));
    expect(canEditTotalSeats(user)).toBe(false);
  });

  it("should return true if user is ADMIN and date is after LIMIT_DATES_ESTIMATED_SEATS", () => {
    const user = { role: ROLES.ADMIN };
    jest.setSystemTime(new Date(LIMIT_DATE_ESTIMATED_SEATS.getTime() + 24 * 60 * 60 * 1000));
    expect(canEditTotalSeats(user)).toBe(true);
  });

  it("should return true if user is ADMINISTRATEUR_CLE or REFERENT_CLASSE and date is between LIMIT_DATE_ESTIMATED_SEATS and LIMIT_DATE_TOTAL_SEATS", () => {
    const user1 = { role: ROLES.ADMINISTRATEUR_CLE };
    const user2 = { role: ROLES.REFERENT_CLASSE };
    const middleDate = new Date(LIMIT_DATE_ESTIMATED_SEATS.getTime() + (LIMIT_DATE_TOTAL_SEATS.getTime() - LIMIT_DATE_ESTIMATED_SEATS.getTime()) / 2);
    jest.setSystemTime(middleDate);

    const limitDatesEstimatedSeats = new Date(LIMIT_DATE_ESTIMATED_SEATS).toISOString();
    const limitDatesTotalSeats = new Date(LIMIT_DATE_TOTAL_SEATS).toISOString();

    expect(isNowBetweenDates(limitDatesEstimatedSeats, limitDatesTotalSeats)).toBe(true);
    expect(canEditTotalSeats(user1)).toBe(true);
    expect(canEditTotalSeats(user2)).toBe(true);
  });

  it("should return false if user is ADMINISTRATEUR_CLE or REFERENT_CLASSE and date is after LIMIT_DATE_TOTAL_SEATS", () => {
    const user1 = { role: ROLES.ADMINISTRATEUR_CLE };
    const user2 = { role: ROLES.REFERENT_CLASSE };
    jest.setSystemTime(new Date(LIMIT_DATE_TOTAL_SEATS.getTime() + 24 * 60 * 60 * 1000));
    expect(canEditTotalSeats(user1)).toBe(false);
    expect(canEditTotalSeats(user2)).toBe(false);
  });

  it("should return false if user is ADMINISTRATEUR_CLE or REFERENT_CLASSE and date is before LIMIT_DATE_ESTIMATED_SEATS", () => {
    const user1 = { role: ROLES.ADMINISTRATEUR_CLE };
    const user2 = { role: ROLES.REFERENT_CLASSE };
    jest.setSystemTime(new Date(LIMIT_DATE_ESTIMATED_SEATS.getTime() - 24 * 60 * 60 * 1000));
    expect(canEditTotalSeats(user1)).toBe(false);
    expect(canEditTotalSeats(user2)).toBe(false);
  });

  it("should return false if user is not ADMIN, ADMINISTRATEUR_CLE, or REFERENT_CLASSE", () => {
    const user = { role: ROLES.RESPONSIBLE };
    expect(canEditTotalSeats(user)).toBe(false);
  });
});

describe("ClasseStateManager.compute function", () => {
  const _id = new ObjectId();
  const fromUser = { userId: "user123" };
  const options = { YoungModel: YoungModel };
  const saveStudentMock = jest.fn();
  const mockedClasse = {
    _id,
    status: STATUS_CLASSE.CREATED,
    save: jest.fn(),
    set: jest.fn(),
    cohort: "CLE Juin 2024",
    seatsTaken: 0,
    totalSeats: 20,
  };
  const mockedYoungs = [
    {
      _id: "student1",
      status: "IN_PROGRESS",
      save: saveStudentMock,
      set: jest.fn(function (data) {
        Object.assign(this, data);
      }),
    },
  ];

  jest.mock("../../emails", () => ({
    emit: jest.fn(),
  }));

  it("should throw an error if YoungModel is not provided", async () => {
    await expect(ClasseStateManager.compute(_id, fromUser, {})).rejects.toThrow("YoungModel is required");
  });

  it("should throw an error if class is not found", async () => {
    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(null);

    await expect(ClasseStateManager.compute(_id, fromUser, options)).rejects.toThrow("Classe not found");
  });
  it("should throw an error if cohort is not found", async () => {
    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(mockedClasse);
    jest.spyOn(CohortModel, "findOne").mockResolvedValueOnce(null);

    await expect(ClasseStateManager.compute(_id, fromUser, options)).rejects.toThrow("Cohort not found");
  });

  it("should set classe.seatsTaken if a young is VALIDATED", async () => {
    const mockedCohort = {
      name: "Example Cohort",
      inscriptionStartDate: new Date(),
      inscriptionEndDate: new Date(),
    };

    const patchedYoungs = [
      {
        _id: "student1",
        status: "VALIDATED",
        save: saveStudentMock,
        set: jest.fn(function (data) {
          Object.assign(this, data);
        }),
      },
    ];

    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(mockedClasse);
    jest.spyOn(YoungModel, "find").mockReturnValueOnce({
      lean: jest.fn().mockResolvedValue(patchedYoungs),
    });
    jest.spyOn(CohortModel, "findOne").mockResolvedValueOnce(mockedCohort);

    const computedClasse = await ClasseStateManager.compute(_id, fromUser, options);

    expect(mockedClasse.set).toHaveBeenCalledWith({ seatsTaken: 1 });
    expect(mockedClasse.save).toHaveBeenCalledWith({ fromUser });
  });

  it("should transition class to STATUS_CLASSE.OPEN when inscription open", async () => {
    const patchedClasse = {
      ...mockedClasse,
      status: STATUS_CLASSE.ASSIGNED,
    };

    const now = new Date();
    const oneDayBefore = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const oneDayAfter = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const mockedCohort = {
      name: "Example Cohort",
      inscriptionStartDate: oneDayBefore,
      inscriptionEndDate: oneDayAfter,
    };

    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(patchedClasse);
    jest.spyOn(YoungModel, "find").mockReturnValueOnce({
      lean: jest.fn().mockResolvedValue(mockedYoungs),
    });
    jest.spyOn(CohortModel, "findOne").mockResolvedValueOnce(mockedCohort);

    const computedClasse = await ClasseStateManager.compute(_id, fromUser, options);

    expect(patchedClasse.set).toHaveBeenCalledWith({ seatsTaken: 0 });
    expect(patchedClasse.set).toHaveBeenCalledWith({ status: STATUS_CLASSE.OPEN });
    expect(patchedClasse.save).toHaveBeenCalledWith({ fromUser });
  });

  it("should transition class to STATUS_CLASSE.CLOSED when inscription close", async () => {
    const patchedClasse = {
      ...mockedClasse,
      status: STATUS_CLASSE.OPEN,
    };

    const now = new Date();
    const oneDayBefore = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const twoDaysBefore = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);

    const mockedCohort = {
      name: "Example Cohort",
      inscriptionStartDate: twoDaysBefore,
      inscriptionEndDate: oneDayBefore,
    };

    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(patchedClasse);
    jest.spyOn(YoungModel, "find").mockReturnValueOnce({
      lean: jest.fn().mockResolvedValue(mockedYoungs),
    });
    jest.spyOn(CohortModel, "findOne").mockResolvedValueOnce(mockedCohort);

    const computedClasse = await ClasseStateManager.compute(_id, fromUser, options);

    expect(patchedClasse.set).toHaveBeenCalledWith({ seatsTaken: 0 });
    expect(patchedClasse.set).toHaveBeenCalledWith({ status: STATUS_CLASSE.CLOSED });
    expect(patchedClasse.save).toHaveBeenCalledWith({ fromUser });
  });
});
describe("buildUniqueClasseId and key", () => {
  it("should return the correct unique classe ID", () => {
    const classe = {
      name: "une classe",
      coloration: "SPORT",
      estimatedSeats: 22,
    };
    const etablissement: IEtablissement = {
      uai: "UN_UAI",
    } as IEtablissement;
    const expectedId = "52FD6A";

    expect(buildUniqueClasseId(etablissement, classe)).toEqual(expectedId);
  });

  it("should return the correct unique classe Key", () => {
    const etablissement = {
      region: "Île-de-France",
      zip: "75001",
      academy: "Paris",
    } as IEtablissement;
    const expectedKey = "C-IDFP075";

    expect(buildUniqueClasseKey(etablissement)).toEqual(expectedKey);
  });

  it("should handle missing inputs gracefully and return NO_UID", () => {
    const classe = { name: "", coloration: undefined, department: "Maine et Loire", estimatedSeats: 22 };
    const expectedId = "NO_UID";

    expect(buildUniqueClasseId({} as IEtablissement, classe)).toEqual(expectedId);
  });
});

describe("getEffectifPrevisionnelByEtablissement", () => {
  it("should return the sum of estimatedSeats for all classes of the given etablissement", async () => {
    const mockEtablissement = { _id: "mockEtablissementId" } as EtablissementDocument;
    const mockClasses = [{ estimatedSeats: 10 }, { estimatedSeats: 20 }, { estimatedSeats: 30 }];
    const expectedResult = 60;

    CleClasseModel.find = jest.fn().mockResolvedValue(mockClasses);

    const result = await getEstimatedSeatsByEtablissement(mockEtablissement);

    expect(result).toEqual(expectedResult);
    expect(CleClasseModel.find).toHaveBeenCalledWith({ etablissementId: mockEtablissement._id });
  });
});
