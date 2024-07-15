const translate = (value) => {
  switch (value) {
    case "WAITING_REALISATION":
      return "En attente de réalisation";
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
    case "WAITING_CONSENT":
      return "En attente du consentement";
    case "CONFIRM":
      return "Confirmation";
    case "CORRECTED":
      return "Corrigée";
    case "IN_PROGRESS":
      return "En cours";
    case "VALIDATED":
      return "Validée";
    case "DELETED":
      return "Supprimée";
    case "deleted":
      return "Supprimée";
    case "WAITING_LIST":
      return "Sur liste complémentaire";
    case "NOT_AUTORISED":
      return "Non autorisé";
    case "REINSCRIPTION":
      return "Réinscription";
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
      return "Décès d'un proche ou du volontaire";
    case "ADMINISTRATION_CANCEL":
      return "Annulation du séjour par l'administration (COVID 19)";
    case "ABANDON":
      return "Abandonnée";
    case "ABANDONED":
      return "Inscription abandonnée";
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
      return "En voie générale ou technologique";
    case "PROFESSIONAL_SCHOOL":
      return "En voie professionnelle (hors apprentissage)";
    case "AGRICULTURAL_SCHOOL":
      return "En lycée agricole";
    case "SPECIALIZED_SCHOOL":
      return "En enseignement adapté";
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
      return "Modérateur";
    case "dsnj":
      return "DSNJ";
    case "transporter":
      return "Transporteur";
    case "referent_department":
      return "Référent départemental";
    case "referent_region":
      return "Référent régional";
    case "responsible":
      return "Responsable";
    case "head_center":
      return "Chef de centre";
    case "administrateur_cle":
      return "Administrateur CLE";
    case "referent_classe":
      return "Référent de classe";
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
    case "referent_etablissement":
      return "Chef d'établissement";
    case "coordinateur_cle":
      return "Coordinateur d'établissement";
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
    case "MILITARY":
      return "Militaire";
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
    case "WHENEVER":
      return "N’importe quand";
    case "DURING_HOLIDAYS":
      return "Sur les vacances scolaires";
    case "DURING_SCHOOL":
      return "Sur le temps extra-scolaire";
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
      return "Autre";
    case "SERVER_ERROR":
      return "Erreur serveur";
    case "NOT_FOUND":
      return "Ressource introuvable";
    case "PASSWORD_TOKEN_EXPIRED_OR_INVALID":
      return "Lien expiré ou token invalide";
    case "EMAIL_VALIDATION_TOKEN_EXPIRED_OR_INVALID":
      return "Le code d'activation saisi n'est pas valide ou a expiré";
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
    case "FILE_INFECTED":
      return "Votre fichier a été détecté comme un virus";
    case "FILE_SCAN_DOWN":
      return "Nous rencontrons actuellement un problème avec le téléversement des pièces jointes sur cette page. Veuillez retenter un peu plus tard. Excusez-nous pour la gène occasionnée.";
    case "FILE_SCAN_DOWN_SUPPORT":
      return "Nous rencontrons actuellement un problème avec le téléversement des pièces jointes sur cette page. Envoyez votre message sans pièce jointe ou retentez plus tard. Veuillez nous excuser pour la gène occasionnée.";
    case "UPLOAD_IN_PROGRESS":
      return "Le téléversement de pièce jointe peut prendre un peu de temps, merci de ne pas rafraîchir la page et de patienter quelques instants.";
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
    case "PUBLIC_TRANSPORT":
      return "Transport en commun";
    case "IN_COMING":
      return "À venir";
    case "other":
      return "Autre";
    case "SENT":
      return "Envoyée";
    case "UNSUPPORTED_TYPE":
      return "Type non pris en charge";
    case "LINKED_OBJECT":
      return "Objet lié";
    case "LINKED_MISSIONS":
      return "Objet lié à une mission";
    case "LINKED_STRUCTURE":
      return "Objet lié à une structure";
    case "NO_TEMPLATE_FOUND":
      return "Template introuvable";
    case "INVALID_BODY":
      return "Requête invalide";
    case "INVALID_PARAMS":
      return "Requête invalide";
    case "EMAIL_OR_PASSWORD_INVALID":
      return "Email ou mot de passe invalide";
    case "PASSWORD_INVALID":
      return "Le mot de passe est incorrect";
    case "EMAIL_INVALID":
      return "Email invalide";
    case "EMAIL_ALREADY_USED":
      return "Cette adresse e-mail est déjà utilisée";
    case "EMAIL_UNCHANGED":
      return "L'adresse e-mail est indentique à l'actuelle";
    case "EMAIL_AND_PASSWORD_REQUIRED":
      return "Email et mot de passe requis";
    case "PASSWORD_NOT_MATCH":
      return "Les mots de passe ne correspondent pas";
    case "NEW_PASSWORD_IDENTICAL_PASSWORD":
      return "Le nouveau mot de passe est identique à l'ancien";
    case "YOUNG_NOT_FOUND":
      return "Jeune(s) introuvable(s)";
    case "cniNew":
      return "CNI (nouveau format)";
    case "cniOld":
      return "CNI (ancien format)";
    case "passport":
      return "Passeport";
    case "NOT_SCOLARISE":
      return "Non scolarisé";
    case "REMINDER_SENT":
      return "La relance a bien été envoyée";
    case "BAD_REQUEST":
      return "Votre demande n'a pas pu être prise en compte";
    case "COPIED_TO_CLIPBOARD":
      return "Copié dans le presse-papiers";
    case "EMAIL_WAITING_VALIDATION":
      return "Email en attente de validation";
    case "COORDONNEES":
      return "Coordonnées";
    case "CONSENTEMENTS":
      return "Consentements";
    case "REPRESENTANTS":
      return "Représentants";
    case "DOCUMENTS":
      return "Documents";
    case "mobilityNearHome":
      return "De leur domicile";
    case "mobilityNearSchool":
      return "De leur établissement";
    case "mobilityNearRelative":
      return "De l'hébergement d'un proche";
    case "N/A":
      return "Non renseigné";
    case "INSCRIPTION_IN_PROGRESS":
      return "Inscription en cours";
    case "INSCRIPTION_TO_CHECK":
      return "Inscription à vérifier";
    case "CREATED":
      return "Créée";
    case "GROUP":
      return "Groupe d'élèves";
    case "FULL":
      return "Classe complète";
    case "active":
      return "Actif";
    case "inactive":
      return "Inactif";
    default:
      return value;
  }
};

