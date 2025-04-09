import { Test } from "@nestjs/testing";
import { EnvoyerCampagne } from "./EnvoyerCampagne";
import { AssocierListeDiffusionToCampagne } from "./AssocierListeDiffusionToCampagne";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { EnvoiCampagneStatut } from "snu-lib";

describe("EnvoyerCampagne", () => {
    let useCase: EnvoyerCampagne;
    let associerListeDiffusionToCampagne: jest.Mocked<AssocierListeDiffusionToCampagne>;
    let planMarketingGateway: jest.Mocked<PlanMarketingGateway>;
    let campagneGateway: jest.Mocked<CampagneGateway>;
    let clockGateway: jest.Mocked<ClockGateway>;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                EnvoyerCampagne,
                {
                    provide: AssocierListeDiffusionToCampagne,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
                {
                    provide: PlanMarketingGateway,
                    useValue: {
                        sendCampagneNow: jest.fn(),
                    },
                },
                {
                    provide: CampagneGateway,
                    useValue: {
                        addEnvoiToCampagneById: jest.fn(),
                    },
                },
                {
                    provide: ClockGateway,
                    useValue: {
                        now: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get(EnvoyerCampagne);
        associerListeDiffusionToCampagne = module.get(AssocierListeDiffusionToCampagne);
        planMarketingGateway = module.get(PlanMarketingGateway);
        campagneGateway = module.get(CampagneGateway);
        clockGateway = module.get(ClockGateway);
    });

    it("should successfully send a campaign", async () => {
        const now = new Date();
        clockGateway.now.mockReturnValue(now);

        await useCase.execute("liste-1", "campagne-1", "provider-1");

        expect(associerListeDiffusionToCampagne.execute).toHaveBeenCalledWith("liste-1", "provider-1");
        expect(planMarketingGateway.sendCampagneNow).toHaveBeenCalledWith("provider-1");
        expect(campagneGateway.addEnvoiToCampagneById).toHaveBeenCalledWith("campagne-1", {
            date: now,
            statut: EnvoiCampagneStatut.TERMINE,
        });
    });

    it("should throw when nomListe is undefined", async () => {
        await expect(useCase.execute(undefined, "campagne-1", "provider-1")).rejects.toThrow(
            new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                "Nom de liste et campagneProviderId sont requis",
            ),
        );
    });

    it("should throw when campagneId is undefined", async () => {
        await expect(useCase.execute("liste-1", undefined, "provider-1")).rejects.toThrow(
            new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                "Nom de liste et campagneProviderId sont requis",
            ),
        );
    });

    it("should throw when campagneProviderId is undefined", async () => {
        await expect(useCase.execute("liste-1", "campagne-1", undefined)).rejects.toThrow(
            new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                "Nom de liste et campagneProviderId sont requis",
            ),
        );
    });
});
