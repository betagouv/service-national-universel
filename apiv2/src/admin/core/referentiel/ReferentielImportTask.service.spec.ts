import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ReferentielTaskType, TaskName, TaskStatus } from "snu-lib";
import { ReferentielImportTaskService } from "./ReferentielImportTask.service";

describe("ReferentielImportTaskService", () => {
    let referentielImportTaskService: ReferentielImportTaskService;
    let fileGateway: FileGateway;
    let taskGateway: TaskGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReferentielImportTaskService,
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
        referentielImportTaskService = module.get<ReferentielImportTaskService>(ReferentielImportTaskService);
    });

    describe("import", () => {
        const mockAuteur = {
            id: "id",
            prenom: "prenom",
            nom: "nom",
            role: "role",
            sousRole: "sousRole",
        };

        const mockImportParams = {
            importType: ReferentielTaskType.IMPORT_REGION_ACADEMIQUE,
            fileName: "fileName",
            buffer: Buffer.from("test"),
            mimetype: "mimetype",
            auteur: mockAuteur,
        };

        it("should not import empty file", async () => {
            jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([]);
            await expect(
                referentielImportTaskService.import({
                    importType: ReferentielTaskType.IMPORT_REGION_ACADEMIQUE,
                    fileName: "fileName",
                    buffer: Buffer.from(""),
                    mimetype: "mimetype",
                    auteur: mockAuteur,
                }),
            ).rejects.toThrow(new FunctionalException(FunctionalExceptionCode.IMPORT_EMPTY_FILE));
        });

        it("should not import file without valid column", async () => {
            jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([{}]);
            await expect(
                referentielImportTaskService.import({
                    importType: ReferentielTaskType.IMPORT_REGION_ACADEMIQUE,
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
            jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([
                {
                    "Code région académique": "RA01",
                    "Région académique : Libellé région académique long": "Test Region",
                    "Zone région académique édition": "Zone1",
                    "Région académique : Date de création": "2023-01-01",
                    "Région académique : Date de dernière modification": "2023-01-02",
                },
            ]);
            
            await referentielImportTaskService.import({
                importType: ReferentielTaskType.IMPORT_REGION_ACADEMIQUE,
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
                        type: ReferentielTaskType.IMPORT_REGION_ACADEMIQUE,
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

            await expect(referentielImportTaskService.import(mockImportParams))
                .rejects
                .toThrow(new FunctionalException(FunctionalExceptionCode.IMPORT_MISSING_COLUMN, "Zone région académique édition"));
        });

        it("devrait gérer les erreurs lors du téléchargement du fichier", async () => {
            jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([{
                "Code région académique": "RA01",
                "Région académique : Libellé région académique long": "Test Region",
                "Zone région académique édition": "Zone1",
                "Région académique : Date de création": "2023-01-01",
                "Région académique : Date de dernière modification": "2023-01-02",
            }]);

            jest.spyOn(fileGateway, "uploadFile").mockRejectedValue(new Error("Erreur upload"));

            await expect(referentielImportTaskService.import(mockImportParams))
                .rejects
                .toThrow("Erreur upload");
        });

        it("devrait gérer les erreurs lors de la création de la tâche", async () => {
            jest.spyOn(fileGateway, "parseXLS").mockResolvedValue([{
                "Code région académique": "RA01",
                "Région académique : Libellé région académique long": "Test Region",
                "Zone région académique édition": "Zone1",
                "Région académique : Date de création": "2023-01-01",
                "Région académique : Date de dernière modification": "2023-01-02",
            }]);

            jest.spyOn(taskGateway, "create").mockRejectedValue(new Error("Erreur création tâche"));

            await expect(referentielImportTaskService.import(mockImportParams))
                .rejects
                .toThrow("Erreur création tâche");
        });
    });
});
