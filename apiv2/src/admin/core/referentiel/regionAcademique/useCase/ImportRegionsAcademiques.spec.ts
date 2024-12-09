import { Test, TestingModule } from '@nestjs/testing';
import { ImportRegionsAcademiques } from './ImportRegionsAcademiques';
import { RegionAcademiqueImportService } from '../ReferentielRegionAcademiqueImport.service';
import { FileGateway } from '@shared/core/File.gateway';
import { ReferentielImportTaskParameters } from 'snu-lib';

describe('ImporterRegionsAcademiques', () => {
  let useCase: ImportRegionsAcademiques;
  let regionAcademiqueImportService: RegionAcademiqueImportService;
  let fileGateway: FileGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportRegionsAcademiques,
        {
          provide: RegionAcademiqueImportService,
          useValue: {
            upsert: jest.fn(),
          },
        },
        {
          provide: FileGateway,
          useValue: {
            downloadFile: jest.fn(),
            parseXLS: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ImportRegionsAcademiques>(ImportRegionsAcademiques);
    regionAcademiqueImportService = module.get<RegionAcademiqueImportService>(RegionAcademiqueImportService);
    fileGateway = module.get<FileGateway>(FileGateway);
  });

  describe('execute', () => {
    it('should import regions academiques', async () => {
    });

    
  });
});
