import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CampagneService } from "./Campagne.service";

describe("CampagneService", () => {
    let service: CampagneService;
    let mockCampagneGateway: any;
    let mockPlanMarketingGateway: any;

    beforeEach(() => {
        mockCampagneGateway = {
            save: jest.fn(),
            update: jest.fn(),
        };
        mockPlanMarketingGateway = {
            findTemplateById: jest.fn(),
        };

        service = new CampagneService(mockCampagneGateway, mockPlanMarketingGateway);
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
});
