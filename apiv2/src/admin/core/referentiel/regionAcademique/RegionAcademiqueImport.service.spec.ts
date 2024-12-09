import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { RegionAcademiqueImportService } from "./ReferentielRegionAcademiqueImport.service";

describe("RegionAcademiqueService", () => {
    let regionAcademiqueImportService: RegionAcademiqueImportService;
    let fileGateway: FileGateway;
    let taskGateway: TaskGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RegionAcademiqueImportService,
                Logger,
                {
                    provide: FileGateway,
                    useValue: {
                        parseXLS: jest.fn().mockResolvedValue([{}]),
                        uploadFile: jest.fn().mockResolvedValue({ Key: "test-key" }),
                    },
                },
                { provide: TaskGateway, useValue: { create: jest.fn() } },
            ],
        }).compile();

        fileGateway = module.get<FileGateway>(FileGateway);
        taskGateway = module.get<TaskGateway>(TaskGateway);
        regionAcademiqueImportService = module.get<RegionAcademiqueImportService>(RegionAcademiqueImportService);
    });

    describe("import", () => {
      
    });
});
