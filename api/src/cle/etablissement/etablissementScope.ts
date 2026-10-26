import { ROLES, UserDto } from "snu-lib";

import { ClasseModel, EtablissementModel } from "../../models";

/**
 * Périmètre faisant foi pour consulter un établissement CLE.
 *
 * `canViewClasse` / `canViewEtablissement` (snu-lib) ne portent que la matrice des rôles : ils sont
 * partagés avec le front et ne lisent pas la base, donc ils ne peuvent pas arbitrer le périmètre.
 * Sans ce contrôle, un référent de classe lit les classes — et les référents — de n'importe quel
 * établissement, y compris hors de son académie.
 */
export async function isEtablissementInUserScope(user: UserDto, etablissementId: string): Promise<boolean> {
  if (user.role === ROLES.ADMIN) return true;

  const etablissement = await EtablissementModel.findById(etablissementId).lean();
  if (!etablissement) return false;

  const userId = user._id?.toString();
  if (!userId) return false;

  switch (user.role) {
    case ROLES.REFERENT_REGION:
      return Boolean(user.region) && etablissement.region === user.region;
    case ROLES.REFERENT_DEPARTMENT:
      return Boolean(etablissement.department) && ((user.department as string[]) || []).includes(etablissement.department as string);
    case ROLES.ADMINISTRATEUR_CLE:
      // Chef d'établissement ou coordinateur rattaché à cet établissement.
      return [...(etablissement.referentEtablissementIds || []), ...(etablissement.coordinateurIds || [])].includes(userId);
    case ROLES.REFERENT_CLASSE:
      // Un référent de classe n'a pas d'`etablissementId` : son rattachement passe par ses classes.
      return (await ClasseModel.countDocuments({ etablissementId: etablissement._id.toString(), referentClasseIds: userId })) > 0;
    default:
      return false;
  }
}
