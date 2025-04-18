import { Test } from "@nestjs/testing";
import { MettreAJourActivationProgrammationSpecifique } from "./MettreAJourActivationProgrammationSpecifique";
import { CampagneService } from "../service/Campagne.service";
import { MettreAJourCampagne } from "./MettreAJourCampagne";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CampagneComplete, CampagneModel } from "../Campagne.model";
import { CampagneJeuneType } from "snu-lib";

describe("MettreAJourActivationProgrammationSpecifique", () => {
    let useCase: MettreAJourActivationProgrammationSpecifique;
    let campagneService: jest.Mocked<CampagneService>;
    let mettreAJourCampagne: jest.Mocked<MettreAJourCampagne>;

    const createMockCampaign = (id: string, isGeneric: boolean, isActive: boolean) => {
        if (isGeneric) {
            return {
                id,
                generic: true,
                nom: "Test Generic Campaign",
                objet: "Test Subject",
                templateId: 123,
                listeDiffusionId: "list-123",
                type: CampagneJeuneType.VOLONTAIRE,
                isProgrammationActive: isActive,
            } as CampagneModel;
        }

        return {
            id,
            generic: false,
            nom: "Test Specific Campaign",
            objet: "Test Subject",
            templateId: 123,
            listeDiffusionId: "list-123",
            type: CampagneJeuneType.VOLONTAIRE,
            isProgrammationActive: isActive,
            cohortId: "cohort-123",
        } as CampagneModel;
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                MettreAJourActivationProgrammationSpecifique,
                {
                    provide: CampagneService,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: MettreAJourCampagne,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get(MettreAJourActivationProgrammationSpecifique);
        campagneService = module.get(CampagneService);
        mettreAJourCampagne = module.get(MettreAJourCampagne);
    });

    describe("execute", () => {
        it("should throw an exception when campaign is generic", async () => {
            const campaignId = "campaign-1";
            const mockGenericCampaign = createMockCampaign(campaignId, true, true);

            campagneService.findById.mockResolvedValue(mockGenericCampaign);

            await expect(useCase.execute(campaignId, true)).rejects.toThrow(
                new FunctionalException(FunctionalExceptionCode.CAMPAIGN_SHOULD_NOT_BE_GENERIC),
            );
            expect(campagneService.findById).toHaveBeenCalledWith(campaignId);
            expect(mettreAJourCampagne.execute).not.toHaveBeenCalled();
        });

        it("should return campaign without updating when isProgrammationActive matches current value", async () => {
            const campaignId = "campaign-1";
            const isProgrammationActive = true;
            const mockSpecificCampaign = createMockCampaign(campaignId, false, isProgrammationActive);

            campagneService.findById.mockResolvedValue(mockSpecificCampaign);

            const result = await useCase.execute(campaignId, isProgrammationActive);

            expect(result).toBe(mockSpecificCampaign);
            expect(campagneService.findById).toHaveBeenCalledWith(campaignId);
            expect(mettreAJourCampagne.execute).not.toHaveBeenCalled();
        });

        it("should update campaign when isProgrammationActive doesn't match current value", async () => {
            const campaignId = "campaign-1";
            const currentProgrammationActive = false;
            const newProgrammationActive = true;
            const mockSpecificCampaign = createMockCampaign(campaignId, false, currentProgrammationActive);

            const updatedCampaign = {
                ...mockSpecificCampaign,
                isProgrammationActive: newProgrammationActive,
            };

            campagneService.findById.mockResolvedValue(mockSpecificCampaign);
            mettreAJourCampagne.execute.mockResolvedValue(updatedCampaign);

            const result = await useCase.execute(campaignId, newProgrammationActive);

            expect(result).toBe(updatedCampaign);
            expect(campagneService.findById).toHaveBeenCalledWith(campaignId);
            expect(mettreAJourCampagne.execute).toHaveBeenCalledWith({
                ...mockSpecificCampaign,
                isProgrammationActive: newProgrammationActive,
            });
        });

        it("should handle undefined isProgrammationActive parameter", async () => {
            const campaignId = "campaign-1";
            const currentProgrammationActive = false;
            const mockSpecificCampaign = createMockCampaign(campaignId, false, currentProgrammationActive);

            campagneService.findById.mockResolvedValue(mockSpecificCampaign);

            const result = await useCase.execute(campaignId);

            expect(result).toBe(mockSpecificCampaign);
            expect(campagneService.findById).toHaveBeenCalledWith(campaignId);
            expect(mettreAJourCampagne.execute).not.toHaveBeenCalled();
        });

        it("should update isProgrammationActive from true to false", async () => {
            const campaignId = "campaign-1";
            const currentProgrammationActive = true;
            const newProgrammationActive = false;
            const mockSpecificCampaign = createMockCampaign(campaignId, false, currentProgrammationActive);

            const updatedCampaign = {
                ...mockSpecificCampaign,
                isProgrammationActive: newProgrammationActive,
            };

            campagneService.findById.mockResolvedValue(mockSpecificCampaign);
            mettreAJourCampagne.execute.mockResolvedValue(updatedCampaign);

            const result = await useCase.execute(campaignId, newProgrammationActive);

            expect(result).toBe(updatedCampaign);
            expect(campagneService.findById).toHaveBeenCalledWith(campaignId);
            expect(mettreAJourCampagne.execute).toHaveBeenCalledWith({
                ...mockSpecificCampaign,
                isProgrammationActive: newProgrammationActive,
            });
        });
    });
});
