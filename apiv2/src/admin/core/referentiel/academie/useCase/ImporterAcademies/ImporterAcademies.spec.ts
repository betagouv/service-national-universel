import { Test, TestingModule } from '@nestjs/testing';
import { FileGateway } from '@shared/core/File.gateway';
import { ReferentielTaskType } from 'snu-lib';
import { ReferentielImportTaskParameters } from '@admin/core/referentiel/ReferentielImportTask.model';
import { Logger } from '@nestjs/common';
import { ClockGateway } from '@shared/core/Clock.gateway';
import { NotificationGateway } from '@notification/core/Notification.gateway';
import { AcademieImportService } from '../../AcademieImport.service';
import { ImporterAcademies } from './ImporterAcademies';
import { AcademieGateway } from '../../Academie.gateway';
import { ACADEMIE_COLUMN_NAMES } from '../../Academie.model';
import { AcademieImportMapper } from '../../AcademieMapper';

describe('ImporterAcademies', () => {
  let useCase: ImporterAcademies;
  let academieImportService: AcademieImportService;
  let academieGateway: AcademieGateway;
  let fileGateway: FileGateway;
  let clockGateway: ClockGateway;

  const mockDate = "31/07/2024";
  const mockDatePlus1 = "01/08/2024";

  let academieRecord = {
    [ACADEMIE_COLUMN_NAMES.code]: "001",
    [ACADEMIE_COLUMN_NAMES.libelle]: "LYON",
    [ACADEMIE_COLUMN_NAMES.regionAcademique]: "AUVERGNE-RHONE-ALPES",
    [ACADEMIE_COLUMN_NAMES.dateCreationSI]: mockDate,
    [ACADEMIE_COLUMN_NAMES.dateDerniereModificationSI]: mockDate
  }

  const importAcademieModel = AcademieImportMapper.fromRecord(academieRecord);

  let mockAcademieDb = {
    ...importAcademieModel,
    id: "1"
  }

  const mockParams: ReferentielImportTaskParameters = {
    type: ReferentielTaskType.IMPORT_ACADEMIES,
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
        ImporterAcademies,
        AcademieImportService,
        Logger,
        {
          provide: ClockGateway,
          useValue: {
            getNowSafeIsoDate: jest.fn().mockReturnValue(mockDate),
            isValidDate: jest.fn().mockReturnValue(true)
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
          provide: AcademieGateway,
          useValue: {
            findByCode: jest.fn(),
            create: jest.fn(() => mockAcademieDb),
            update: jest.fn(() => mockAcademieDb),
          }
        }
      ],
    }).compile();

    useCase = module.get<ImporterAcademies>(ImporterAcademies);
    academieImportService = module.get<AcademieImportService>(AcademieImportService);
    academieGateway = module.get<AcademieGateway>(AcademieGateway);
    fileGateway = module.get<FileGateway>(FileGateway);
    clockGateway = module.get<ClockGateway>(ClockGateway);
  });

  describe('execute', () => {
    describe('Create academie', () => {
      it('Not existing row', async () => {
        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([academieRecord]);
        jest.spyOn(academieGateway, 'findByCode').mockResolvedValue(undefined);

        const result = await useCase.execute(mockParams);

        expect(academieGateway.create).toHaveBeenCalledTimes(1);
        expect(academieGateway.update).toHaveBeenCalledTimes(0);

        expect(result).toContainEqual(expect.objectContaining({
          code: "001",
          libelle: "LYON",
          regionAcademique: "AUVERGNE-RHONE-ALPES",
          dateCreationSI: expect.any(Date),
          dateDerniereModificationSI: expect.any(Date),
          result: "success",
        }));
      });
    });

    describe('Update academie', () => {
      it('Existing row ET siEntity.dateDerniereModificationSI is greater than internalEntity.dateDerniereModificationSI', async () => {
        let academieRecordPlus1 = {
          ...academieRecord,
          [ACADEMIE_COLUMN_NAMES.dateDerniereModificationSI]: mockDatePlus1
        };

        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([academieRecordPlus1]);
        jest.spyOn(academieGateway, 'findByCode').mockResolvedValue(mockAcademieDb);

        const result = await useCase.execute(mockParams);

        expect(academieGateway.create).toHaveBeenCalledTimes(0);
        expect(academieGateway.update).toHaveBeenCalledTimes(1);

        expect(result).toContainEqual(expect.objectContaining({
          code: "001",
          libelle: "LYON",
          regionAcademique: "AUVERGNE-RHONE-ALPES",
          dateCreationSI: expect.any(Date),
          dateDerniereModificationSI: expect.any(Date),
          result: "success",
        }));
      });
    });

    describe('no creation, No update', () => {
      it('Empty buffer', async () => {
        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([]);

        const result = await useCase.execute(mockParams);

        expect(academieGateway.create).toHaveBeenCalledTimes(0);
        expect(academieGateway.update).toHaveBeenCalledTimes(0);

        expect(result).toEqual([]);
      });

      it('Data Validation - Code - Empty', async () => {
        let academieRecordEmpty = {
          ...academieRecord,
          [ACADEMIE_COLUMN_NAMES.code]: ""
        };

        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([academieRecordEmpty]);

        const result = await useCase.execute(mockParams);

        expect(result).toContainEqual(expect.objectContaining({
          code: "",
          libelle: "LYON",
          regionAcademique: "AUVERGNE-RHONE-ALPES",
          dateCreationSI: expect.any(Date),
          dateDerniereModificationSI: expect.any(Date),
          result: "error",
          error: "Invalid format - code"
        }));

        expect(academieGateway.create).toHaveBeenCalledTimes(0);
        expect(academieGateway.update).toHaveBeenCalledTimes(0);
      });

      it('Data Validation - Code - Invalid format - less than 3 letters', async () => {
        let academieRecordLessThan3Letters = {
          ...academieRecord,
          [ACADEMIE_COLUMN_NAMES.code]: "01"
        };

        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([academieRecordLessThan3Letters]);

        const result = await useCase.execute(mockParams);

        expect(result).toContainEqual(expect.objectContaining({
          code: "01",
          libelle: "LYON",
          regionAcademique: "AUVERGNE-RHONE-ALPES",
          dateCreationSI: expect.any(Date),
          dateDerniereModificationSI: expect.any(Date),
          result: "error",
          error: "Invalid format - code"
        }));

        expect(academieGateway.create).toHaveBeenCalledTimes(0);
        expect(academieGateway.update).toHaveBeenCalledTimes(0);
      });

      it('Data Validation - libelle - Invalid format - Empty', async () => {
        let academieRecordEmpty = {
          ...academieRecord,
          [ACADEMIE_COLUMN_NAMES.libelle]: ""
        };

        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([academieRecordEmpty]);

        const result = await useCase.execute(mockParams);

        expect(result).toContainEqual(expect.objectContaining({
          code: "001",
          libelle: "",
          regionAcademique: "AUVERGNE-RHONE-ALPES",
          dateCreationSI: expect.any(Date),
          dateDerniereModificationSI: expect.any(Date),
          result: "error",
          error: "Invalid format - libelle"
        }));

        expect(academieGateway.create).toHaveBeenCalledTimes(0);
        expect(academieGateway.update).toHaveBeenCalledTimes(0);
      });

      it('Data Validation - Date modification SI - Invalid format - Empty', async () => {
        let academieRecordEmpty = {
          ...academieRecord,
          [ACADEMIE_COLUMN_NAMES.dateDerniereModificationSI]: ""
        };
        jest.spyOn(clockGateway, 'isValidDate').mockRestore();
        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([academieRecordEmpty]);

        const result = await useCase.execute(mockParams);

        expect(result).toContainEqual(expect.objectContaining({
          code: "001",
          libelle: "LYON",
          regionAcademique: "AUVERGNE-RHONE-ALPES",
          dateCreationSI: expect.any(Date),
          dateDerniereModificationSI: expect.any(Date),
          result: "error",
          error: "Invalid format - dateDerniereModificationSI"
        }));

        expect(academieGateway.create).toHaveBeenCalledTimes(0);
        expect(academieGateway.update).toHaveBeenCalledTimes(0);
      });

      it('Data Validation - Date modification SI - Invalid format - Invalid date format', async () => {
        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([{
          ...academieRecord,
          [ACADEMIE_COLUMN_NAMES.dateDerniereModificationSI]: "jeudi dernier",
        }]);
        jest.spyOn(clockGateway, 'isValidDate').mockRestore();

        const result = await useCase.execute(mockParams);

        expect(result).toContainEqual(expect.objectContaining({
          code: "001",
          libelle: "LYON",
          regionAcademique: "AUVERGNE-RHONE-ALPES",
          dateCreationSI: expect.any(Date),
          dateDerniereModificationSI: expect.any(Date),
          result: "error",
          error: "Invalid format - dateDerniereModificationSI"
        }));

        expect(academieGateway.create).toHaveBeenCalledTimes(0);
        expect(academieGateway.update).toHaveBeenCalledTimes(0);
      });

      it('Existing row ET date_derniere_modification_si is less or equal than date_derniere_modification_si_db', async () => {
        let academieRecordLessThanMockDate = {
          ...academieRecord,
          [ACADEMIE_COLUMN_NAMES.dateDerniereModificationSI]: mockDate,
        };

        jest.spyOn(fileGateway, 'parseXLS').mockResolvedValue([academieRecordLessThanMockDate]);        
        
        jest.spyOn(academieGateway, 'findByCode').mockResolvedValue(mockAcademieDb);

        const result = await useCase.execute(mockParams);
        expect(academieGateway.create).toHaveBeenCalledTimes(0);
        expect(academieGateway.update).toHaveBeenCalledTimes(0);

        expect(result).toEqual([{
          code: "001",
          libelle: "LYON",
          regionAcademique: "AUVERGNE-RHONE-ALPES",
          dateCreationSI: new Date("2024-07-31"),
          dateDerniereModificationSI: new Date("2024-07-31"),
          result: "success"
        }]);
      });
    });
  });
});