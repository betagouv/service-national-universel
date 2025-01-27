import * as request from "supertest";
import mongoose from "mongoose";
import { addHours } from "date-fns";
import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";

import { departmentList, region2department, RegionsMetropoleAndCorse, TaskName, TaskStatus } from "snu-lib";

import { AffectationController } from "@admin/infra/sejours/phase1/affectation/api/Affectation.controller";
import { TaskGateway } from "@task/core/Task.gateway";

import { createTask } from "../../../TaskHelper";
import { setupAdminTest } from "../../../setUpAdminTest";

import { AffectationService } from "@admin/core/sejours/phase1/affectation/Affectation.service";
import { createSession } from "../helper/SessionHelper";

describe("AffectationController - CLE", () => {
    let app: INestApplication;
    let affectationController: AffectationController;
    let affectationService: AffectationService;
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
        affectationService = module.get<AffectationService>(AffectationService);
        await app.init();
        const tasks = await taskGateway.findAll();
        taskGateway.deleteMany(tasks.map((task) => task.id));
    });

    it("should be defined", () => {
        expect(affectationController).toBeDefined();
    });

    describe("POST /affectation/:id/simulation/cle", () => {
        it("should return 400 for invalid params", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer()).post(`/affectation/${session.id}/simulation/cle`);

            expect(response.status).toBe(400);
        });

        it("should return 400 for invalid departement (empty)", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer()).post(`/affectation/${session.id}/simulation/cle`).send({
                departements: [],
                etranger: true,
            });

            expect(response.status).toBe(400);
        });

        it("should return 400 for invalid departement (inexistant)", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer())
                .post(`/affectation/${session.id}/simulation/cle`)
                .send({
                    departements: ["nonInexistant"],
                    etranger: true,
                });

            expect(response.status).toBe(400);
        });

        it("should return 400 for departement hors metropole", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer()).post(`/affectation/${session.id}/simulation/cle`).send({
                departements: departmentList,
                etranger: true,
            });

            expect(response.status).toBe(400);
        });

        it("should return 201 (valid with corse)", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer())
                .post(`/affectation/${session.id}/simulation/cle`)
                .send({
                    departements: RegionsMetropoleAndCorse.flatMap((region) => region2department[region]),
                    etranger: true,
                });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe(TaskName.AFFECTATION_CLE_SIMULATION);
            expect(response.body.status).toBe(TaskStatus.PENDING);
            expect(response.body.metadata.parameters.sessionId).toBe(session.id);
        });
    });

    describe("POST /affectation/:id/simulation/:taskId/valider/cle", () => {
        it("should return 422 for invalid task (pending)", async () => {
            const session = await createSession();
            const task = await createTask({
                name: TaskName.AFFECTATION_CLE_SIMULATION_VALIDER,
                status: TaskStatus.PENDING,
                metadata: {
                    parameters: {
                        sessionId: session.id,
                    },
                },
            });

            const response = await request(app.getHttpServer()).post(
                `/affectation/${session.id}/simulation/${task.id}/valider/cle`,
            );

            expect(response.status).toBe(422);
        });

        it("should return 422 for invalid task (outdated)", async () => {
            const session = await createSession();
            const simuTask = await createTask({
                name: TaskName.AFFECTATION_CLE_SIMULATION,
                status: TaskStatus.COMPLETED,
                metadata: {
                    parameters: {
                        sessionId: session.id,
                    },
                },
                createdAt: addHours(new Date(), -2),
            });

            // la dernière affectation reel est plus récente que la simulation
            jest.spyOn(affectationService, "getStatusValidation").mockResolvedValue({
                status: TaskStatus.COMPLETED,
                lastCompletedAt: addHours(new Date(), -1),
            });

            const response = await request(app.getHttpServer())
                .post(`/affectation/${session.id}/simulation/${simuTask.id}/valider/cle`)
                .send({ affecterPDR: true });

            expect(response.status).toBe(422);
        });

        it("should return 201 for valid task", async () => {
            const session = await createSession();
            const simuTask = await createTask({
                name: TaskName.AFFECTATION_CLE_SIMULATION,
                status: TaskStatus.COMPLETED,
                metadata: {
                    parameters: {
                        sessionId: session.id,
                    },
                },
                createdAt: addHours(new Date(), -1),
            });

            // la dernière affectation reel est plus vieille que la simulation
            jest.spyOn(affectationService, "getStatusValidation").mockResolvedValue({
                status: TaskStatus.COMPLETED,
                lastCompletedAt: addHours(new Date(), -2),
            });

            const response = await request(app.getHttpServer())
                .post(`/affectation/${session.id}/simulation/${simuTask.id}/valider/cle`)
                .send({ affecterPDR: true });

            expect(response.status).toBe(201);
        });
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });
});
