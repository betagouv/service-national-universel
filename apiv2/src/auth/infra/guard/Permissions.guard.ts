import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { HasPermissionParams, HasPermissionsParams, isAuthorized } from "snu-lib";

import { CustomRequest } from "@shared/infra/CustomRequest";
import { ReferentMapper } from "@admin/infra/iam/repository/mongo/Referent.mapper";
import { ReferentModel } from "@admin/core/iam/Referent.model";

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: CustomRequest = context.switchToHttp().getRequest();
        if (!request.user) {
            throw new Error("User not found");
        }
        const permissions = this.reflector.get<HasPermissionsParams["permissions"]>(
            "permissions",
            context.getHandler(),
        );
        if (!permissions || permissions.length === 0) {
            throw new Error("No permissions found");
        }

        const user = {
            ...ReferentMapper.toEntity(request.user as ReferentModel),
            acl: request.user.acl,
        } as HasPermissionParams["user"];

        return !permissions.some(({ ressource, action }) => isAuthorized({ user, ressource, action }));
    }
}
