import { PreparerEnvoiCampagne } from "./PreparerEnvoiCampagne";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { CreerListeDiffusion } from "./CreerListeDiffusion";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { ImporterContacts } from "./ImporterContacts";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

describe("PreparerEnvoiCampagne", () => {
    let useCase: PreparerEnvoiCampagne;
    let campagneGateway: jest.Mocked<CampagneGateway>;
    let creerListeDiffusion: jest.Mocked<CreerListeDiffusion>;
    let planMarketingGateway: jest.Mocked<PlanMarketingGateway>;
    let importerContacts: jest.Mocked<ImporterContacts>;

    beforeEach(() => {
        campagneGateway = {
            findById: jest.fn(),
        } as any;

        creerListeDiffusion = {
            execute: jest.fn(),
        } as any;

        planMarketingGateway = {
            deleteOldestListeDiffusion: jest.fn(),
            createCampagne: jest.fn(),
        } as any;

        importerContacts = {
            execute: jest.fn(),
        } as any;

        useCase = new PreparerEnvoiCampagne(
            campagneGateway,
            creerListeDiffusion,
            planMarketingGateway,
            importerContacts,
        );
    });

    it("should successfully prepare campaign sending", async () => {
        const mockCampagne = {
            id: "campaign-1",
            nom: "Test Campaign",
            templateId: "template-1",
            objet: "Test Subject",
            generic: false,
        };

        const mockContacts = ["contact1", "contact2"];
        const mockCampagneFournisseur = { id: "provider-campaign-1" };

        campagneGateway.findById.mockResolvedValue(mockCampagne as any);
        creerListeDiffusion.execute.mockResolvedValue(mockContacts as any);
        planMarketingGateway.createCampagne.mockResolvedValue(mockCampagneFournisseur as any);

        await useCase.execute("campaign-1");

        expect(planMarketingGateway.deleteOldestListeDiffusion).toHaveBeenCalled();
        expect(planMarketingGateway.createCampagne).toHaveBeenCalledWith({
            name: mockCampagne.nom,
            sender: {
                email: "no_reply-mailauto@snu.gouv.fr",
                name: "Service National Universel",
            },
            templateId: mockCampagne.templateId,
            subject: mockCampagne.objet,
        });
        expect(importerContacts.execute).toHaveBeenCalledWith("campaign-1", "provider-campaign-1", mockContacts);
    });

    it("should throw when campaign is not found", async () => {
        campagneGateway.findById.mockResolvedValue(null);

        await expect(useCase.execute("non-existent")).rejects.toThrow(
            new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND),
        );
    });

    it("should throw when campaign is generic", async () => {
        const mockGenericCampagne = {
            id: "campaign-1",
            generic: true,
        };

        campagneGateway.findById.mockResolvedValue(mockGenericCampagne as any);

        await expect(useCase.execute("campaign-1")).rejects.toThrow(
            new FunctionalException(FunctionalExceptionCode.CAMPAIGN_SHOULD_NOT_BE_GENERIC),
        );
    });
});
