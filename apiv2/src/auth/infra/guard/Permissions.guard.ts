import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { PERMISSION_RESOURCES_LIST } from "snu-lib";

import { CustomRequest } from "@shared/infra/CustomRequest";
import { PermissionService } from "../../core/Permission.service";
import { ReferentMapper } from "@admin/infra/iam/repository/mongo/Referent.mapper";
import { ReferentModel } from "@admin/core/iam/Referent.model";

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly permissionService: PermissionService,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: CustomRequest = context.switchToHttp().getRequest();
        if (!request.user) {
            throw new Error("User not found");
        }
        const ressource = this.reflector.get<string>("ressource", context.getHandler());
        if (!ressource) {
            throw new Error("Ressource not found");
        } else if (!PERMISSION_RESOURCES_LIST.includes(ressource as any)) {
            throw new Error("Ressource not valid");
        }
        const ressourceIdKey = this.reflector.get<string>("ressourceIdKey", context.getHandler());
        let ressourceId = request.params.id;
        if (ressourceIdKey) {
            ressourceId = request.params[ressourceIdKey];
        }
        if (!ressourceId) {
            throw new Error("Ressource id not found");
        }
        const permissionCodes = this.reflector.get<string[]>("permissions", context.getHandler());
        if (!permissionCodes || permissionCodes.length === 0) {
            throw new Error("No permissions found");
        }

        return await this.permissionService.hasPermissions({
            user: ReferentMapper.toEntity(request.user as ReferentModel),
            codes: permissionCodes,
            context: {
                ressource,
                ressourceId,
            },
        });
    }
}
