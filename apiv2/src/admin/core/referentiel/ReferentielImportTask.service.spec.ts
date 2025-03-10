import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ReferentielTaskType, TaskName, TaskStatus } from "snu-lib";
import { ReferentielImportTaskService } from "./ReferentielImportTask.service";
import { IMPORT_REQUIRED_COLUMN_NAMES } from "./Referentiel";
import { ClockGateway } from "@shared/core/Clock.gateway";

describe("ReferentielImportTaskService", () => {
    let referentielImportTaskService: ReferentielImportTaskService;
    let fileGateway: FileGateway;
    let taskGateway: TaskGateway;
    const REGION_ACADEMIQUE_COLUMN_NAMES = IMPORT_REQUIRED_COLUMN_NAMES[ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReferentielImportTaskService,
                Logger,
                {
                    provide: ClockGateway,
                    useValue: {
                        now: jest.fn().mockReturnValue(new Date("2024-07-31T00:00:00.000Z")),
                        formatSafeDateTime: jest.fn().mockReturnValue("2024-07-31T00:00:00.000Z"),
                    },
                },
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
        referentielImportTaskService = module.get<ReferentielImportTaskService>(ReferentielImportTaskService);
    });

    const regionAcademiqueRecord = {
        [REGION_ACADEMIQUE_COLUMN_NAMES[0]]: "BRE",
        [REGION_ACADEMIQUE_COLUMN_NAMES[1]]: "BRETAGNE",
        [REGION_ACADEMIQUE_COLUMN_NAMES[2]]: "A",
        [REGION_ACADEMIQUE_COLUMN_NAMES[3]]: "31/07/2024",
    };

    describe("import", () => {
        const mockAuteur = {
            id: "id",
            prenom: "prenom",
            nom: "nom",
            role: "role",
            sousRole: "sousRole",
        };

        const mockImportParams = {
            importType: ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES,
            fileName: "fileName",
            buffer: Buffer.from("test"),
            mimetype: "mimetype",
            auteur: mockAuteur,
        };

        it("should not import empty file", async () => {
            jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([]);
            await expect(
                referentielImportTaskService.import({
                    importType: ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES,
                    fileName: "fileName",
                    buffer: Buffer.from(""),
                    mimetype: "mimetype",
                    auteur: mockAuteur,
                }),
            ).rejects.toThrow(new FunctionalException(FunctionalExceptionCode.IMPORT_EMPTY_FILE));
        });

        it("should not import file without valid column", async () => {
            jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([
                {
                    "Session formule": "",
                    "Code court de Route": "",
                    "Commentaire interne sur l'enregistrement": "",
                    "Session : Code de la session": "",
                    "Session : Désignation de la session": "",
                    "Session : Date de début de la session": "",
                    "Session : Date de fin de la session": "",
                    // Route: "",
                    "Code point de rassemblement initial": "",
                    "Point de rassemblement initial": "",
                },
            ]);
            await expect(
                referentielImportTaskService.import({
                    importType: ReferentielTaskType.IMPORT_ROUTES,
                    fileName: "fileName",
                    buffer: Buffer.from("test"),
                    mimetype: "mimetype",
                    auteur: {
                        id: "id",
                        prenom: "prenom",
                        nom: "nom",
                        role: "role",
                        sousRole: "sousRole",
                    },
                }),
            ).rejects.toThrow(new FunctionalException(FunctionalExceptionCode.IMPORT_MISSING_COLUMN));
        });

        it("should import file with valid columns", async () => {
            jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([regionAcademiqueRecord]);

            await referentielImportTaskService.import({
                importType: ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES,
                fileName: "fileName",
                buffer: Buffer.from("test"),
                mimetype: "mimetype",
                auteur: {
                    id: "id",
                    prenom: "prenom",
                    nom: "nom",
                    role: "role",
                    sousRole: "sousRole",
                },
            });

            expect(taskGateway.create).toHaveBeenCalledWith({
                name: TaskName.REFERENTIEL_IMPORT,
                status: TaskStatus.PENDING,
                metadata: {
                    parameters: {
                        type: ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES,
                        fileKey: "test-key",
                        fileLineCount: 1,
                        fileName: "fileName",
                        auteur: {
                            id: "id",
                            prenom: "prenom",
                            nom: "nom",
                            role: "role",
                            sousRole: "sousRole",
                        },
                    },
                },
            });
        });

        it("devrait vérifier la présence de toutes les colonnes requises", async () => {
            const partialData = {
                "Code région académique": "RA01",
                "Région académique : Libellé région académique long": "Test Region",
                // Colonne manquante: "Zone région académique édition"
                "Région académique : Date de création": "2023-01-01",
                "Région académique : Date de dernière modification": "2023-01-02",
            };

            jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([partialData]);

            await expect(referentielImportTaskService.import(mockImportParams)).rejects.toThrow(
                new FunctionalException(
                    FunctionalExceptionCode.IMPORT_MISSING_COLUMN,
                    "Zone région académique édition",
                ),
            );
        });
    });
});
