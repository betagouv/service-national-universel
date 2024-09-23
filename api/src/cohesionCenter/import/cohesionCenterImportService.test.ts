import { CohesionCenterDocument, CohesionCenterModel } from "../../models";
import { processCentersByMatriculeFound, processCenterWithId, processCenterWithoutId, updateCenter } from "./cohesionCenterImportService";

jest.mock("../../models");
jest.mock("../../logger");
jest.mock("../../services/fileService");
jest.mock("../../utils");
jest.mock("./cohesionCenterImportMapper");

jest.mock("../../models", () => {
  return {
    CohesionCenterModel: {
      findById: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      set: jest.fn(),
    },
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("cohesionCenterImportService", () => {
  describe("processCenterWithId", () => {
    it("should update the center if it exists", async () => {
      const center = { _id: "123", name: "Test Center", matricule: "12345" };
      const existingCenter = { _id: "123", name: "Old Center", matricule: "12345", save: jest.fn(), set: jest.fn() };
      const findByIdSpy = jest.spyOn(CohesionCenterModel, "findById").mockResolvedValue(existingCenter);
      const result = await processCenterWithId(center);
      expect(result.action).toBe("updated");
      expect(existingCenter.save).toHaveBeenCalled();
      expect(findByIdSpy).toHaveBeenCalledWith("123");
    });

    it("should return an error if the center does not exist", async () => {
      const center = { _id: "123", name: "Test Center", matricule: "12345" };
      const findByIdSpy = jest.spyOn(CohesionCenterModel, "findById").mockResolvedValue(null);
      const result = await processCenterWithId(center);
      expect(result.action).toBe("error");
      expect(findByIdSpy).toHaveBeenCalledWith("123");
    });
  });

  describe("processCenterWithoutId", () => {
    it("should update the center if one is found by matricule", async () => {
      const center = { name: "Test Center", matricule: "12345" };
      const foundCenter = { _id: "123", name: "Old Center", matricule: "12345", save: jest.fn(), set: jest.fn() };
      const findSpy = jest.spyOn(CohesionCenterModel, "find").mockResolvedValue([foundCenter]);
      const result = await processCenterWithoutId(center);
      expect(result.action).toBe("updated");
      expect(foundCenter.save).toHaveBeenCalled();
      expect(findSpy).toHaveBeenCalledWith({ matricule: "12345" });
    });

    it("should return an error if multiple centers are found by matricule", async () => {
      const center = { name: "Test Center", matricule: "12345" };
      const foundCenters = [
        { _id: "123", name: "Old Center 1", matricule: "12345" },
        { _id: "456", name: "Old Center 2", matricule: "12345" },
      ];
      const findSpy = jest.spyOn(CohesionCenterModel, "find").mockResolvedValue(foundCenters);
      const result = await processCenterWithoutId(center);
      expect(result.action).toBe("nothing");
      expect(findSpy).toHaveBeenCalledWith({ matricule: "12345" });
    });

    it("should create a new center if none are found by matricule", async () => {
      const center = { name: "Test Center", matricule: "12345" };
      const findSpy = jest.spyOn(CohesionCenterModel, "find").mockResolvedValue([]);
      const createdCenter = { _id: "123", name: "Test Center", matricule: "12345", save: jest.fn() };
      // @ts-ignore
      const createSpy = jest.spyOn(CohesionCenterModel, "create").mockResolvedValue(createdCenter);
      const result = await processCenterWithoutId(center);
      expect(result.action).toBe("created");
      expect(createdCenter.save).toHaveBeenCalled();
      expect(findSpy).toHaveBeenCalledWith({ matricule: "12345" });
      expect(createSpy).toHaveBeenCalledWith(center);
    });
  });

  describe("updateCenter", () => {
    it("should update the center", async () => {
      const center = { name: "Test Center", matricule: "12345" };
      const foundCenter = { _id: "123", name: "Old Center", matricule: "12345", save: jest.fn(), set: jest.fn() } as unknown as CohesionCenterDocument;
      const result = await updateCenter(center, foundCenter, "");
      expect(result.action).toBe("updated");
      expect(foundCenter.save).toHaveBeenCalled();
      expect(foundCenter.set).toHaveBeenCalledWith(center);
    });
  });

  describe("processCentersByMatriculeFound", () => {
    it("should return an error if multiple centers are found by matricule", async () => {
      const center = { name: "Test Center", matricule: "12345" };
      const foundCenters = [
        { _id: "123", name: "Old Center 1", matricule: "12345" },
        { _id: "456", name: "Old Center 2", matricule: "12345" },
      ] as unknown as CohesionCenterDocument[];
      const result = await processCentersByMatriculeFound(center, foundCenters);
      expect(result.action).toBe("nothing");
      expect(result.comment).toBe("No Id provided in CSV, several centers found by matricule");
    });
  });
});
