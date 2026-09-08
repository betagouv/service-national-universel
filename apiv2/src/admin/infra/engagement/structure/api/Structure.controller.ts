import { StructureModel, STRUCTURE_PROJECTION_KEYS } from "@admin/core/engagement/structure/Structure.model";
import { StructureGateway } from "@admin/core/engagement/structure/Structure.gateway";
import { Body, Controller, Inject, Post, Request } from "@nestjs/common";
import { UseAnyGuard } from "@admin/infra/iam/guard/Any.guard";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { ReferentRegionalGuard } from "@admin/infra/iam/guard/ReferentRegional.guard";
import { ReferentDepartementalGuard } from "@admin/infra/iam/guard/ReferentDepartemental.guard";
import { ResponsableGuard } from "@admin/infra/iam/guard/Responsable.guard";
import { SupervisorGuard } from "@admin/infra/iam/guard/Superviseur.guard";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { StructureProjectionPayloadDto } from "./Structure.validation";
import { buildStructureScopeFilter } from "./Structure.scope";

@Controller("structure")
export class StructureController {
    constructor(@Inject(StructureGateway) private readonly structureGateway: StructureGateway) {}

    @Post("/")
    @UseAnyGuard(AdminGuard, ReferentRegionalGuard, ReferentDepartementalGuard, ResponsableGuard, SupervisorGuard)
    async findAll(
        @Body() body: StructureProjectionPayloadDto,
        @Request() request: CustomRequest,
    ): Promise<Partial<StructureModel>[]> {
        let projection: (keyof StructureModel)[] | undefined;

        if (body.fields) {
            projection = body.fields.filter((field) => STRUCTURE_PROJECTION_KEYS.includes(field));
        }

        const filter = buildStructureScopeFilter(request.user);
        // Aucun périmètre exploitable (ex. référent sans région) : cette route ne sert qu'à alimenter des listes,
        // une liste vide est la réponse fail-closed attendue par le front (pas d'erreur remontée à l'utilisateur).
        if (filter === undefined) {
            return [];
        }

        // `null` = aucune restriction (admin), transmis tel quel au gateway.
        return this.structureGateway.findAll(projection, filter);
    }
}
