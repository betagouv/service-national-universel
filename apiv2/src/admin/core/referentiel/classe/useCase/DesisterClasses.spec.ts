import { ReferentielTaskType, STATUS_CLASSE, YOUNG_STATUS } from "snu-lib";
import { DesisterClasses } from "./DesisterClasses";

jest.mock("@nestjs-cls/transactional", () => ({
    Transactional: () => jest.fn(),
}));

describe("DesisterClasses", () => {
    let useCase: DesisterClasses;
    let mockFileGateway: any;
    let mockClasseGateway: any;
    let mockJeuneGateway: any;

    beforeEach(() => {
        mockFileGateway = {
            downloadFile: jest.fn(),
            parseXLS: jest.fn(),
            generateExcel: jest.fn(),
            uploadFile: jest.fn(),
        };
        mockClasseGateway = {
            findById: jest.fn(),
            updateStatut: jest.fn(),
        };
        mockJeuneGateway = {
            findByClasseId: jest.fn(),
            bulkUpdate: jest.fn(),
        };

        useCase = new DesisterClasses(mockFileGateway, mockClasseGateway, mockJeuneGateway);
    });

    it("should successfully process class withdrawal", async () => {
        const mockXlsxData = [
            {
                "Identifiant de la classe engagée": "CLASS-001",
            },
        ];

        const mockClasse = {
            id: "CLASS-001",
            statut: STATUS_CLASSE.ASSIGNED,
        };

        const mockJeunes = [
            { id: "YOUNG-001", statut: YOUNG_STATUS.VALIDATED },
            { id: "YOUNG-002", statut: YOUNG_STATUS.VALIDATED },
        ];

        mockFileGateway.downloadFile.mockResolvedValue({ Body: Buffer.from("") });
        mockFileGateway.parseXLS.mockResolvedValue(mockXlsxData);
        mockClasseGateway.findById.mockResolvedValue(mockClasse);
        mockJeuneGateway.findByClasseId.mockResolvedValue(mockJeunes);
        mockClasseGateway.updateStatut.mockResolvedValue({ ...mockClasse, statut: STATUS_CLASSE.WITHDRAWN });

        const result = await useCase.execute({
            fileKey: "test.xlsx",
            folderPath: "/test",
            auteur: { email: "test@test.com", nom: "Test", prenom: "User" },
            fileName: "test.xlsx",
            fileLineCount: 1,
            type: ReferentielTaskType.IMPORT_DESISTER_CLASSES,
        });

        expect(result[0]).toEqual({
            classeId: "CLASS-001",
            result: "success",
            error: "",
            jeunesDesistesIds: "YOUNG-001,YOUNG-002",
        });
    });

    it("should handle class not found error", async () => {
        const mockXlsxData = [
            {
                "Identifiant de la classe": "CLASS-NOT-FOUND",
                "Motif du désistement": "Raison test",
            },
        ];

        mockFileGateway.downloadFile.mockResolvedValue({ Body: Buffer.from("") });
        mockFileGateway.parseXLS.mockResolvedValue(mockXlsxData);
        mockClasseGateway.findById.mockResolvedValue(null);

        const result = await useCase.execute({
            fileKey: "test.xlsx",
            folderPath: "/test",
            auteur: { email: "test@test.com", nom: "Test", prenom: "User" },
            fileName: "test.xlsx",
            fileLineCount: 1,
            type: ReferentielTaskType.IMPORT_DESISTER_CLASSES,
        });

        expect(result[0]).toEqual({
            result: "error",
            error: "No classe ID found",
            jeunesDesistesIds: "",
        });
    });

    it("should handle invalid file format", async () => {
        mockFileGateway.downloadFile.mockResolvedValue({ Body: Buffer.from("") });
        mockFileGateway.parseXLS.mockRejectedValue(new Error("Invalid file format"));

        await expect(
            useCase.execute({
                fileKey: "test.xlsx",
                folderPath: "/test",
                auteur: { email: "test@test.com", nom: "Test", prenom: "User" },
                fileName: "test.xlsx",
                fileLineCount: 1,
                type: ReferentielTaskType.IMPORT_DESISTER_CLASSES,
            }),
        ).rejects.toThrow("Invalid file format");
    });

    it("should handle empty file content", async () => {
        mockFileGateway.downloadFile.mockResolvedValue({ Body: Buffer.from("") });
        mockFileGateway.parseXLS.mockResolvedValue([]);

        const result = await useCase.execute({
            fileKey: "test.xlsx",
            folderPath: "/test",
            auteur: { email: "test@test.com", nom: "Test", prenom: "User" },
            fileName: "test.xlsx",
            fileLineCount: 0,
            type: ReferentielTaskType.IMPORT_DESISTER_CLASSES,
        });

        expect(result).toEqual([]);
    });

    it("should process multiple classes successfully", async () => {
        const mockXlsxData = [
            { "Identifiant de la classe engagée": "CLASS-001" },
            { "Identifiant de la classe engagée": "CLASS-002" },
        ];

        mockFileGateway.downloadFile.mockResolvedValue({ Body: Buffer.from("") });
        mockFileGateway.parseXLS.mockResolvedValue(mockXlsxData);
        mockClasseGateway.updateStatut.mockImplementation((id) => ({
            id,
            statut: STATUS_CLASSE.WITHDRAWN,
        }));
        mockJeuneGateway.findByClasseId.mockImplementation((id) => [
            { id: `YOUNG-${id}-1`, statut: YOUNG_STATUS.VALIDATED },
            { id: `YOUNG-${id}-2`, statut: YOUNG_STATUS.VALIDATED },
        ]);

        const result = await useCase.execute({
            fileKey: "test.xlsx",
            folderPath: "/test",
            auteur: { email: "test@test.com", nom: "Test", prenom: "User" },
            fileName: "test.xlsx",
            fileLineCount: 2,
            type: ReferentielTaskType.IMPORT_DESISTER_CLASSES,
        });
        expect(result).toHaveLength(2);
        expect(result[0].result).toBe("success");
        expect(result[1].result).toBe("success");
        expect(mockJeuneGateway.bulkUpdate).toHaveBeenCalledTimes(2);
    });

    it("should handle gateway errors gracefully", async () => {
        const mockXlsxData = [{ "Identifiant de la classe engagée": "CLASS-001" }];

        mockFileGateway.downloadFile.mockResolvedValue({ Body: Buffer.from("") });
        mockFileGateway.parseXLS.mockResolvedValue(mockXlsxData);
        mockClasseGateway.updateStatut.mockRejectedValue(new Error("Database error"));

        const result = await useCase.execute({
            fileKey: "test.xlsx",
            folderPath: "/test",
            auteur: { email: "test@test.com", nom: "Test", prenom: "User" },
            fileName: "test.xlsx",
            fileLineCount: 1,
            type: ReferentielTaskType.IMPORT_DESISTER_CLASSES,
        });

        expect(result[0]).toEqual({
            classeId: "class-001",
            error: "Database error",
            result: "error",
            jeunesDesistesIds: "",
        });
    });

    it("should handle jeune update errors", async () => {
        const mockXlsxData = [{ "Identifiant de la classe engagée": "CLASS-001" }];

        mockFileGateway.downloadFile.mockResolvedValue({ Body: Buffer.from("") });
        mockFileGateway.parseXLS.mockResolvedValue(mockXlsxData);
        mockClasseGateway.updateStatut.mockResolvedValue({
            id: "CLASS-001",
            statut: STATUS_CLASSE.WITHDRAWN,
        });
        mockJeuneGateway.findByClasseId.mockResolvedValue([{ id: "YOUNG-001", statut: YOUNG_STATUS.VALIDATED }]);
        mockJeuneGateway.bulkUpdate.mockRejectedValue(new Error("Update failed"));

        const result = await useCase.execute({
            fileKey: "test.xlsx",
            folderPath: "/test",
            auteur: { email: "test@test.com", nom: "Test", prenom: "User" },
            fileName: "test.xlsx",
            fileLineCount: 1,
            type: ReferentielTaskType.IMPORT_DESISTER_CLASSES,
        });

        expect(result[0]).toEqual({
            classeId: "class-001",
            error: "Update failed",
            result: "error",
            jeunesDesistesIds: "",
        });
    });
});
