import { Test, TestingModule } from "@nestjs/testing";
import { ReferentielClasseService } from "./ReferentielClasse.service";
import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { ReferentielService } from "../Referentiel.service";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ReferentielTaskType, TaskName, TaskStatus, MIME_TYPES } from "snu-lib";

describe("ReferentielClasseService", () => {
    let service: ReferentielClasseService;
    let fileGateway: jest.Mocked<FileGateway>;
    let taskGateway: jest.Mocked<TaskGateway>;
    let referentielService: jest.Mocked<ReferentielService>;
    let clockGateway: jest.Mocked<ClockGateway>;
    let notificationGateway: jest.Mocked<NotificationGateway>;

    beforeEach(async () => {
        const mockFileGateway = {
            parseXLS: jest.fn(),
            uploadFile: jest.fn(),
            generateExcel: jest.fn(),
        };
        const mockTaskGateway = {
            create: jest.fn(),
        };
        const mockReferentielService = {
            getMissingColumns: jest.fn(),
        };
        const mockClockGateway = {
            getNowSafeIsoDate: jest.fn(),
        };
        const mockNotificationGateway = {
            sendEmail: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReferentielClasseService,
                { provide: FileGateway, useValue: mockFileGateway },
                { provide: TaskGateway, useValue: mockTaskGateway },
                { provide: ReferentielService, useValue: mockReferentielService },
                { provide: ClockGateway, useValue: mockClockGateway },
                { provide: NotificationGateway, useValue: mockNotificationGateway },
            ],
        }).compile();

        service = module.get<ReferentielClasseService>(ReferentielClasseService);
        fileGateway = module.get(FileGateway);
        taskGateway = module.get(TaskGateway);
        referentielService = module.get(ReferentielService);
        clockGateway = module.get(ClockGateway);
        notificationGateway = module.get(NotificationGateway);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("import", () => {
        const mockImportParams = {
            fileName: "test.xlsx",
            buffer: Buffer.from("test"),
            mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            auteur: { email: "test@test.com", nom: "Test", prenom: "User" },
        };

        it("should throw IMPORT_EMPTY_FILE when no data to import", async () => {
            fileGateway.parseXLS.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

            await expect(service.import(mockImportParams)).rejects.toThrow(
                new FunctionalException(FunctionalExceptionCode.IMPORT_EMPTY_FILE),
            );
        });

        it("should create import classes task when only classes to import", async () => {
            const mockTimestamp = "2023-01-01";
            const mockS3Response = { Key: "test-key" };

            fileGateway.parseXLS.mockResolvedValueOnce([{ someData: "test" }]).mockResolvedValueOnce([]);
            referentielService.getMissingColumns.mockReturnValueOnce([]);
            clockGateway.getNowSafeIsoDate.mockReturnValueOnce(mockTimestamp);
            fileGateway.uploadFile.mockResolvedValueOnce(mockS3Response as any);
            taskGateway.create.mockResolvedValueOnce({ id: "task-id" } as any);

            await service.import(mockImportParams);

            expect(taskGateway.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: TaskName.REFERENTIEL_IMPORT,
                    status: TaskStatus.PENDING,
                    metadata: expect.objectContaining({
                        parameters: expect.objectContaining({
                            type: ReferentielTaskType.IMPORT_CLASSES,
                        }),
                    }),
                }),
            );
        });

        it("should create desister classes task when only classes to desist", async () => {
            const mockTimestamp = "2023-01-01";
            const mockS3Response = { Key: "test-key" };

            fileGateway.parseXLS.mockResolvedValueOnce([]).mockResolvedValueOnce([{ someData: "test" }]);
            referentielService.getMissingColumns.mockReturnValueOnce([]);
            clockGateway.getNowSafeIsoDate.mockReturnValueOnce(mockTimestamp);
            fileGateway.uploadFile.mockResolvedValueOnce(mockS3Response as any);
            taskGateway.create.mockResolvedValueOnce({ id: "task-id" } as any);

            await service.import(mockImportParams as any);

            expect(taskGateway.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: TaskName.REFERENTIEL_IMPORT,
                    status: TaskStatus.PENDING,
                    metadata: expect.objectContaining({
                        parameters: expect.objectContaining({
                            type: ReferentielTaskType.IMPORT_DESISTER_CLASSES,
                        }),
                    }),
                }),
            );
        });

        it("should create combined import/desister task when both present", async () => {
            const mockTimestamp = "2023-01-01";
            const mockS3Response = { Key: "test-key" };

            fileGateway.parseXLS
                .mockResolvedValueOnce([{ someData: "import" }])
                .mockResolvedValueOnce([{ someData: "desister" }]);

            referentielService.getMissingColumns.mockReturnValueOnce([]).mockReturnValueOnce([]);

            clockGateway.getNowSafeIsoDate.mockReturnValueOnce(mockTimestamp);
            fileGateway.uploadFile.mockResolvedValueOnce(mockS3Response as any);
            taskGateway.create.mockResolvedValueOnce({ id: "task-id" } as any);

            await service.import(mockImportParams);

            expect(taskGateway.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: TaskName.REFERENTIEL_IMPORT,
                    status: TaskStatus.PENDING,
                    metadata: expect.objectContaining({
                        parameters: expect.objectContaining({
                            type: ReferentielTaskType.IMPORT_DESISTER_CLASSES_ET_IMPORTER_CLASSES,
                        }),
                    }),
                }),
            );
        });

        it("should throw when missing columns in desister file", async () => {
            fileGateway.parseXLS.mockResolvedValueOnce([]).mockResolvedValueOnce([{ someData: "test" }]);
            referentielService.getMissingColumns.mockReturnValueOnce(["required_column"]);

            await expect(service.import(mockImportParams)).rejects.toThrow(
                new FunctionalException(FunctionalExceptionCode.IMPORT_MISSING_COLUMN, "required_column"),
            );
        });
    });

    describe("processReport", () => {
        it("should process report and return file key", async () => {
            const mockParams = {
                type: ReferentielTaskType.IMPORT_CLASSES,
                fileName: "test.xlsx",
                fileKey: "original-key",
                fileLineCount: 1,
                folderPath: "test-folder",
                auteur: { email: "test@test.com", nom: "Test", prenom: "User" },
            };
            const mockReport = [{ someData: "test" }];
            const mockTimestamp = "2023-01-01";
            const mockS3Response = { Key: "report-key" };

            fileGateway.generateExcel.mockResolvedValueOnce(Buffer.from("test"));
            clockGateway.getNowSafeIsoDate.mockReturnValueOnce(mockTimestamp);
            fileGateway.uploadFile.mockResolvedValueOnce(mockS3Response as any);

            const result = await service.processReport(mockParams, mockReport);

            expect(result).toBe(mockS3Response.Key);
            expect(notificationGateway.sendEmail).toHaveBeenCalled();
        });
    });
});
