import { Test } from "@nestjs/testing";
import { EnvoyerCampagne } from "./EnvoyerCampagne";
import { AssocierListeDiffusionToCampagne } from "./AssocierListeDiffusionToCampagne";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { EnvoiCampagneStatut } from "snu-lib";
import { MettreAJourCampagne } from "./MettreAJourCampagne";
import { CampagneModel } from "../Campagne.model";

describe("EnvoyerCampagne", () => {
    let useCase: EnvoyerCampagne;
    let associerListeDiffusionToCampagne: jest.Mocked<AssocierListeDiffusionToCampagne>;
    let planMarketingGateway: jest.Mocked<PlanMarketingGateway>;
    let campagneGateway: jest.Mocked<CampagneGateway>;
    let clockGateway: jest.Mocked<ClockGateway>;
    let mettreAJourCampagne: jest.Mocked<MettreAJourCampagne>;

    const now = new Date();

    const mockCampagneSpecifique = {
        id: "campagne-spec-1",
        generic: false,
    };

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
                        findById: jest.fn(),
                    },
                },
                {
                    provide: ClockGateway,
                    useValue: {
                        now: jest.fn().mockReturnValue(now),
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

        useCase = module.get(EnvoyerCampagne);
        associerListeDiffusionToCampagne = module.get(AssocierListeDiffusionToCampagne);
        planMarketingGateway = module.get(PlanMarketingGateway);
        campagneGateway = module.get(CampagneGateway);
        clockGateway = module.get(ClockGateway);
        mettreAJourCampagne = module.get(MettreAJourCampagne);
    });

    it("should successfully send a non-generic campaign without updating", async () => {
        campagneGateway.findById.mockResolvedValue(mockCampagneSpecifique as CampagneModel);

        await useCase.execute("liste-1", mockCampagneSpecifique.id, "provider-1");

        expect(associerListeDiffusionToCampagne.execute).toHaveBeenCalledWith("liste-1", "provider-1");
        expect(planMarketingGateway.sendCampagneNow).toHaveBeenCalledWith("provider-1");
        expect(campagneGateway.addEnvoiToCampagneById).toHaveBeenCalledWith(mockCampagneSpecifique.id, {
            date: now,
            statut: EnvoiCampagneStatut.TERMINE,
        });
        expect(campagneGateway.findById).toHaveBeenCalledWith(mockCampagneSpecifique.id);
        expect(mettreAJourCampagne.execute).not.toHaveBeenCalled();
    });

    it("should successfully send a specific campaign and trigger update", async () => {
        const campagneSpecifiqueWithRef = {
            ...mockCampagneSpecifique,
            campagneGeneriqueId: "campagne-gen-1",
        };
        campagneGateway.findById.mockResolvedValue(campagneSpecifiqueWithRef as CampagneModel);

        await useCase.execute("liste-1", campagneSpecifiqueWithRef.id, "provider-1");

        expect(associerListeDiffusionToCampagne.execute).toHaveBeenCalledWith("liste-1", "provider-1");
        expect(planMarketingGateway.sendCampagneNow).toHaveBeenCalledWith("provider-1");
        expect(campagneGateway.addEnvoiToCampagneById).toHaveBeenCalledWith(campagneSpecifiqueWithRef.id, {
            date: now,
            statut: EnvoiCampagneStatut.TERMINE,
        });
        expect(campagneGateway.findById).toHaveBeenCalledWith(campagneSpecifiqueWithRef.id);
        expect(mettreAJourCampagne.execute).toHaveBeenCalledWith(campagneSpecifiqueWithRef as CampagneModel);
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

    it("should not call mettreAJourCampagne if findById returns null", async () => {
        campagneGateway.findById.mockResolvedValue(null);

        await useCase.execute("liste-1", "campagne-nonexistent", "provider-1");

        expect(associerListeDiffusionToCampagne.execute).toHaveBeenCalledWith("liste-1", "provider-1");
        expect(planMarketingGateway.sendCampagneNow).toHaveBeenCalledWith("provider-1");
        expect(campagneGateway.addEnvoiToCampagneById).toHaveBeenCalledWith("campagne-nonexistent", {
            date: now,
            statut: EnvoiCampagneStatut.TERMINE,
        });
        expect(campagneGateway.findById).toHaveBeenCalledWith("campagne-nonexistent");
        expect(mettreAJourCampagne.execute).not.toHaveBeenCalled();
    });
});
