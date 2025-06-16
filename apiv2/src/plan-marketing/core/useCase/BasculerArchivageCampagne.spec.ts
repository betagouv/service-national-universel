import { Test } from "@nestjs/testing";
import { BasculerArchivageCampagne } from "./BasculerArchivageCampagne";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import {
    CampagneGeneriqueModel,
    CampagneSpecifiqueModelWithRef,
    CampagneSpecifiqueModelWithoutRef,
    CampagneSpecifiqueModelWithRefAndGeneric,
} from "../Campagne.model";
import { CampagneJeuneType, DestinataireListeDiffusion } from "snu-lib";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CampagneService } from "../service/Campagne.service";

describe("BasculerArchivageCampagne", () => {
    let useCase: BasculerArchivageCampagne;
    let campagneGateway: jest.Mocked<CampagneGateway>;
    let campagneService: jest.Mocked<CampagneService>;

    beforeEach(async () => {
        campagneGateway = {
            findById: jest.fn(),
            update: jest.fn(),
            search: jest.fn(),
        } as any;

        campagneService = {
            updateAndRemoveRef: jest.fn(),
        } as any;

        const module = await Test.createTestingModule({
            providers: [
                BasculerArchivageCampagne,
                {
                    provide: CampagneGateway,
                    useValue: campagneGateway,
                },
                {
                    provide: CampagneService,
                    useValue: campagneService,
                },
            ],
        }).compile();

        useCase = module.get<BasculerArchivageCampagne>(BasculerArchivageCampagne);
    });

    describe("when campaign does not exist", () => {
        it("should throw CAMPAIGN_NOT_FOUND exception", async () => {
            campagneGateway.findById.mockResolvedValue(null);

            await expect(useCase.execute("nonexistent-id")).rejects.toThrow(
                new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND),
            );
            expect(campagneGateway.findById).toHaveBeenCalledWith("nonexistent-id");
        });
    });

    describe("when handling specific campaign with reference", () => {
        it("should throw CAMPAIGN_NOT_FOUND if generic campaign does not exist", async () => {
            const campagneSpecifiqueWithRef: CampagneSpecifiqueModelWithRef = {
                id: "specific-ref-id",
                generic: false,
                cohortId: "cohort1",
                campagneGeneriqueId: "generic-id",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            campagneGateway.findById
                .mockResolvedValueOnce(campagneSpecifiqueWithRef)
                .mockResolvedValueOnce(null);

            await expect(useCase.execute("specific-ref-id")).rejects.toThrow(
                new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND),
            );
        });

        it("should archive a specific campaign with reference when it was not archived", async () => {
            const campagneSpecifiqueWithRef: CampagneSpecifiqueModelWithRefAndGeneric = {
                id: "specific-ref-id",
                generic: false,
                cohortId: "cohort1",
                campagneGeneriqueId: "generic-id",
                createdAt: new Date(),
                updatedAt: new Date(),
                isArchived: false,
                nom: "Campagne Spécifique",
                objet: "Objet Test",
                templateId: 42,
                listeDiffusionId: "list1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                isProgrammationActive: true,
            };

            const campagneGenerique: CampagneGeneriqueModel = {
                id: "generic-id",
                generic: true,
                nom: "Campagne Générique",
                objet: "Objet Test",
                templateId: 42,
                listeDiffusionId: "list1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                programmations: [],
                isProgrammationActive: true,
                isArchived: false,
            };

            const expectedCampagneSpecifiqueWithoutRef: CampagneSpecifiqueModelWithoutRef = {
                id: "specific-ref-id",
                generic: false,
                cohortId: "cohort1",
                originalCampagneGeneriqueId: "generic-id",
                nom: campagneGenerique.nom,
                objet: campagneGenerique.objet,
                templateId: campagneGenerique.templateId,
                listeDiffusionId: campagneGenerique.listeDiffusionId,
                destinataires: campagneGenerique.destinataires,
                type: campagneGenerique.type,
                envois: campagneGenerique.envois,
                programmations: campagneGenerique.programmations,
                isProgrammationActive: false,
                isArchived: true,
            };

            campagneGateway.findById
                .mockResolvedValueOnce(campagneSpecifiqueWithRef)
                .mockResolvedValueOnce(campagneGenerique);

            campagneService.updateAndRemoveRef.mockResolvedValue(expectedCampagneSpecifiqueWithoutRef);

            const result = await useCase.execute("specific-ref-id");

            expect(result).toEqual(expectedCampagneSpecifiqueWithoutRef);
            expect(campagneService.updateAndRemoveRef).toHaveBeenCalledWith(expectedCampagneSpecifiqueWithoutRef);
        });

        it("should unarchive a specific campaign with reference when it was archived", async () => {
            const campagneSpecifiqueWithRef: CampagneSpecifiqueModelWithRefAndGeneric = {
                id: "specific-ref-id",
                generic: false,
                cohortId: "cohort1",
                campagneGeneriqueId: "generic-id",
                createdAt: new Date(),
                updatedAt: new Date(),
                isArchived: true,
                nom: "Campagne Spécifique",
                objet: "Objet Test",
                templateId: 42,
                listeDiffusionId: "list1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                isProgrammationActive: false,
            };

            const campagneGenerique: CampagneGeneriqueModel = {
                id: "generic-id",
                generic: true,
                nom: "Campagne Générique",
                objet: "Objet Test",
                templateId: 42,
                listeDiffusionId: "list1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                programmations: [],
                isProgrammationActive: true,
                isArchived: false,
            };

            const expectedCampagneSpecifiqueWithoutRef: CampagneSpecifiqueModelWithoutRef = {
                id: "specific-ref-id",
                generic: false,
                cohortId: "cohort1",
                originalCampagneGeneriqueId: "generic-id",
                nom: campagneGenerique.nom,
                objet: campagneGenerique.objet,
                templateId: campagneGenerique.templateId,
                listeDiffusionId: campagneGenerique.listeDiffusionId,
                destinataires: campagneGenerique.destinataires,
                type: campagneGenerique.type,
                envois: campagneGenerique.envois,
                programmations: campagneGenerique.programmations,
                isProgrammationActive: false,
                isArchived: false,
            };

            campagneGateway.findById
                .mockResolvedValueOnce(campagneSpecifiqueWithRef)
                .mockResolvedValueOnce(campagneGenerique);

            campagneService.updateAndRemoveRef.mockResolvedValue(expectedCampagneSpecifiqueWithoutRef);

            const result = await useCase.execute("specific-ref-id");

            expect(result).toEqual(expectedCampagneSpecifiqueWithoutRef);
            expect(campagneService.updateAndRemoveRef).toHaveBeenCalledWith(expectedCampagneSpecifiqueWithoutRef);
        });
    });

    describe("when handling specific campaign without reference", () => {
        it("should archive the campaign and disable programming", async () => {
            const campagneSpecifique: CampagneSpecifiqueModelWithoutRef = {
                id: "specific-id",
                generic: false,
                cohortId: "cohort1",
                nom: "Campagne Spécifique",
                objet: "Objet Test",
                templateId: 42,
                listeDiffusionId: "list1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                programmations: [],
                isProgrammationActive: true,
                isArchived: false,
            };

            const campagneSpecifiqueUpdated: CampagneSpecifiqueModelWithoutRef = {
                ...campagneSpecifique,
                isArchived: true,
                isProgrammationActive: false,
            };

            campagneGateway.findById.mockResolvedValue(campagneSpecifique);
            campagneGateway.update.mockResolvedValue(campagneSpecifiqueUpdated);

            const result = await useCase.execute("specific-id");

            expect(result).toEqual(campagneSpecifiqueUpdated);
            expect(campagneGateway.update).toHaveBeenCalledWith({
                ...campagneSpecifique,
                isArchived: true,
                isProgrammationActive: false,
            });
        });

        it("should unarchive the campaign", async () => {
            const campagneSpecifique: CampagneSpecifiqueModelWithoutRef = {
                id: "specific-id",
                generic: false,
                cohortId: "cohort1",
                nom: "Campagne Spécifique",
                objet: "Objet Test",
                templateId: 42,
                listeDiffusionId: "list1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                programmations: [],
                isProgrammationActive: false,
                isArchived: true,
            };

            const campagneSpecifiqueUpdated: CampagneSpecifiqueModelWithoutRef = {
                ...campagneSpecifique,
                isArchived: false,
            };

            campagneGateway.findById.mockResolvedValue(campagneSpecifique);
            campagneGateway.update.mockResolvedValue(campagneSpecifiqueUpdated);

            const result = await useCase.execute("specific-id");

            expect(result).toEqual(campagneSpecifiqueUpdated);
            expect(campagneGateway.update).toHaveBeenCalledWith({
                ...campagneSpecifique,
                isArchived: false,
            });
        });
    });

    describe("when handling generic campaign", () => {
        it("should archive the campaign and disable programming", async () => {
            const campagneGenerique: CampagneGeneriqueModel = {
                id: "generic-id",
                generic: true,
                nom: "Campagne Générique",
                objet: "Objet Test",
                templateId: 42,
                listeDiffusionId: "list1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                programmations: [],
                isProgrammationActive: true,
                isArchived: false,
            };

            const campagneGeneriqueUpdated: CampagneGeneriqueModel = {
                ...campagneGenerique,
                isArchived: true,
                isProgrammationActive: false,
            };

            campagneGateway.findById.mockResolvedValue(campagneGenerique);
            campagneGateway.update.mockResolvedValueOnce(campagneGeneriqueUpdated);
            campagneGateway.search.mockResolvedValue([]);

            const result = await useCase.execute("generic-id");

            expect(result).toEqual(campagneGeneriqueUpdated);
            expect(campagneGateway.update).toHaveBeenCalledWith({
                ...campagneGenerique,
                isArchived: true,
                isProgrammationActive: false,
            });
        });

        it("should disable programming of linked specific campaigns when archiving", async () => {
            const campagneGenerique: CampagneGeneriqueModel = {
                id: "generic-id",
                generic: true,
                nom: "Campagne Générique",
                objet: "Objet Test",
                templateId: 42,
                listeDiffusionId: "list1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                programmations: [],
                isProgrammationActive: true,
                isArchived: false,
            };

            const campagneGeneriqueUpdated: CampagneGeneriqueModel = {
                ...campagneGenerique,
                isArchived: true,
                isProgrammationActive: false,
            };

            const campagneSpecifiqueWithRef: CampagneSpecifiqueModelWithRef = {
                id: "specific-ref-id",
                generic: false,
                cohortId: "cohort1",
                campagneGeneriqueId: "generic-id",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const campagneSpecifiqueWithoutRef: CampagneSpecifiqueModelWithoutRef = {
                id: "specific-no-ref-id",
                generic: false,
                cohortId: "cohort2",
                nom: "Campagne Spécifique Sans Ref",
                objet: "Objet Test",
                templateId: 42,
                listeDiffusionId: "list1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                programmations: [],
                isProgrammationActive: true,
            };

            campagneGateway.findById.mockResolvedValue(campagneGenerique);
            campagneGateway.update.mockResolvedValueOnce(campagneGeneriqueUpdated);
            campagneGateway.search.mockResolvedValue([campagneSpecifiqueWithRef, campagneSpecifiqueWithoutRef]);

            await useCase.execute("generic-id");

            expect(campagneGateway.update).toHaveBeenCalledTimes(2);
            expect(campagneGateway.update).toHaveBeenNthCalledWith(1, {
                ...campagneGenerique,
                isArchived: true,
                isProgrammationActive: false,
            });
            expect(campagneGateway.update).toHaveBeenNthCalledWith(2, {
                ...campagneSpecifiqueWithoutRef,
                isProgrammationActive: false,
            });
        });

        it("should unarchive the campaign", async () => {
            const campagneGenerique: CampagneGeneriqueModel = {
                id: "generic-id",
                generic: true,
                nom: "Campagne Générique",
                objet: "Objet Test",
                templateId: 42,
                listeDiffusionId: "list1",
                destinataires: [DestinataireListeDiffusion.JEUNES],
                type: CampagneJeuneType.VOLONTAIRE,
                programmations: [],
                isProgrammationActive: false,
                isArchived: true,
            };

            const campagneGeneriqueUpdated: CampagneGeneriqueModel = {
                ...campagneGenerique,
                isArchived: false,
            };

            campagneGateway.findById.mockResolvedValue(campagneGenerique);
            campagneGateway.update.mockResolvedValue(campagneGeneriqueUpdated);

            const result = await useCase.execute("generic-id");

            expect(result).toEqual(campagneGeneriqueUpdated);
            expect(campagneGateway.update).toHaveBeenCalledWith({
                ...campagneGenerique,
                isArchived: false,
            });
            expect(campagneGateway.search).not.toHaveBeenCalled();
        });
    });
});
