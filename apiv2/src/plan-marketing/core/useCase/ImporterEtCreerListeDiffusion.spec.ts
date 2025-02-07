import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { TaskGateway } from "@task/core/Task.gateway";
import { TaskName, TaskStatus } from "snu-lib";
import { ImporterEtCreerListeDiffusion } from "./ImporterEtCreerListeDiffusion";
import { PlanMarketingGateway } from "./../gateway/PlanMarketing.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { FunctionalExceptionCode } from "@shared/core/FunctionalException";

describe("ImporterEtCreerListeDiffusion", () => {
    let useCase: ImporterEtCreerListeDiffusion;
    let planMarketingGateway: jest.Mocked<PlanMarketingGateway>;
    let taskGateway: jest.Mocked<TaskGateway>;
    let fileGateway: jest.Mocked<FileGateway>;
    let configService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
        const mocks = {
            planMarketingGateway: {
                importerContacts: jest.fn(),
                findCampagneById: jest.fn(),
            },
            taskGateway: {
                create: jest.fn(),
            },
            fileGateway: {
                downloadFile: jest.fn(),
            },
            configService: {
                get: jest.fn(),
            },
        };

        const moduleRef = await Test.createTestingModule({
            providers: [
                ImporterEtCreerListeDiffusion,
                { provide: PlanMarketingGateway, useValue: mocks.planMarketingGateway },
                { provide: TaskGateway, useValue: mocks.taskGateway },
                { provide: FileGateway, useValue: mocks.fileGateway },
                { provide: ConfigService, useValue: mocks.configService },
            ],
        }).compile();

        useCase = moduleRef.get<ImporterEtCreerListeDiffusion>(ImporterEtCreerListeDiffusion);
        planMarketingGateway = moduleRef.get(PlanMarketingGateway);
        taskGateway = moduleRef.get(TaskGateway);
        fileGateway = moduleRef.get(FileGateway);
        configService = moduleRef.get(ConfigService);
    });

    it("should successfully import contacts and create task", async () => {
        const nomListe = "testList";
        const campagneId = "123";
        const pathFile = "path/to/file";
        const processId = 42;
        const fileContent = "contact1,contact2";

        configService.get.mockImplementation((key) => {
            if (key === "marketing.folderId") return "folder123";
            if (key === "urls.apiv2") return "http://api.test";
            return null;
        });

        fileGateway.downloadFile.mockResolvedValue({ Body: Buffer.from(fileContent) } as any);
        planMarketingGateway.importerContacts.mockResolvedValue(processId);
        planMarketingGateway.findCampagneById.mockResolvedValue({ id: campagneId });

        await useCase.execute(nomListe, campagneId, pathFile);

        expect(fileGateway.downloadFile).toHaveBeenCalledWith(pathFile);
        expect(planMarketingGateway.importerContacts).toHaveBeenCalledWith(
            nomListe,
            fileContent,
            "folder123",
            "http://api.test/plan-marketing/import/webhook",
        );
        expect(taskGateway.create).toHaveBeenCalledWith({
            name: TaskName.PLAN_MARKETING_IMPORT_CONTACTS_ET_CREER_LISTE,
            status: TaskStatus.PENDING,
            metadata: {
                parameters: {
                    processId,
                    nomListe,
                    campagneId,
                },
            },
        });
    });

    it("should throw FunctionalException when campaign is not found", async () => {
        const nomListe = "testList";
        const campagneId = "123";
        const pathFile = "path/to/file";

        planMarketingGateway.findCampagneById.mockResolvedValue(null);

        await expect(useCase.execute(nomListe, campagneId, pathFile)).rejects.toThrow(
            FunctionalExceptionCode.CAMPAIGN_NOT_FOUND,
        );
        expect(planMarketingGateway.findCampagneById).toHaveBeenCalledWith(campagneId);
        expect(fileGateway.downloadFile).not.toHaveBeenCalled();
        expect(planMarketingGateway.importerContacts).not.toHaveBeenCalled();
        expect(taskGateway.create).not.toHaveBeenCalled();
    });
});
