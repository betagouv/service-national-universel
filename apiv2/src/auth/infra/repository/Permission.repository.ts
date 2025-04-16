import { Inject, Injectable } from "@nestjs/common";

import { Model } from "mongoose";
import { PermissionGateway } from "../../core/Permission.gateway";
import { PERMISSION_MONGOOSE_ENTITY } from "../provider/Permission.provider";
import { PermissionDocument } from "../provider/Permission.provider";
import { PermissionModel, CreatePermissionModel } from "../../core/Permission.model";
import { PermissionMapper } from "./Permission.mapper";

import { PERMISSION_RESOURCES_COLLECTION } from "snu-lib";

@Injectable()
export class PermissionRepository implements PermissionGateway {
    constructor(@Inject(PERMISSION_MONGOOSE_ENTITY) private permissionMongooseEntity: Model<PermissionDocument>) {}

    getResourceRepository(ressource: typeof PERMISSION_RESOURCES_COLLECTION): Model<any> {
        switch (ressource) {
            default:
                throw new Error(`Resource ${ressource} not found`);
        }
    }

    async findByCode(code: string): Promise<PermissionModel | null> {
        const permission = await this.permissionMongooseEntity.findOne({ code });
        if (!permission) {
            return null;
        }
        return PermissionMapper.toModel(permission);
    }

    async findByCodesRolesAndActions(codes: string[], roles: string[], actions: string[]): Promise<PermissionModel[]> {
        const permissions = await this.permissionMongooseEntity.find({
            code: { $in: codes },
            action: { $in: actions },
            roles: { $in: roles },
        });
        return permissions.map((permission) => PermissionMapper.toModel(permission));
    }

    async findByCodesRolesResourceAndActions(
        codes: string[],
        ressource: string,
        actions: string[],
        roles: string[],
    ): Promise<PermissionModel[]> {
        const permissions = await this.permissionMongooseEntity.find({
            code: { $in: codes },
            ressource,
            action: { $in: actions },
            roles: { $in: roles },
        });
        return permissions.map((permission) => PermissionMapper.toModel(permission));
    }

    async findById(id: string): Promise<PermissionModel | null> {
        const permission = await this.permissionMongooseEntity.findById(id);
        if (!permission) {
            return null;
        }
        return PermissionMapper.toModel(permission);
    }

    async create(permission: CreatePermissionModel): Promise<PermissionModel> {
        const permissionDocument = await this.permissionMongooseEntity.create(permission);
        return PermissionMapper.toModel(permissionDocument);
    }
}
