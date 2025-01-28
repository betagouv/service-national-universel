import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { JeuneGuardService } from "./JeuneGuard.service";
import { ROLES } from "snu-lib";

@Injectable()
export class JeuneRegionGuard implements CanActivate {
    constructor(
        private readonly jeuneGuardService: JeuneGuardService,
        private logger: Logger,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        request.jeune = await this.jeuneGuardService.findJeune(request);
        const userRole = request.user.role;
        const userRegion = request.user.region;
        const hasAccess = request.jeune.region === userRegion && userRole === ROLES.REFERENT_REGION;
        if (!hasAccess) {
            this.logger.log(
                `User ${request.user?.id} tried to access young ${request.jeune?.id} but is not in the same region, user region is ${userRegion} and young region is ${request.jeune.region}`,
            );
        }
        return hasAccess;
    }
}
