import { Test, TestingModule } from "@nestjs/testing";
import { ImporterClasses } from "./ImporterClasses";
import { FileGateway } from "@shared/core/File.gateway";
import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { SessionGateway } from "@admin/core/sejours/phase1/session/Session.gateway";
import { CentreGateway } from "@admin/core/sejours/phase1/centre/Centre.gateway";
import { PointDeRassemblementGateway } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.gateway";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { ClsService } from "nestjs-cls";
import { TaskStatus } from "snu-lib";
import { ClasseModel } from "@admin/core/sejours/cle/classe/Classe.model";
import { SessionMode } from "aws-sdk/clients/s3";
import { SessionModel } from "@admin/core/sejours/phase1/session/Session.model";
import { JeuneModel } from "@admin/core/sejours/jeune/Jeune.model";
import { ReferentielImportTaskParameters } from "../../routes/ReferentielImportTask.model";

describe("ImporterClasses", () => {
    let useCase: ImporterClasses;
    let fileGateway: jest.Mocked<FileGateway>;
    let classeGateway: jest.Mocked<ClasseGateway>;
    let sessionGateway: jest.Mocked<SessionGateway>;
    let jeuneGateway: jest.Mocked<JeuneGateway>;
    let clockGateway: jest.Mocked<ClockGateway>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImporterClasses,
                {
                    provide: FileGateway,
                    useValue: {
                        downloadFile: jest.fn(),
                        parseXLS: jest.fn(),
                        generateExcel: jest.fn(),
                        uploadFile: jest.fn(),
                    },
                },
                {
                    provide: ClasseGateway,
                    useValue: { findById: jest.fn() },
                },
                {
                    provide: SessionGateway,
                    useValue: { findBySnuId: jest.fn() },
                },
                {
                    provide: CentreGateway,
                    useValue: {},
                },
                {
                    provide: PointDeRassemblementGateway,
                    useValue: {},
                },
                {
                    provide: JeuneGateway,
                    useValue: {
                        findByClasseId: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: ClockGateway,
                    useValue: { getNowSafeIsoDate: jest.fn() },
                },
                {
                    provide: ClsService,
                    useValue: {},
                },
            ],
        }).compile();

        useCase = module.get<ImporterClasses>(ImporterClasses);
        fileGateway = module.get(FileGateway);
        classeGateway = module.get(ClasseGateway);
        sessionGateway = module.get(SessionGateway);
        jeuneGateway = module.get(JeuneGateway);
        clockGateway = module.get(ClockGateway);
    });

    it("should be defined", () => {
        expect(useCase).toBeDefined();
    });

    it("should process classe import successfully", async () => {
        const mockFileKey = "test-file.xlsx";
        const mockFolderPath = "test-folder";
        const mockTimestamp = "2023-01-01";

        fileGateway.downloadFile.mockResolvedValue({ Body: Buffer.from("test") });
        fileGateway.parseXLS.mockResolvedValue([{ classeId: "123", sessionCode: "S1" }]);
        classeGateway.findById.mockResolvedValue({ id: "123", sessionId: "old-session" } as ClasseModel);
        sessionGateway.findBySnuId.mockResolvedValue({ id: "new-session", nom: "Session 1" } as SessionModel);
        jeuneGateway.findByClasseId.mockResolvedValue([
            { id: "Y1", sessionId: "old-session", sessionNom: "Old Session" } as JeuneModel,
        ]);
        clockGateway.getNowSafeIsoDate.mockReturnValue(mockTimestamp);
        fileGateway.generateExcel.mockResolvedValue(Buffer.from("report"));
        fileGateway.uploadFile.mockResolvedValue({ Key: "path/to/uploaded-file.xlsx" } as any);

        const result = await useCase.execute({
            fileKey: mockFileKey,
            folderPath: mockFolderPath,
        } as ReferentielImportTaskParameters);

        expect(result).toBe("path/to/uploaded-file.xlsx");
        expect(jeuneGateway.update).toHaveBeenCalled();
    });

    it("should handle file processing error", async () => {
        fileGateway.downloadFile.mockRejectedValue(new Error("File not found"));
        fileGateway.generateExcel.mockResolvedValue(Buffer.from("error-report"));
        fileGateway.uploadFile.mockResolvedValue({ Key: "error-report.xlsx" } as any);
        clockGateway.getNowSafeIsoDate.mockReturnValue("2023-01-01");

        const result = await useCase.execute({
            fileKey: "invalid-file.xlsx",
            folderPath: "test-folder",
        } as ReferentielImportTaskParameters);

        expect(result).toBe("error-report.xlsx");
    });
});
