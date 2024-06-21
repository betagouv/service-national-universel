import { buildUniqueClasseId, deleteClasse } from "./classeService";
const youngService = require("../../young/young.service");
const classService = require("./classeService");

const findYoungsByClasseIdSpy = jest.spyOn(youngService, "findYoungsByClasseId");
const generateConvocationsForMultipleYoungsSpy = jest.spyOn(youngService, "generateConvocationsForMultipleYoungs");

const ClasseStateManager = require("../../states/models/classe");
const ClasseModel = require("../../models/cle/classe");
import YoungModel from "../../models/young";
const { ObjectId } = require("mongoose").Types;

import { canEditEstimatedSeats, canEditTotalSeats } from "./classeService";
import { ROLES, SUB_ROLES, LIMIT_DATE_ADMIN_CLE, LIMIT_DATE_REF_CLASSE } from "snu-lib";

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

  it("should return true if user is ADMINISTRATEUR_CLE, subRole is referent_etablissement and date is before LIMIT_DATE_ADMIN_CLE", () => {
    const user = { role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement };
    jest.setSystemTime(new Date(LIMIT_DATE_ADMIN_CLE.getTime() - 24 * 60 * 60 * 1000));
    expect(canEditEstimatedSeats(user)).toBe(true);
  });

  it("should return false if user is ADMINISTRATEUR_CLE, subRole is referent_etablissement and date is after LIMIT_DATE_ADMIN_CLE", () => {
    const user = { role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement };
    jest.setSystemTime(new Date(LIMIT_DATE_ADMIN_CLE.getTime() + 24 * 60 * 60 * 1000));
    expect(canEditEstimatedSeats(user)).toBe(false);
  });

  it("should return false if user is not ADMIN and not ADMINISTRATEUR_CLE with referent_etablissement subRole", () => {
    const user = { role: ROLES.REFERENT_CLASSE, subRole: SUB_ROLES.referent_etablissement };
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
  it("should return true if user is ADMIN", () => {
    const user = { role: ROLES.ADMIN };
    expect(canEditTotalSeats(user)).toBe(true);
  });

  it("should return true if user is ADMINISTRATEUR_CLE or REFERENT_CLASSE and date is before LIMIT_DATE_REF_CLASSE", () => {
    const user1 = { role: ROLES.ADMINISTRATEUR_CLE };
    const user2 = { role: ROLES.REFERENT_CLASSE };
    jest.setSystemTime(new Date(LIMIT_DATE_REF_CLASSE.getTime() - 24 * 60 * 60 * 1000));
    expect(canEditTotalSeats(user1)).toBe(true);
    expect(canEditTotalSeats(user2)).toBe(true);
  });

  it("should return false if user is ADMINISTRATEUR_CLE or REFERENT_CLASSE and date is after LIMIT_DATE_REF_CLASSE", () => {
    const user1 = { role: ROLES.ADMINISTRATEUR_CLE };
    const user2 = { role: ROLES.REFERENT_CLASSE };
    jest.setSystemTime(new Date(LIMIT_DATE_REF_CLASSE.getTime() + 24 * 60 * 60 * 1000));
    expect(canEditTotalSeats(user1)).toBe(false);
    expect(canEditTotalSeats(user2)).toBe(false);
  });

  it("should return false if user is not ADMIN, ADMINISTRATEUR_CLE, or REFERENT_CLASSE", () => {
    const user = { role: ROLES.SOME_OTHER_ROLE };
    expect(canEditTotalSeats(user)).toBe(false);
  });
});

describe("buildUniqueClasseId", () => {
  it("should return the correct unique classe ID", () => {
    const etablissement = {
      region: "Ile-de-France",
      zip: "75001",
      academy: "Paris",
    };
    const classe = {
      name: "une classe",
      coloration: "SPORT",
    };
    const expectedId = "ILEP075-1Y684M";
    expect(buildUniqueClasseId(etablissement, classe)).toEqual(expectedId);
  });

  it("should handle missing inputs gracefully and return NO_UID", () => {
    const etablissement = {
      region: "Ile-de-France",
      zip: "75001",
      academy: "Paris",
    };
    const classe = { name: "", coloration: undefined };
    const expectedId = "ILEP075-NO_UID";
    expect(buildUniqueClasseId(etablissement, classe)).toEqual(expectedId);
  });
});
