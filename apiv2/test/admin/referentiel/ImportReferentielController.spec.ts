import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { setupAdminTest } from "../setUpAdminTest";
import mongoose from "mongoose";
import { MIME_TYPES, ReferentielTaskType, ROLES, SUB_ROLE_GOD, TaskName, TaskStatus } from "snu-lib";
import { ReferentielImportTaskService } from "@admin/core/referentiel/ReferentielImportTask.service";
import { TestingModule } from "@nestjs/testing";
import { ImportReferentielController } from "@admin/infra/referentiel/api/ImportReferentiel.controller";

describe("ImportReferentielController", () => {
    let app: INestApplication;
    let mockedAddUserToRequestMiddleware;
    let module: TestingModule;
    let referentielImportTaskService: ReferentielImportTaskService;

    beforeAll(async () => {
        const appSetup = await setupAdminTest({ newContainer: true });
        app = appSetup.app;
        module = appSetup.adminTestModule;

        referentielImportTaskService = module.get<ReferentielImportTaskService>(ReferentielImportTaskService);
        mockedAddUserToRequestMiddleware = jest.fn((req, _res, next) => {
            req.user = {
                id: "1",
                prenom: "test",
                nom: "test",
                role: ROLES.ADMIN,
                sousRole: SUB_ROLE_GOD,
            };
            next();
        });
        app.use(mockedAddUserToRequestMiddleware);
        await app.init();
    });

    it("should be defined", () => {
        expect(ImportReferentielController).toBeDefined();
    });

    describe("/POST referentiel/import/:name", () => {
        describe("422 - INVALID_FILE_FORMAT", () => {
            it(`no file provided`, async () => {
                const response = await request(app.getHttpServer())
                    .post("/referentiel/import/:name")
                    .field("name", "test")
                expect(response.statusCode).toEqual(422);
                expect(response.body.message).toEqual("INVALID_FILE_FORMAT");
            });

            it(`not supported filetype`, async () => {
                const response = await request(app.getHttpServer())
                    .post("/referentiel/import/:name")
                    .attach("file", Buffer.from("test"), {
                        filename: "test.txt",
                        contentType: MIME_TYPES.PLAIN,
                    })
                    
                expect(response.statusCode).toEqual(422);
                expect(response.body.message).toEqual("INVALID_FILE_FORMAT");
            });

            it(`no originalName provided`, async () => {
                const response = await request(app.getHttpServer())
                    .post("/referentiel/import/:name")
                    .attach("file", Buffer.from(""), {
                        contentType: MIME_TYPES.PLAIN,
                    });

                expect(response.statusCode).toEqual(422);
                expect(response.body.message).toEqual("INVALID_FILE_FORMAT");
            });

            it(`no mimetype provided`, async () => {
                const response = await request(app.getHttpServer())
                    .post("/referentiel/import/:name")
                   .attach("file", Buffer.from(""), {
                        filename: "test.txt",
                    })

                expect(response.statusCode).toEqual(422);
                expect(response.body.message).toEqual("INVALID_FILE_FORMAT");
            });
        });

        describe("422 - Unprocessable Entity", () => {
            it(`not supported import type`, async () => {
                const response = await request(app.getHttpServer())
                    .post("/referentiel/import/:name")
                    .attach("file", Buffer.from(""), {
                        filename: "test.xlsx",
                        contentType: MIME_TYPES.EXCEL
                    });

                expect(response.statusCode).toEqual(422);
                expect(response.body.message).toEqual("NOT_FOUND");
            });

        });

        describe("403 - Forbidden", () => {
            it(`invalid role`, async () => { 
                mockedAddUserToRequestMiddleware.mockImplementationOnce((req, res, next) => {
                    req.user = {
                        role: "admin_cle",
                    };
                    next();
                });
                const response = await request(app.getHttpServer())
                .post("/referentiel/import/:name")
                .attach("file", Buffer.from(""), {
                    filename: "test.xlsx",
                    contentType: MIME_TYPES.EXCEL
                });


                expect(response.statusCode).toEqual(403);
            });
        });

        describe("201 - OK", () => {
            it(`import REGION_ACADEMIQUE`, async () => { 
                const testFile = require('fs').readFileSync("./test/admin/referentiel/fixtures/regions-academiques.xlsx");
                jest.spyOn(referentielImportTaskService, "import").mockResolvedValue({
                    id: "task-id",
                    name: TaskName.REFERENTIEL_IMPORT,
                    status: TaskStatus.PENDING,
                    metadata: {
                        parameters: {
                            type: ReferentielTaskType.IMPORT_REGION_ACADEMIQUE,
                            fileName: "test.xlsx",
                            fileLineCount: 10,
                            auteur: {
                                id: "user-id",
                                prenom: "John",
                                nom: "Doe", 
                                role: "admin",
                                sousRole: "super"
                            }
                        }
                    },
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                
                const response = await request(app.getHttpServer())
                    .post(`/referentiel/import/${ReferentielTaskType.IMPORT_REGION_ACADEMIQUE}`)
                    .attach("file", testFile, {
                        filename: "test.xlsx",
                        contentType: MIME_TYPES.EXCEL,
                    });

                expect(response.statusCode).toEqual(201);
            });
        });
    });

    describe("/GET referentiel/import", () => {
        describe("200 - OK", () => {
            it(`get imports`, async () => { 
                const response = await request(app.getHttpServer())
                    .get("/referentiel/import")
                    .query({ 
                        name: TaskName.REFERENTIEL_IMPORT,
                        type: "test",
                        status: TaskStatus.PENDING,
                        sort: "ASC",
                        limit: 10,
                     })
                    .query({ type: "test" });

                expect(response.statusCode).toEqual(200);
            });
        });

        describe("403 - Forbidden", () => {
            it(`invalid role`, async () => { 
                mockedAddUserToRequestMiddleware.mockImplementationOnce((req, res, next) => {
                    req.user = {
                        role: ROLES.VISITOR,
                    };
                    next();
                });

                const response = await request(app.getHttpServer())
                    .get("/referentiel/import")
                    .query({ name: TaskName.REFERENTIEL_IMPORT })
                    .query({ type: "" });

                expect(response.statusCode).toEqual(403);
            });
        });
    });

    
    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });
});
