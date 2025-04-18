import { PERMISSION_RESOURCES_COLLECTION } from "snu-lib";
import { PermissionModel, CreatePermissionModel } from "./Permission.model";
import { Model } from "mongoose";

export interface PermissionGateway {
    findById(id: string): Promise<PermissionModel | null>;
    findByCode(code: string): Promise<PermissionModel | null>;
    findByCodesRolesAndActions(codes: string[], roles: string[], actions: string[]): Promise<PermissionModel[]>;
    findByCodesRolesResourceAndActions(
        codes: string[],
        ressource: string,
        actions: string[],
        roles: string[],
    ): Promise<PermissionModel[]>;
    create(permission: CreatePermissionModel): Promise<PermissionModel>;
    getResourceRepository(ressource: typeof PERMISSION_RESOURCES_COLLECTION): Model<any>;
}

export const PermissionGateway = Symbol("PermissionGateway");
