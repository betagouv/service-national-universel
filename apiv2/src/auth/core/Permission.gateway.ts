import { PermissionModel, CreatePermissionModel } from "./Permission.model";

export interface PermissionGateway {
    findById(id: string): Promise<PermissionModel | null>;
    findByCode(code: string): Promise<PermissionModel | null>;
    create(permission: CreatePermissionModel): Promise<PermissionModel>;
}

export const PermissionGateway = Symbol("PermissionGateway");
