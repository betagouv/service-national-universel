import { Test, TestingModule } from "@nestjs/testing";
import { CampagneDataFetcherService } from "./CampagneDataFetcher.service";
import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { PointDeRassemblementGateway } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.gateway";
import { LigneDeBusGateway } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.gateway";
import { CentreGateway } from "@admin/core/sejours/phase1/centre/Centre.gateway";
import { SegmentDeLigneGateway } from "@admin/core/sejours/phase1/segmentDeLigne/SegmentDeLigne.gateway";
import { EtablissementGateway } from "@admin/core/sejours/cle/etablissement/Etablissement.gateway";
import { SejourGateway } from "@admin/core/sejours/phase1/sejour/Sejour.gateway";
import { YoungType } from "snu-lib";
import { ClasseModel } from "@admin/core/sejours/cle/classe/Classe.model";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { PointDeRassemblementModel } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.model";
import { LigneDeBusModel } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.model";
import { CentreModel } from "@admin/core/sejours/phase1/centre/Centre.model";
import { SegmentDeLigneModel } from "@admin/core/sejours/phase1/segmentDeLigne/SegmentDeLigne.model";
import { EtablissementModel } from "@admin/core/sejours/cle/etablissement/Etablissement.model";
import { SejourModel } from "@admin/core/sejours/phase1/sejour/Sejour.model";

