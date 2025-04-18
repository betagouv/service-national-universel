import {
  getPolicyQuery,
  getUserRoles,
  getPermissionActions,
  HasPermissionsParams,
  PERMISSION_RESOURCES_COLLECTION,
  PermissionContext,
  PermissionType,
  ReferentType,
} from "snu-lib";
import { PermissionRepository } from "./Permission.repository";
import { YoungModel } from "../../models";
import { Model } from "mongoose";
import { RoleRepository } from "./Role.repository";

export async function hasPermissions({ user, codes, action, context }: HasPermissionsParams): Promise<boolean> {
  const rolesCodes = getUserRoles(user);
  // on récupère les roles et sous roles associés à l'utilisateur (ex: si l'utilisateur est god, on récupère le role admin)
  const roles = await RoleRepository.findByCodesAndParent(rolesCodes);

  // on calcul les actions à vérifier
  const actions = getPermissionActions(action);

  if (context?.ressource) {
    // pour ces rôles on récupère les permissions (brutes) associées
    const userPermissions = await PermissionRepository.findByCodesRolesResourceAndActions(
      codes,
      roles.map((role) => role.code),
      context.ressource,
      actions,
    );
    // on calcul les droits de l'utilisateur en fonction du contexte
    const allowedPermissions = await getUserAllowedPermissionsForRessource(user, userPermissions, context);
    if (allowedPermissions.length) {
      return true;
    }
  } else {
    // pour ces rôles on vérifie qu'on a la permission associée
    const userPermissions = await PermissionRepository.findByCodesRolesAndActions(
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

async function getUserAllowedPermissionsForRessource(user: Partial<ReferentType>, permissions: PermissionType[], context: PermissionContext): Promise<PermissionType[]> {
  const allowedPermissions: PermissionType[] = [];
  for (const permission of permissions) {
    for (const policy of permission.policy) {
      if (policy.where?.length) {
        // get resource gateway
        const resourceModel = getResourceRepository(context.ressource);
        const query = getPolicyQuery(policy, user);
        // filter resource by source or value
        const resourceDocument = await resourceModel.findOne(query);
        // if result found, allow permission
        if (resourceDocument) {
          allowedPermissions.push(permission);
        }
      }
    }
  }
  return allowedPermissions;
}

function getResourceRepository(ressource: string): Model<any> {
  switch (ressource) {
    case PERMISSION_RESOURCES_COLLECTION.YOUNG:
      return YoungModel;
    default:
      throw new Error(`Model for resource ${ressource} not found`);
  }
}

async function getUserAllowedRessources(
  user: Partial<ReferentType>,
  //   permissions: PermissionType[],
  //   context: PermissionContext,
  //   action?: PermissionType["action"],
): Promise<{ ressource: string; field: string; value: string[] }[]> {
  // Exemple: listes des départements associés à l'utilisateur (ref dep)
  // const allowedPermissions = await this.getUserAllowedPermissions(user, permissions, context, action);
  // on récupère les ressources associées aux permissions
  // TODO: implémenter
  return [];
}
