import * as request from "supertest";
import mongoose from "mongoose";
import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";

import { departmentList, GRADES, region2department, RegionsMetropole, TaskName, TaskStatus } from "snu-lib";

import { AffectationController } from "@admin/infra/sejours/phase1/affectation/api/Affectation.controller";
import { TaskGateway } from "@task/core/Task.gateway";

import { setupAdminTest } from "../../../setUpAdminTest";
import { createSession } from "../SessionHelper";

describe("AffectationController", () => {
    let app: INestApplication;
    let affectationController: AffectationController;
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
        await app.init();
    });

    it("should be defined", () => {
        expect(affectationController).toBeDefined();
    });

    it("/POST affectation/:id/simulation should return 400 for invalid params", async () => {
        const session = await createSession();

        const response = await request(app.getHttpServer()).post(`/affectation/${session.id}/simulations`);

        expect(response.status).toBe(400);
    });

    it("/POST affectation/:id/simulation should return 400 for invalid niveauScolaires", async () => {
        const session = await createSession();

        const response = await request(app.getHttpServer()).post(`/affectation/${session.id}/simulations`).send({
            niveauScolaires: [],
            departements: departmentList,
            changementDepartements: [],
            etranger: false,
            affecterPDR: false,
        });

        expect(response.status).toBe(400);
    });

    it("/POST affectation/:id/simulation should return 400 for invalid departement", async () => {
        const session = await createSession();

        const response = await request(app.getHttpServer())
            .post(`/affectation/${session.id}/simulations`)
            .send({
                niveauScolaires: Object.values(GRADES),
                departements: [],
                changementDepartements: [],
                etranger: false,
                affecterPDR: false,
            });

        expect(response.status).toBe(400);
    });

    it("/POST affectation/:id/simulation should return 400 for invalid departement", async () => {
        const session = await createSession();

        const response = await request(app.getHttpServer())
            .post(`/affectation/${session.id}/simulations`)
            .send({
                niveauScolaires: Object.values(GRADES),
                departements: ["nonInexistant"],
                changementDepartements: [],
                etranger: false,
                affecterPDR: false,
            });

        expect(response.status).toBe(400);
    });

    it("/POST affectation/:id/simulation should return 400 for departement hors metropole", async () => {
        const session = await createSession();

        const response = await request(app.getHttpServer())
            .post(`/affectation/${session.id}/simulations`)
            .send({
                niveauScolaires: Object.values(GRADES),
                departements: departmentList,
                changementDepartements: [],
                etranger: false,
                affecterPDR: false,
            });

        expect(response.status).toBe(400);
    });

    it("/POST affectation/:id/simulation should return 201", async () => {
        const session = await createSession();

        const response = await request(app.getHttpServer())
            .post(`/affectation/${session.id}/simulations`)
            .send({
                niveauScolaires: Object.values(GRADES),
                departements: RegionsMetropole.flatMap((region) => region2department[region]),
                changementDepartements: [],
                etranger: false,
                affecterPDR: false,
            });

        expect(response.status).toBe(201);
        expect(response.body.name).toBe(TaskName.AFFECTATION_HTS_SIMULATION);
        expect(response.body.status).toBe(TaskStatus.PENDING);
        expect(response.body.metadata.parameters.sessionId).toBe(session.id);
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });
});