describe("CampagneDataFetcherService", () => {
    let service: CampagneDataFetcherService;
    let mockClasseGateway: jest.Mocked<ClasseGateway>;
    let mockReferentGateway: jest.Mocked<ReferentGateway>;
    let mockPointDeRassemblementGateway: jest.Mocked<PointDeRassemblementGateway>;
    let mockLigneDeBusGateway: jest.Mocked<LigneDeBusGateway>;
    let mockCentreGateway: jest.Mocked<CentreGateway>;
    let mockSegmentDeLigneGateway: jest.Mocked<SegmentDeLigneGateway>;
    let mockEtablissementGateway: jest.Mocked<EtablissementGateway>;
    let mockSejourGateway: jest.Mocked<SejourGateway>;

    beforeEach(async () => {
        // Create mock implementations for all gateways
        mockClasseGateway = {
            findByIds: jest.fn(),
            findReferentIdsByClasseIds: jest.fn(),
        } as unknown as jest.Mocked<ClasseGateway>;

        mockReferentGateway = {
            findByIds: jest.fn(),
        } as unknown as jest.Mocked<ReferentGateway>;

        mockPointDeRassemblementGateway = {
            findByIds: jest.fn(),
        } as unknown as jest.Mocked<PointDeRassemblementGateway>;

        mockLigneDeBusGateway = {
            findByIds: jest.fn(),
        } as unknown as jest.Mocked<LigneDeBusGateway>;

        mockCentreGateway = {
            findByIds: jest.fn(),
        } as unknown as jest.Mocked<CentreGateway>;

        mockSegmentDeLigneGateway = {
            findByLigneDeBusIds: jest.fn(),
        } as unknown as jest.Mocked<SegmentDeLigneGateway>;

        mockEtablissementGateway = {
            findByIds: jest.fn(),
        } as unknown as jest.Mocked<EtablissementGateway>;

        mockSejourGateway = {
            findByCohesionCenterIds: jest.fn(),
        } as unknown as jest.Mocked<SejourGateway>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CampagneDataFetcherService,
                { provide: ClasseGateway, useValue: mockClasseGateway },
                { provide: ReferentGateway, useValue: mockReferentGateway },
                { provide: PointDeRassemblementGateway, useValue: mockPointDeRassemblementGateway },
                { provide: LigneDeBusGateway, useValue: mockLigneDeBusGateway },
                { provide: CentreGateway, useValue: mockCentreGateway },
                { provide: SegmentDeLigneGateway, useValue: mockSegmentDeLigneGateway },
                { provide: EtablissementGateway, useValue: mockEtablissementGateway },
                { provide: SejourGateway, useValue: mockSejourGateway },
            ],
        }).compile();

        service = module.get<CampagneDataFetcherService>(CampagneDataFetcherService);
    });

    describe("fetchRelatedData", () => {
        it("should fetch all related data for a list of youngs", async () => {
            // Setup test data
            const mockYoungs = [
                {
                    id: "young1",
                    classeId: "classe1",
                    meetingPointId: "pdr1",
                    cohesionCenterId: "centre1",
                    ligneId: "ligne1",
                },
                {
                    id: "young2",
                    classeId: "classe2",
                    meetingPointId: "pdr2",
                    cohesionCenterId: "centre2",
                    ligneId: "ligne2",
                },
            ] as unknown as YoungType[];

            const mockClasses = [
                {
                    id: "classe1",
                    etablissementId: "etab1",
                    sejourId: "sejour1",
                },
                {
                    id: "classe2",
                    etablissementId: "etab2",
                    sejourId: "sejour2",
                },
            ] as unknown as ClasseModel[];

            const mockReferentClasseIds = ["refClasse1", "refClasse2"];
            const mockReferentsClasse = [
                { id: "refClasse1", nom: "Nom1", prenom: "Prenom1" },
                { id: "refClasse2", nom: "Nom2", prenom: "Prenom2" },
            ] as unknown as ReferentModel[];

            const mockEtablissements = [
                {
                    id: "etab1",
                    referentEtablissementIds: ["chefEtab1"],
                    coordinateurIds: ["coordCle1"],
                },
                {
                    id: "etab2",
                    referentEtablissementIds: ["chefEtab2"],
                    coordinateurIds: ["coordCle2"],
                },
            ] as unknown as EtablissementModel[];

            const mockChefsEtablissement = [
                { id: "chefEtab1", nom: "ChefNom1", prenom: "ChefPrenom1" },
                { id: "chefEtab2", nom: "ChefNom2", prenom: "ChefPrenom2" },
            ] as unknown as ReferentModel[];

            const mockCoordinateursCle = [
                { id: "coordCle1", nom: "CoordNom1", prenom: "CoordPrenom1" },
                { id: "coordCle2", nom: "CoordNom2", prenom: "CoordPrenom2" },
            ] as unknown as ReferentModel[];

            const mockSejours = [
                { id: "sejour1", chefDeCentreReferentId: "chefCentre1" },
                { id: "sejour2", chefDeCentreReferentId: "chefCentre2" },
            ] as unknown as SejourModel[];

            const mockChefsDeCentre = [
                { id: "chefCentre1", nom: "ChefCentreNom1", prenom: "ChefCentrePrenom1" },
                { id: "chefCentre2", nom: "ChefCentreNom2", prenom: "ChefCentrePrenom2" },
            ] as unknown as ReferentModel[];

            const mockPointDeRassemblements = [
                { id: "pdr1", nom: "PDR 1" },
                { id: "pdr2", nom: "PDR 2" },
            ] as unknown as PointDeRassemblementModel[];

            const mockLignes = [
                { id: "ligne1", numeroLigne: "L1" },
                { id: "ligne2", numeroLigne: "L2" },
            ] as unknown as LigneDeBusModel[];

            const mockCentres = [
                { id: "centre1", nom: "Centre 1" },
                { id: "centre2", nom: "Centre 2" },
            ] as unknown as CentreModel[];

            const mockSegmentDeLignes = [
                { id: "segment1", ligneDeBusId: "ligne1" },
                { id: "segment2", ligneDeBusId: "ligne2" },
            ] as unknown as SegmentDeLigneModel[];

            // Setup mock return values
            mockClasseGateway.findByIds.mockResolvedValue(mockClasses);
            mockClasseGateway.findReferentIdsByClasseIds.mockResolvedValue(mockReferentClasseIds);
            mockReferentGateway.findByIds
                .mockResolvedValueOnce(mockReferentsClasse) // For referentsClasse
                .mockResolvedValueOnce(mockChefsEtablissement) // For chefsEtablissement
                .mockResolvedValueOnce(mockCoordinateursCle) // For coordinateursCle
                .mockResolvedValueOnce(mockChefsDeCentre); // For chefsDeCentre
            mockEtablissementGateway.findByIds.mockResolvedValue(mockEtablissements);
            mockSejourGateway.findByCohesionCenterIds.mockResolvedValue(mockSejours);
            mockPointDeRassemblementGateway.findByIds.mockResolvedValue(mockPointDeRassemblements);
            mockLigneDeBusGateway.findByIds.mockResolvedValue(mockLignes);
            mockCentreGateway.findByIds.mockResolvedValue(mockCentres);
            mockSegmentDeLigneGateway.findByLigneDeBusIds.mockResolvedValue(mockSegmentDeLignes);

            // Execute the method
            const result = await service.fetchRelatedData(mockYoungs);

            // Verify the results
            expect(result).toEqual({
                classes: mockClasses,
                referentsClasse: mockReferentsClasse,
                etablissements: mockEtablissements,
                chefsEtablissement: mockChefsEtablissement,
                coordinateursCle: mockCoordinateursCle,
                sejours: mockSejours,
                chefsDeCentre: mockChefsDeCentre,
                pointDeRassemblements: mockPointDeRassemblements,
                lignes: mockLignes,
                centres: mockCentres,
                segmentDeLignes: mockSegmentDeLignes,
            });

            // Verify all the calls were made with the correct IDs
            expect(mockClasseGateway.findByIds).toHaveBeenCalledWith(["classe1", "classe2"]);
            expect(mockClasseGateway.findReferentIdsByClasseIds).toHaveBeenCalledWith(["classe1", "classe2"]);
            expect(mockReferentGateway.findByIds).toHaveBeenCalledWith(["refClasse1", "refClasse2"]);
            expect(mockEtablissementGateway.findByIds).toHaveBeenCalledWith(["etab1", "etab2"]);
            expect(mockReferentGateway.findByIds).toHaveBeenCalledWith(["chefEtab1", "chefEtab2"]);
            expect(mockReferentGateway.findByIds).toHaveBeenCalledWith(["coordCle1", "coordCle2"]);
            expect(mockSejourGateway.findByCohesionCenterIds).toHaveBeenCalledWith(["centre1", "centre2"]);
            expect(mockReferentGateway.findByIds).toHaveBeenCalledWith(["chefCentre1", "chefCentre2"]);
            expect(mockPointDeRassemblementGateway.findByIds).toHaveBeenCalledWith(["pdr1", "pdr2"]);
            expect(mockLigneDeBusGateway.findByIds).toHaveBeenCalledWith(["ligne1", "ligne2"]);
            expect(mockCentreGateway.findByIds).toHaveBeenCalledWith(["centre1", "centre2"]);
            expect(mockSegmentDeLigneGateway.findByLigneDeBusIds).toHaveBeenCalledWith(["ligne1", "ligne2"]);
        });

        it("should handle missing data gracefully", async () => {
            // Setup test data with missing properties
            const mockYoungs = [
                {
                    id: "young1",
                    // No classeId
                    meetingPointId: "pdr1",
                    // No cohesionCenterId
                    ligneId: "ligne1",
                },
                {
                    id: "young2",
                    classeId: "classe2",
                    // No meetingPointId
                    cohesionCenterId: "centre2",
                    // No ligneId
                },
            ] as unknown as YoungType[];

            // Setup mock return values - all returning empty arrays
            mockClasseGateway.findByIds.mockResolvedValue([]);
            mockClasseGateway.findReferentIdsByClasseIds.mockResolvedValue([]);
            mockReferentGateway.findByIds.mockResolvedValue([]);
            mockEtablissementGateway.findByIds.mockResolvedValue([]);
            mockSejourGateway.findByCohesionCenterIds.mockResolvedValue([]);
            mockPointDeRassemblementGateway.findByIds.mockResolvedValue([]);
            mockLigneDeBusGateway.findByIds.mockResolvedValue([]);
            mockCentreGateway.findByIds.mockResolvedValue([]);
            mockSegmentDeLigneGateway.findByLigneDeBusIds.mockResolvedValue([]);

            // Execute the method
            const result = await service.fetchRelatedData(mockYoungs);

            // Verify we get empty arrays
            expect(result).toEqual({
                classes: [],
                referentsClasse: [],
                etablissements: [],
                chefsEtablissement: [],
                coordinateursCle: [],
                sejours: [],
                chefsDeCentre: [],
                pointDeRassemblements: [],
                lignes: [],
                centres: [],
                segmentDeLignes: [],
            });

            // Verify the correct IDs were passed
            expect(mockClasseGateway.findByIds).toHaveBeenCalledWith(["classe2"]);
            expect(mockPointDeRassemblementGateway.findByIds).toHaveBeenCalledWith(["pdr1"]);
            expect(mockLigneDeBusGateway.findByIds).toHaveBeenCalledWith(["ligne1"]);
            expect(mockCentreGateway.findByIds).toHaveBeenCalledWith(["centre2"]);
            expect(mockSejourGateway.findByCohesionCenterIds).toHaveBeenCalledWith(["centre2"]);
        });
    });
});
