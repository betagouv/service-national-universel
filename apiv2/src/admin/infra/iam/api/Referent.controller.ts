import { ReferentService } from "@admin/core/iam/service/Referent.service";
import { Controller, Get, ParseEnumPipe, Query, Request } from "@nestjs/common";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { ROLES, ReferentRoutes } from "snu-lib";
import { AdminGuard } from "../guard/Admin.guard";
import { AdminCleGuard } from "../guard/AdminCle.guard";
import { UseAnyGuard } from "../guard/Any.guard";
import { ReferentDepartementalGuard } from "../guard/ReferentDepartemental.guard";
import { ReferentRegionalGuard } from "../guard/ReferentRegional.guard";

/**
 * Seuls les référents de classe sont listables par cette route : c'est son unique usage
 * fonctionnel (sélection du référent d'une classe d'un établissement). Autoriser les autres
 * rôles en ferait un annuaire national des ~28 000 référents.
 */
const LISTABLE_ROLES = { REFERENT_CLASSE: ROLES.REFERENT_CLASSE } as const;

@Controller("referent")
export class ReferentController {
    constructor(private readonly referentService: ReferentService) {}

    @Get("/")
    @UseAnyGuard(AdminGuard, AdminCleGuard, ReferentDepartementalGuard, ReferentRegionalGuard)
    async findReferentsByRole(
        @Request() request: CustomRequest,
        @Query("role", new ParseEnumPipe(LISTABLE_ROLES)) role: typeof ROLES.REFERENT_CLASSE,
        @Query("etablissementId") etablissementId: string,
        @Query("search") search?: string,
    ): Promise<ReferentRoutes["GetByRole"]["response"]> {
        return this.referentService.findByRoleAndEtablissement(request.user, role, etablissementId, search);
    }
}
