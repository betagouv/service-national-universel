import { Test } from "@nestjs/testing";
import { BasculerArchivageCampagne } from "./BasculerArchivageCampagne";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import {
    CampagneGeneriqueModel,
    CampagneSpecifiqueModelWithRef,
    CampagneSpecifiqueModelWithoutRef,
} from "../Campagne.model";
import { CampagneJeuneType, DestinataireListeDiffusion } from "snu-lib";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

describe("BasculerArchivageCampagne", () => {
    let useCase: BasculerArchivageCampagne;
    let campagneGateway: jest.Mocked<CampagneGateway>;

    beforeEach(async () => {
        campagneGateway = {
            findById: jest.fn(),
            update: jest.fn(),
            search: jest.fn(),
        } as any;

        const module = await Test.createTestingModule({
            providers: [
                BasculerArchivageCampagne,
                {
                    provide: CampagneGateway,
                    useValue: campagneGateway,
                },
            ],
        }).compile();

        useCase = module.get<BasculerArchivageCampagne>(BasculerArchivageCampagne);
    });

    describe("archiving a generic campaign", () => {
        it("should fail if campaign does not exist", async () => {
            campagneGateway.findById.mockResolvedValue(null);

            await expect(useCase.execute("nonexistent-id")).rejects.toThrow(
                new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND),
            );
            expect(campagneGateway.findById).toHaveBeenCalledWith("nonexistent-id");
        });

        it("should archive a specific campaign without reference", async () => {
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
            };

            campagneGateway.findById.mockResolvedValue(campagneSpecifique);

            await useCase.execute("specific-id");

            expect(campagneGateway.findById).toHaveBeenCalledWith("specific-id");
            expect(campagneGateway.update).toHaveBeenCalledWith({
                ...campagneSpecifique,
                isArchived: true,
                isProgrammationActive: false,
            });
        });

        it("should archive a generic campaign and disable its programming", async () => {
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
            campagneGateway.update.mockResolvedValue(campagneGeneriqueUpdated);
            campagneGateway.search.mockResolvedValue([]);

            const result = await useCase.execute("generic-id");

            expect(result).toEqual(campagneGeneriqueUpdated);
            expect(campagneGateway.findById).toHaveBeenCalledWith("generic-id");
            expect(campagneGateway.update).toHaveBeenCalledWith({
                ...campagneGenerique,
                isArchived: true,
                isProgrammationActive: false,
            });
            expect(campagneGateway.search).toHaveBeenCalledWith({
                generic: false,
                campagneGeneriqueId: "generic-id",
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

            // A specific campaign with reference
            const campagneSpecifiqueWithRef: CampagneSpecifiqueModelWithRef = {
                id: "specific-ref-id",
                generic: false,
                cohortId: "cohort1",
                campagneGeneriqueId: "generic-id",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // A specific campaign without reference
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
            // First call - update generic campaign
            expect(campagneGateway.update).toHaveBeenNthCalledWith(1, {
                ...campagneGenerique,
                isArchived: true,
                isProgrammationActive: false,
            });
            // Second call - update specific campaign without reference
            expect(campagneGateway.update).toHaveBeenNthCalledWith(2, {
                ...campagneSpecifiqueWithoutRef,
                isProgrammationActive: false,
            });
        });

        it("should unarchive a generic campaign", async () => {
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
            expect(campagneGateway.findById).toHaveBeenCalledWith("generic-id");
            expect(campagneGateway.update).toHaveBeenCalledWith({
                ...campagneGenerique,
                isArchived: false,
            });
            // Should not search or update specific campaigns when unarchiving
            expect(campagneGateway.search).not.toHaveBeenCalled();
        });
    });
});
