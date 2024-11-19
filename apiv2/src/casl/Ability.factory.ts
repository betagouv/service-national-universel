import { Injectable } from "@nestjs/common";
import { createMongoAbility, AbilityBuilder, ExtractSubjectType, InferSubjects } from "@casl/ability";
import { ReferentModel } from "src/admin/core/iam/Referent.model";
import { ROLES } from "snu-lib";

export type Actions = "manage" | "create" | "read" | "update" | "delete";
export type Subjects = "Classe" | InferSubjects<{ departementId: string }> | "all";

export type AppAbility = ReturnType<typeof createMongoAbility>;

@Injectable()
export class AbilityFactory {
    createForUser(user: ReferentModel) {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

        if (user.role === ROLES.ADMIN) {
            can("manage", "all");
        } else if (user.role === ROLES.ADMINISTRATEUR_CLE) {
            can(["update", "read"], "Classe", { departement: user.departement });
            can(["update", "read"], "Classe", { region: user.region });
        } else if (user.role === ROLES.REFERENT_REGION) {
            can(["update", "read"], "Classe", { region: user.region });
        } else if (user.role === ROLES.REFERENT_DEPARTMENT) {
            can(["update", "read"], "Classe", { departement: user.departement });
        }

        // if (user && user.departement) {
        //     // Allow users to update classes in their department
        //     can("update", "Classe", { departement: user.departement });

        //     // Allow users to read all classes
        //     can("read", "Classe");
        // }

        // if (user.role === ROLES.ADMIN) {
        //     can("manage", "all");
        // } else if (user.role === ROLES.REFERENT) {
        //     can("read", "Classe");
        //     can("update", "Classe", { departmentId: user.departmentId });
        // }

        // if (user && user.departmentId) {
        //     // Allow users to update classes in their department
        //     can("update", "Classe", { departmentId: user.departmentId });

        //     // Allow users to read all classes
        //     can("read", "Classe");
        // }

        return build({
            detectSubjectType: (item) => item.constructor as unknown as ExtractSubjectType<Subjects>,
        });
    }
}
