import { Test } from "@nestjs/testing";
import { AssocierListeDiffusionToCampagne } from "./AssocierListeDiffusionToCampagne";
import { PlanMarketingGateway } from "./../gateway/PlanMarketing.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

describe("AssocierListeDiffusionToCampagne", () => {
    let useCase: AssocierListeDiffusionToCampagne;
    let planMarketingGateway: jest.Mocked<PlanMarketingGateway>;

    beforeEach(async () => {
        const mocks = {
            planMarketingGateway: {
                updateCampagne: jest.fn(),
            },
        };

        const moduleRef = await Test.createTestingModule({
            providers: [
                AssocierListeDiffusionToCampagne,
                { provide: PlanMarketingGateway, useValue: mocks.planMarketingGateway },
            ],
        }).compile();

        useCase = moduleRef.get<AssocierListeDiffusionToCampagne>(AssocierListeDiffusionToCampagne);
        planMarketingGateway = moduleRef.get(PlanMarketingGateway);
    });

    it("should successfully associate list to campaign", async () => {
        const nomListe = "testList";
        const campagneId = "123";

        planMarketingGateway.updateCampagne.mockResolvedValue(undefined);

        await useCase.execute(nomListe, campagneId);

        expect(planMarketingGateway.updateCampagne).toHaveBeenCalledWith(nomListe, campagneId);
    });

    it("should throw FunctionalException when nomListe is missing", async () => {
        const campagneId = "123";

        await expect(useCase.execute(undefined, campagneId)).rejects.toThrow(
            new FunctionalException(
                FunctionalExceptionCode.CANNOT_ASSOCIATE_LIST_TO_CAMPAIGN,
                "nomListe et campagneId sont obligatoires",
            ),
        );
    });

    it("should throw FunctionalException when campagneId is missing", async () => {
        const nomListe = "testList";

        await expect(useCase.execute(nomListe, undefined)).rejects.toThrow(
            new FunctionalException(
                FunctionalExceptionCode.CANNOT_ASSOCIATE_LIST_TO_CAMPAIGN,
                "nomListe et campagneId sont obligatoires",
            ),
        );
    });
});
