import { faker } from "@faker-js/faker";

import { PERMISSION_ACTIONS } from "snu-lib";

import { PermissionGateway } from "@auth/core/Permission.gateway";
import { PermissionModel } from "@auth/core/Permission.model";
import { getAuthTestModuleRef } from "./setUpAuthTest";

export const createPermission = async (permission: Partial<PermissionModel>) => {
    const permissionGateway = getAuthTestModuleRef().get<PermissionGateway>(PermissionGateway);
    return permissionGateway.create({
        code: faker.lorem.word(),
        resource: faker.lorem.word(),
        titre: faker.lorem.word(),
        action: PERMISSION_ACTIONS.FULL,
        roles: [],
        policy: [],
        ...permission,
    });
};
