import * as request from "supertest";
import mongoose from "mongoose";
import { addHours } from "date-fns";
import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";

import { departmentList, GRADES, region2department, RegionsMetropole, TaskName, TaskStatus } from "snu-lib";

import { AffectationController } from "@admin/infra/sejours/phase1/affectation/api/Affectation.controller";
import { TaskGateway } from "@task/core/Task.gateway";
import { Phase1Service } from "@admin/core/sejours/phase1/Phase1.service";

import { createTask } from "../../../TaskHelper";
import { setupAdminTest } from "../../../setUpAdminTest";
import { createSession } from "../helper/SessionHelper";

describe("AffectationController - HTS", () => {
    let app: INestApplication;
    let affectationController: AffectationController;
    let phase1Service: Phase1Service;
    let mockedAddUserToRequestMiddleware;
    let module: TestingModule;
    let taskGateway: TaskGateway;
    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;

        module = appSetup.adminTestModule;
        affectationController = module.get<AffectationController>(AffectationController);
        mockedAddUserToRequestMiddleware = jest.fn((req, res, next) => {
            req.user = {
                role: "admin",
                sousRole: "god",
            };
            next();
        });
        app.use(mockedAddUserToRequestMiddleware);

        taskGateway = module.get<TaskGateway>(TaskGateway);
        phase1Service = module.get<Phase1Service>(Phase1Service);
        await app.init();
        const tasks = await taskGateway.findAll();
        taskGateway.deleteMany(tasks.map((task) => task.id));
    });

    it("should be defined", () => {
        expect(affectationController).toBeDefined();
    });

    describe("POST /affectation/:id/simulation/hts", () => {
        it("should return 400 for invalid params", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer()).post(`/affectation/${session.id}/simulation/hts`);

            expect(response.status).toBe(400);
        });

        it("should return 400 for invalid niveauScolaires", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer()).post(`/affectation/${session.id}/simulation/hts`).send({
                niveauScolaires: [],
                departements: departmentList,
                sdrImportId: new mongoose.Types.ObjectId().toString(),
                etranger: false,
                affecterPDR: false,
            });

            expect(response.status).toBe(400);
        });

        it("should return 400 for invalid departement (empty)", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer())
                .post(`/affectation/${session.id}/simulation/hts`)
                .send({
                    niveauScolaires: Object.values(GRADES),
                    departements: [],
                    sdrImportId: new mongoose.Types.ObjectId().toString(),
                    etranger: false,
                    affecterPDR: false,
                });

            expect(response.status).toBe(400);
        });

        it("should return 400 for invalid departement (inexistant)", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer())
                .post(`/affectation/${session.id}/simulation/hts`)
                .send({
                    niveauScolaires: Object.values(GRADES),
                    departements: ["nonInexistant"],
                    sdrImportId: new mongoose.Types.ObjectId().toString(),
                    etranger: false,
                    affecterPDR: false,
                });

            expect(response.status).toBe(400);
        });

        it("should return 400 for departement hors metropole", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer())
                .post(`/affectation/${session.id}/simulation/hts`)
                .send({
                    niveauScolaires: Object.values(GRADES),
                    departements: departmentList,
                    sdrImportId: new mongoose.Types.ObjectId().toString(),
                    etranger: false,
                    affecterPDR: false,
                });

            expect(response.status).toBe(400);
        });

        it("should return 400 when sdrImportId is not valid", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer())
                .post(`/affectation/${session.id}/simulation/hts`)
                .send({
                    niveauScolaires: Object.values(GRADES),
                    departements: RegionsMetropole.flatMap((region) => region2department[region]),
                    sdrImportId: "123456789",
                    etranger: false,
                    affecterPDR: false,
                });

            expect(response.status).toBe(400);
        });

        it("should return 201", async () => {
            const session = await createSession();
            const sdrImportTask = await createTask({
                name: TaskName.REFERENTIEL_IMPORT,
                metadata: {
                    parameters: {
                        fileKey: "path/1-testFile.xlsx",
                        fileName: "testFile.xlsx",
                    },
                },
            });

            const response = await request(app.getHttpServer())
                .post(`/affectation/${session.id}/simulation/hts`)
                .send({
                    niveauScolaires: Object.values(GRADES),
                    departements: RegionsMetropole.flatMap((region) => region2department[region]),
                    sdrImportId: sdrImportTask.id,
                    etranger: false,
                    affecterPDR: false,
                });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe(TaskName.AFFECTATION_HTS_SIMULATION);
            expect(response.body.status).toBe(TaskStatus.PENDING);
            expect(response.body.metadata.parameters.sessionId).toBe(session.id);
        });
    });

    describe("POST /affectation/:id/simulation/:taskId/valider/hts", () => {
        it("should return 400 for invalid params", async () => {
            const session = await createSession();
            const task = await createTask({ name: TaskName.AFFECTATION_HTS_SIMULATION });

            const response = await request(app.getHttpServer()).post(
                `/affectation/${session.id}/simulation/${task.id}/valider/hts`,
            );

            expect(response.status).toBe(400);
        });

        it("should return 422 for invalid task (pending)", async () => {
            const session = await createSession();
            const task = await createTask({
                name: TaskName.AFFECTATION_HTS_SIMULATION_VALIDER,
                status: TaskStatus.PENDING,
                metadata: {
                    parameters: {
                        sessionId: session.id,
                    },
                },
            });

            const response = await request(app.getHttpServer())
                .post(`/affectation/${session.id}/simulation/${task.id}/valider/hts`)
                .send({ affecterPDR: true });

            expect(response.status).toBe(422);
        });

        it("should return 422 for invalid task (outdated)", async () => {
            const session = await createSession();
            const simuTask = await createTask({
                name: TaskName.AFFECTATION_HTS_SIMULATION,
                status: TaskStatus.COMPLETED,
                metadata: {
                    parameters: {
                        sessionId: session.id,
                    },
                },
                createdAt: addHours(new Date(), -2),
            });

            // la dernière affectation reel est plus récente que la simulation
            jest.spyOn(phase1Service, "getStatusValidation").mockResolvedValue({
                status: TaskStatus.COMPLETED,
                lastCompletedAt: addHours(new Date(), -1),
            });

            const response = await request(app.getHttpServer())
                .post(`/affectation/${session.id}/simulation/${simuTask.id}/valider/hts`)
                .send({ affecterPDR: true });

            expect(response.status).toBe(422);
        });

        it("should return 201 for valid task", async () => {
            const session = await createSession();
            const simuTask = await createTask({
                name: TaskName.AFFECTATION_HTS_SIMULATION,
                status: TaskStatus.COMPLETED,
                metadata: {
                    parameters: {
                        sessionId: session.id,
                    },
                },
                createdAt: addHours(new Date(), -1),
            });

            // la dernière affectation reel est plus vieille que la simulation
            jest.spyOn(phase1Service, "getStatusValidation").mockResolvedValue({
                status: TaskStatus.COMPLETED,
                lastCompletedAt: addHours(new Date(), -2),
            });

            const response = await request(app.getHttpServer())
                .post(`/affectation/${session.id}/simulation/${simuTask.id}/valider/hts`)
                .send({ affecterPDR: true });

            expect(response.status).toBe(201);
        });
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });
});
