import { Inject, Injectable } from "@nestjs/common";

import { Model } from "mongoose";
import { RoleGateway } from "../../core/Role.gateway";
import { ROLE_MONGOOSE_ENTITY } from "../provider/Role.provider";
import { RoleDocument } from "../provider/Role.provider";
import { RoleModel } from "../../core/Role.model";
import { RoleMapper } from "./Role.mapper";

@Injectable()
export class RoleRepository implements RoleGateway {
    constructor(@Inject(ROLE_MONGOOSE_ENTITY) private roleMongooseEntity: Model<RoleDocument>) {}

    async findByCode(code: string): Promise<RoleModel | null> {
        const role = await this.roleMongooseEntity.findOne({ code });
        if (!role) {
            return null;
        }
        return RoleMapper.toModel(role);
    }

    async findByCodesAndParent(codes: string[]): Promise<RoleModel[]> {
        const roles = await this.roleMongooseEntity.find({
            $or: [{ code: { $in: codes } }, { parent: { $in: codes } }],
        });
        return roles.map((role) => RoleMapper.toModel(role));
    }

    async create(role: RoleModel): Promise<RoleModel> {
        const roleDocument = await this.roleMongooseEntity.create(role);
        return RoleMapper.toModel(roleDocument);
    }

    async findById(id: string): Promise<RoleModel | null> {
        const role = await this.roleMongooseEntity.findById(id);
        if (!role) {
            return null;
        }
        return RoleMapper.toModel(role);
    }
}
