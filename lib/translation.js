const translate = (value) => {
  switch (value) {
    case "NONE":
      return "Aucun";
    case "AFFECTED":
      return "Affectée";
    case "NOT_DONE":
      return "Non réalisée";
    case "WAITING_VALIDATION":
      return "En attente de validation";
    case "WAITING_ACCEPTATION":
      return "En attente d'acceptation";
    case "WAITING_VERIFICATION":
      return "En attente de vérification d'éligibilité";
    case "WAITING_AFFECTATION":
      return "En attente d'affectation";
    case "WAITING_CORRECTION":
      return "En attente de correction";
    case "WAITING_UPLOAD":
      return "En attente de téléversement";
    case "IN_PROGRESS":
      return "En cours";
    case "VALIDATED":
      return "Validée";
    case "DELETED":
      return "Supprimée";
    case "WAITING_LIST":
      return "Sur liste complémentaire";
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
    case "NOT_ELIGIBLE":
      return "Non éligible";
    case "EXEMPTED":
      return "Dispensée";
    case "ILLNESS":
      return "Maladie d'un proche ou du volontaire";
    case "DEATH":
      return "Mort d'un proche ou du volontaire";
    case "ADMINISTRATION_CANCEL":
      return "Annulation du séjour par l'administration (COVID 19)";
    case "ABANDON":
      return "Abandonnée";
    case "ABANDONED":
      return "Inscription Abandonnée";
    case "ARCHIVED":
      return "Archivée";
    case "DONE":
      return "Effectuée";
    case "WITHDRAWN":
      return "Désistée";
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
    case "head_center":
      return "Chef de centre";
    case "visitor":
      return "Visiteur";
    case "supervisor":
      return "Superviseur";
    case "manager_department":
      return "Chef de projet départemental";
    case "assistant_manager_department":
      return "Chef de projet départemental adjoint";
    case "manager_department_phase2":
      return "Référent départemental phase 2";
    case "manager_phase2":
      return "Référent phase 2";
    case "secretariat":
      return "Secrétariat";
    case "coordinator":
      return "Coordinateur régional";
    case "assistant_coordinator":
      return "Coordinateur régional adjoint";
    case "recteur_region":
      return "Recteur de région académique";
    case "recteur":
      return "Recteur d'académie";
    case "vice_recteur":
      return "Vice-recteur d'académie";
    case "dasen":
      return "Directeur académique des services de l'éducation nationale (DASEN)";
    case "sgra":
      return "Secrétaire général de région académique (SGRA)";
    case "sga":
      return "Secrétaire général d'académie (SGA)";
    case "drajes":
      return "Délégué régional académique à la jeunesse, à l'engagement et aux sports (DRAJES)";
    case "INSCRIPTION":
      return "Inscription";
    case "COHESION_STAY":
      return "Séjour de cohésion";
    case "INTEREST_MISSION":
      return "Mission d'intérêt général";
    case "CONTINUE":
      return "Poursuivre le SNU";
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
      return "Pendant l'après-midi";
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
      return "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole";
    case "INVITATION_TOKEN_EXPIRED_OR_INVALID":
      return "Invitation invalide";
    case "USER_NOT_FOUND":
      return "Utilisateur introuvable";
    case "USER_NOT_EXISTS":
      return "L'utilisateur n'existe pas";
    case "OPERATION_UNAUTHORIZED":
      return "Opération non autorisée";
    case "FILE_CORRUPTED":
      return "Ce fichier est corrompu";
    case "YOUNG_ALREADY_REGISTERED":
      return "Utilisateur déjà inscrit";
    case "OPERATION_NOT_ALLOWED":
      return "Opération non autorisée";
    case "BIKE":
      return "Vélo";
    case "MOTOR":
      return "Motorisé";
    case "CARPOOLING":
      return "Covoiturage";
    case "WAITING_REALISATION":
      return "En attente de réalisation";
    case "PUBLIC_TRANSPORT":
      return "Transport en commun";
    case "IN_COMING":
      return "À venir";
    case "OTHER":
      return "Autre";
    case "other":
      return "Autre";
    case "SENT":
      return "Envoyée";
    case "UNSUPPORTED_TYPE":
      return "Type non pris en charge";
    case "LINKED_OBJECT":
      return "Objet lié";
    case "NO_TEMPLATE_FOUND":
      return "Template introuvable";
    case "INVALID_BODY":
      return "Requête invalide";
    case "INVALID_PARAMS":
      return "Requête invalide";
    case "EMAIL_OR_PASSWORD_INVALID":
      return "Email ou mot de passe invalide";
    case "PASSWORD_INVALID":
      return "Mot de passe invalide";
    case "EMAIL_INVALID":
      return "Email invalide";
    case "EMAIL_ALREADY_USED":
      return "Cette adresse e-mail est déjà utilisée";
    case "EMAIL_AND_PASSWORD_REQUIRED":
      return "Email et mot de passe requis";
    case "PASSWORD_NOT_MATCH":
      return "Les mots de passe ne correspondent pas";
    case "NEW_PASSWORD_IDENTICAL_PASSWORD":
      return "Le nouveau mot de passe est identique à l'ancien";
    default:
      return value;
  }
};

