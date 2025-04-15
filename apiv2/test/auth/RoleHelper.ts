import { faker } from "@faker-js/faker";
import { RoleGateway } from "src/auth/core/Role.gateway";
import { RoleModel } from "src/auth/core/Role.model";
import { getAuthTestModuleRef } from "./setUpAuthTest";

export const createRole = async (role: Partial<RoleModel>) => {
    const roleGateway = getAuthTestModuleRef().get<RoleGateway>(RoleGateway);
    return roleGateway.create({
        code: faker.lorem.word(),
        titre: faker.lorem.word(),
        description: faker.lorem.word(),
        ...role,
    });
};
