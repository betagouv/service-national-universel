import { Inject, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Response } from "express";
import { CustomRequest } from "../../../../shared/infra/CustomRequest";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { AuthProvider } from "./Auth.provider";
import { ClsService } from "nestjs-cls";

@Injectable()
export class AddUserToRequestMiddleware implements NestMiddleware {
    constructor(
        @Inject(ReferentGateway) private referentGateway: ReferentGateway,
        @Inject(AuthProvider) private authProvider: AuthProvider,
        private readonly cls: ClsService,
    ) {}

    async use(req: CustomRequest, _: Response, next: NextFunction) {
        // const token = req.headers.authorization?.split(" ")?.[1];
        // if (!token) {
        //     throw new UnauthorizedException();
        // }

        // const userId = await this.authProvider.parseToken(token);
        // const user = await this.referentGateway.findById(userId);
        // if (!user) {
        //     throw new UnauthorizedException();
        // }
        const user = {} as any;
        req.user = user;

        this.cls.set("user", { id: user?.id, firstName: user?.prenom, lastName: user?.nom });
        next();
    }
}
