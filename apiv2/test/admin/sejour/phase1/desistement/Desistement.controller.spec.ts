import * as request from "supertest";
import mongoose from "mongoose";
import { addHours } from "date-fns";
import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";

import { TaskName, TaskStatus } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";

import { createTask } from "../../../TaskHelper";
import { setupAdminTest } from "../../../setUpAdminTest";
import { createSession } from "../helper/SessionHelper";
import { DesistementController } from "@admin/infra/sejours/phase1/desistement/api/Desistement.controller";
import { Phase1Service } from "@admin/core/sejours/phase1/Phase1.service";

describe("DesistementController", () => {
    let app: INestApplication;
    let desistementController: DesistementController;
    let phase1Service: Phase1Service;
    let mockedAddUserToRequestMiddleware;
    let module: TestingModule;
    let taskGateway: TaskGateway;
    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;

        module = appSetup.adminTestModule;
        desistementController = module.get<DesistementController>(DesistementController);
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
        expect(desistementController).toBeDefined();
    });

    describe("POST /desistement/:id/simulation", () => {
        it("should return 400 for invalid params", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer()).post(`/desistement/${session.id}/simulation`);

            expect(response.status).toBe(400);
        });

        it("should return 400 for invalid affectationTaskId", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer()).post(`/desistement/${session.id}/simulation`).send({
                affectationTaskId: "invalid-id",
            });

            expect(response.status).toBe(400);
        });

        it("should return 201", async () => {
            const session = await createSession();
            const affectationTask = await createTask({
                name: TaskName.AFFECTATION_HTS_SIMULATION_VALIDER,
                status: TaskStatus.COMPLETED,
                metadata: {
                    parameters: {
                        sessionId: session.id,
                    },
                    results: {
                        rapportKey: "rapportKey",
                    },
                },
                createdAt: addHours(new Date(), -1),
            });

            const response = await request(app.getHttpServer()).post(`/desistement/${session.id}/simulation`).send({
                affectationTaskId: affectationTask.id,
            });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe(TaskName.DESISTEMENT_POST_AFFECTATION_SIMULATION);
            expect(response.body.status).toBe(TaskStatus.PENDING);
            expect(response.body.metadata.parameters.sessionId).toBe(session.id);
        });
    });

    describe("POST /desistement/:id/simulation/:taskId/valider", () => {
        it("should return 400 for invalid params", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer()).post(
                `/desistement/${session.id}/simulation/invalid-id/valider`,
            );

            expect(response.status).toBe(400);
        });

        it("should return 422 for invalid task (pending)", async () => {
            const session = await createSession();
            const task = await createTask({
                name: TaskName.DESISTEMENT_POST_AFFECTATION_VALIDER,
                status: TaskStatus.PENDING,
                metadata: {
                    parameters: {
                        sessionId: session.id,
                    },
                },
            });

            const response = await request(app.getHttpServer()).post(
                `/desistement/${session.id}/simulation/${task.id}/valider`,
            );

            expect(response.status).toBe(422);
        });

        it("should return 422 for invalid task (outdated)", async () => {
            const session = await createSession();
            const simuTask = await createTask({
                name: TaskName.DESISTEMENT_POST_AFFECTATION_SIMULATION,
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

            const response = await request(app.getHttpServer()).post(
                `/desistement/${session.id}/simulation/${simuTask.id}/valider`,
            );

            expect(response.status).toBe(422);
        });

        it("should return 201 for valid task", async () => {
            const session = await createSession();
            const simuTask = await createTask({
                name: TaskName.DESISTEMENT_POST_AFFECTATION_SIMULATION,
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

            const response = await request(app.getHttpServer()).post(
                `/desistement/${session.id}/simulation/${simuTask.id}/valider`,
            );

            expect(response.status).toBe(201);
        });
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });
});
