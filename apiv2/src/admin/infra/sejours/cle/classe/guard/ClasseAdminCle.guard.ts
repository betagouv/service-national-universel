import { EtablissementGateway } from "@admin/core/sejours/cle/etablissement/Etablissement.gateway";
import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { ROLES, isAdmin } from "snu-lib";
import { ClasseDepartementGuard } from "./ClasseDepartement.guard";
import { ClasseGuardService } from "./ClasseGuard.service";
import { ClasseRegionGuard } from "./ClasseRegion.guard";

@Injectable()
export class ClasseAdminCleGuard implements CanActivate {
    constructor(
        @Inject(EtablissementGateway)
        private readonly etablissementGateway: EtablissementGateway,
        private readonly classeDepartementGuard: ClasseDepartementGuard,
        private readonly classeRegionGuard: ClasseRegionGuard,
        private readonly classeGuardService: ClasseGuardService,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<CustomRequest>();
        request.classe = await this.classeGuardService.findClasse(request);

        // TODO : request.user mapping
        if (isAdmin({ role: request.user.role })) {
            return true;
        }

        if (request.user.role === ROLES.ADMINISTRATEUR_CLE) {
            const etablissement = await this.etablissementGateway.findById(request.classe.etablissementId);
            if (!request.user.id) {
                return false;
            }
            return (
                etablissement.referentEtablissementIds.includes(request.user.id) ||
                etablissement.coordinateurIds.includes(request.user.id)
            );
        }
        // La voie géographique est réservée aux référents territoriaux : sans condition de rôle,
        // tout compte de la région de la classe (référent d'une autre classe, visiteur, chef de
        // centre…) pouvait remplacer le référent de la classe, la vérifier ou y inscrire des élèves.
        if (request.user.role === ROLES.REFERENT_REGION) {
            return this.classeRegionGuard.canActivate(context);
        }
        if (request.user.role === ROLES.REFERENT_DEPARTMENT) {
            return this.classeDepartementGuard.canActivate(context);
        }
        return false;
    }
}