const translateInscriptionStatus = (value) => {
  switch (value) {
    case "WAITING_VALIDATION":
      return "En attente de validation";
    case "WAITING_CORRECTION":
      return "En attente de correction";
    case "REINSCRIPTION":
      return "Réinscription";
    case "VALIDATED":
      return "Validée sur liste principale";
    case "REFUSED":
      return "Refusée";
    case "IN_PROGRESS":
      return "En cours";
    case "WITHDRAWN":
      return "Désistée";
    case "DELETED":
      return "Supprimée";
    case "WAITING_LIST":
      return "Validée sur liste complémentaire";
    case "NOT_ELIGIBLE":
      return "Non éligible";
    case "ABANDONED":
      return "Inscription abandonnée";
    case "NOT_AUTORISED":
      return "Non autorisée";
    default:
      return value;
  }
};

const translateVisibilty = (v) => {
  switch (v) {
    case "VISIBLE":
      return "Ouverte";
    case "HIDDEN":
      return "Fermée";
    default:
      return v;
  }
};

const translateState = (state) => {
  switch (state) {
    case "open":
    case "OPEN":
      return "ouvert";
    case "new":
    case "NEW":
      return "nouveau";
    case "closed":
    case "CLOSED":
      return "archivé";
    case "pending reminder":
    case "PENDING REMINDER":
      return "rappel en attente";
    case "pending closure":
    case "PENDING CLOSURE":
      return "clôture en attente";
    case "pending":
    case "PENDING":
      return "en attente";
    default:
      return state;
  }
};

