import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { ClasseGuardService } from "./ClasseGuard.service";
import { ROLES } from "snu-lib";

@Injectable()
export class ClasseDepartementGuard implements CanActivate {
    constructor(
        private readonly classeGuardService: ClasseGuardService,
        private logger: Logger,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        request.classe = await this.classeGuardService.findClasse(request);
        const utilisateurRole = request.user.role;
        const utilisateurDepartement = request.user.departement;
        const hasAccess =
            request.classe.departement === utilisateurDepartement && utilisateurRole === ROLES.REFERENT_DEPARTMENT;
        if (!hasAccess) {
            this.logger.log(
                `User ${request.user?.id} tried to access classe ${request.classe?.id} but is not in the same department, user department is ${utilisateurDepartement} and classe department is ${request.classe.departement}`,
            );
        }
        return hasAccess;
    }
}
