import mongoose from "mongoose";

import { setUpAuthTest } from "./setUpAuthTest";
import { INestApplication } from "@nestjs/common";
import { RoleGateway } from "@auth/core/Role.gateway";
import { createRole } from "./RoleHelper";
import { ROLES } from "snu-lib";

describe("RoleGateway", () => {
    let roleGateway: RoleGateway;
    let app: INestApplication;

    beforeAll(async () => {
        const appSetup = await setUpAuthTest();
        app = appSetup.app;
        const module = appSetup.testModule;
        roleGateway = module.get<RoleGateway>(RoleGateway);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });

    it("should be defined", () => {
        expect(roleGateway).toBeDefined();
    });

    describe("findByCode", () => {
        it("devrait trouver un rôle par son code", async () => {
            const code = ROLES.ADMINISTRATEUR_CLE;
            await createRole({
                code,
            });

            const result = await roleGateway.findByCode(code);

            expect(result).toMatchObject({
                code,
            });
        });

        it("should return undefined if role not found", async () => {
            await expect(roleGateway.findByCode("INVALID")).resolves.toBeNull();
        });
    });
});
