import { Inject, Injectable } from "@nestjs/common";

import { Model } from "mongoose";
import { PermissionGateway } from "../../core/Permission.gateway";
import { PERMISSION_MONGOOSE_ENTITY } from "../provider/Permission.provider";
import { PermissionDocument } from "../provider/Permission.provider";
import { PermissionModel, CreatePermissionModel } from "../../core/Permission.model";
import { PermissionMapper } from "./Permission.mapper";

@Injectable()
export class PermissionRepository implements PermissionGateway {
    constructor(@Inject(PERMISSION_MONGOOSE_ENTITY) private permissionMongooseEntity: Model<PermissionDocument>) {}

    async findByCode(code: string): Promise<PermissionModel | null> {
        const permission = await this.permissionMongooseEntity.findOne({ code });
        if (!permission) {
            return null;
        }
        return PermissionMapper.toModel(permission);
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
