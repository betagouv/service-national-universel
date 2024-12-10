import { Test, TestingModule } from '@nestjs/testing';
import { ImportRegionsAcademiques, RegionAcademiqueValidationError } from './ImportRegionsAcademiques';
import { RegionAcademiqueImportService } from '../RegionAcademiqueImport.service';
import { FileGateway } from '@shared/core/File.gateway';
import { complyDate, ReferentielImportTaskParameters, ReferentielTaskType } from 'snu-lib';
import { RegionAcademiqueGateway } from '../RegionAcademique.gateway';

describe('ImporterRegionsAcademiques', () => {
  let useCase: ImportRegionsAcademiques;
  let regionAcademiqueImportService: RegionAcademiqueImportService;
  let regionAcademiqueGateway: RegionAcademiqueGateway;
  let fileGateway: FileGateway;

  const mockDate = "31/07/2024";
  const mockDatePlus1 = "01/08/2024";

  let mockRegionAcademique = {
    code: "BRE",
    libelle: "BRETAGNE",
    zone: "A",
    dateDerniereModificationSI: complyDate(mockDate)
  }

  let mockRegionAcademiqueDb = {
    ...mockRegionAcademique,
    id: "1"
  }

  const mockParams: ReferentielImportTaskParameters = {
    type: ReferentielTaskType.IMPORT_REGION_ACADEMIQUE,
    fileName: "test",
    fileKey: "test",
    fileLineCount: 1,
    auteur: {
      id: "test",
      prenom: "test",
      nom: "test",
      role: "test",
      sousRole: "test"
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportRegionsAcademiques,
        RegionAcademiqueImportService,
        {
          provide: FileGateway,
          useValue: {
            downloadFile: jest.fn().mockResolvedValue({ Body: 'mocked file content' }),
            parseXLS: jest.fn()
          }
        },
        {
          provide: RegionAcademiqueGateway,
          useValue: {
            findByCode: jest.fn(),
            create: jest.fn(() => mockRegionAcademiqueDb),
            update: jest.fn(() => mockRegionAcademiqueDb),
          }
        }
      ],
    }).compile();

    useCase = module.get<ImportRegionsAcademiques>(ImportRegionsAcademiques);
    regionAcademiqueImportService = module.get<RegionAcademiqueImportService>(RegionAcademiqueImportService);
    regionAcademiqueGateway = module.get<RegionAcademiqueGateway>(RegionAcademiqueGateway);

    fileGateway = module.get<FileGateway>(FileGateway);
  });

  describe('execute', () => {
    describe('Create région academique', () => {
      it('Not existing row', async () => {
        const params: ReferentielImportTaskParameters = {
          type: ReferentielTaskType.IMPORT_REGION_ACADEMIQUE,
          fileName: "test",
          fileKey: "test",
          fileLineCount: 1,
          auteur: {
          id: "test",
          prenom: "test",
          nom: "test",
          role: "test",
          sousRole: "test"
        }
      };

        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([{
          code: mockRegionAcademique.code,
          libelle: mockRegionAcademique.libelle,
          zone: mockRegionAcademique.zone,
          dateDerniereModificationSI: mockDate,
        }]);
        jest.spyOn(regionAcademiqueGateway, 'findByCode').mockResolvedValue(null);

        const result = await useCase.execute(params);

        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(1);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);

        expect(result).toBeUndefined();
      });
    });

    describe('Update région académique', () => {
      it('Existing row ET siEntity.dateDerniereModificationSI is greater than internalEntity.dateDerniereModificationSI', async () => {

        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([{
          code: mockRegionAcademique.code,
          libelle: mockRegionAcademique.libelle,
          zone: mockRegionAcademique.zone,
          dateDerniereModificationSI: mockDatePlus1,
        }]);
        jest.spyOn(regionAcademiqueGateway, 'findByCode').mockResolvedValue(mockRegionAcademiqueDb);

        const result = await useCase.execute(mockParams);

        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(1);

        expect(result).toBeUndefined();
      });
    });

    describe('no createion, No update', () => {
      it('Empty buffer', async () => {
        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([]);

        const result = await useCase.execute(mockParams);

        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);

        expect(result).toBeUndefined();
      });

      it('Data Validation - Code - Empty', async () => {
        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([{
          code: "",
          libelle: mockRegionAcademique.libelle,
          zone: mockRegionAcademique.zone,
          dateDerniereModificationSI: mockDate,
        }]);

        await expect(useCase.execute(mockParams)).rejects
        .toThrow(new RegionAcademiqueValidationError('Invalid format'));


        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);
      });

      it('Data Validation - Code - Invalid format - less than 3 letters', async () => {
        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([{
          code: "AB",
          libelle: mockRegionAcademique.libelle,
          zone: mockRegionAcademique.zone,
          dateDerniereModificationSI: mockDate,
        }]);

        await expect(useCase.execute(mockParams)).rejects
        .toThrow(new RegionAcademiqueValidationError('Invalid format'));


        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);
      });

      it('Data Validation - libelle - Invalid format - Empty', async () => {
        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([{
          code: mockRegionAcademique.code,
          libelle: "",
          zone: mockRegionAcademique.zone,
          dateDerniereModificationSI: mockDate,
        }]);

        await expect(useCase.execute(mockParams)).rejects
        .toThrow(new RegionAcademiqueValidationError('Invalid format'));


        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);
      });

      it('Data Validation - Zone - Invalid format - Must be empty, A, B or C', async () => {
        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([{
          code: mockRegionAcademique.code,
          libelle: mockRegionAcademique.libelle,
          zone: "D",
          dateDerniereModificationSI: mockDate,
        }]);

        await expect(useCase.execute(mockParams)).rejects
        .toThrow(new RegionAcademiqueValidationError('Invalid format'));

        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);
      });

      it('Data Validation - Date modification SI - Invalid format - Empty', async () => {
        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([{
          code: mockRegionAcademique.code,
          libelle: mockRegionAcademique.libelle,
          zone: mockRegionAcademique.zone,
          dateDerniereModificationSI: "",
        }]);

        await expect(useCase.execute(mockParams)).rejects
        .toThrow(new RegionAcademiqueValidationError('Invalid format'));

        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);
      }); 

      it('Data Validation - Date creation SI - Invalid format - Invalid date format', async () => {
        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([{
          code: mockRegionAcademique.code,
          libelle: mockRegionAcademique.libelle,
          zone: mockRegionAcademique.zone,
          dateDerniereModificationSI: "jeudi dernier",
        }]);

        await expect(useCase.execute(mockParams)).rejects
        .toThrow(new RegionAcademiqueValidationError('Invalid format'));

        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);

      }); 


      it('Existing row ET date_derniere_modification_si is less or equal than date_derniere_modification_si_db', async () => {
    
        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([{
          code: mockRegionAcademique.code,
          libelle: mockRegionAcademique.libelle,
          zone: mockRegionAcademique.zone,
          dateDerniereModificationSI: mockDate,
        }]);        
        
        jest.spyOn(regionAcademiqueGateway, 'findByCode').mockResolvedValue(mockRegionAcademiqueDb);

        const result = await useCase.execute(mockParams);
        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);

        expect(result).toBeUndefined();
      });
    });
  });
});