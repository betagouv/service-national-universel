import { Test, TestingModule } from "@nestjs/testing";
import { CreerListeDiffusion } from "./CreerListeDiffusion";
import { FileGateway } from "@shared/core/File.gateway";
import { CampagneContactBuilderService } from "../service/CampagneContactBuilder.service";
import { CampagneDataFetcherService } from "../service/CampagneDataFetcher.service";
import { CampagneProcessorService } from "../service/CampagneProcessor.service";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { DestinataireListeDiffusion, YoungType } from "snu-lib";
import { ColumnCsvName, ColumnType } from "../ListeDiffusion.model";
import { Logger } from "@nestjs/common";
import { SearchYoungResult } from "src/analytics/core/SearchYoung.gateway";
import { ClasseModel } from "@admin/core/sejours/cle/classe/Classe.model";
import { CentreModel } from "@admin/core/sejours/phase1/centre/Centre.model";
import { PointDeRassemblementModel } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.model";
import { LigneDeBusModel } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.model";
import { SegmentDeLigneModel } from "@admin/core/sejours/phase1/segmentDeLigne/SegmentDeLigne.model";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { EtablissementModel } from "@admin/core/sejours/cle/etablissement/Etablissement.model";
import { SejourModel } from "@admin/core/sejours/phase1/sejour/Sejour.model";

interface CampaignProcessorResult {
    destinataires: DestinataireListeDiffusion[];
    youngs: SearchYoungResult;
    contactsQuery: Record<string, any>;
}

interface RelatedDataResult {
    classes: ClasseModel[];
    referentsClasse: ReferentModel[];
    etablissements: EtablissementModel[];
    chefsEtablissement: ReferentModel[];
    coordinateursCle: ReferentModel[];
    sejours: SejourModel[];
    chefsDeCentre: ReferentModel[];
    pointDeRassemblements: PointDeRassemblementModel[];
    lignes: LigneDeBusModel[];
    centres: CentreModel[];
    segmentDeLignes: SegmentDeLigneModel[];
}

