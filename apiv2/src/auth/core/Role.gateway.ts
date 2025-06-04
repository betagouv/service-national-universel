import { RoleModel, CreateRoleModel } from "./Role.model";

export interface RoleGateway {
    findById(id: string): Promise<RoleModel | null>;
    findByCode(code: string): Promise<RoleModel | null>;
    findByCodesAndParent(codes: string[]): Promise<RoleModel[]>;
    create(role: CreateRoleModel): Promise<RoleModel>;
}

export const RoleGateway = Symbol("RoleGateway");
