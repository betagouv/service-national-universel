import { Inject, Injectable } from "@nestjs/common";

import { PermissionDto, ReferentType, getUserRoles } from "snu-lib";

import { PermissionGateway } from "./Permission.gateway";
import { RoleGateway } from "./Role.gateway";

@Injectable()
export class PermissionService {
    constructor(
        @Inject(PermissionGateway) private readonly permissionGateway: PermissionGateway,
        @Inject(RoleGateway) private readonly roleGateway: RoleGateway,
    ) {}

    async getAcl(user: Partial<ReferentType>): Promise<PermissionDto[]> {
        if (!user) return [];
        const rolesCodes = getUserRoles(user);
        const roles = await this.roleGateway.findByCodesAndParent(rolesCodes);
        const permissions = await this.permissionGateway.findByRoles(roles.map((role) => role.code));
        // TODO: compute whitelist of resources (by department, structure, ...)
        return permissions.map((permission) => ({
            code: permission.code,
            action: permission.action,
            resource: permission.resource,
            policy: permission.policy || [],
        }));
    }
}
