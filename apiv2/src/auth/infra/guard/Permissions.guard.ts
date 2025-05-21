import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { HasPermissionParams, HasPermissionsParams, isAuthorized } from "snu-lib";

import { CustomRequest } from "@shared/infra/CustomRequest";
import { ReferentMapper } from "@admin/infra/iam/repository/mongo/Referent.mapper";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { Logger } from "@nestjs/common";
@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly logger: Logger,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: CustomRequest = context.switchToHttp().getRequest();
        if (!request.user) {
            this.logger.debug("User not found");
            return false;
        }
        const permissions = this.reflector.get<HasPermissionsParams["permissions"]>(
            "permissions",
            context.getHandler(),
        );
        if (!permissions || permissions.length === 0) {
            this.logger.debug("No permissions found");
            return false;
        }

        const user = {
            ...ReferentMapper.toEntity(request.user as ReferentModel),
            acl: request.user.acl,
        } as HasPermissionParams["user"];

        return !permissions.some(({ resource, action }) => isAuthorized({ user, resource, action }));
    }
}
