import { department2region, ROLES, UserDto } from "snu-lib";

/**
 * Périmètre faisant foi pour écrire un service départemental.
 *
 * `canCreateOrUpdateDepartmentService` (snu-lib) ne porte que la matrice des rôles : il est partagé
 * avec le front et ne connaît pas la ressource visée, donc il ne peut pas arbitrer le périmètre.
 * Sans ce contrôle, un référent départemental réécrit l'adresse, les contacts de convocation et le
 * représentant de l'État de n'importe quel département — coordonnées imprimées sur les convocations
 * et utilisées comme destinataires d'emails.
 *
 * Tout rôle non listé ici est refusé (fail-closed).
 */
export function isDepartmentInUserScope(user: UserDto, department?: string | null): boolean {
  if (user?.role === ROLES.ADMIN) return true;
  if (!department) return false;

  switch (user?.role) {
    case ROLES.REFERENT_DEPARTMENT:
      return (user.department || []).includes(department);
    case ROLES.REFERENT_REGION:
      return Boolean(user.region) && department2region[department] === user.region;
    default:
      return false;
  }
}
