import * as request from "supertest";
import mongoose from "mongoose";
import { addHours } from "date-fns";
import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";

import {
    departmentList,
    GRADES,
    region2department,
    RegionsMetropole,
    TaskName,
    TaskStatus,
    YOUNG_STATUS,
    YOUNG_STATUS_PHASE1,
} from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { BasculeJeuneValidesController } from "@admin/infra/sejours/phase1/inscription/api/BasculeJeuneValides.controller";
import { InscriptionService } from "@admin/core/sejours/phase1/inscription/Inscription.service";

import { createTask } from "../../../TaskHelper";
import { setupAdminTest } from "../../../setUpAdminTest";
import { createSession } from "../helper/SessionHelper";

describe("BasculeJeuneValidesController", () => {
    let app: INestApplication;
    let bacsuleController: BasculeJeuneValidesController;
    let inscriptionService: InscriptionService;
    let mockedAddUserToRequestMiddleware;
    let module: TestingModule;
    let taskGateway: TaskGateway;
    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;

        module = appSetup.adminTestModule;
        bacsuleController = module.get<BasculeJeuneValidesController>(BasculeJeuneValidesController);
        mockedAddUserToRequestMiddleware = jest.fn((req, res, next) => {
            req.user = {
                role: "admin",
                sousRole: "god",
            };
            next();
        });
        app.use(mockedAddUserToRequestMiddleware);

        taskGateway = module.get<TaskGateway>(TaskGateway);
        inscriptionService = module.get<InscriptionService>(InscriptionService);
        await app.init();
        const tasks = await taskGateway.findAll();
        taskGateway.deleteMany(tasks.map((task) => task.id));
    });

    it("should be defined", () => {
        expect(bacsuleController).toBeDefined();
    });

    describe("POST /inscription/:id/bascule-jeunes-valides/simulation", () => {
        it("should return 400 for invalid params", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer()).post(
                `/inscription/${session.id}/bascule-jeunes-valides/simulation`,
            );

            expect(response.status).toBe(400);
        });

        it("should return 400 for invalid niveauScolaires", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer())
                .post(`/inscription/${session.id}/bascule-jeunes-valides/simulation`)
                .send({
                    status: [YOUNG_STATUS.WAITING_VALIDATION],
                    statusPhase1: [YOUNG_STATUS_PHASE1.WAITING_AFFECTATION],
                    presenceArrivee: [false],
                    statusPhase1Motif: [],
                    niveauScolaires: [],
                    departements: departmentList,
                    etranger: false,
                    sansDepartement: false,
                    avenir: false,
                });

            expect(response.status).toBe(400);
        });

        it("should return 400 for invalid departement (empty)", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer())
                .post(`/inscription/${session.id}/bascule-jeunes-valides/simulation`)
                .send({
                    status: [YOUNG_STATUS.WAITING_VALIDATION],
                    statusPhase1: [YOUNG_STATUS_PHASE1.WAITING_AFFECTATION],
                    presenceArrivee: [false],
                    statusPhase1Motif: [],
                    niveauScolaires: Object.values(GRADES),
                    departements: [],
                    etranger: false,
                    sansDepartement: false,
                    avenir: false,
                });

            expect(response.status).toBe(400);
        });

        it("should return 400 for invalid departement (inexistant)", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer())
                .post(`/inscription/${session.id}/bascule-jeunes-valides/simulation`)
                .send({
                    status: [YOUNG_STATUS.WAITING_VALIDATION],
                    statusPhase1: [YOUNG_STATUS_PHASE1.WAITING_AFFECTATION],
                    presenceArrivee: [false],
                    statusPhase1Motif: [],
                    niveauScolaires: Object.values(GRADES),
                    departements: ["nonInexistant"],
                    etranger: false,
                    sansDepartement: false,
                    avenir: false,
                });

            expect(response.status).toBe(400);
        });

        it("should return 201", async () => {
            const session = await createSession();

            const response = await request(app.getHttpServer())
                .post(`/inscription/${session.id}/bascule-jeunes-valides/simulation`)
                .send({
                    status: [YOUNG_STATUS.WAITING_VALIDATION],
                    statusPhase1: [YOUNG_STATUS_PHASE1.WAITING_AFFECTATION],
                    presenceArrivee: [false],
                    statusPhase1Motif: [],
                    niveauScolaires: Object.values(GRADES),
                    departements: departmentList,
                    etranger: false,
                    sansDepartement: false,
                    avenir: false,
                });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe(TaskName.BACULE_JEUNES_VALIDES_SIMULATION);
            expect(response.body.status).toBe(TaskStatus.PENDING);
            expect(response.body.metadata.parameters.sessionId).toBe(session.id);
        });
    });

    describe("POST /inscription/:id/simulation/:taskId/bascule-jeunes-valides/valider", () => {
        it("should return 400 for invalid params", async () => {
            const session = await createSession();
            const task = await createTask({ name: TaskName.BACULE_JEUNES_VALIDES_SIMULATION });

            const response = await request(app.getHttpServer()).post(
                `/inscription/${session.id}/simulation/${task.id}/bascule-jeunes-valides/valider`,
            );

            expect(response.status).toBe(400);
        });

        it("should return 422 for invalid task (pending)", async () => {
            const session = await createSession();
            const task = await createTask({
                name: TaskName.BACULE_JEUNES_VALIDES_SIMULATION_VALIDER,
                status: TaskStatus.PENDING,
                metadata: {
                    parameters: {
                        sessionId: session.id,
                    },
                },
            });

            const response = await request(app.getHttpServer())
                .post(`/inscription/${session.id}/simulation/${task.id}/bascule-jeunes-valides/valider`)
                .send({ sendEmail: true });

            expect(response.status).toBe(422);
        });

        it("should return 422 for invalid task (outdated)", async () => {
            const session = await createSession();
            const simuTask = await createTask({
                name: TaskName.BACULE_JEUNES_VALIDES_SIMULATION,
                status: TaskStatus.COMPLETED,
                metadata: {
                    parameters: {
                        sessionId: session.id,
                    },
                },
                createdAt: addHours(new Date(), -2),
            });

            // la dernière affectation reel est plus récente que la simulation
            jest.spyOn(inscriptionService, "getStatusValidation").mockResolvedValue({
                status: TaskStatus.COMPLETED,
                lastCompletedAt: addHours(new Date(), -1),
            });

            const response = await request(app.getHttpServer())
                .post(`/inscription/${session.id}/simulation/${simuTask.id}/bascule-jeunes-valides/valider`)
                .send({ sendEmail: true });

            expect(response.status).toBe(422);
        });

        it("should return 201 for valid task", async () => {
            const session = await createSession();
            const simuTask = await createTask({
                name: TaskName.BACULE_JEUNES_VALIDES_SIMULATION,
                status: TaskStatus.COMPLETED,
                metadata: {
                    parameters: {
                        sessionId: session.id,
                    },
                },
                createdAt: addHours(new Date(), -1),
            });

            // la dernière affectation reel est plus vieille que la simulation
            jest.spyOn(inscriptionService, "getStatusValidation").mockResolvedValue({
                status: TaskStatus.COMPLETED,
                lastCompletedAt: addHours(new Date(), -2),
            });

            const response = await request(app.getHttpServer())
                .post(`/inscription/${session.id}/simulation/${simuTask.id}/bascule-jeunes-valides/valider`)
                .send({ sendEmail: true });

            expect(response.status).toBe(201);
        });
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });
});
