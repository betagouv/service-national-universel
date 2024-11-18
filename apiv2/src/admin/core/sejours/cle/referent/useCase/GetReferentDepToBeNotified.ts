import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { ReferentToBeNotifiedModel } from "./ReferentToBeNotifiedModel";
import { ReferentGateway } from "src/admin/core/iam/Referent.gateway";
import { ROLES, SUB_ROLES } from "snu-lib";

@Injectable()
export class GetReferentDepToBeNotified implements UseCase<ReferentToBeNotifiedModel[]> {
    constructor(@Inject(ReferentGateway) private readonly referentGateway: ReferentGateway) {}

    //Fetch des référents du département à notifier
    //manager_department -> sinon assistant_manager_department -> sinon secretariat -> sinon manager_phase2
    //cas final -> tous les référents du département (ne devrait pas arriver)
    async execute(departement: string): Promise<ReferentToBeNotifiedModel[]> {
        let referents = await this.referentGateway.findByDepartementRoleAndSousRole(
            departement,
            ROLES.REFERENT_DEPARTMENT,
            SUB_ROLES.manager_department,
        );

        if (!referents.length) {
            referents = await this.referentGateway.findByDepartementRoleAndSousRole(
                departement,
                ROLES.REFERENT_DEPARTMENT,
                SUB_ROLES.assistant_manager_department,
            );
        }

        if (!referents.length) {
            referents = await this.referentGateway.findByDepartementRoleAndSousRole(
                departement,
                ROLES.REFERENT_DEPARTMENT,
                SUB_ROLES.secretariat,
            );
        }

        if (!referents.length) {
            referents = await this.referentGateway.findByDepartementRoleAndSousRole(
                departement,
                ROLES.REFERENT_DEPARTMENT,
                SUB_ROLES.manager_phase2,
            );
        }

        if (!referents.length) {
            referents = await this.referentGateway.findByDepartementRoleAndSousRole(
                departement,
                ROLES.REFERENT_DEPARTMENT,
            );
        }

        return referents;
    }
}
