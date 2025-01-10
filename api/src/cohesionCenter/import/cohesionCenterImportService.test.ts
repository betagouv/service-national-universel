import fs from "fs";
import { CohesionCenterDocument, CohesionCenterModel } from "../../models";
import { XLSXToCSVBuffer, readCSVBuffer } from "../../services/fileService";
import { uploadFile } from "../../utils";
import { checkColumnHeaders, processCenterWithoutId, processCentersByMatriculeFound, updateCenter, uploadAndConvertFile, xlsxMimetype } from "./cohesionCenterImportService";

jest.mock("../../models");
jest.mock("../../logger");
jest.mock("../../services/fileService");
jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  uploadFile: jest.fn(),
}));
jest.mock("./cohesionCenterImportMapper");
jest.mock("fs", () => ({
  readFileSync: jest.fn(),
}));
jest.mock("../../services/fileService", () => ({
  XLSXToCSVBuffer: jest.fn(),
  readCSVBuffer: jest.fn(),
}));

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
  describe("processCenterWithoutId", () => {
    it("should update the center if one is found by matricule", async () => {
      const center = { name: "Test Center", matricule: "12345" };
      const foundCenter = { _id: "123", name: "Old Center", matricule: "12345", save: jest.fn(), set: jest.fn() };
      const findSpy = jest.spyOn(CohesionCenterModel, "find").mockResolvedValue([foundCenter]);
      const result = await processCenterWithoutId(center);
      expect(result.action).toBe("updated");
      expect(foundCenter.save).toHaveBeenCalled();
      expect(findSpy).toHaveBeenCalledWith({ matricule: "12345", deletedAt: { $exists: false } });
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
      expect(findSpy).toHaveBeenCalledWith({ matricule: "12345", deletedAt: { $exists: false } });
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
      expect(findSpy).toHaveBeenCalledWith({ matricule: "12345", deletedAt: { $exists: false } });
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
      expect(result.comment).toBe("Several centers found by matricule");
    });
  });
  describe("checkColumnHeaders", () => {
    it("should not throw error when all headers are present", () => {
      const fileHeaders = [
        "Matricule du Centre",
        "Désignation du centre",
        "Adresse",
        "Complément adresse",
        "Code postal",
        "Commune",
        "Commentaire interne sur l'enregistrement",
        "Capacité d'accueil Maximale",
        "Acceuil PMR",
        "Avis conforme",
        "Date avis commission hygiène & sécurité",
        "Région académique",
        "Académie",
        "Département",
        "Typologie du centre",
        "Domaine d'activité",
        "Organisme de rattachement",
        "Date début validité de l'enregistrement",
        "Date fin de validité de l'enregistrement",
        "ID temporaire",
      ];

      expect(() => checkColumnHeaders(fileHeaders)).not.toThrow();
    });

    it("should throw error when headers are missing", () => {
      const fileHeaders = ["Matricule du Centre", "Désignation du centre"];

      expect(() => checkColumnHeaders(fileHeaders)).toThrow("Un fichier d'import de centre doit contenir les colonnes suivantes:");
    });
  });
});

describe("uploadAndConvertFile", () => {
  const timestamp = "2024-01-01";
  const filePath = "test.xlsx";

  beforeEach(() => {
    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from("test data"));
    (XLSXToCSVBuffer as jest.Mock).mockReturnValue(Buffer.from("csv data"));
    (readCSVBuffer as jest.Mock).mockResolvedValue([{ data: "test" }]);
  });

  it("should read the file and upload it to the bucket", async () => {
    await uploadAndConvertFile(filePath, timestamp);

    expect(fs.readFileSync).toHaveBeenCalledWith(filePath);
    expect(uploadFile).toHaveBeenCalledWith("file/si-snu/centres/export-2024-01-01/export-si-snu-centres-2024-01-01.xlsx", {
      data: Buffer.from("test data"),
      encoding: "",
      mimetype: xlsxMimetype,
    });
  });

  it("should convert xlsx to csv and return parsed data", async () => {
    const result = await uploadAndConvertFile(filePath, timestamp);

    expect(XLSXToCSVBuffer).toHaveBeenCalledWith(filePath);
    expect(readCSVBuffer).toHaveBeenCalledWith(Buffer.from("csv data"));
    expect(result).toEqual([{ data: "test" }]);
  });
});
