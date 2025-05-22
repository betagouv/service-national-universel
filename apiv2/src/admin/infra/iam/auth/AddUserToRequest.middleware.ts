import { NextFunction, Response } from "express";
import { ClsService } from "nestjs-cls";
import { Inject, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { CustomRequest } from "../../../../shared/infra/CustomRequest";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { AuthProvider } from "./Auth.provider";
import { PermissionService } from "@auth/core/Permission.service";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { ReferentMapper } from "../repository/mongo/Referent.mapper";

@Injectable()
export class AddUserToRequestMiddleware implements NestMiddleware {
    constructor(
        @Inject(ReferentGateway) private referentGateway: ReferentGateway,
        @Inject(AuthProvider) private authProvider: AuthProvider,
        @Inject(PermissionService) private permissionService: PermissionService,
        private readonly cls: ClsService,
    ) {}

    async use(req: CustomRequest, _: Response, next: NextFunction) {
        const token = req.headers.authorization?.split(" ")?.[1];
        if (!token) {
            throw new UnauthorizedException();
        }

        const userId = await this.authProvider.parseToken(token);
        const user = await this.referentGateway.findById(userId);
        if (!user) {
            throw new UnauthorizedException();
        }
        const acl = await this.permissionService.getAcl(ReferentMapper.toEntity(user as ReferentModel));
        req.user = {
            ...user,
            acl,
        };

        this.cls.set("user", {
            id: user?.id,
            firstName: user?.prenom,
            lastName: user?.nom,
            role: user?.role,
            subRole: user?.sousRole,
            acl,
        });
        next();
    }
}
