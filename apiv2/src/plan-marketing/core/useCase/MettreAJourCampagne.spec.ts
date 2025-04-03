import { Test } from "@nestjs/testing";
import { MettreAJourCampagne } from "./MettreAJourCampagne";
import { CampagneService } from "../service/Campagne.service";
import {
    CampagneModel,
    CampagneGeneriqueModel,
    CampagneSpecifiqueModelWithRef,
    CampagneSpecifiqueModelWithoutRef,
} from "../Campagne.model";
import { CampagneJeuneType, DestinataireListeDiffusion, EnvoiCampagneStatut } from "snu-lib";

describe("MettreAJourCampagne", () => {
    let useCase: MettreAJourCampagne;
    let campagneService: jest.Mocked<CampagneService>;

    beforeEach(async () => {
        campagneService = {
            findById: jest.fn(),
            updateCampagne: jest.fn(),
            updateAndRemoveRef: jest.fn(),
        } as any;

        const module = await Test.createTestingModule({
            providers: [
                MettreAJourCampagne,
                {
                    provide: CampagneService,
                    useValue: campagneService,
                },
            ],
        }).compile();

        useCase = module.get<MettreAJourCampagne>(MettreAJourCampagne);
    });

    it("should update a generic campaign", async () => {
        const campagneGenerique: CampagneGeneriqueModel = {
            id: "1",
            generic: true,
            nom: "Test Campaign",
            objet: "Test Object",
            templateId: 42,
            listeDiffusionId: "list1",
            destinataires: [DestinataireListeDiffusion.JEUNES],
            type: CampagneJeuneType.VOLONTAIRE,
        };

        campagneService.findById.mockResolvedValue(campagneGenerique);
        campagneService.updateCampagne.mockResolvedValue(campagneGenerique);

        const result = await useCase.execute(campagneGenerique);

        expect(result).toEqual(campagneGenerique);
        expect(campagneService.findById).toHaveBeenCalledWith("1");
        expect(campagneService.updateCampagne).toHaveBeenCalledWith(campagneGenerique);
    });

    it("should update and remove ref for specific campaign with reference", async () => {
        const sentDate = new Date();

        const campagneSpecifiqueWithRef: CampagneSpecifiqueModelWithRef = {
            id: "2",
            generic: false,
            cohortId: "cohort1",
            campagneGeneriqueId: "campaign1",
            envois: [{ date: sentDate, statut: EnvoiCampagneStatut.TERMINE }],
        };

        const expectedCampagneWithoutRef: CampagneSpecifiqueModelWithoutRef = {
            id: "2",
            generic: false,
            cohortId: "cohort1",
            originalCampagneGeneriqueId: "campaign1",
            nom: "Test Campaign",
            objet: "Test Object",
            templateId: 42,
            listeDiffusionId: "list1",
            destinataires: [DestinataireListeDiffusion.JEUNES],
            type: CampagneJeuneType.VOLONTAIRE,
            envois: [{ date: sentDate, statut: EnvoiCampagneStatut.TERMINE }],
        };

        campagneService.findById.mockResolvedValue(campagneSpecifiqueWithRef);
        campagneService.updateAndRemoveRef.mockResolvedValue(expectedCampagneWithoutRef);

        const result = await useCase.execute(expectedCampagneWithoutRef);

        expect(result).toEqual(expectedCampagneWithoutRef);
        expect(campagneService.findById).toHaveBeenCalledWith("2");
        expect(campagneService.updateAndRemoveRef).toHaveBeenCalledWith(expectedCampagneWithoutRef);
    });

    it("should update specific campaign without reference", async () => {
        const campagneSpecifique: CampagneSpecifiqueModelWithoutRef = {
            id: "3",
            generic: false,
            cohortId: "cohort1",
            originalCampagneGeneriqueId: "campaign1",
            nom: "Test Campaign",
            objet: "Test Object",
            templateId: 42,
            listeDiffusionId: "list1",
            destinataires: [DestinataireListeDiffusion.JEUNES],
            type: CampagneJeuneType.VOLONTAIRE,
        };

        campagneService.findById.mockResolvedValue(campagneSpecifique);
        campagneService.updateCampagne.mockResolvedValue(campagneSpecifique);

        const result = await useCase.execute(campagneSpecifique);

        expect(result).toEqual(campagneSpecifique);
        expect(campagneService.findById).toHaveBeenCalledWith("3");
        expect(campagneService.updateCampagne).toHaveBeenCalledWith(campagneSpecifique);
    });
});
