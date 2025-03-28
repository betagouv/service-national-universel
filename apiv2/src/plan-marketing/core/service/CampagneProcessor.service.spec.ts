import { Test, TestingModule } from "@nestjs/testing";
import { CampagneProcessorService } from "./CampagneProcessor.service";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { ListeDiffusionService } from "./ListeDiffusion.service";
import { SearchYoungGateway } from "src/analytics/core/SearchYoung.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { DestinataireListeDiffusion } from "snu-lib";
import { Logger } from "@nestjs/common";

describe("CampagneProcessorService", () => {
    let service: CampagneProcessorService;
    let mockCampagneGateway: jest.Mocked<CampagneGateway>;
    let mockListeDiffusionService: jest.Mocked<ListeDiffusionService>;
    let mockSearchYoungGateway: jest.Mocked<SearchYoungGateway>;

    beforeEach(async () => {
        // Create mock implementations for all dependencies
        mockCampagneGateway = {
            findById: jest.fn(),
            findSpecifiqueWithRefById: jest.fn(),
        } as unknown as jest.Mocked<CampagneGateway>;

        mockListeDiffusionService = {
            getListeDiffusionById: jest.fn(),
        } as unknown as jest.Mocked<ListeDiffusionService>;

        mockSearchYoungGateway = {
            searchYoung: jest.fn(),
        } as unknown as jest.Mocked<SearchYoungGateway>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CampagneProcessorService,
                { provide: CampagneGateway, useValue: mockCampagneGateway },
                { provide: ListeDiffusionService, useValue: mockListeDiffusionService },
                { provide: SearchYoungGateway, useValue: mockSearchYoungGateway },
                Logger,
            ],
        }).compile();

        service = module.get<CampagneProcessorService>(CampagneProcessorService);
    });

    describe("validateAndProcessCampaign", () => {
        it("should throw an exception when campaign is not found", async () => {
            // Setup
            mockCampagneGateway.findById.mockResolvedValue(null);

            // Execute & Assert
            await expect(service.validateAndProcessCampaign("not-found-id")).rejects.toThrow(
                new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND),
            );
        });

        it("should throw an exception when campaign is generic", async () => {
            // Setup
            const genericCampagne = {
                id: "generic-id",
                generic: true,
            };

            mockCampagneGateway.findById.mockResolvedValue(genericCampagne as any);

            // Execute & Assert
            await expect(service.validateAndProcessCampaign("generic-id")).rejects.toThrow(
                new FunctionalException(FunctionalExceptionCode.CAMPAIGN_SHOULD_NOT_BE_GENERIC),
            );
        });

        it("should process a campaign with a reference to a generic campaign", async () => {
            // Setup
            const campaignId = "campaign-with-ref-id";
            const listeDiffusionId = "liste-diffusion-id";
            const cohortId = "cohort-id";
            const genericCampaignId = "generic-campaign-id";

            const campaignWithRef = {
                id: campaignId,
                generic: false,
                campagneGeneriqueId: genericCampaignId,
                cohortId,
                listeDiffusionId,
            };

            const campaignWithRefDetailed = {
                ...campaignWithRef,
                destinataires: [DestinataireListeDiffusion.JEUNES],
            };

            const listeDiffusion = {
                id: listeDiffusionId,
                filters: {
                    status: ["VALIDATED"],
                },
            };

            const youngsResult = {
                hits: [{ _source: { id: "young1" } }, { _source: { id: "young2" } }],
                total: 2,
            };

            mockCampagneGateway.findById.mockResolvedValue(campaignWithRef as any);
            mockCampagneGateway.findSpecifiqueWithRefById.mockResolvedValue(campaignWithRefDetailed as any);
            mockListeDiffusionService.getListeDiffusionById.mockResolvedValue(listeDiffusion as any);
            mockSearchYoungGateway.searchYoung.mockResolvedValue(youngsResult as any);

            // Execute
            const result = await service.validateAndProcessCampaign(campaignId);

            // Assert
            expect(mockCampagneGateway.findById).toHaveBeenCalledWith(campaignId);
            expect(mockCampagneGateway.findSpecifiqueWithRefById).toHaveBeenCalledWith(campaignId);
            expect(mockListeDiffusionService.getListeDiffusionById).toHaveBeenCalledWith(listeDiffusionId);
            expect(mockSearchYoungGateway.searchYoung).toHaveBeenCalledWith({
                filters: {
                    ...listeDiffusion.filters,
                    cohortId: [cohortId],
                },
                sourceFields: [
                    "email",
                    "firstName",
                    "lastName",
                    "meetingPointId",
                    "ligneId",
                    "cohort",
                    "classeId",
                    "etablissementId",
                    "cohesionCenterId",
                ],
                full: true,
            });

            expect(result).toEqual({
                contactsQuery: {
                    filters: {
                        status: ["VALIDATED"],
                        cohortId: [cohortId],
                    },
                    sourceFields: [
                        "email",
                        "firstName",
                        "lastName",
                        "meetingPointId",
                        "ligneId",
                        "cohort",
                        "classeId",
                        "etablissementId",
                        "cohesionCenterId",
                    ],
                    full: true,
                },
                destinataires: [DestinataireListeDiffusion.JEUNES],
                youngs: youngsResult,
            });
        });

        it("should process a campaign without reference to a generic campaign", async () => {
            // Setup
            const campaignId = "campaign-without-ref-id";
            const listeDiffusionId = "liste-diffusion-id";
            const cohortId = "cohort-id";

            const campaignWithoutRef = {
                id: campaignId,
                generic: false,
                cohortId,
                listeDiffusionId,
                destinataires: [DestinataireListeDiffusion.JEUNES, DestinataireListeDiffusion.REPRESENTANTS_LEGAUX],
            };

            const listeDiffusion = {
                id: listeDiffusionId,
                filters: {
                    status: ["VALIDATED"],
                },
            };

            const youngsResult = {
                hits: [{ _source: { id: "young1" } }, { _source: { id: "young2" } }],
                total: 2,
            };

            mockCampagneGateway.findById.mockResolvedValue(campaignWithoutRef as any);
            mockListeDiffusionService.getListeDiffusionById.mockResolvedValue(listeDiffusion as any);
            mockSearchYoungGateway.searchYoung.mockResolvedValue(youngsResult as any);

            // Execute
            const result = await service.validateAndProcessCampaign(campaignId);

            // Assert
            expect(mockCampagneGateway.findById).toHaveBeenCalledWith(campaignId);
            expect(mockListeDiffusionService.getListeDiffusionById).toHaveBeenCalledWith(listeDiffusionId);
            expect(mockSearchYoungGateway.searchYoung).toHaveBeenCalledWith({
                filters: {
                    ...listeDiffusion.filters,
                    cohortId: [cohortId],
                },
                sourceFields: [
                    "email",
                    "firstName",
                    "lastName",
                    "meetingPointId",
                    "ligneId",
                    "cohort",
                    "classeId",
                    "etablissementId",
                    "cohesionCenterId",
                    "parent1Email",
                    "parent1FirstName",
                    "parent1LastName",
                    "parent2Email",
                    "parent2FirstName",
                    "parent2LastName",
                ],
                full: true,
            });

            expect(result).toEqual({
                contactsQuery: {
                    filters: {
                        status: ["VALIDATED"],
                        cohortId: [cohortId],
                    },
                    sourceFields: [
                        "email",
                        "firstName",
                        "lastName",
                        "meetingPointId",
                        "ligneId",
                        "cohort",
                        "classeId",
                        "etablissementId",
                        "cohesionCenterId",
                        "parent1Email",
                        "parent1FirstName",
                        "parent1LastName",
                        "parent2Email",
                        "parent2FirstName",
                        "parent2LastName",
                    ],
                    full: true,
                },
                destinataires: [DestinataireListeDiffusion.JEUNES, DestinataireListeDiffusion.REPRESENTANTS_LEGAUX],
                youngs: youngsResult,
            });
        });

        it("should throw an exception when liste diffusion is not found", async () => {
            // Setup
            const campaignId = "campaign-without-ref-id";
            const listeDiffusionId = "liste-diffusion-id";
            const cohortId = "cohort-id";

            const campaignWithoutRef = {
                id: campaignId,
                generic: false,
                cohortId,
                listeDiffusionId,
                destinataires: [DestinataireListeDiffusion.JEUNES],
            };

            mockCampagneGateway.findById.mockResolvedValue(campaignWithoutRef as any);
            mockListeDiffusionService.getListeDiffusionById.mockResolvedValue(null as any);

            // Execute & Assert
            await expect(service.validateAndProcessCampaign(campaignId)).rejects.toThrow(
                new FunctionalException(FunctionalExceptionCode.LISTE_DIFFUSION_NOT_FOUND),
            );
        });
    });
});
