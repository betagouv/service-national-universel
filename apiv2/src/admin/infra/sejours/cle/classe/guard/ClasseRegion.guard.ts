import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { ClasseGuardService } from "./ClasseGuard.service";

@Injectable()
export class ClasseRegionGuard implements CanActivate {
    constructor(
        private readonly classeGuardService: ClasseGuardService,
        private logger: Logger,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        request.classe = await this.classeGuardService.findClasse(request);
        const userRegion = request.user.region;
        const hasAccess = request.classe.region === userRegion;
        if (!hasAccess) {
            this.logger.log(
                `User ${request.user?.id} tried to access classe ${request.classe?.id} but is not in the same region, user region is ${userRegion} and classe region is ${request.classe.region}`,
            );
        }
        return hasAccess;
    }
}
