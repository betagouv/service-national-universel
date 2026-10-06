import { Types } from "mongoose";
const ObjectId = Types.ObjectId;

import { STATUS_CLASSE, EtablissementType } from "snu-lib";

import { ClasseModel, CohortModel, YoungModel } from "../../models";

import { buildUniqueClasseKey } from "./classeService";

import ClasseStateManager from "./stateManager";

describe("ClasseStateManager.compute function", () => {
  const _id = new ObjectId().toString();
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    } as any);
    jest.spyOn(CohortModel, "findOne").mockResolvedValueOnce(mockedCohort);

    const computedClasse = await ClasseStateManager.compute(_id, fromUser, options);

    expect(mockedClasse.set).toHaveBeenCalledWith({ seatsTaken: 1 });
    expect(mockedClasse.save).toHaveBeenCalledWith({ fromUser });
  });

  it("should transition class to STATUS_CLASSE.OPEN when inscription open AND it not full", async () => {
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
    } as any);
    jest.spyOn(CohortModel, "findOne").mockResolvedValueOnce(mockedCohort);

    const computedClasse = await ClasseStateManager.compute(_id, fromUser, options);

    expect(patchedClasse.set).toHaveBeenCalledWith({ seatsTaken: 0 });
    expect(patchedClasse.set).toHaveBeenCalledWith({ status: STATUS_CLASSE.OPEN });
    expect(patchedClasse.save).toHaveBeenCalledWith({ fromUser });
  });

  it("should NOT transition class to STATUS_CLASSE.OPEN when it's full even if inscription is open", async () => {
    const patchedClasse = {
      ...mockedClasse,
      status: STATUS_CLASSE.CLOSED,
      totalSeats: 1,
    };

    const now = new Date();
    const oneDayBefore = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const oneDayAfter = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const mockedCohort = {
      name: "Example Cohort",
      inscriptionStartDate: oneDayBefore,
      inscriptionEndDate: oneDayAfter,
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

    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(patchedClasse);
    jest.spyOn(YoungModel, "find").mockReturnValueOnce({
      lean: jest.fn().mockResolvedValue(patchedYoungs),
    } as any);
    jest.spyOn(CohortModel, "findOne").mockResolvedValueOnce(mockedCohort);

    const computedClasse = await ClasseStateManager.compute(_id, fromUser, options);

    expect(mockedClasse.set).toHaveBeenCalledWith({ seatsTaken: 1 });
    expect(patchedClasse.set).not.toHaveBeenCalledWith({ status: STATUS_CLASSE.OPEN });
  });

  it("should transition class to STATUS_CLASSE.CLOSED when it's full even if inscription is open", async () => {
    const patchedClasse = {
      ...mockedClasse,
      status: STATUS_CLASSE.OPEN,
      totalSeats: 1,
    };

    const now = new Date();
    const oneDayBefore = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const oneDayAfter = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const mockedCohort = {
      name: "Example Cohort",
      inscriptionStartDate: oneDayBefore,
      inscriptionEndDate: oneDayAfter,
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

    jest.spyOn(ClasseModel, "findById").mockResolvedValueOnce(patchedClasse);
    jest.spyOn(YoungModel, "find").mockReturnValueOnce({
      lean: jest.fn().mockResolvedValue(patchedYoungs),
    } as any);
    jest.spyOn(CohortModel, "findOne").mockResolvedValueOnce(mockedCohort);

    const computedClasse = await ClasseStateManager.compute(_id, fromUser, options);

    expect(mockedClasse.set).toHaveBeenCalledWith({ seatsTaken: 1 });
    expect(mockedClasse.set).toHaveBeenCalledWith({ status: STATUS_CLASSE.CLOSED });
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
    } as any);
    jest.spyOn(CohortModel, "findOne").mockResolvedValueOnce(mockedCohort);

    const computedClasse = await ClasseStateManager.compute(_id, fromUser, options);

    expect(patchedClasse.set).toHaveBeenCalledWith({ seatsTaken: 0 });
    expect(patchedClasse.set).toHaveBeenCalledWith({ status: STATUS_CLASSE.CLOSED });
    expect(patchedClasse.save).toHaveBeenCalledWith({ fromUser });
  });
});

describe("buildUniqueClasseKey", () => {
  it("should return the correct unique classe Key", () => {
    const etablissement = {
      region: "Île-de-France",
      zip: "75001",
      academy: "Paris",
    } as EtablissementType;
    const expectedKey = "C-IDFP075";

    expect(buildUniqueClasseKey(etablissement)).toEqual(expectedKey);
  });
});
