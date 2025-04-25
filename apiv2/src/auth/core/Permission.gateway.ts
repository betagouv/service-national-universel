import { PermissionModel, CreatePermissionModel } from "./Permission.model";

export interface PermissionGateway {
    findById(id: string): Promise<PermissionModel | null>;
    findByCode(code: string): Promise<PermissionModel | null>;
    findByRoles(roles: string[]): Promise<PermissionModel[]>;
    create(permission: CreatePermissionModel): Promise<PermissionModel>;
}

export const PermissionGateway = Symbol("PermissionGateway");
