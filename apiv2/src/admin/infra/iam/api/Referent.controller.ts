import { ReferentService } from "@admin/core/iam/service/Referent.service";
import { Controller, Get, ParseEnumPipe, Query } from "@nestjs/common";
import { Role } from "@shared/core/Role";
import { ROLES, ReferentRoutes } from "snu-lib";
import { AdminGuard } from "../guard/Admin.guard";
import { AdminCleGuard } from "../guard/AdminCle.guard";
import { UseAnyGuard } from "../guard/Any.guard";
import { ReferentDepartementalGuard } from "../guard/ReferentDepartemental.guard";
import { ReferentRegionalGuard } from "../guard/ReferentRegional.guard";

@Controller("referent")
export class ReferentController {
    constructor(private readonly referentService: ReferentService) {}

    @Get("/")
    @UseAnyGuard(AdminGuard, AdminCleGuard, ReferentDepartementalGuard, ReferentRegionalGuard)
    async findReferentsByRole(
        @Query("role", new ParseEnumPipe(ROLES)) role: Role,
        @Query("etablissementId") etablissementId?: string,
        @Query("search") search?: string,
    ): Promise<ReferentRoutes["GetByRole"]["response"]> {
        return this.referentService.findByRoleAndEtablissement(role, etablissementId, search);
    }
}
