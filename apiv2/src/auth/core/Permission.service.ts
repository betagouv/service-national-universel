import { Inject, Injectable, Logger } from "@nestjs/common";

import {
    HasPermissionParams,
    HasPermissionsParams,
    PERMISSION_ACTIONS,
    PermissionContext,
    ReferentType,
    getPermissionActions,
    getPolicyQuery,
    getUserRoles,
} from "snu-lib";

import { PermissionModel } from "./Permission.model";
import { PermissionGateway } from "./Permission.gateway";
import { RoleGateway } from "./Role.gateway";

@Injectable()
export class PermissionService {
    constructor(
        @Inject(PermissionGateway) private readonly permissionGateway: PermissionGateway,
        @Inject(RoleGateway) private readonly roleGateway: RoleGateway,
        private readonly logger: Logger,
    ) {}

    async hasCreatePermission({ user, code, context }: HasPermissionParams) {
        return this.hasPermission({ user, code, action: PERMISSION_ACTIONS.CREATE, context });
    }

    // Exemple:
    //   hasReadPermission({ user, code: "AdminSupport" })
    //   hasReadPermission({ user, code: "ExportInjep" })
    //   hasReadPermission({ user, code: "UserProfile", context: { ressource: "referent", ressourceId: user.id } })
    async hasReadPermission({ user, code, context }: HasPermissionParams) {
        return this.hasPermission({ user, code, action: PERMISSION_ACTIONS.READ, context });
    }

    // Exemple: l'utilisateur a-t-il les droits de modifier un etablissement ?
    // hasUpdatePermission({ user, code: "AjouterCoordinateur", context: { ressource: "etablissement" } })
    async hasUpdatePermission({ user, code, context }: HasPermissionParams) {
        return this.hasPermission({ user, code, action: PERMISSION_ACTIONS.UPDATE, context });
    }

    async hasDeletePermission({ user, code, context }: HasPermissionParams) {
        return this.hasPermission({ user, code, action: PERMISSION_ACTIONS.DELETE, context });
    }

    async hasExecutePermission({ user, code, context }: HasPermissionParams) {
        return this.hasPermission({ user, code, action: PERMISSION_ACTIONS.EXECUTE, context });
    }

    async hasPermission({ user, code, action, context }: HasPermissionParams) {
        return this.hasPermissions({ user, codes: [code], action, context });
    }

    async hasPermissions({ user, codes, action, context }: HasPermissionsParams): Promise<boolean> {
        const rolesCodes = getUserRoles(user);
        // on récupère les roles et sous roles associés à l'utilisateur (ex: si l'utilisateur est god, on récupère le role admin)
        const roles = await this.roleGateway.findByCodesAndParent(rolesCodes);

        // on calcul les actions à vérifier
        const actions = getPermissionActions(action);

        if (context?.ressource) {
            // pour ces rôles on récupère les permissions (brutes) associées
            const userPermissions = await this.permissionGateway.findByCodesRolesResourceAndActions(
                codes,
                context.ressource,
                action ? [action, PERMISSION_ACTIONS.FULL] : [PERMISSION_ACTIONS.FULL],
                roles.map((role) => role.code),
            );

            // on calcul les droits de l'utilisateur en fonction du contexte
            const allowedPermissions = await this.getUserAllowedPermissionsForRessource(user, userPermissions, context);
            if (allowedPermissions.length) {
                return true;
            }
        } else {
            // pour ces rôles on vérifie qu'on a la permission associée
            const userPermissions = await this.permissionGateway.findByCodesRolesAndActions(
                codes,
                roles.map((role) => role.code),
                actions,
            );
            if (userPermissions.length) {
                return true;
            }
        }

        return false;
    }

    private async getUserAllowedPermissionsForRessource(
        user: Partial<ReferentType>,
        permissions: PermissionModel[],
        context: PermissionContext,
    ): Promise<PermissionModel[]> {
        const allowedPermissions: PermissionModel[] = [];
        for (const permission of permissions) {
            for (const policy of permission.policy || []) {
                if (policy.where) {
                    const query = getPolicyQuery(policy, user);
                    // get resource gateway
                    const resourceRepository = this.permissionGateway.getResourceRepository(context.ressource as any);
                    // filter resource by source or value
                    const resourceDocument = await resourceRepository.findOne(query);
                    // if result found, allow permission
                    if (resourceDocument) {
                        allowedPermissions.push(permission);
                    }
                }
            }
        }
        return allowedPermissions;
    }
}
