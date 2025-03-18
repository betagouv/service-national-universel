import { ImporterClasses } from "./ImporterClasses";
import { ReferentielTaskType, STATUS_CLASSE, STATUS_PHASE1_CLASSE } from "snu-lib";

jest.mock("@nestjs-cls/transactional", () => ({
    Transactional: () => jest.fn(),
}));

describe("ImporterClasses", () => {
    let useCase: ImporterClasses;
    let mockFileGateway: any;
    let mockClasseGateway: any;
    let mockSessionGateway: any;
    let mockCentreGateway: any;
    let mockPdrGateway: any;
    let mockJeuneGateway: any;
    let mockSejourGateway: any;
    let mockReferentielService: any;
    let mockLogger: any;
    beforeEach(() => {
        mockFileGateway = {
            downloadFile: jest.fn(),
            parseXLS: jest.fn(),
            generateExcel: jest.fn(),
            uploadFile: jest.fn(),
        };
        mockClasseGateway = {
            findById: jest.fn(),
            update: jest.fn(),
        };
        mockSessionGateway = {
            findBySnuId: jest.fn(),
        };
        mockCentreGateway = {
            findByMatricule: jest.fn(),
        };
        mockPdrGateway = {
            findByMatricule: jest.fn(),
        };
        mockJeuneGateway = {
            findByClasseId: jest.fn(),
            bulkUpdate: jest.fn(),
        };
        mockSejourGateway = {
            findBySejourSnuId: jest.fn(),
        };
        mockReferentielService = {
            processReport: jest.fn(),
        };
        mockLogger = {
            log: jest.fn(),
            warn: jest.fn(),
        };

        useCase = new ImporterClasses(
            mockFileGateway,
            mockClasseGateway,
            mockSessionGateway,
            mockCentreGateway,
            mockPdrGateway,
            mockJeuneGateway,
            mockSejourGateway,
            mockReferentielService,
            mockLogger,
        );
    });

    it("should successfully import classes", async () => {
        const mockXlsxData = [
            {
                "Session formule": "2024",
                "Identifiant de la classe engagée": "CLASS-001",
                "Effectif de jeunes concernés": 30,
                "Session : Code de la session": "SES001",
                "Désignation du centre": "CENTRE-001",
                "Code point de rassemblement initial": "PDR-001",
            },
        ];

        mockFileGateway.downloadFile.mockResolvedValue({ Body: Buffer.from("") });
        mockFileGateway.parseXLS.mockResolvedValueOnce(mockXlsxData); // import
        mockFileGateway.parseXLS.mockResolvedValueOnce([]); // desist
        mockFileGateway.generateExcel.mockResolvedValue(Buffer.from(""));
        mockFileGateway.uploadFile.mockResolvedValue({ Key: "report.xlsx" });

        mockClasseGateway.findById.mockResolvedValue({
            id: "CLASS-001",
            statut: STATUS_CLASSE.VERIFIED,
        });
        mockSessionGateway.findBySnuId.mockResolvedValue({
            id: "SESSION-001",
            nom: "Session 2024",
        });
        mockSejourGateway.findBySejourSnuId.mockResolvedValue({
            id: "SEJOUR-001",
        });
        mockCentreGateway.findByMatricule.mockResolvedValue({
            id: "CENTRE-001",
        });
        mockPdrGateway.findByMatricule.mockResolvedValue({
            id: "PDR-001",
        });
        mockJeuneGateway.findByClasseId.mockResolvedValue([]);

        const result = await useCase.execute({
            fileKey: "test.xlsx",
            folderPath: "/test",
            auteur: { email: "test@test.com", nom: "Test", prenom: "User" },
            fileName: "",
            fileLineCount: 0,
            type: ReferentielTaskType.IMPORT_CLASSES,
        });

        expect(mockClasseGateway.update).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "CLASS-001",
                statut: STATUS_CLASSE.ASSIGNED,
                sessionId: "SESSION-001",
                sejourId: "SEJOUR-001",
                centreCohesionId: "CENTRE-001",
                pointDeRassemblementId: "PDR-001",
                statutPhase1: STATUS_PHASE1_CLASSE.AFFECTED,
            }),
        );
    });

    it("should handle classe not found error", async () => {
        const mockXlsxData = [
            {
                "Session formule": "2024",
                "Identifiant de la classe engagée": "CLASS-NOT-FOUND",
                "Effectif de jeunes concernés": 30,
            },
        ];

        mockFileGateway.downloadFile.mockResolvedValue({ Body: Buffer.from("") });
        mockFileGateway.parseXLS.mockResolvedValueOnce(mockXlsxData); // import
        mockFileGateway.parseXLS.mockResolvedValueOnce([]); // desist
        mockFileGateway.generateExcel.mockResolvedValue(Buffer.from(""));
        mockFileGateway.uploadFile.mockResolvedValue({ Key: "report.xlsx" });

        mockClasseGateway.findById.mockResolvedValue(null);

        const result = await useCase.execute({
            fileKey: "test.xlsx",
            folderPath: "/test",
            auteur: { email: "test@test.com", nom: "Test", prenom: "User" },
            fileName: "",
            fileLineCount: 0,
            type: ReferentielTaskType.IMPORT_CLASSES,
        });

        expect(mockClasseGateway.update).not.toHaveBeenCalled();
    });

    it("should update young session when classe session changes", async () => {
        const mockXlsxData = [
            {
                "Session formule": "2024",
                "Identifiant de la classe engagée": "CLASS-001",
                "Effectif de jeunes concernés": 30,
                "Session : Code de la session": "SES001",
                "Désignation du centre": "CENTRE-001",
            },
        ];

        mockFileGateway.downloadFile.mockResolvedValue({ Body: Buffer.from("") });
        mockFileGateway.parseXLS.mockResolvedValueOnce(mockXlsxData); // import
        mockFileGateway.parseXLS.mockResolvedValueOnce([]); // desist
        mockFileGateway.generateExcel.mockResolvedValue(Buffer.from(""));
        mockFileGateway.uploadFile.mockResolvedValue({ Key: "report.xlsx" });

        mockClasseGateway.findById.mockResolvedValue({
            id: "CLASS-001",
            sessionId: "OLD-SESSION",
            statut: STATUS_CLASSE.VERIFIED,
        });
        mockSessionGateway.findBySnuId.mockResolvedValue({
            id: "SESSION-001",
            nom: "Session 2024",
        });
        mockSejourGateway.findBySejourSnuId.mockResolvedValue({
            id: "SEJOUR-001",
        });
        mockJeuneGateway.findByClasseId.mockResolvedValue([
            { id: "YOUNG-001", sessionId: "OLD-SESSION", sessionNom: "Old Session" },
        ]);

        await useCase.execute({
            fileKey: "test.xlsx",
            folderPath: "/test",
            auteur: { email: "test@test.com", nom: "Test", prenom: "User" },
            fileName: "",
            fileLineCount: 0,
            type: ReferentielTaskType.IMPORT_CLASSES,
        });

        expect(mockJeuneGateway.bulkUpdate).toHaveBeenCalledWith([
            expect.objectContaining({
                id: "YOUNG-001",
                sessionId: "SESSION-001",
                sessionNom: "Session 2024",
                originalSessionId: "OLD-SESSION",
                originalSessionNom: "Old Session",
                sessionChangeReason: "Import SI-SNU",
            }),
        ]);
    });

    it("should handle duplicate import and desist classe error", async () => {
        const mockXlsxData = [
            {
                "Session formule": "2024",
                "Identifiant de la classe engagée": "class-001",
            },
        ];

        mockFileGateway.downloadFile.mockResolvedValue({ Body: Buffer.from("") });
        mockFileGateway.parseXLS.mockResolvedValueOnce(mockXlsxData); // import
        mockFileGateway.parseXLS.mockResolvedValueOnce(mockXlsxData); // desist
        mockFileGateway.generateExcel.mockResolvedValue(Buffer.from(""));
        mockFileGateway.uploadFile.mockResolvedValue({ Key: "report.xlsx" });

        mockClasseGateway.findById.mockResolvedValue({
            id: "class-001",
        });

        const result = await useCase.execute({
            fileKey: "test.xlsx",
            folderPath: "/test",
            auteur: { email: "test@test.com", nom: "Test", prenom: "User" },
            fileName: "",
            fileLineCount: 0,
            type: ReferentielTaskType.IMPORT_CLASSES,
        });

        expect(result).toEqual([
            {
                classeId: "class-001",
                cohortCode: "2024",
                error: "Classe existe dans les 2 onglets",
                sessionCode: "undefined_undefined",
            },
        ]);
    });
});