const translateSessionStatus = (statut) => {
  switch (statut) {
    case "VALIDATED":
      return "Validé";
    case "DRAFT":
      return "Brouillon";
    default:
      return statut;
  }
};

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
const translateContractStatus = (contract) => {
  switch (contract) {
    case "DRAFT":
      return "Brouillon";
    case "SENT":
      return "Envoyé";
    case "VALIDATED":
      return "Validé";
    default:
      return contract;
  }
};
const translateApplication = (candidature) => {
  switch (candidature) {
    case "WAITING_VALIDATION":
      return "Candidature en attente";
    case "WAITING_VERIFICATION":
      return "En attente de vérification";
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
    case "N/A":
      return "Aucune candidature ni proposition";
    default:
      return candidature;
  }
};

const translateApplicationForYoungs = (candidature) => {
  switch (candidature) {
    case "WAITING_VALIDATION":
      return "Candidature en attente";
    case "WAITING_VERIFICATION":
      return "Candidature en attente";
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
const translateStatusMilitaryPreparationFiles = (status) => {
  switch (status) {
    case "WAITING_VERIFICATION":
      return "En attente de vérification";
    case "WAITING_CORRECTION":
      return "En attente de correction";
    case "VALIDATED":
      return "Validé";
    case "REFUSED":
      return "Refusé";
    default:
      return status;
  }
};

const translateEquivalenceStatus = (status) => {
  switch (status) {
    case "WAITING_VERIFICATION":
      return "En attente de vérification";
    case "WAITING_CORRECTION":
      return "En attente de correction";
    case "VALIDATED":
      return "Validée";
    case "REFUSED":
      return "Refusée";
    default:
      return status;
  }
};

const translateAddFilePhase2WithoutPreposition = (status) => {
  switch (status) {
    case "contractAvenantFiles":
      return "Avenant au contrat d’engagement";
    case "justificatifsFiles":
      return `Document justificatif`;
    case "feedBackExperienceFiles":
      return `Retour d’expérience (rapport de MIG)`;
    case "othersFiles":
      return `Document`;
    default:
      return status;
  }
};

const translateAddFilePhase2 = (status) => {
  switch (status) {
    case "contractAvenantFiles":
      return "un avenant au contrat d’engagement";
    case "justificatifsFiles":
      return `un document justificatif`;
    case "feedBackExperienceFiles":
      return `un retour d’expérience (rapport de MIG)`;
    case "othersFiles":
      return `un document`;
    default:
      return status;
  }
};

const translateAddFilesPhase2 = (status) => {
  switch (status) {
    case "contractAvenantFiles":
      return "plusieurs avenants au contrat d’engagement";
    case "justificatifsFiles":
      return `plusieurs documents justificatifs`;
    case "feedBackExperienceFiles":
      return `plusieurs retours d’expériences (rapport de MIG)`;
    case "othersFiles":
      return `plusieurs documents`;
    default:
      return status;
  }
};

const translateSource = (bool) => {
  if (bool === "true") return "JVA";
  else return "SNU";
};

const translateFilter = (label) => {
  switch (label) {
    // Volontaires
    case "SEARCH":
      return "Rechercher";
    case "STATUS":
      return "Statut";
    case "COHORT":
      return "Cohorte";
    case "ORIGINAL_COHORT":
      return "Cohorte d'origine";
    case "DEPARTMENT":
      return "Département";
    case "REGION":
      return "Région";
    case "STATUS_PHASE_1":
      return "Status phase 1";
    case "STATUS_PHASE_2":
      return "Statut phase2";
    case "STATUS_PHASE_3":
      return "Statut phase 3";
    case "APPLICATION_STATUS":
      return "Statut de la candidature";
    case "LOCATION":
      return "Lieu";
    case "CONTRACT_STATUS":
      return "Statut du contrat";
    case "MEDICAL_FILE_RECEIVED":
      return "Fichier médical réceptionné";
    case "COHESION_PRESENCE":
      return "Présence à l'arrivée";
    case "MILITARY_PREPARATION_FILES_STATUS":
      return "Statut des fichiers de PM";
    case "EQUIVALENCE_STATUS":
      return "Statut de la demande d'équivalence";
    case "HANDICAP":
      return "Handicap";
    case "GRADE":
      return "Classe";
    case "IMAGE_RIGHT":
      return "Droit à l'image";
    case "IMAGE_RIGHT_STATUS":
      return "Droit à l'image - Statut";
    case "RULES":
      return "Règlement intérieur";
    case "AUTOTEST":
      return "Utilisation d'autotest";
    case "AUTOTEST_STATUS":
      return "Utilisation d'autotest - Statut";
    case "SPECIFIC_AMENAGEMENT":
      return "Aménagement spécifique";
    case "SAME_DEPARTMENT":
      return "Affectation dans son département (handicap)";
    case "ALLERGIES":
      return "Allergies ou intolérances";
    case "COHESION_PARTICIPATION":
      return "Confirmation de participation au séjour de cohésion";
    case "COHESION_JDM":
      return "Présence à la JDM";
    case "DEPART":
      return "Départ renseigné";
    case "DEPART_MOTIF":
      return "Motif du départ";
    case "SAME_DEPARTMENT_SPORT":
      return "Affectation dans son département (sport)";
    case "PMR":
      return "Aménagement PMR";
    case "PPS":
      return "PPS";
    case "PAI":
      return "PAI";
    case "QPV":
      return "QPV";
    case "ZRR":
      return "ZRR";
    case "PLANE":
      return "Voyage en avion";

    // Missions
    case "DOMAIN":
      return "Domaine";
    case "PLACES":
      return "Places restantes";
    case "TUTOR":
      return "Tuteur";
    case "STRUCTURE":
      return "Structure";
    case "MILITARY_PREPARATION":
      return "Préparation militaire";
    case "DATE":
      return "Date";
    case "SOURCE":
      return "Source";
    case "VISIBILITY":
      return "Visibilité";
    case "PLACESTATUS":
      return "Place occupées";
    case "APPLICATIONSTATUS":
      return "Statut de candidature";

    // Structures
    case "LEGAL_STATUS":
      return "Statut juridique";
    case "CORPS":
      return "Corps en uniforme";
    case "WITH_NETWORK":
      return "Affiliation à un réseau national";
    case "TYPE":
      return "Type";
    case "SOUS-TYPE":
      return "Sous-type";

    default:
      return label;
  }
};

const translateGrade = (grade) => {
  switch (grade) {
    case "NOT_SCOLARISE":
      return "Non scolarisé(e)";
    case "4eme":
      return "4ème";
    case "3eme":
      return "3ème";
    case "2nde":
      return "2nde";
    case "1ere":
      return "1ère";
    case "1ereCAP":
      return "1ère année de CAP";
    case "2ndeCAP":
      return "2ème année de CAP";
    case "Terminale":
      return "Terminale";
    case "TERM_CAP":
      return "Terminale CAP";
    case "2ndePro":
      return "2nde professionnelle";
    case "2ndeGT":
      return "2nde génerale et technologique";
    case "1erePro":
      return "1ere professionnelle";
    case "1ereGT":
      return "1ere génerale et technologique";
    case "CAP":
      return "CAP";
    case "Autre":
      return "Autre";
    case "TermGT":
      return "Terminale génerale et technologique";
    case "TermPro":
      return "Terminale professionnelle";
    default:
      return grade;
  }
};

const translateField = (field) => {
  switch (field) {
    case "firstName":
      return "Prénom";
    case "lastName":
      return "Nom";
    case "gender":
      return "Sexe";
    case "cohort":
      return "Cohorte";
    case "originalCohort":
      return "Cohorte d'origine";
    case "email":
      return "Email";
    case "phone":
      return "Téléphone";
    case "frenchNationality":
      return "Nationalité";
    case "birthdateAt":
      return "Date de naissance";
    case "birthCountry":
      return "Pays de naissance";
    case "birthCity":
      return "Ville de naissance";
    case "birthCityZip":
      return "Code postal de naissance";
    case "address":
      return "Adresse";
    case "zip":
      return "Code postal";
    case "city":
      return "Ville";
    case "country":
      return "Pays";
    case "hostLastName":
      return "Nom de l'hébergeur";
    case "hostFirstName":
      return "Prénom de l'hébergeur";
    case "hostRelationship":
      return "Lien avec l'hébergeur";
    case "foreignAddress":
      return "Adresse - étranger";
    case "foreignZip":
      return "Code postal - étranger";
    case "foreignCity":
      return "Ville - étranger";
    case "foreignCountry":
      return "Pays - étranger";
    case "department":
      return "Département";
    case "academy":
      return "Académie";
    case "region":
      return "Région";
    case "situation":
      return "Situation";
    case "grade":
      return "Niveau";
    case "schoolType":
      return "Type d'établissement";
    case "schoolName":
      return "Nom de l'établissement";
    case "schoolZip":
      return "Code postal de l'établissement";
    case "schoolCity":
      return "Ville de l'établissement";
    case "schoolDepartment":
      return "Département de l'établissement";
    case "schoolRegion":
      return "Région de l'établissement";
    case "qpv":
      return "Quartier Prioritaire de la ville";
    case "populationDensity":
      return "Zone Rurale";
    case "handicap":
      return "Handicap";
    case "ppsBeneficiary":
      return "PPS";
    case "paiBeneficiary":
      return "PAI";
    case "specificAmenagment":
      return "Aménagement spécifique";
    case "specificAmenagmentType":
      return "Nature de l'aménagement spécifique";
    case "reducedMobilityAccess":
      return "Aménagement pour mobilité réduite";
    case "handicapInSameDepartment":
      return "Besoin d'être affecté(e) dans le département de résidence";
    case "allergies":
      return "Allergies ou intolérances alimentaires";
    case "highSkilledActivity":
      return "Activité de haut-niveau";
    case "highSkilledActivityType":
      return "Nature de l'activité de haut-niveau";
    case "highSkilledActivityInSameDepartment":
      return "Activités de haut niveau nécessitant d'être affecté dans le département de résidence";
    case "highSkilledActivityProofFiles":
      return "Document activité de haut-niveau";
    case "medicosocialStructure":
      return "Structure médico-sociale";
    case "medicosocialStructureName":
      return "Nom de la structure médico-sociale";
    case "medicosocialStructureAddress":
      return "Adresse de la structure médico-sociale";
    case "medicosocialStructureZip":
      return "Code postal de la structure médico-sociale";
    case "medicosocialStructureCity":
      return "Ville de la structure médico-sociale";
    case "parent1Status":
      return "Statut du représentant légal 1";
    case "parent1FirstName":
      return "Prénom du représentant légal 1";
    case "parent1LastName":
      return "Nom du représentant légal 1";
    case "parent1Email":
      return "Email du représentant légal 1";
    case "parent1Phone":
      return "Téléphone du représentant légal 1";
    case "parent1Address":
      return "Adresse du représentant légal 1";
    case "parent1Zip":
      return "Code postal du représentant légal 1";
    case "parent1City":
      return "Ville du représentant légal 1";
    case "parent1Department":
      return "Département du représentant légal 1";
    case "parent1Region":
      return "Région du représentant légal 1";
    case "parent2Status":
      return "Statut du représentant légal 2";
    case "parent2FirstName":
      return "Prénom du représentant légal 2";
    case "parent2LastName":
      return "Nom du représentant légal 2";
    case "parent2Email":
      return "Email du représentant légal 2";
    case "parent2Phone":
      return "Téléphone du représentant légal 2";
    case "parent2Address":
      return "Adresse du représentant légal 2";
    case "parent2Zip":
      return "Code postal du représentant légal 2";
    case "parent2City":
      return "Ville du représentant légal 2";
    case "parent2Department":
      return "Département du représentant légal 2";
    case "parent2Region":
      return "Région du représentant légal 2";
    case "cniExpirationDate":
      return "Date d'expiration de la CNI";
    case "cniFile":
      return "Pièce d'identité";
    case "latestCNIFileExpirationDate":
      return "Date d'expiration de la pièce d'identité";
    case "latestCNIFileCategory":
      return "Type de pièce d'identité";

    default:
      return field;
  }
};

const translateCorrectionReason = (reason) => {
  switch (reason) {
    case "UNREADABLE":
      return "Pièce illisible";
    case "MISSING_FRONT":
      return "Recto à fournir";
    case "MISSING_BACK":
      return "Verso à fournir";
    case "NOT_SUITABLE":
      return "Pièce ne convenant pas...";
    case "OTHER":
      return "Autre";
    default:
      return reason;
  }
};

const translateApplicationFileType = (type) => {
  switch (type) {
    case "contractAvenantFiles":
      return "Avenant au contrat d'engagement";
    case "justificatifsFiles":
      return "Document justificatif";
    case "feedBackExperienceFiles":
      return "Retour d'expérience";
    case "othersFiles":
      return "Autre";
    default:
      return type;
  }
};

const translateAction = (action) => {
  switch (action) {
    case "add":
      return "Ajout";
    case "replace":
      return "Modification";
    case "remove":
      return "Suppression";
    default:
      return action;
  }
};

const translateTypologieCenter = (typology) => {
  switch (typology) {
    case "PUBLIC_ETAT":
      return "Public / État";
    case "PUBLIC_COLLECTIVITE":
      return "Public / Collectivité territoriale";
    case "PRIVE_ASSOCIATION":
      return "Privé / Association ou fondation";
    case "PRIVE_AUTRE":
      return "Privé / Autre";
    default:
      return typology;
  }
};

const translateDomainCenter = (domain) => {
  switch (domain) {
    case "ETABLISSEMENT":
      return "Etablissement d’enseignement";
    case "VACANCES":
      return "Centre de vacances";
    case "FORMATION":
      return "Centre de formation";
    case "AUTRE":
      return "Autres";
    default:
      return domain;
  }
};

const translateMission = (mission) => {
  switch (mission) {
    case "FULL":
      return "Toutes les places occupées";
    case "EMPTY":
      return "Aucune place occupée";
    case "ONE_OR_MORE":
      return "Au moins une place occupée";
    default:
      return mission;
  }
};

const translateCniExpired = (cniExpired) => {
  switch (cniExpired) {
    case "true":
      return "En attente";
    default:
      return "Validée";
  }
};

const translateEtbalissementSector = (sector) => {
  switch (sector) {
    case "pro":
      return "Professionnel";
    case "gen":
      return "Général";
    default:
      return sector;
  }
};

const translateColoration = (coloration) => {
  switch (coloration) {
    case "SPORT":
      return "Sport";
    case "ENVIRONMENT":
      return "Environnement";
    case "DEFENSE":
      return "Défense";
    case "RESILIENCE":
      return "Résilience";
    default:
      return coloration;
  }
};

const translateYoungSource = (source) => {
  switch (source) {
    case "CLE":
      return "CLE";
    case "VOLONTAIRE":
      return "Volontaire";

    default:
      return source;
  }
};

const translateStatusClasse = (status) => {
  switch (status) {
    case "WITHDRAWN":
      return "Classe Désistée";
    case "CREATED":
      return "Classe Créée";
    case "VERIFIED":
      return "Classe Vérifiée";
    case "ASSIGNED":
      return "Cohorte attribuée";
    case "OPEN":
      return "Inscription Ouverte";
    case "CLOSED":
      return "Inscription Fermée";
    default:
      return status;
  }
};

// --------------------------------------------------------------
// Utilisé pour traduire l'historique des plans de transport

const globalFields = {
  createdAt: "Date de création",
  updatedAt: "Date de modification",
};

const busPatchFields = {
  cohort: "Cohorte de la ligne de bus",
  busId: "Numero de bus",
  departuredDate: "Date de départ",
  returnDate: "Date de retour",
  youngCapacity: "Capacité de jeunes",
  totalCapacity: "Capacité totale",
  followerCapacity: "Capacité d'accompagnateurs",
  youngSeatsTaken: "Nombre de jeunes",
  travelTime: "Temps de route",
  lunchBreak: "Pause déjeuner aller",
  lunchBreakReturn: "Pause déjeuner retour",
  sessionId: "Session",
  centerId: "Centre de destination",
  centerArrivalTime: "Heure d'arrivée au centre",
  centerDepartureTime: "Heure de départ du centre",
  meetingPointsIds: "Points de rassemblement",
  km: "Distance",
};

const lineToPointFields = {
  lineId: "Id de la ligne de bus",
  meetingPointId: "Point de rassemblement",
  busArrivalHour: "Heure d'arrivée du bus",
  departureHour: "Heure de départ",
  meetingHour: "Heure de convocation",
  returnHour: "Heure de retour",
  transportType: "Type de transport",
  stepPoints: "Point d'étape",
};

const busModificationFields = {
  cohort: "Cohorte de la ligne de bus",
  lineId: "Id de la ligne de bus",
  lineName: "Nom de la ligne de bus",
  requestMessage: "Message de la demande de modification",
  requestUserId: "Utilisateur ayant fait la demande",
  requestUserName: "Nom de l'utilisateur ayant fait la demande",
  requestUserRole: "Rôle de l'utilisateur ayant fait la demande",
  tagIds: "Tags de la demande",
  status: "Statut de la demande",
  statusUserId: "Id de l'utilisateur ayant changé le statut de la demande",
  statusUserName: "Nom de l'utilisateur ayant changé le statut de la demande",
  statusDate: "Date du changement de statut de la demande",
  opinion: "Avis sur la demande",
  opinionUserId: "Id de l'utilisateur ayant donné son avis sur la demande",
  opinionUserName: "Nom de l'utilisateur ayant donné son avis sur la demande",
  opinionDate: "Date de l'avis sur la demande",
  messages: "Conversation sur la demande",
};

const allBusPatchesFields = { ...globalFields, ...busPatchFields, ...lineToPointFields, ...busModificationFields };

function translateBusPatchesField(path) {
  // const translationKey = Object.keys(allBusPatchesFields).find((key) => path.includes(key));
  // return translationKey ? allBusPatchesFields[translationKey] : path;
  return allBusPatchesFields[path] ? allBusPatchesFields[path] : path;
}

export {
  translate,
  translateState,
  translateSessionStatus,
  translatePhase1,
  translateContractStatus,
  translatePhase2,
  translateApplication,
  translateApplicationForYoungs,
  translateEngagement,
  translateFileStatusPhase1,
  translateStatusMilitaryPreparationFiles,
  translateEquivalenceStatus,
  translateAddFilePhase2,
  translateAddFilesPhase2,
  translateAddFilePhase2WithoutPreposition,
  translateVisibilty,
  translateFilter,
  translateSource,
  translateGrade,
  translateField,
  translateCorrectionReason,
  translateApplicationFileType,
  translateAction,
  translateTypologieCenter,
  translateDomainCenter,
  translateMission,
  translateBusPatchesField,
  translateInscriptionStatus,
  translateCniExpired,
  translateEtbalissementSector,
  translateColoration,
  translateYoungSource,
  translateStatusClasse,
};
export default {
  translate,
  translateState,
  translateSessionStatus,
  translatePhase1,
  translateContractStatus,
  translatePhase2,
  translateApplication,
  translateApplicationForYoungs,
  translateEngagement,
  translateFileStatusPhase1,
  translateStatusMilitaryPreparationFiles,
  translateEquivalenceStatus,
  translateAddFilePhase2,
  translateAddFilesPhase2,
  translateAddFilePhase2WithoutPreposition,
  translateVisibilty,
  translateFilter,
  translateSource,
  translateGrade,
  translateField,
  translateCorrectionReason,
  translateApplicationFileType,
  translateAction,
  translateTypologieCenter,
  translateDomainCenter,
  translateMission,
  translateBusPatchesField,
  translateInscriptionStatus,
  translateCniExpired,
  translateEtbalissementSector,
  translateColoration,
  translateYoungSource,
  translateStatusClasse,
};
