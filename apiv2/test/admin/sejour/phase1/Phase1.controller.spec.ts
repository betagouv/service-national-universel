import * as request from "supertest";
import mongoose from "mongoose";

import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";

import { TaskGateway } from "@task/core/Task.gateway";
import { Phase1Controller } from "@admin/infra/sejours/phase1/api/Phase1.controller";

import { setupAdminTest } from "../../setUpAdminTest";
import { createSession } from "./SessionHelper";

jest.mock("@nestjs-cls/transactional", () => ({
    Transactional: () => jest.fn(),
}));

describe("Phase1Controller", () => {
    let app: INestApplication;
    let phase1Controller: Phase1Controller;
    let mockedAddUserToRequestMiddleware;
    let module: TestingModule;
    let taskGateway: TaskGateway;
    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;

        module = appSetup.adminTestModule;
        phase1Controller = module.get<Phase1Controller>(Phase1Controller);
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
        const tasks = await taskGateway.findAll();
        taskGateway.deleteMany(tasks.map((task) => task.id));
    });

    it("should be defined", () => {
        expect(phase1Controller).toBeDefined();
    });

    describe("DELETE /phase1/:id/plan-de-transport", () => {
        it("should return 200", async () => {
            const session = await createSession();
            const response = await request(app.getHttpServer()).delete(`/phase1/${session.id}/plan-de-transport`);

            expect(response.status).toBe(200);
        });
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });
});
