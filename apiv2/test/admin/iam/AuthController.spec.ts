import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { setupAdminTest } from "../setUpAdminTest";
import { createReferent } from "./ReferentHelper";
import mongoose from "mongoose";

describe("AuthController", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;

        await app.init();
    });

    it(`/POST register should throw an error 401`, async () => {
        const referent = await createReferent({ email: "mon_ref@mail.com" });

        const signinDto = { email: "mon_ref@mail.com", password: "password" };
        const response = await request(app.getHttpServer()).post("/referent/signin").send(signinDto);
        expect(response.statusCode).toEqual(401);
    });

    it.skip(`/POST register should return 201`, async () => {
        // TODO : add method to create referent with password
        const referent = await createReferent({ email: "mon_ref_2@mail.com" });

        const signinDto = { email: referent.email, password: "password" };
        const response = await request(app.getHttpServer()).post("/referent/signin").send(signinDto);
        expect(response.statusCode).toEqual(201);
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });
});