describe("CreerListeDiffusion", () => {
    let useCase: CreerListeDiffusion;
    let mockFileGateway: jest.Mocked<FileGateway>;
    let mockContactBuilderService: jest.Mocked<CampagneContactBuilderService>;
    let mockDataFetcherService: jest.Mocked<CampagneDataFetcherService>;
    let mockCampaignProcessorService: jest.Mocked<CampagneProcessorService>;

    beforeEach(async () => {
        mockFileGateway = {
            generateCSV: jest.fn(),
        } as unknown as jest.Mocked<FileGateway>;

        mockContactBuilderService = {
            buildYoungContactRow: jest.fn(),
            buildParentContactRow: jest.fn(),
            buildReferentContactRow: jest.fn(),
            buildChefEtablissementContactRow: jest.fn(),
            buildChefCentreContactRow: jest.fn(),
            buildCoordinateurCleContactRow: jest.fn(),
        } as unknown as jest.Mocked<CampagneContactBuilderService>;

        mockDataFetcherService = {
            fetchRelatedData: jest.fn(),
        } as unknown as jest.Mocked<CampagneDataFetcherService>;

        mockCampaignProcessorService = {
            validateAndProcessCampaign: jest.fn(),
        } as unknown as jest.Mocked<CampagneProcessorService>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreerListeDiffusion,
                { provide: FileGateway, useValue: mockFileGateway },
                { provide: CampagneContactBuilderService, useValue: mockContactBuilderService },
                { provide: CampagneDataFetcherService, useValue: mockDataFetcherService },
                { provide: CampagneProcessorService, useValue: mockCampaignProcessorService },
                Logger,
            ],
        }).compile();

        useCase = module.get<CreerListeDiffusion>(CreerListeDiffusion);
    });

    describe("execute", () => {
        it("should throw an exception when no contacts are found", async () => {
            // Setup
            const campaignId = "campaign-id";
            const emptyYoungs = {
                hits: [],
                total: 0,
            };
            mockCampaignProcessorService.validateAndProcessCampaign.mockResolvedValue({
                destinataires: [DestinataireListeDiffusion.JEUNES],
                youngs: emptyYoungs,
                contactsQuery: {},
            } as unknown as CampaignProcessorResult);

            // Execute & Assert
            await expect(useCase.execute(campaignId)).rejects.toThrow(
                new FunctionalException(FunctionalExceptionCode.NO_CONTACTS),
            );
        });

        it("should generate CSV for young contacts only", async () => {
            // Setup
            const campaignId = "campaign-id";
            const youngsList = {
                hits: [
                    { id: "young1", firstName: "John", lastName: "Doe" },
                    { id: "young2", firstName: "Jane", lastName: "Smith" },
                ],
                total: 2,
            };

            const relatedData = {
                centres: [{ id: "centre1" }],
                pointDeRassemblements: [{ id: "pdr1" }],
                lignes: [{ id: "ligne1" }],
                segmentDeLignes: [{ id: "segment1" }],
                classes: [],
                referentsClasse: [],
                etablissements: [],
                chefsEtablissement: [],
                coordinateursCle: [],
                sejours: [],
                chefsDeCentre: [],
            } as unknown as RelatedDataResult;

            const youngContact1 = {
                type: ColumnType.jeunes,
                PRENOM: "John",
                NOM: "Doe",
                EMAIL: "john.doe@example.com",
            } as unknown as ColumnCsvName;

            const youngContact2 = {
                type: ColumnType.jeunes,
                PRENOM: "Jane",
                NOM: "Smith",
                EMAIL: "jane.smith@example.com",
            } as unknown as ColumnCsvName;

            const csvFilePath = "path/to/csv/file.csv";

            mockCampaignProcessorService.validateAndProcessCampaign.mockResolvedValue({
                destinataires: [DestinataireListeDiffusion.JEUNES],
                youngs: youngsList,
                contactsQuery: {},
            } as unknown as CampaignProcessorResult);

            mockDataFetcherService.fetchRelatedData.mockResolvedValue(relatedData);

            mockContactBuilderService.buildYoungContactRow
                .mockReturnValueOnce(youngContact1)
                .mockReturnValueOnce(youngContact2);

            mockFileGateway.generateCSV.mockResolvedValue(csvFilePath);

            // Execute
            const result = await useCase.execute(campaignId);

            // Assert
            expect(mockCampaignProcessorService.validateAndProcessCampaign).toHaveBeenCalledWith(campaignId);
            expect(mockDataFetcherService.fetchRelatedData).toHaveBeenCalledWith(youngsList.hits);
            expect(mockContactBuilderService.buildYoungContactRow).toHaveBeenCalledTimes(2);
            expect(mockFileGateway.generateCSV).toHaveBeenCalledWith(
                [youngContact1, youngContact2],
                expect.objectContaining({
                    delimiter: ";",
                }),
            );
            expect(result).toBe(csvFilePath);
        });

        it("should include parent contacts when REPRESENTANTS_LEGAUX is in destinataires", async () => {
            // Setup
            const campaignId = "campaign-id";
            const youngsList = {
                hits: [{ id: "young1", firstName: "John", lastName: "Doe" }],
                total: 1,
            };

            const relatedData = {
                centres: [{ id: "centre1" }],
                pointDeRassemblements: [{ id: "pdr1" }],
                lignes: [{ id: "ligne1" }],
                segmentDeLignes: [{ id: "segment1" }],
                classes: [],
                referentsClasse: [],
                etablissements: [],
                chefsEtablissement: [],
                coordinateursCle: [],
                sejours: [],
                chefsDeCentre: [],
            } as unknown as RelatedDataResult;

            const youngContact = {
                type: ColumnType.jeunes,
                PRENOM: "John",
                NOM: "Doe",
                EMAIL: "john.doe@example.com",
            } as unknown as ColumnCsvName;

            const parent1Contact = {
                type: ColumnType.representants,
                PRENOM_RL1: "Parent1",
                NOM_RL1: "One",
                EMAIL: "parent1@example.com",
            } as unknown as ColumnCsvName;

            const parent2Contact = {
                type: ColumnType.representants,
                PRENOM_RL2: "Parent2",
                NOM_RL2: "Two",
                EMAIL: "parent2@example.com",
            } as unknown as ColumnCsvName;

            const csvFilePath = "path/to/csv/file.csv";

            mockCampaignProcessorService.validateAndProcessCampaign.mockResolvedValue({
                destinataires: [DestinataireListeDiffusion.JEUNES, DestinataireListeDiffusion.REPRESENTANTS_LEGAUX],
                youngs: youngsList,
                contactsQuery: {},
            } as unknown as CampaignProcessorResult);

            mockDataFetcherService.fetchRelatedData.mockResolvedValue(relatedData);

            mockContactBuilderService.buildYoungContactRow.mockReturnValue(youngContact);
            mockContactBuilderService.buildParentContactRow
                .mockReturnValueOnce(parent1Contact)
                .mockReturnValueOnce(parent2Contact);

            mockFileGateway.generateCSV.mockResolvedValue(csvFilePath);

            // Execute
            const result = await useCase.execute(campaignId);

            // Assert
            expect(mockContactBuilderService.buildYoungContactRow).toHaveBeenCalledTimes(1);
            expect(mockContactBuilderService.buildParentContactRow).toHaveBeenCalledTimes(2);
            expect(mockFileGateway.generateCSV).toHaveBeenCalledWith(
                [youngContact, parent1Contact, parent2Contact],
                expect.any(Object),
            );
            expect(result).toBe(csvFilePath);
        });

        it("should include referent contacts when REFERENTS_CLASSES is in destinataires", async () => {
            // Setup
            const campaignId = "campaign-id";
            const youngsList = {
                hits: [{ id: "young1", firstName: "John", lastName: "Doe", classeId: "classe1" }],
                total: 1,
            };

            const relatedData = {
                centres: [{ id: "centre1" }],
                pointDeRassemblements: [{ id: "pdr1" }],
                lignes: [{ id: "ligne1" }],
                segmentDeLignes: [{ id: "segment1" }],
                classes: [{ id: "classe1", referentClasseIds: ["referent1"] }],
                referentsClasse: [{ id: "referent1", prenom: "Ref", nom: "One" }],
                etablissements: [],
                chefsEtablissement: [],
                coordinateursCle: [],
                sejours: [],
                chefsDeCentre: [],
            } as unknown as RelatedDataResult;

            const youngContact = {
                type: ColumnType.jeunes,
                PRENOM: "John",
                NOM: "Doe",
                EMAIL: "john.doe@example.com",
            } as unknown as ColumnCsvName;

            const referentContact = {
                type: ColumnType.referents,
                PRENOM: "Ref",
                NOM: "One",
                EMAIL: "ref@example.com",
            } as unknown as ColumnCsvName;

            const csvFilePath = "path/to/csv/file.csv";

            mockCampaignProcessorService.validateAndProcessCampaign.mockResolvedValue({
                destinataires: [DestinataireListeDiffusion.JEUNES, DestinataireListeDiffusion.REFERENTS_CLASSES],
                youngs: youngsList,
                contactsQuery: {},
            } as unknown as CampaignProcessorResult);

            mockDataFetcherService.fetchRelatedData.mockResolvedValue(relatedData);

            mockContactBuilderService.buildYoungContactRow.mockReturnValue(youngContact);
            mockContactBuilderService.buildReferentContactRow.mockReturnValue(referentContact);

            mockFileGateway.generateCSV.mockResolvedValue(csvFilePath);

            // Execute
            const result = await useCase.execute(campaignId);

            // Assert
            expect(mockContactBuilderService.buildYoungContactRow).toHaveBeenCalledTimes(2); // Once for young and once for referent
            expect(mockContactBuilderService.buildReferentContactRow).toHaveBeenCalledTimes(1);
            expect(mockFileGateway.generateCSV).toHaveBeenCalledWith(
                [youngContact, referentContact],
                expect.any(Object),
            );
            expect(result).toBe(csvFilePath);
        });

        it("should include chef establishment contacts when CHEFS_ETABLISSEMENT is in destinataires", async () => {
            // Setup
            const campaignId = "campaign-id";
            const youngsList = {
                hits: [{ id: "young1", firstName: "John", lastName: "Doe", classeId: "classe1" }],
                total: 1,
            };

            const relatedData = {
                centres: [{ id: "centre1" }],
                pointDeRassemblements: [{ id: "pdr1" }],
                lignes: [{ id: "ligne1" }],
                segmentDeLignes: [{ id: "segment1" }],
                classes: [{ id: "classe1", etablissementId: "etab1" }],
                referentsClasse: [],
                etablissements: [{ id: "etab1", referentEtablissementIds: ["chef1"] }],
                chefsEtablissement: [{ id: "chef1", prenom: "Chef", nom: "Etablissement" }],
                coordinateursCle: [],
                sejours: [],
                chefsDeCentre: [],
            } as unknown as RelatedDataResult;

            const youngContact = {
                type: ColumnType.jeunes,
                PRENOM: "John",
                NOM: "Doe",
                EMAIL: "john.doe@example.com",
            } as unknown as ColumnCsvName;

            const chefEtabContact = {
                type: ColumnType["chefs-etablissement"],
                PRENOM: "Chef",
                NOM: "Etablissement",
                EMAIL: "chef@example.com",
            } as unknown as ColumnCsvName;

            const csvFilePath = "path/to/csv/file.csv";

            mockCampaignProcessorService.validateAndProcessCampaign.mockResolvedValue({
                destinataires: [DestinataireListeDiffusion.JEUNES, DestinataireListeDiffusion.CHEFS_ETABLISSEMENT],
                youngs: youngsList,
                contactsQuery: {},
            } as unknown as CampaignProcessorResult);

            mockDataFetcherService.fetchRelatedData.mockResolvedValue(relatedData);

            mockContactBuilderService.buildYoungContactRow.mockReturnValue(youngContact);
            mockContactBuilderService.buildChefEtablissementContactRow.mockReturnValue(chefEtabContact);

            mockFileGateway.generateCSV.mockResolvedValue(csvFilePath);

            // Execute
            const result = await useCase.execute(campaignId);

            // Assert
            expect(mockContactBuilderService.buildYoungContactRow).toHaveBeenCalledTimes(2); // Once for young and once for chef
            expect(mockContactBuilderService.buildChefEtablissementContactRow).toHaveBeenCalledTimes(1);
            expect(mockFileGateway.generateCSV).toHaveBeenCalledWith(
                [youngContact, chefEtabContact],
                expect.any(Object),
            );
            expect(result).toBe(csvFilePath);
        });

        it("should include chef centre contacts when CHEFS_CENTRES is in destinataires", async () => {
            // Setup
            const campaignId = "campaign-id";
            const youngsList = {
                hits: [{ id: "young1", firstName: "John", lastName: "Doe", classeId: "classe1" }],
                total: 1,
            };

            const relatedData = {
                centres: [{ id: "centre1" }],
                pointDeRassemblements: [{ id: "pdr1" }],
                lignes: [{ id: "ligne1" }],
                segmentDeLignes: [{ id: "segment1" }],
                classes: [{ id: "classe1", sejourId: "sejour1" }],
                referentsClasse: [],
                etablissements: [],
                chefsEtablissement: [],
                coordinateursCle: [],
                sejours: [{ id: "sejour1", chefDeCentreReferentId: "chef1" }],
                chefsDeCentre: [{ id: "chef1", prenom: "Chef", nom: "Centre" }],
            } as unknown as RelatedDataResult;

            const youngContact = {
                type: ColumnType.jeunes,
                PRENOM: "John",
                NOM: "Doe",
                EMAIL: "john.doe@example.com",
            } as unknown as ColumnCsvName;

            const chefCentreContact = {
                type: ColumnType["chefs-centres"],
                PRENOM: "Chef",
                NOM: "Centre",
                EMAIL: "chefCentre@example.com",
            } as unknown as ColumnCsvName;

            const csvFilePath = "path/to/csv/file.csv";

            mockCampaignProcessorService.validateAndProcessCampaign.mockResolvedValue({
                destinataires: [DestinataireListeDiffusion.JEUNES, DestinataireListeDiffusion.CHEFS_CENTRES],
                youngs: youngsList,
                contactsQuery: {},
            } as unknown as CampaignProcessorResult);

            mockDataFetcherService.fetchRelatedData.mockResolvedValue(relatedData);

            mockContactBuilderService.buildYoungContactRow.mockReturnValue(youngContact);
            mockContactBuilderService.buildChefCentreContactRow.mockReturnValue(chefCentreContact);

            mockFileGateway.generateCSV.mockResolvedValue(csvFilePath);

            // Execute
            const result = await useCase.execute(campaignId);

            // Assert
            expect(mockContactBuilderService.buildYoungContactRow).toHaveBeenCalledTimes(2); // Once for young and once for chef
            expect(mockContactBuilderService.buildChefCentreContactRow).toHaveBeenCalledTimes(1);
            expect(mockFileGateway.generateCSV).toHaveBeenCalledWith(
                [youngContact, chefCentreContact],
                expect.any(Object),
            );
            expect(result).toBe(csvFilePath);
        });

        it("should include coordinateur CLE contacts when COORDINATEURS_CLE is in destinataires", async () => {
            // Setup
            const campaignId = "campaign-id";
            const youngsList = {
                hits: [{ id: "young1", firstName: "John", lastName: "Doe", classeId: "classe1" }],
                total: 1,
            };

            const relatedData = {
                centres: [{ id: "centre1" }],
                pointDeRassemblements: [{ id: "pdr1" }],
                lignes: [{ id: "ligne1" }],
                segmentDeLignes: [{ id: "segment1" }],
                classes: [{ id: "classe1", etablissementId: "etab1" }],
                referentsClasse: [],
                etablissements: [{ id: "etab1", coordinateurIds: ["coord1"] }],
                chefsEtablissement: [],
                coordinateursCle: [{ id: "coord1", prenom: "Coordinateur", nom: "CLE" }],
                sejours: [],
                chefsDeCentre: [],
            } as unknown as RelatedDataResult;

            const youngContact = {
                type: ColumnType.jeunes,
                PRENOM: "John",
                NOM: "Doe",
                EMAIL: "john.doe@example.com",
            } as unknown as ColumnCsvName;

            const coordCleContact = {
                type: ColumnType.administrateurs,
                PRENOM: "Coordinateur",
                NOM: "CLE",
                EMAIL: "coordinateur@example.com",
            } as unknown as ColumnCsvName;

            const csvFilePath = "path/to/csv/file.csv";

            mockCampaignProcessorService.validateAndProcessCampaign.mockResolvedValue({
                destinataires: [DestinataireListeDiffusion.JEUNES, DestinataireListeDiffusion.COORDINATEURS_CLE],
                youngs: youngsList,
                contactsQuery: {},
            } as unknown as CampaignProcessorResult);

            mockDataFetcherService.fetchRelatedData.mockResolvedValue(relatedData);

            mockContactBuilderService.buildYoungContactRow.mockReturnValue(youngContact);
            mockContactBuilderService.buildCoordinateurCleContactRow.mockReturnValue(coordCleContact);

            mockFileGateway.generateCSV.mockResolvedValue(csvFilePath);

            // Execute
            const result = await useCase.execute(campaignId);

            // Assert
            expect(mockContactBuilderService.buildYoungContactRow).toHaveBeenCalledTimes(2); // Once for young and once for coord
            expect(mockContactBuilderService.buildCoordinateurCleContactRow).toHaveBeenCalledTimes(1);
            expect(mockFileGateway.generateCSV).toHaveBeenCalledWith(
                [youngContact, coordCleContact],
                expect.any(Object),
            );
            expect(result).toBe(csvFilePath);
        });

        it("should throw an exception when no contacts are generated", async () => {
            // Setup
            const campaignId = "campaign-id";
            const youngsList = {
                hits: [{ id: "young1", firstName: "John", lastName: "Doe" }],
                total: 1,
            };

            mockCampaignProcessorService.validateAndProcessCampaign.mockResolvedValue({
                destinataires: [], // No destinataires = no contacts will be generated
                youngs: youngsList,
                contactsQuery: {},
            } as unknown as CampaignProcessorResult);

            mockDataFetcherService.fetchRelatedData.mockResolvedValue({
                centres: [],
                pointDeRassemblements: [],
                lignes: [],
                segmentDeLignes: [],
                classes: [],
                referentsClasse: [],
                etablissements: [],
                chefsEtablissement: [],
                coordinateursCle: [],
                sejours: [],
                chefsDeCentre: [],
            } as unknown as RelatedDataResult);

            // Execute & Assert
            await expect(useCase.execute(campaignId)).rejects.toThrow(
                new FunctionalException(FunctionalExceptionCode.NO_CONTACTS),
            );
        });
    });
});
