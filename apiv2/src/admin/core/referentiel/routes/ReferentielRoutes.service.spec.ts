import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { ReferentielRoutesService } from "./ReferentielRoutes.service";
import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { FunctionalException } from "@shared/core/FunctionalException";
import { ReferentielTaskType, TaskName, TaskStatus } from "snu-lib";

describe("ReferentielRoutesService", () => {
    let referentielRoutesService: ReferentielRoutesService;
    let fileGateway: FileGateway;
    let taskGateway: TaskGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReferentielRoutesService,
                Logger,
                {
                    provide: FileGateway,
                    useValue: {
                        readXLS: jest.fn().mockResolvedValue([{}]),
                        uploadFile: jest.fn().mockResolvedValue({}),
                    },
                },
                { provide: TaskGateway, useValue: { create: jest.fn() } },
            ],
        }).compile();

        fileGateway = module.get<FileGateway>(FileGateway);
        taskGateway = module.get<TaskGateway>(TaskGateway);
        referentielRoutesService = module.get<ReferentielRoutesService>(ReferentielRoutesService);
    });

    describe("import", () => {
        it("should not import empty file", () => {
            jest.spyOn(fileGateway, "readXLS").mockResolvedValue([]);
            expect(
                referentielRoutesService.import({
                    fileName: "fileName",
                    // @ts-ignore
                    buffer: null,
                    mimetype: "mimetype",
                    auteur: {
                        id: "id",
                        prenom: "prenom",
                        nom: "nom",
                        role: "role",
                        sousRole: "sousRole",
                    },
                }),
            ).rejects.toThrow(FunctionalException);
        });
        it("should not import file without valid column", () => {
            jest.spyOn(fileGateway, "readXLS").mockResolvedValue([{}]);
            expect(
                referentielRoutesService.import({
                    fileName: "fileName",
                    // @ts-ignore
                    buffer: null,
                    mimetype: "mimetype",
                    auteur: {
                        id: "id",
                        prenom: "prenom",
                        nom: "nom",
                        role: "role",
                        sousRole: "sousRole",
                    },
                }),
            ).rejects.toThrow(FunctionalException);
        });
        it("should not import file with valid column", async () => {
            jest.spyOn(fileGateway, "readXLS").mockResolvedValue([
                {
                    "Session formule": "",
                    "Code court de Route": "",
                    "Commentaire interne sur l'enregistrement": "",
                    "Session : Code de la session": "",
                    "Session : Désignation de la session": "",
                    "Session : Date de début de la session": "",
                    "Session : Date de fin de la session": "",
                    Route: "",
                    "Code point de rassemblement initial": "",
                    "Point de rassemblement initial": "",
                },
            ]);
            const result = await referentielRoutesService.import({
                fileName: "fileName",
                // @ts-ignore
                buffer: null,
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
                        type: ReferentielTaskType.IMPORT_ROUTES,
                        fileKey: undefined,
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
    });
});
