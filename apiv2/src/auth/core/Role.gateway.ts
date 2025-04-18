import { RoleModel, CreateRoleModel } from "./Role.model";

export interface RoleGateway {
    findById(id: string): Promise<RoleModel | null>;
    findByCode(code: string): Promise<RoleModel | null>;
    create(role: CreateRoleModel): Promise<RoleModel>;
}

export const RoleGateway = Symbol("RoleGateway");
