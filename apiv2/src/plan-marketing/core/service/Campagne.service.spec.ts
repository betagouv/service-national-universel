import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CampagneService } from "./Campagne.service";
import { Logger } from "@nestjs/common";
import { CampagneModel } from "@plan-marketing/core/Campagne.model";

describe("CampagneService", () => {
    let service: CampagneService;
    let mockCampagneGateway: any;
    let mockPlanMarketingGateway: any;
    let mockProgrammationService: any;
    let mockSessionGateway: any;
    let loggerSpy: jest.SpyInstance;

    beforeEach(() => {
        mockCampagneGateway = {
            save: jest.fn(),
            update: jest.fn(),
            search: jest.fn(),
        };
        mockPlanMarketingGateway = {
            findTemplateById: jest.fn(),
        };
        mockProgrammationService = {
            computeDateEnvoi: jest.fn(),
        };
        mockSessionGateway = {
            findById: jest.fn(),
        };

        service = new CampagneService(
            mockCampagneGateway,
            mockPlanMarketingGateway,
            mockProgrammationService,
            mockSessionGateway,
        );

        loggerSpy = jest.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        loggerSpy.mockRestore();
    });

    it("should create a campaign successfully", async () => {
        const mockCampagne = { templateId: "TEMPLATE-001" };
        const mockTemplate = { id: "TEMPLATE-001" };

        mockPlanMarketingGateway.findTemplateById.mockResolvedValue(mockTemplate);
        mockCampagneGateway.save.mockResolvedValue(mockCampagne);

        const result = await service.creerCampagne(mockCampagne as any);

        expect(mockPlanMarketingGateway.findTemplateById).toHaveBeenCalledWith("TEMPLATE-001");
        expect(mockCampagneGateway.save).toHaveBeenCalledWith(mockCampagne);
        expect(result).toEqual(mockCampagne);
    });

    it("should throw an error if template is not found when creating a campaign", async () => {
        const mockCampagne = { templateId: "TEMPLATE-NOT-FOUND" };

        mockPlanMarketingGateway.findTemplateById.mockResolvedValue(null);

        await expect(service.creerCampagne(mockCampagne as any)).rejects.toThrow(
            new FunctionalException(FunctionalExceptionCode.TEMPLATE_NOT_FOUND),
        );

        expect(mockPlanMarketingGateway.findTemplateById).toHaveBeenCalledWith("TEMPLATE-NOT-FOUND");
        expect(mockCampagneGateway.save).not.toHaveBeenCalled();
    });

    it("should update a campaign successfully", async () => {
        const mockCampagne = { templateId: "TEMPLATE-001" };
        const mockTemplate = { id: "TEMPLATE-001" };

        mockPlanMarketingGateway.findTemplateById.mockResolvedValue(mockTemplate);
        mockCampagneGateway.update.mockResolvedValue(mockCampagne);

        const result = await service.updateCampagne(mockCampagne as any);

        expect(mockPlanMarketingGateway.findTemplateById).toHaveBeenCalledWith("TEMPLATE-001");
        expect(mockCampagneGateway.update).toHaveBeenCalledWith(mockCampagne);
        expect(result).toEqual(mockCampagne);
    });

    it("should throw an error if template is not found when updating a campaign", async () => {
        const mockCampagne = { templateId: "TEMPLATE-NOT-FOUND" };

        mockPlanMarketingGateway.findTemplateById.mockResolvedValue(null);

        await expect(service.updateCampagne(mockCampagne as any)).rejects.toThrow(
            new FunctionalException(FunctionalExceptionCode.TEMPLATE_NOT_FOUND),
        );

        expect(mockPlanMarketingGateway.findTemplateById).toHaveBeenCalledWith("TEMPLATE-NOT-FOUND");
        expect(mockCampagneGateway.update).not.toHaveBeenCalled();
    });

    describe("findActivesCampagnesWithProgrammationBetweenDatesBySessionId", () => {
        const sessionId = "SESSION-001";
        const startDate = new Date("2023-01-01");
        const endDate = new Date("2023-01-31");
        const sessionDates = {
            dateStart: new Date("2023-01-15"),
            dateEnd: new Date("2023-01-30"),
            inscriptionStartDate: new Date("2022-12-01"),
            inscriptionEndDate: new Date("2022-12-31"),
            instructionEndDate: new Date("2022-12-15"),
            inscriptionModificationEndDate: new Date("2022-12-20"),
            validationDate: new Date("2023-01-10"),
        };

        it("should find campaigns with programmations within date range", async () => {
            const mockCampagnes = [
                {
                    id: "CAMP-001",
                    cohortId: sessionId,
                    generic: false,
                    programmations: [{ id: "PROG-001", envoiDate: new Date("2023-01-15") }],
                },
            ];
            const processedCampagne = {
                ...mockCampagnes[0],
                programmations: [{ id: "PROG-001", envoiDate: new Date("2023-01-15") }],
            };

            mockCampagneGateway.search.mockResolvedValue(mockCampagnes);
            mockSessionGateway.findById.mockResolvedValue(sessionDates);
            mockProgrammationService.computeDateEnvoi.mockReturnValue(processedCampagne);

            const result = await service.findActivesCampagnesWithProgrammationBetweenDatesBySessionId(
                startDate,
                endDate,
                sessionId,
                mockCampagnes as CampagneModel[],
            );

            expect(mockSessionGateway.findById).toHaveBeenCalledWith(sessionId);
            expect(mockProgrammationService.computeDateEnvoi).toHaveBeenCalledWith(mockCampagnes[0], {
                dateStart: sessionDates.dateStart,
                dateEnd: sessionDates.dateEnd,
                inscriptionStartDate: sessionDates.inscriptionStartDate,
                inscriptionEndDate: sessionDates.inscriptionEndDate,
                inscriptionModificationEndDate: sessionDates.inscriptionModificationEndDate,
                instructionEndDate: sessionDates.instructionEndDate,
                validationDate: sessionDates.validationDate,
            });
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(processedCampagne);
        });

        it("should not return campaigns with programmations outside date range", async () => {
            const mockCampagnes = [
                {
                    id: "CAMP-001",
                    cohortId: sessionId,
                    generic: false,
                    programmations: [{ id: "PROG-001", envoiDate: new Date("2022-12-15") }],
                },
            ];
            const processedCampagne = {
                ...mockCampagnes[0],
                programmations: [{ id: "PROG-001", envoiDate: new Date("2022-12-15") }],
            };

            mockCampagneGateway.search.mockResolvedValue(mockCampagnes);
            mockSessionGateway.findById.mockResolvedValue(sessionDates);
            mockProgrammationService.computeDateEnvoi.mockReturnValue(processedCampagne);

            const result = await service.findActivesCampagnesWithProgrammationBetweenDatesBySessionId(
                startDate,
                endDate,
                sessionId,
                mockCampagnes as CampagneModel[],
            );

            expect(result).toHaveLength(0);
        });

        it("should filter out campaigns without programmations", async () => {
            const mockCampagnes = [
                {
                    id: "CAMP-001",
                    cohortId: sessionId,
                    generic: false,
                    // No programmations array
                },
            ];

            mockCampagneGateway.search.mockResolvedValue(mockCampagnes);
            mockSessionGateway.findById.mockResolvedValue(sessionDates);
            // computeDateEnvoi won't be called for this campaign

            const result = await service.findActivesCampagnesWithProgrammationBetweenDatesBySessionId(
                startDate,
                endDate,
                sessionId,
                mockCampagnes as CampagneModel[],
            );

            expect(result).toHaveLength(0);
            expect(mockProgrammationService.computeDateEnvoi).not.toHaveBeenCalled();
        });

        it("should filter out generic campaigns", async () => {
            const mockCampagnes = [
                {
                    id: "CAMP-001",
                    cohortId: sessionId,
                    generic: true,
                    programmations: [{ id: "PROG-001", envoiDate: new Date("2023-01-15") }],
                },
            ];

            mockCampagneGateway.search.mockResolvedValue(mockCampagnes);
            mockSessionGateway.findById.mockResolvedValue(sessionDates);
            // computeDateEnvoi won't be called for generic campaigns

            const result = await service.findActivesCampagnesWithProgrammationBetweenDatesBySessionId(
                startDate,
                endDate,
                sessionId,
                mockCampagnes as CampagneModel[],
            );

            expect(result).toHaveLength(0);
            expect(mockProgrammationService.computeDateEnvoi).not.toHaveBeenCalled();
        });

        it("should handle programmations at date range boundaries", async () => {
            const mockCampagnes = [
                {
                    id: "CAMP-001",
                    cohortId: sessionId,
                    generic: false,
                    programmations: [
                        { id: "PROG-001", envoiDate: new Date("2023-01-01") }, // Exactly at start date
                        { id: "PROG-002", envoiDate: new Date("2023-01-31") }, // Exactly at end date
                    ],
                },
            ];
            const processedCampagne = {
                ...mockCampagnes[0],
                programmations: [
                    { id: "PROG-001", envoiDate: new Date("2023-01-01") },
                    { id: "PROG-002", envoiDate: new Date("2023-01-31") },
                ],
            };

            mockCampagneGateway.search.mockResolvedValue(mockCampagnes);
            mockSessionGateway.findById.mockResolvedValue(sessionDates);
            mockProgrammationService.computeDateEnvoi.mockReturnValue(processedCampagne);

            const result = await service.findActivesCampagnesWithProgrammationBetweenDatesBySessionId(
                startDate,
                endDate,
                sessionId,
                mockCampagnes as CampagneModel[],
            );

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(processedCampagne);
        });

        it("should handle multiple campaigns with mixed programmation dates", async () => {
            const mockCampagnes = [
                {
                    id: "CAMP-001",
                    cohortId: sessionId,
                    generic: false,
                    programmations: [
                        { id: "PROG-001", envoiDate: new Date("2023-01-15") }, // Within range
                    ],
                },
                {
                    id: "CAMP-002",
                    cohortId: sessionId,
                    generic: false,
                    programmations: [
                        { id: "PROG-002", envoiDate: new Date("2022-12-15") }, // Outside range
                    ],
                },
                {
                    id: "CAMP-003",
                    cohortId: sessionId,
                    generic: false,
                    programmations: [
                        { id: "PROG-003", envoiDate: new Date("2022-12-15") }, // Outside range
                        { id: "PROG-004", envoiDate: new Date("2023-01-20") }, // Within range
                    ],
                },
            ];

            const processedCampagnes = [
                {
                    ...mockCampagnes[0],
                    programmations: [{ id: "PROG-001", envoiDate: new Date("2023-01-15") }],
                },
                {
                    ...mockCampagnes[1],
                    programmations: [{ id: "PROG-002", envoiDate: new Date("2022-12-15") }],
                },
                {
                    ...mockCampagnes[2],
                    programmations: [
                        { id: "PROG-003", envoiDate: new Date("2022-12-15") },
                        { id: "PROG-004", envoiDate: new Date("2023-01-20") },
                    ],
                },
            ];

            mockCampagneGateway.search.mockResolvedValue(mockCampagnes);
            mockSessionGateway.findById.mockResolvedValue(sessionDates);

            mockProgrammationService.computeDateEnvoi
                .mockReturnValueOnce(processedCampagnes[0])
                .mockReturnValueOnce(processedCampagnes[1])
                .mockReturnValueOnce(processedCampagnes[2]);

            const result = await service.findActivesCampagnesWithProgrammationBetweenDatesBySessionId(
                startDate,
                endDate,
                sessionId,
                mockCampagnes as CampagneModel[],
            );

            expect(result).toHaveLength(2);
            expect(result).toContainEqual(processedCampagnes[0]);
            expect(result).toContainEqual(processedCampagnes[2]);
            expect(result).not.toContainEqual(processedCampagnes[1]);
        });
    });

    it("should pass isLinkedToGenericCampaign filter to the repository", async () => {
        const mockCampagnes = [{ id: "CAMP-001" }];
        mockCampagneGateway.search.mockResolvedValue(mockCampagnes);

        const filter = { isLinkedToGenericCampaign: true };
        const result = await service.search(filter, "ASC");

        expect(mockCampagneGateway.search).toHaveBeenCalledWith(
            filter,
            "ASC"
        );
        expect(result).toEqual(mockCampagnes);
    });
});
