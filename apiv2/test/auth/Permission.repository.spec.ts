import mongoose from "mongoose";

import { setUpAuthTest } from "./setUpAuthTest";
import { INestApplication } from "@nestjs/common";
import { createPermission } from "./PermissionHelper";
import { PermissionGateway } from "src/auth/core/Permission.gateway";

describe("PermissionGateway", () => {
    let permissionGateway: PermissionGateway;
    let app: INestApplication;

    beforeAll(async () => {
        const appSetup = await setUpAuthTest();
        app = appSetup.app;
        const module = appSetup.testModule;
        permissionGateway = module.get<PermissionGateway>(PermissionGateway);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });

    it("should be defined", () => {
        expect(permissionGateway).toBeDefined();
    });

    describe("findByCode", () => {
        it("devrait trouver une permission par son code", async () => {
            const code = "CentresListAll";
            await createPermission({
                code,
            });

            const result = await permissionGateway.findByCode(code);

            expect(result).toMatchObject({
                code,
            });
        });

        it("should return undefined if permission not found", async () => {
            await expect(permissionGateway.findByCode("INVALID")).resolves.toBeNull();
        });
    });
});
