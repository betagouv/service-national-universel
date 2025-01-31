import { Test, TestingModule } from '@nestjs/testing';
import { RegionAcademiqueImportService } from '../../RegionAcademiqueImport.service';
import { FileGateway } from '@shared/core/File.gateway';
import { ReferentielTaskType } from 'snu-lib';
import { RegionAcademiqueGateway } from '../../RegionAcademique.gateway';
import { ImporterRegionsAcademiques } from './ImporterRegionsAcademiques';
import { ReferentielImportTaskParameters } from '@admin/core/referentiel/ReferentielImportTask.model';
import { Logger } from '@nestjs/common';
import { ClockGateway } from '@shared/core/Clock.gateway';
import { NotificationGateway } from '@notification/core/Notification.gateway';
import { REGION_ACADEMIQUE_COLUMN_NAMES } from '../../RegionAcademique.model';
import { RegionAcademiqueMapper } from '../../RegionAcademiqueMapper';

describe('ImporterRegionsAcademiques', () => {
  let useCase: ImporterRegionsAcademiques;
  let regionAcademiqueImportService: RegionAcademiqueImportService;
  let regionAcademiqueGateway: RegionAcademiqueGateway;
  let fileGateway: FileGateway;

  const mockDate = "31/07/2024";
  const mockDatePlus1 = "01/08/2024";

  let regionAcademiqueRecord = {
    [REGION_ACADEMIQUE_COLUMN_NAMES.code]: "BRE",
    [REGION_ACADEMIQUE_COLUMN_NAMES.libelle]: "BRETAGNE",
    [REGION_ACADEMIQUE_COLUMN_NAMES.zone]: "A",
    [REGION_ACADEMIQUE_COLUMN_NAMES.date_derniere_modification_si]: mockDate
  }

  const importRegionAcademiqueModel = RegionAcademiqueMapper.fromRecord(regionAcademiqueRecord);

  let mockRegionAcademiqueDb = {
    ...importRegionAcademiqueModel,
    id: "1"
  }

  const mockParams: ReferentielImportTaskParameters = {
    type: ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES,
    fileName: "test",
    fileKey: "test",
    fileLineCount: 1,
    auteur: {
      id: "test",
      prenom: "test",
      nom: "test",
      role: "test",
      sousRole: "test"
    },
    folderPath: ''
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterRegionsAcademiques,
        RegionAcademiqueImportService,
        Logger,
        {
          provide: ClockGateway,
          useValue: {
            getNowSafeIsoDate: jest.fn().mockReturnValue(mockDate)
          }
        },
        {
          provide: NotificationGateway,
          useValue: {
            sendEmail: jest.fn()
          }
        },
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

    useCase = module.get<ImporterRegionsAcademiques>(ImporterRegionsAcademiques);
    regionAcademiqueImportService = module.get<RegionAcademiqueImportService>(RegionAcademiqueImportService);
    regionAcademiqueGateway = module.get<RegionAcademiqueGateway>(RegionAcademiqueGateway);

    fileGateway = module.get<FileGateway>(FileGateway);
  });

  describe('execute', () => {
    describe('Create région academique', () => {
      it('Not existing row', async () => {
        const params: ReferentielImportTaskParameters = {
          type: ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES,
          fileName: "test",
          fileKey: "test",
          fileLineCount: 1,
          auteur: {
            id: "test",
            prenom: "test",
            nom: "test",
            role: "test",
            sousRole: "test"
          },
          folderPath: ''
        };

        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([regionAcademiqueRecord]);
        jest.spyOn(regionAcademiqueGateway, 'findByCode').mockResolvedValue(undefined);

        const result = await useCase.execute(params);

        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(1);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);

        expect(result).toContainEqual(expect.objectContaining({
          code: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.code],
          libelle: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.libelle],
          zone: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.zone],
          dateDerniereModificationSI: expect.any(Date),
          result: "success",
        }));
      });
    });

    describe('Update région académique', () => {
      it('Existing row ET siEntity.dateDerniereModificationSI is greater than internalEntity.dateDerniereModificationSI', async () => {

        let regionAcademiqueRecordPlus1 = {
          ...regionAcademiqueRecord,
          [REGION_ACADEMIQUE_COLUMN_NAMES.date_derniere_modification_si]: mockDatePlus1
        };

        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([regionAcademiqueRecordPlus1]);
        jest.spyOn(regionAcademiqueGateway, 'findByCode').mockResolvedValue(mockRegionAcademiqueDb);

        const result = await useCase.execute(mockParams);

        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(1);

        expect(result).toContainEqual(expect.objectContaining({
          code: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.code],
          libelle: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.libelle],
          zone: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.zone],
          dateDerniereModificationSI: expect.any(Date),
          result: "success",
        }));
      });
    });

    describe('no createion, No update', () => {
      it('Empty buffer', async () => {
        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([]);

        const result = await useCase.execute(mockParams);

        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);

        expect(result).toEqual([]);
      });

      it('Data Validation - Code - Empty', async () => {
        let regionAcademiqueRecordEmpty = {
          ...regionAcademiqueRecord,
          [REGION_ACADEMIQUE_COLUMN_NAMES.code]: ""
        };

        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([regionAcademiqueRecordEmpty]);

        const result = await useCase.execute(mockParams);

        expect(result).toContainEqual(expect.objectContaining({
          code: "",
          libelle: "BRETAGNE",
          zone: "A",
          dateDerniereModificationSI: expect.any(Date),
          result: "error",
          error: "Invalid format - code"
        }));


        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);
      });

      it('Data Validation - Code - Invalid format - less than 3 letters', async () => {
        let regionAcademiqueRecordLessThan3Letters = {
          ...regionAcademiqueRecord,
          [REGION_ACADEMIQUE_COLUMN_NAMES.code]: "AB"
        };

        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([regionAcademiqueRecordLessThan3Letters]);

        const result = await useCase.execute(mockParams);

        expect(result).toContainEqual(expect.objectContaining({
          code: "AB",
          libelle: "BRETAGNE",
          zone: "A",
          dateDerniereModificationSI: expect.any(Date),
          result: "error",
          error: "Invalid format - code"
        }));

        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);
      });

      it('Data Validation - libelle - Invalid format - Empty', async () => {
        let regionAcademiqueRecordEmpty = {
          ...regionAcademiqueRecord,
          [REGION_ACADEMIQUE_COLUMN_NAMES.libelle]: ""
        };

        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([regionAcademiqueRecordEmpty]);

        const result = await useCase.execute(mockParams);

        expect(result).toContainEqual(expect.objectContaining({
          code: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.code],
          libelle: "",
          zone: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.zone],
          dateDerniereModificationSI: expect.any(Date),
          result: "error",
          error: "Invalid format - libelle"
        }));

        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);
      });

      it('Data Validation - Zone - Invalid format - Must be empty, A, B or C', async () => {
        let regionAcademiqueRecordInvalidZone = {
          ...regionAcademiqueRecord,
          [REGION_ACADEMIQUE_COLUMN_NAMES.zone]: "D"
        };

        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([regionAcademiqueRecordInvalidZone]);

        const result = await useCase.execute(mockParams);

        expect(result).toContainEqual(expect.objectContaining({
          code: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.code],
          libelle: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.libelle],
          zone: "D",
          dateDerniereModificationSI: expect.any(Date),
          result: "error",
          error: "Invalid format - zone"
        }));

        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);
      });

      it('Data Validation - Date modification SI - Invalid format - Empty', async () => {
        let regionAcademiqueRecordEmpty = {
          ...regionAcademiqueRecord,
          [REGION_ACADEMIQUE_COLUMN_NAMES.date_derniere_modification_si]: ""
        };

        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([regionAcademiqueRecordEmpty]);

        const result = await useCase.execute(mockParams);

        expect(result).toContainEqual(expect.objectContaining({
          code: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.code],
          libelle: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.libelle],
          zone: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.zone],
          dateDerniereModificationSI: expect.any(Date),
          result: "error",
          error: "Invalid format - dateDerniereModificationSI"
        }));

        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);
      }); 

      it('Data Validation - Date creation SI - Invalid format - Invalid date format', async () => {
        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([{
          ...regionAcademiqueRecord,
          [REGION_ACADEMIQUE_COLUMN_NAMES.date_derniere_modification_si]: "jeudi dernier",
        }]);

        const result = await useCase.execute(mockParams);

        expect(result).toContainEqual(expect.objectContaining({
          code: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.code],
          libelle: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.libelle],
          zone: regionAcademiqueRecord[REGION_ACADEMIQUE_COLUMN_NAMES.zone],
          dateDerniereModificationSI: expect.any(Date),
          result: "error",
          error: "Invalid format - dateDerniereModificationSI"
        }));

        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);

      }); 


      it('Existing row ET date_derniere_modification_si is less or equal than date_derniere_modification_si_db', async () => {
    
        let regionAcademiqueRecordLessThanMockDate = {
          ...regionAcademiqueRecord,
          [REGION_ACADEMIQUE_COLUMN_NAMES.date_derniere_modification_si]: mockDate,
        };

        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([regionAcademiqueRecordLessThanMockDate]);        
        
        jest.spyOn(regionAcademiqueGateway, 'findByCode').mockResolvedValue(mockRegionAcademiqueDb);

        const result = await useCase.execute(mockParams);
        expect(regionAcademiqueGateway.create).toHaveBeenCalledTimes(0);
        expect(regionAcademiqueGateway.update).toHaveBeenCalledTimes(0);

        expect(result).toEqual([{
          code: "BRE",
          dateDerniereModificationSI: new Date("2024-07-31"),
          libelle: "BRETAGNE", 
          result: "success",
          zone: "A"
        }]);
      });
    });
  });
});