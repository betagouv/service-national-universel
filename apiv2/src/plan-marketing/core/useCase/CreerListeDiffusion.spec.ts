import { Test } from "@nestjs/testing";
import { CreerListeDiffusion } from "./CreerListeDiffusion";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { SearchYoungGateway } from "src/analytics/core/SearchYoung.gateway";
import { ListeDiffusionService } from "../service/ListeDiffusion.service";
import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { PointDeRassemblementGateway } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.gateway";
import { LigneDeBusGateway } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.gateway";
import { CentreGateway } from "@admin/core/sejours/phase1/centre/Centre.gateway";
import { SegmentDeLigneGateway } from "@admin/core/sejours/phase1/segmentDeLigne/SegmentDeLigne.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { DestinataireListeDiffusion } from "snu-lib";

describe("CreerListeDiffusion", () => {
    let useCase: CreerListeDiffusion;
    let campagneGateway: jest.Mocked<CampagneGateway>;
    let searchYoungGateway: jest.Mocked<SearchYoungGateway>;
    let listeDiffusionService: jest.Mocked<ListeDiffusionService>;
    let ligneDeBusGateway: jest.Mocked<LigneDeBusGateway>;
    let centreGateway: jest.Mocked<CentreGateway>;
    let pointDeRassemblementGateway: jest.Mocked<PointDeRassemblementGateway>;
    let segmentDeLigneGateway: jest.Mocked<SegmentDeLigneGateway>;
    let fileGateway: jest.Mocked<FileGateway>;
    let referentGateway: jest.Mocked<ReferentGateway>;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                CreerListeDiffusion,
                {
                    provide: PlanMarketingGateway,
                    useValue: {
                        findById: jest.fn(),
                        find: jest.fn().mockResolvedValue([]),
                    },
                },
                {
                    provide: CampagneGateway,
                    useValue: {
                        findById: jest.fn(),
                        findSpecifiqueWithRefById: jest.fn(),
                    },
                },
                {
                    provide: SearchYoungGateway,
                    useValue: { searchYoung: jest.fn() },
                },
                {
                    provide: ListeDiffusionService,
                    useValue: { getListeDiffusionById: jest.fn() },
                },
                {
                    provide: ClasseGateway,
                    useValue: {
                        findByIds: jest.fn(),
                        findReferentIdsByClasseIds: jest.fn(),
                    },
                },
                {
                    provide: ReferentGateway,
                    useValue: {
                        findByIds: jest.fn(),
                        findByCohesionCenterIds: jest.fn(),
                    },
                },
                {
                    provide: FileGateway,
                    useValue: { generateCSV: jest.fn() },
                },
                {
                    provide: PointDeRassemblementGateway,
                    useValue: { findByIds: jest.fn() },
                },
                {
                    provide: LigneDeBusGateway,
                    useValue: { findByIds: jest.fn() },
                },
                {
                    provide: CentreGateway,
                    useValue: { findByIds: jest.fn() },
                },
                {
                    provide: SegmentDeLigneGateway,
                    useValue: { findByLigneDeBusIds: jest.fn() },
                },
                {
                    provide: ClockGateway,
                    useValue: {
                        isValidDate: jest.fn(),
                        formatShort: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get(CreerListeDiffusion);
        campagneGateway = module.get(CampagneGateway);
        searchYoungGateway = module.get(SearchYoungGateway);
        listeDiffusionService = module.get(ListeDiffusionService);
        ligneDeBusGateway = module.get(LigneDeBusGateway);
        centreGateway = module.get(CentreGateway);
        segmentDeLigneGateway = module.get(SegmentDeLigneGateway);
        pointDeRassemblementGateway = module.get(PointDeRassemblementGateway);
        referentGateway = module.get(ReferentGateway);
        fileGateway = module.get(FileGateway);
    });

    it("should throw when campaign is not found", async () => {
        campagneGateway.findById.mockResolvedValue(null);

        await expect(useCase.execute("nonexistent-id")).rejects.toThrow(
            new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND),
        );
    });

    it("should throw when campaign is generic", async () => {
        campagneGateway.findById.mockResolvedValue({
            id: "campaign-1",
            generic: true,
        } as any);

        await expect(useCase.execute("campaign-1")).rejects.toThrow(
            new FunctionalException(FunctionalExceptionCode.CAMPAIGN_SHOULD_NOT_BE_GENERIC),
        );
    });

    it("should create liste diffusion for specifique campaign without ref", async () => {
        const mockCampagne = {
            id: "campaign-1",
            generic: false,
            destinataires: [DestinataireListeDiffusion.REPRESENTANTS_LEGAUX],
            listeDiffusionId: "liste-1",
            cohortId: "cohort-1",
        };

        const mockListeDiffusion = {
            id: "liste-1",
            filters: {},
        };

        const mockYoung = {
            id: "young-1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            cohort: "2023",
            cohesionCenterId: "centre-1",
            meetingPointId: "point-1",
            ligneId: "ligne-1",
            parent1FirstName: "Parent1",
            parent1LastName: "Doe",
            parent1Email: "parent1@example.com",
        };

        campagneGateway.findById.mockResolvedValue(mockCampagne as any);
        listeDiffusionService.getListeDiffusionById.mockResolvedValue(mockListeDiffusion as any);
        searchYoungGateway.searchYoung.mockResolvedValue({ hits: [mockYoung] } as any);

        ligneDeBusGateway.findByIds.mockResolvedValue([
            {
                id: "ligne-1",
            },
        ] as any);

        centreGateway.findByIds.mockResolvedValue([
            {
                id: "centre-1",
            },
        ] as any);

        pointDeRassemblementGateway.findByIds.mockResolvedValue([
            {
                id: "point-1",
            },
        ] as any);

        segmentDeLigneGateway.findByLigneDeBusIds.mockResolvedValue([
            {
                id: "segment-1",
            },
        ] as any);

        const mockCsvContent = "csv-content";
        fileGateway.generateCSV.mockResolvedValue(mockCsvContent);

        const result = await useCase.execute("campaign-1");
        expect(result).toBe(mockCsvContent);
        expect(fileGateway.generateCSV).toHaveBeenCalled();
    });

    it("should create liste diffusion for specifique campaign with ref", async () => {
        const mockCampagne = {
            id: "campaign-with-ref-1",
            generic: false,
            campagneGeneriqueId: "generic-campaign-1",
            destinataires: [DestinataireListeDiffusion.REPRESENTANTS_LEGAUX, DestinataireListeDiffusion.CHEFS_CENTRES],
            listeDiffusionId: "liste-ref-1",
            cohortId: "cohort-1",
        };

        const mockListeDiffusion = {
            id: "liste-ref-1",
            filters: { department: ["75", "92"] },
        };

        const mockYoung = {
            id: "young-ref-1",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
            cohort: "2023",
            cohesionCenterId: "centre-ref-1",
            meetingPointId: "point-ref-1",
            ligneId: "ligne-ref-1",
            parent1FirstName: "Parent1",
            parent1LastName: "Smith",
            parent1Email: "parent1.smith@example.com",
        };

        const mockReferentChefCentre = {
            id: "ref-1",
            prenom: "Chef",
            nom: "Centre",
            email: "chef@centre.com",
            role: "head_center",
            cohesionCenterId: "centre-ref-1",
        };

        campagneGateway.findById.mockResolvedValue(mockCampagne as any);
        campagneGateway.findSpecifiqueWithRefById.mockResolvedValue(mockCampagne as any);
        listeDiffusionService.getListeDiffusionById.mockResolvedValue(mockListeDiffusion as any);
        searchYoungGateway.searchYoung.mockResolvedValue({ hits: [mockYoung] } as any);

        ligneDeBusGateway.findByIds.mockResolvedValue([{ id: "ligne-ref-1" }] as any);
        centreGateway.findByIds.mockResolvedValue([{ id: "centre-ref-1" }] as any);
        pointDeRassemblementGateway.findByIds.mockResolvedValue([{ id: "point-ref-1" }] as any);
        segmentDeLigneGateway.findByLigneDeBusIds.mockResolvedValue([{ id: "segment-ref-1" }] as any);
        referentGateway.findByCohesionCenterIds.mockResolvedValue([mockReferentChefCentre] as any);

        const mockCsvContent = "csv-content-with-ref";
        fileGateway.generateCSV.mockResolvedValue(mockCsvContent);

        const result = await useCase.execute("campaign-with-ref-1");

        expect(result).toBe(mockCsvContent);
        expect(campagneGateway.findSpecifiqueWithRefById).toHaveBeenCalledWith("campaign-with-ref-1");
        expect(fileGateway.generateCSV).toHaveBeenCalled();
        expect(referentGateway.findByCohesionCenterIds).toHaveBeenCalledWith(["centre-ref-1"]);
    });
});
