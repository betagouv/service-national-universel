import { ROLES, UserDto } from "snu-lib";

import { isEtablissementInUserScope } from "../etablissement/etablissementScope";

type ScopedClasse = {
  etablissementId?: string | null;
} | null;

/**
 * Périmètre faisant foi pour consulter une classe CLE.
 *
 * `accessControlMiddleware` et les permissions `PATCH READ` (seedées sans policy) ne portent que la
 * matrice des rôles : sans ce contrôle, un référent départemental ou régional lit la classe, son
 * historique et celui de ses élèves partout en France.
 *
 * Le rattachement passe par l'établissement de la classe.
 */
export async function isClasseInUserScope(user: UserDto, classe: ScopedClasse): Promise<boolean> {
  if (!classe) return false;
  if (user.role === ROLES.ADMIN) return true;

  if (!classe.etablissementId) return false;
  return isEtablissementInUserScope(user, classe.etablissementId);
}