const translateState = (state) => {
  switch (state) {
    case "open":
      return "ouvert";
    case "new":
      return "nouveau";
    case "closed":
      return "archivé";
    case "pending reminder":
      return "rappel en attente";
    case "pending closure":
      return "clôture en attente";
    default:
      return state;
  }
};

const translateCohort = (cohort) => {
  switch (cohort) {
    case "Février 2022":
      return "du 13 au 25 Février 2022";
    case "Juin 2022":
      return "du 12 au 24 Juin 2022";
    case "Juillet 2022":
      return "du 3 au 15 Juillet 2022";
    default:
      return cohort;
  }
};

const translateSessionStatus = (statut) => {
  switch (statut) {
    case "VALIDATED":
      return "🟢 Validé";
    case "DRAFT":
      return "🟡 Brouillon";
    default:
      return statut;
  }
}

const translatePhase1 = (phase1) => {
  switch (phase1) {
    case "WAITING_AFFECTATION":
      return "En attente d'affectation";
    case "AFFECTED":
      return "Affectée";
    case "EXEMPTED":
      return "Dispensée";
    case "DONE":
      return "Validée";
    case "NOT_DONE":
      return "Non réalisée";
    case "WITHDRAWN":
      return "Désistée";
    case "CANCEL":
      return "Annulée";
    case "WAITING_LIST":
      return "Sur liste complémentaire";
    case "IN_COMING":
      return "À venir";
    default:
      return phase1;
  }
};

const translatePhase2 = (phase2) => {
  switch (phase2) {
    case "WAITING_REALISATION":
      return "Inactif";
    case "IN_PROGRESS":
      return "Actif";
    case "VALIDATED":
      return "Validée";
    case "WITHDRAWN":
      return "Désistée";
    case "IN_COMING":
      return "À venir";
    default:
      return phase2;
  }
};

const translateApplication = (candidature) => {
  switch (candidature) {
    case "WAITING_VALIDATION":
      return "Candidature en attente de validation";
    case "WAITING_VERIFICATION":
      return "En attente de vérification d'éligibilité";
    case "WAITING_ACCEPTATION":
      return "Proposition de mission en attente";
    case "VALIDATED":
      return "Candidature approuvée";
    case "REFUSED":
      return "Candidature non retenue";
    case "CANCEL":
      return "Candidature annulée";
    case "IN_PROGRESS":
      return "Mission en cours";
    case "DONE":
      return "Mission effectuée";
    case "ABANDON":
      return "Mission abandonnée";
    default:
      return candidature;
  }
};

const translateEngagement = (engagement) => {
  switch (engagement) {
    case "DRAFT":
      return "Brouillon";
    case "SENT":
      return "Envoyée";
    case "VALIDATED":
      return "Contrat signé";
    default:
      return engagement;
  }
};

const translateFileStatusPhase1 = (status) => {
  switch (status) {
    case "TO_UPLOAD":
      return "À renseigner";
    case "WAITING_VERIFICATION":
      return "En attente de vérification";
    case "WAITING_CORRECTION":
      return "En attente de correction";
    case "VALIDATED":
      return "Validé";
    case "cohesionStayMedical":
      return "fiche sanitaire";
    case "autoTestPCR":
      return "consentement à l’utilisation d’autotest COVID";
    case "imageRight":
      return "consentement de droit à l'image";
    case "rules":
      return "règlement intérieur";
    default:
      return status;
  }
};

module.exports = {
  translate,
  translateState,
  translateCohort,
  translateSessionStatus,
  translatePhase1,
  translatePhase2,
  translateApplication,
  translateEngagement,
  translateFileStatusPhase1,
};
