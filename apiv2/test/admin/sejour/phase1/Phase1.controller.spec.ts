import * as request from "supertest";
import mongoose from "mongoose";

import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";

import { Phase1Controller } from "@admin/infra/sejours/phase1/api/Phase1.controller";

import { setupAdminTest } from "../../setUpAdminTest";

jest.mock("@nestjs-cls/transactional", () => ({
    Transactional: () => jest.fn(),
}));

describe("Phase1Controller", () => {
    let app: INestApplication;
    let phase1Controller: Phase1Controller;
    let mockedAddUserToRequestMiddleware;
    let module: TestingModule;
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

        await app.init();
    });

    it("should be defined", () => {
        expect(phase1Controller).toBeDefined();
    });

    describe("identifiants de route mal formés (L42)", () => {
        it.each([
            ["GET /phase1/simulations/abc", () => request(app.getHttpServer()).get("/phase1/simulations/abc")],
            ["GET /phase1/abc/simulations", () => request(app.getHttpServer()).get("/phase1/abc/simulations")],
        ])("%s répond 400 au lieu d'un CastError en 500", async (_, appel) => {
            const response = await appel();

            expect(response.status).toBe(400);
        });
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });
});
