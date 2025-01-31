import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import mongoose from "mongoose";
import { MIME_TYPES, ReferentielTaskType, ROLES, SUB_ROLE_GOD, TaskName, TaskStatus } from "snu-lib";
import { ReferentielImportTaskService } from "@admin/core/referentiel/ReferentielImportTask.service";
import { Test, TestingModule } from "@nestjs/testing";
import { ImportReferentielController } from "@admin/infra/referentiel/api/ImportReferentiel.controller";
import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { FileProvider } from "@shared/infra/File.provider";
import { ConfigService } from "@nestjs/config";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { ReferentielClasseService } from "@admin/core/referentiel/classe/ReferentielClasse.service";
import { ReferentielService } from "@admin/core/referentiel/Referentiel.service";
import { NotificationGateway } from "@notification/core/Notification.gateway";

describe("ImportReferentielController", () => {
    let app: INestApplication;
    let module: TestingModule;
    let mockedAddUserToRequestMiddleware;
    let referentielImportTaskService: ReferentielImportTaskService;
    let fileGateway: FileGateway;
    let taskGateway: TaskGateway;

    beforeAll(async () => {
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
    
        const mockClockGateway = {
            getNowSafeIsoDate: jest.fn(),
        };
        const mockNotificationGateway = {
            sendEmail: jest.fn(),
        };
        
         module = await Test.createTestingModule({
            controllers: [ImportReferentielController],
            providers: [
                ConfigService,
                ReferentielClasseService,
                ReferentielImportTaskService,
                ReferentielService,
                { provide: NotificationGateway, useValue: mockNotificationGateway },
                { provide: ClockGateway, useValue: mockClockGateway},
                { provide: FileGateway,
                     useFactory: () => ({
                    uploadFile: jest.fn(),
                    parseXLS: new FileProvider(new ConfigService()).parseXLS
                })},
                { provide: TaskGateway, useValue: { create: jest.fn() } },
            ],
        })
        .compile();

        app = module.createNestApplication();
        app.use(mockedAddUserToRequestMiddleware);

        await app.init();
        
        fileGateway = app.get<FileGateway>(FileGateway);
        taskGateway = app.get<TaskGateway>(TaskGateway);
        referentielImportTaskService = app.get<ReferentielImportTaskService>(ReferentielImportTaskService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(ImportReferentielController).toBeDefined();
    });

    describe("/POST referentiel/import/:name", () => {
        describe("422 - INVALID_FILE_FORMAT", () => {
            it(`no file provided`, async () => {
                const response = await request(app.getHttpServer())
                    .post(`/referentiel/import/${ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES}`)
                    .field("name", "test")
                expect(response.statusCode).toEqual(422);
                expect(response.body.message).toEqual(FunctionalExceptionCode.INVALID_FILE_FORMAT);
            });

            it(`not supported filetype`, async () => {
                const response = await request(app.getHttpServer())
                    .post("/referentiel/import/:name")
                    .attach("file", Buffer.from("test"), {
                        filename: "test.txt",
                        contentType: MIME_TYPES.PLAIN,
                    })
                    
                expect(response.statusCode).toEqual(422);
                expect(response.body.message).toEqual(FunctionalExceptionCode.INVALID_FILE_FORMAT);
            });

            it(`no originalName provided`, async () => {
                const response = await request(app.getHttpServer())
                    .post("/referentiel/import/:name")
                    .attach("file", Buffer.from(""), {
                        contentType: MIME_TYPES.PLAIN,
                    });

                expect(response.statusCode).toEqual(422);
                expect(response.body.message).toEqual(FunctionalExceptionCode.INVALID_FILE_FORMAT);
            });

            it(`no mimetype provided`, async () => {
                const response = await request(app.getHttpServer())
                    .post("/referentiel/import/:name")
                   .attach("file", Buffer.from(""), {
                        filename: "test.txt",
                    })

                expect(response.statusCode).toEqual(422);
                expect(response.body.message).toEqual(FunctionalExceptionCode.INVALID_FILE_FORMAT);
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
                expect(response.body.message).toEqual(FunctionalExceptionCode.NOT_FOUND);
            });

            it(`Missing columns`, async () => {
                const testFile = require('fs')
                .readFileSync("./test/admin/referentiel/fixtures/regions-academiques-missing-columns.xlsx");
                jest.spyOn(fileGateway, "uploadFile").mockResolvedValue({
                  Location: "test",
                  ETag: "test",
                  Bucket: "test",
                  Key: "test",
                });
                jest.spyOn(taskGateway, "create").mockResolvedValue({
                  id: "task-id",
                  name: TaskName.REFERENTIEL_IMPORT,
                  status: TaskStatus.PENDING,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
                
                const response = await request(app.getHttpServer())
                    .post(`/referentiel/import/${ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES}`)
                    .attach("file", testFile, {
                        filename: "test.xlsx",
                        contentType: MIME_TYPES.EXCEL,
                    });

                expect(response.statusCode).toEqual(422);
                expect(response.body.message).toEqual(FunctionalExceptionCode.IMPORT_MISSING_COLUMN);
            });

            it(`Empty file`, async () => {
                jest.spyOn(fileGateway, "uploadFile").mockResolvedValue({
                  Location: "test",
                  ETag: "test",
                  Bucket: "test",
                  Key: "test",
                });
                jest.spyOn(taskGateway, "create").mockResolvedValue({
                  id: "task-id",
                  name: TaskName.REFERENTIEL_IMPORT,
                  status: TaskStatus.PENDING,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
                
                const response = await request(app.getHttpServer())
                    .post(`/referentiel/import/${ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES}`)
                    .attach("file", Buffer.from(""), {
                        filename: "test.xlsx",
                        contentType: MIME_TYPES.EXCEL,
                    });

                expect(response.statusCode).toEqual(422);
                expect(response.body.message).toEqual(FunctionalExceptionCode.IMPORT_EMPTY_FILE);
            });
        });

        describe("403 - Forbidden", () => {
            it(`Invalid roles`, async () => { 
                const invalidRoles = [
                    ROLES.VISITOR,
                    ROLES.REFERENT_DEPARTMENT,
                    ROLES.REFERENT_REGION,
                    ROLES.RESPONSIBLE,
                    ROLES.HEAD_CENTER,
                    ROLES.SUPERVISOR,
                    ROLES.DSNJ,
                    ROLES.INJEP,
                    ROLES.TRANSPORTER,
                    ROLES.ADMINISTRATEUR_CLE,
                    ROLES.REFERENT_CLASSE,
                ];

                for (const role of invalidRoles) {
                    mockedAddUserToRequestMiddleware.mockImplementationOnce((req, res, next) => {
                        req.user = {
                            role: role,
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
                }
            });
        });

        describe("201 - OK", () => {
            it(`imports REGION_ACADEMIQUE`, async () => { 
                const testFile = require('fs')
                .readFileSync("./test/admin/referentiel/fixtures/regions-academiques.xlsx");
                jest.spyOn(fileGateway, "uploadFile").mockResolvedValue({
                  Location: "test",
                  ETag: "test",
                  Bucket: "test",
                  Key: "test",
                });
                jest.spyOn(taskGateway, "create").mockResolvedValue({
                  id: "task-id",
                  name: TaskName.REFERENTIEL_IMPORT,
                  status: TaskStatus.PENDING,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
                
                const response = await request(app.getHttpServer())
                    .post(`/referentiel/import/${ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES}`)
                    .attach("file", testFile, {
                        filename: "test.xlsx",
                        contentType: MIME_TYPES.EXCEL,
                    });

                expect(response.statusCode).toEqual(201);
            });

            it(`imports ROUTES`, async () => {
                const testFile = require('fs')
                    .readFileSync("./test/admin/referentiel/fixtures/routes.xlsx");
                jest.spyOn(fileGateway, "uploadFile").mockResolvedValue({
                    Location: "test",
                    ETag: "test", 
                    Bucket: "test",
                    Key: "test",
                });
                jest.spyOn(taskGateway, "create").mockResolvedValue({
                    id: "task-id",
                    name: TaskName.REFERENTIEL_IMPORT,
                    status: TaskStatus.PENDING,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                const response = await request(app.getHttpServer())
                    .post(`/referentiel/import/${ReferentielTaskType.IMPORT_ROUTES}`)
                    .attach("file", testFile, {
                        filename: "test.xlsx",
                        contentType: MIME_TYPES.EXCEL,
                    });

                expect(response.statusCode).toEqual(201);
            });

            it(`imports DEPARTEMENTS`, async () => {
                const testFile = require('fs')
                    .readFileSync("./test/admin/referentiel/fixtures/departements.xlsx");

                jest.spyOn(fileGateway, "uploadFile").mockResolvedValue({
                    Location: "test",
                    ETag: "test",
                    Bucket: "test", 
                    Key: "test",
                });

                jest.spyOn(taskGateway, "create").mockResolvedValue({
                    id: "task-id",
                    name: TaskName.REFERENTIEL_IMPORT,
                    status: TaskStatus.PENDING,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                const response = await request(app.getHttpServer())
                    .post(`/referentiel/import/${ReferentielTaskType.IMPORT_DEPARTEMENTS}`)
                    .attach("file", testFile, {
                        filename: "test.xlsx",
                        contentType: MIME_TYPES.EXCEL,
                    });
                expect(response.statusCode).toEqual(201);
            });

            it(`imports ACADEMIES`, async () => {
                const testFile = require('fs')
                    .readFileSync("./test/admin/referentiel/fixtures/academies.xlsx");

                jest.spyOn(fileGateway, "uploadFile").mockResolvedValue({
                    Location: "test",
                    ETag: "test",
                    Bucket: "test", 
                    Key: "test",
                });

                jest.spyOn(taskGateway, "create").mockResolvedValue({
                    id: "task-id",
                    name: TaskName.REFERENTIEL_IMPORT,
                    status: TaskStatus.PENDING,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                const response = await request(app.getHttpServer())
                    .post(`/referentiel/import/${ReferentielTaskType.IMPORT_ACADEMIES}`)
                    .attach("file", testFile, {
                        filename: "test.xlsx",
                        contentType: MIME_TYPES.EXCEL,
                    });
                expect(response.statusCode).toEqual(201);
            });
        });
    });

    describe("/GET referentiel/import", () => {
        describe("403 - Forbidden", () => {
            it(`Invalid roles`, async () => { 
                const invalidRoles = [
                         ROLES.VISITOR,
                         ROLES.REFERENT_DEPARTMENT,
                         ROLES.REFERENT_REGION,
                         ROLES.RESPONSIBLE,
                         ROLES.HEAD_CENTER,
                         ROLES.SUPERVISOR,
                         ROLES.DSNJ,
                         ROLES.INJEP,
                         ROLES.TRANSPORTER,
                         ROLES.ADMINISTRATEUR_CLE,
                         ROLES.REFERENT_CLASSE,
                        ];

                for (const role of invalidRoles) {
                    mockedAddUserToRequestMiddleware.mockImplementationOnce((req, res, next) => {
                        req.user = {
                            role: role,
                        };
                        next();
                    });

                    const response = await request(app.getHttpServer())
                        .get("/referentiel/import")
                        .query({ name: TaskName.REFERENTIEL_IMPORT })
                        .query({ type: "" });

                    expect(response.statusCode).toEqual(403);
                }
            });
        });
    });

    
    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });
});
