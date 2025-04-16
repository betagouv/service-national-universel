import mongoose from "mongoose";

import { PERMISSION_ACTIONS, ROLES } from "snu-lib";

import { PermissionGateway } from "@auth/core/Permission.gateway";
import { INestApplication } from "@nestjs/common";
import { RoleGateway } from "@auth/core/Role.gateway";
import { PermissionService } from "@auth/core/Permission.service";

import { setUpAuthTest } from "./setUpAuthTest";
import { createPermission } from "./PermissionHelper";
import { createRole } from "./RoleHelper";

describe("PermissionGateway", () => {
    let roleGateway: RoleGateway;
    let permissionGateway: PermissionGateway;
    let permissionService: PermissionService;
    let app: INestApplication;

    beforeAll(async () => {
        const appSetup = await setUpAuthTest();
        app = appSetup.app;
        const module = appSetup.testModule;
        permissionGateway = module.get<PermissionGateway>(PermissionGateway);
        roleGateway = module.get<RoleGateway>(RoleGateway);
        permissionService = module.get<PermissionService>(PermissionService);
        await app.init();
        await createRole({ code: ROLES.ADMIN });
        await createPermission({
            code: "CodePermission",
            roles: [ROLES.ADMIN],
            ressource: "ressource",
            action: PERMISSION_ACTIONS.READ,
        });
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });

    describe("hasReadPermission", () => {
        it("should return true when user has permission (read action)", async () => {
            const user = { roles: [ROLES.ADMIN] };
            const result = await permissionService.hasReadPermission({ user, code: "CodePermission" });
            expect(result).toBe(true);
        });

        it("should return true when user has permission (full action)", async () => {
            await createPermission({
                code: "FullPermission",
                roles: [ROLES.ADMIN],
                ressource: "ressource",
                action: PERMISSION_ACTIONS.FULL,
            });

            const user = { roles: [ROLES.ADMIN] };
            const result = await permissionService.hasReadPermission({ user, code: "FullPermission" });
            expect(result).toBe(true);
        });

        it("should return false when user has no permission", async () => {
            await createPermission({
                code: "UpdatePermission",
                roles: [ROLES.ADMIN],
                ressource: "ressource",
                action: PERMISSION_ACTIONS.UPDATE,
            });

            // wrong role
            let result = await permissionService.hasReadPermission({
                user: { roles: [ROLES.VISITOR] },
                code: "CodePermission",
            });
            expect(result).toBe(false);

            // wrong permission code
            result = await permissionService.hasReadPermission({
                user: { roles: [ROLES.ADMIN] },
                code: "UnknownPermission",
            });
            expect(result).toBe(false);

            // wrong permission action
            result = await permissionService.hasReadPermission({
                user: { roles: [ROLES.ADMIN] },
                code: "UpdatePermission",
            });
            expect(result).toBe(false);
        });
    });
});
