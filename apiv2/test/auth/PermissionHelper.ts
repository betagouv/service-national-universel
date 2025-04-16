import { faker } from "@faker-js/faker";
import { PermissionGateway } from "@auth/core/Permission.gateway";
import { PermissionModel } from "@auth/core/Permission.model";
import { getAuthTestModuleRef } from "./setUpAuthTest";

export const createPermission = async (permission: Partial<PermissionModel>) => {
    const permissionGateway = getAuthTestModuleRef().get<PermissionGateway>(PermissionGateway);
    return permissionGateway.create({
        code: faker.lorem.word(),
        ressource: faker.lorem.word(),
        titre: faker.lorem.word(),
        action: "full",
        roles: [],
        policy: [],
        ...permission,
    });
};
