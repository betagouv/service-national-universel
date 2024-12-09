import { ReferentModelLight } from "@admin/core/iam/Referent.model";
import { ReferentService } from "@admin/core/iam/service/Referent.service";
import { ClasseAdminCleGuard } from "@admin/infra/sejours/cle/classe/guard/ClasseAdminCle.guard";
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Role } from "@shared/core/Role";
import { AdminGuard } from "../guard/Admin.guard";
import { ReferentForListDto, ReferentRoutes } from "snu-lib";

@Controller("referent")
export class ReferentController {
    constructor(private readonly referentService: ReferentService) {}

    @Get("/")
    @UseGuards(AdminGuard)
    async findReferentsByRole(
        @Query("role") role: Role,
        @Query("search") search: string,
    ): Promise<ReferentRoutes["GetByRole"]["response"]> {
        return this.referentService.findByRole(role, search);
    }
}
