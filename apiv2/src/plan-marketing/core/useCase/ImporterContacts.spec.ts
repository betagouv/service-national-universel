import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { ImporterContacts } from "./ImporterContacts";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { ListeDiffusionGateway } from "../gateway/ListeDiffusion.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { TaskName, TaskStatus } from "snu-lib";

describe("ImporterContacts", () => {
    let useCase: ImporterContacts;
    let planMarketingGateway: jest.Mocked<PlanMarketingGateway>;
    let taskGateway: jest.Mocked<TaskGateway>;
    let campagneGateway: jest.Mocked<CampagneGateway>;
    let listeDiffusionGateway: jest.Mocked<ListeDiffusionGateway>;
    let configService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                ImporterContacts,
                {
                    provide: PlanMarketingGateway,
                    useValue: {
                        importerContacts: jest.fn(),
                    },
                },
                {
                    provide: TaskGateway,
                    useValue: {
                        create: jest.fn(),
                    },
                },
                {
                    provide: CampagneGateway,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: ListeDiffusionGateway,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get(ImporterContacts);
        planMarketingGateway = module.get(PlanMarketingGateway);
        taskGateway = module.get(TaskGateway);
        campagneGateway = module.get(CampagneGateway);
        listeDiffusionGateway = module.get(ListeDiffusionGateway);
        configService = module.get(ConfigService);
    });

    it("should successfully import contacts and create task", async () => {
        const mockCampagne = {
            id: "campaign-1",
            listeDiffusionId: "liste-1",
        };
        const mockListeDiffusion = {
            id: "liste-1",
            nom: "Test Liste",
        };
        const mockProcessId = "process-123";

        campagneGateway.findById.mockResolvedValue(mockCampagne as any);
        listeDiffusionGateway.findById.mockResolvedValue(mockListeDiffusion as any);
        planMarketingGateway.importerContacts.mockResolvedValue(mockProcessId as any);
        configService.get.mockImplementation((key) => {
            switch (key) {
                case "marketing.folderId":
                    return "folder-123";
                case "urls.apiv2":
                    return "http://api.test";
                default:
                    return null;
            }
        });

        await useCase.execute("campaign-1", 456, "contacts-data");

        expect(planMarketingGateway.importerContacts).toHaveBeenCalledWith(
            "Test Liste",
            "contacts-data",
            "folder-123",
            "http://api.test/plan-marketing/import/webhook",
        );

        expect(taskGateway.create).toHaveBeenCalledWith({
            name: TaskName.PLAN_MARKETING_IMPORT_CONTACTS_ET_CREER_LISTE_PUIS_ENVOYER_CAMPAGNE,
            status: TaskStatus.PENDING,
            metadata: {
                parameters: {
                    processId: mockProcessId,
                    nomListe: "Test Liste",
                    campagneId: "campaign-1",
                    campagneProviderId: "456",
                },
            },
        });
    });

    it("should throw when campaign is not found", async () => {
        campagneGateway.findById.mockResolvedValue(null);

        await expect(useCase.execute("nonexistent-id", 456, "contacts")).rejects.toThrow(
            new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND),
        );

        expect(planMarketingGateway.importerContacts).not.toHaveBeenCalled();
        expect(taskGateway.create).not.toHaveBeenCalled();
    });
});
