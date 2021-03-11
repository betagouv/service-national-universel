export const translate = (value) => {
  switch (value) {
    case "AFFECTED":
      return "Affectée";
    case "NOT_DONE":
      return "Non réalisée";
    case "WAITING_VALIDATION":
      return "En attente de validation";
    case "WAITING_ACCEPTATION":
      return "En attente d'acceptation";
    case "WAITING_AFFECTATION":
      return "En attente d'affectation";
    case "WAITING_CORRECTION":
      return "En attente de correction";
    case "IN_PROGRESS":
      return "En cours";
    case "VALIDATED":
      return "Validée";
    case "CONTINUOUS":
      return "Mission regroupée sur des journées";
    case "DISCONTINUOUS":
      return "Mission répartie sur des heures";
    case "AUTONOMOUS":
      return "En autonomie";
    case "DRAFT":
      return "Brouillon";
    case "REFUSED":
      return "Refusée";
    case "CANCEL":
      return "Annulée";
    case "ABANDON":
      return "Abandonnée";
    case "ARCHIVED":
      return "Archivée";
    case "WITHDRAWN":
      return "Désistée";
    case "DONE":
      return "Effectuée";
    case "NOT_COMPLETED":
      return "Non achevée";
    case "PRESELECTED":
      return "Présélectionnée";
    case "SIGNED_CONTRACT":
      return "Contrat signé";
    case "ASSOCIATION":
      return "Association";
    case "PUBLIC":
      return "Structure publique";
    case "PRIVATE":
      return "Structure privée";
    case "OTHER":
      return "Autre";
    case "GENERAL_SCHOOL":
      return "En enseignement général ou technologique";
    case "PROFESSIONAL_SCHOOL":
      return "En enseignement professionnel";
    case "AGRICULTURAL_SCHOOL":
      return "En lycée agricole";
    case "SPECIALIZED_SCHOOL":
      return "En établissement spécialisé";
    case "APPRENTICESHIP":
      return "En apprentissage";
    case "EMPLOYEE":
      return "Salarié(e)";
    case "INDEPENDANT":
      return "Indépendant(e)";
    case "SELF_EMPLOYED":
      return "Auto-entrepreneur";
    case "ADAPTED_COMPANY":
      return "En ESAT, CAT ou en entreprise adaptée";
    case "POLE_EMPLOI":
      return "Inscrit(e) à Pôle emploi";
    case "MISSION_LOCALE":
      return "Inscrit(e) à la Mission locale";
    case "CAP_EMPLOI":
      return "Inscrit(e) à Cap emploi";
    case "NOTHING":
      return "Inscrit(e) nulle part";
    case "admin":
      return "modérateur";
    case "referent_department":
      return "Référent départemental";
    case "referent_region":
      return "Référent régional";
    case "responsible":
      return "Responsable";
    case "supervisor":
      return "Superviseur";
    case "INSCRIPTION":
      return "Inscription";
    case "COHESION_STAY":
      return "Séjour de cohésion";
    case "INTEREST_MISSION":
      return "Mission d'interêt générale";
    case "SUMMER":
      return "Vacances d'été (juillet ou août)";
    case "AUTUMN":
      return "Vacances d'automne";
    case "DECEMBER":
      return "Vacances de fin d'année (décembre)";
    case "WINTER":
      return "Vacances d'hiver";
    case "SPRING":
      return "Vacances de printemps";
    case "EVENING":
      return "En soirée";
    case "END_DAY":
      return "En fin de journée";
    case "WEEKEND":
      return "Durant le week-end";
    case "CITIZENSHIP":
      return "Citoyenneté";
    case "CULTURE":
      return "Culture";
    case "DEFENSE":
      return "Défense et mémoire";
    case "EDUCATION":
      return "Éducation";
    case "ENVIRONMENT":
      return "Environnement";
    case "HEALTH":
      return "Santé";
    case "SECURITY":
      return "Sécurité";
    case "SOLIDARITY":
      return "Solidarité";
    case "SPORT":
      return "Sport";
    case "UNIFORM":
      return "Corps en uniforme";
    case "OTHER":
      return "Autre";
    case "UNKNOWN":
      return "Non connu pour le moment";
    case "FIREFIGHTER":
      return "Pompiers";
    case "POLICE":
      return "Police";
    case "ARMY":
      return "Militaire";
    case "DURING_HOLIDAYS":
      return "Sur les vacances scolaires";
    case "DURING_SCHOOL":
      return "Sur le temps scolaire";
    case "true":
      return "Oui";
    case "false":
      return "Non";
    case "male":
      return "Homme";
    case "female":
      return "Femme";
    case "father":
      return "Père";
    case "mother":
      return "Mère";
    case "representant":
      return "Représentant légal";
    case "SERVER_ERROR":
      return "Erreur serveur";
    case "NOT_FOUND":
      return "Ressource introuvable";
    case "PASSWORD_TOKEN_EXPIRED_OR_INVALID":
      return "Lien expiré ou token invalide";
    case "USER_ALREADY_REGISTERED":
      return "Utilisateur déjà inscrit";
    case "PASSWORD_NOT_VALIDATED":
      return "Mot de passe invalide";
    case "INVITATION_TOKEN_EXPIRED_OR_INVALID":
      return "Invitation invalide";
    case "USER_NOT_FOUND":
    case "USER_NOT_EXISTS":
      return "L'utilisateur n'existe pas";
    case "OPERATION_UNAUTHORIZED":
      return "Opération non autorisée";
    case "FILE_CORRUPTED":
      return "Ce fichier est corrompu";
    case "YOUNG_ALREADY_REGISTERED":
      return "Utilisateur déjà inscrit";
    case "PUBLIC_TRANSPORT":
      return "Transport en commun";
    case "BIKE":
      return "Vélo";
    case "MOTOR":
      return "Motorisé";
    case "CARPOOLING":
      return "Covoiturage";
    case "WAITING_REALISATION":
      return "En attente de réalisation";
    default:
      return value;
  }
};
