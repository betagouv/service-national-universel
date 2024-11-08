import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { isSuperAdmin } from "snu-lib";
import { EtablissementGateway } from "src/admin/core/sejours/cle/etablissement/Etablissement.gateway";
import { ClasseDepartementGuard } from "./ClasseDepartement.guard";
import { ClasseGuardService } from "./ClasseGuard.service";
import { ClasseRegionGuard } from "./ClasseRegion.guard";
import { ReferentMapper } from "src/admin/infra/iam/repository/mongo/Referent.mapper";

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

        // TODO : handle request.user mapping
        if (isSuperAdmin({ role: request.user.role, subRole: request.user.sousRole })) {
            return true;
        }

        if (request.user.role === "admin_cle") {
            const etablissement = await this.etablissementGateway.findById(request.classe.etablissementId);
            if (!request.user.id) {
                return false;
            }
            return (
                etablissement.referentEtablissementIds.includes(request.user.id) &&
                etablissement.coordinateurIds.includes(request.user.id)
            );
        }
        return (
            (await this.classeDepartementGuard.canActivate(context)) &&
            (await this.classeRegionGuard.canActivate(context))
        );
    }
}
