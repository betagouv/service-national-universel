import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { JeuneGuardService } from "./JeuneGuard.service";
import { ROLES } from "snu-lib";

@Injectable()
export class JeuneDepartementGuard implements CanActivate {
    constructor(
        private readonly jeuneGuardService: JeuneGuardService,
        private logger: Logger,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        request.jeune = await this.jeuneGuardService.findJeune(request);
        const userRole = request.user.role;
        const userDepartement = request.user.departement;
        const hasAccess = request.jeune.departement === userDepartement && userRole === ROLES.REFERENT_DEPARTMENT;
        if (!hasAccess) {
            this.logger.log(
                `User ${request.user?.id} tried to access young ${request.jeune?.id} but is not in the same department, user department is ${userDepartement} and young department is ${request.jeune.departement}`,
            );
        }
        return hasAccess;
    }
}
