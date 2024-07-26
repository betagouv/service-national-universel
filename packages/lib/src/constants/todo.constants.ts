const DASHBOARD_TODOS_FUNCTIONS = {
  INSCRIPTION: {
    BASIC: "basic",
    WAITING_VALIDATION: "waiting_validation",
    // Dossier. X dossiers d’inscription en attente de validation pour le séjour de [Février 2023 C] (A instruire)
    // inscription_en_attente_de_validation_cohorte
    WAITING_VALIDATION_BY_COHORT: "waiting_validation_by_cohort",
    // Dossier (À instruire) X dossiers d’inscription corrigés sont à instruire de nouveau.
    // inscription_corrigé_à_instruire_de_nouveau
    WAITING_VALIDATION_CORRECTION: "waiting_validation_correction",
    // Dossier (À relancer) X dossiers d’inscription en attente de correction
    // inscription_en_attente_de_correction
    WAITING_CORRECTION: "waiting_correction",
    // Droit à l’image (À relancer) X volontaires sans accord renseigné
    // inscription_sans_accord_renseigné
    IMAGE_RIGHT: "image_right",
  },
  SEJOUR: {
    DOCS: "docs",
    // Point de rassemblement (À suivre) X volontaires n’ont pas confirmé leur point de rassemblement
    // sejour_rassemblement_non_confirmé
    MEETING_POINT_NOT_CONFIRMED: "meeting_point_not_confirmed",
    // Participation (À suivre) X volontaires n’ont pas confirmé leur participation au séjour de [Février 2023-C]
    // sejour_participation_non_confirmée
    PARTICIPATION_NOT_CONFIRMED: "participation_not_confirmed",
    // Point de rassemblement (À déclarer) Au moins 1 point de rassemblement est à déclarer pour le séjour de [Février 2023-C].
    // sejour_point_de_rassemblement_à_déclarer
    MEETING_POINT_TO_DECLARE: "meeting_point_to_declare",
    // Centre (À déclarer) Au moins 1 centre est en attente de déclaration pour le séjour de [Février 2023-C].
    // sejour_centre_à_déclarer
    CENTER_TO_DECLARE: "center_to_declare",
    // Emploi du temps (À relancer) X emplois du temps n’ont pas été déposés pour le séjour de [Février 2023 -C].
    // sejour_emploi_du_temps_non_déposé
    SCHEDULE_NOT_UPLOADED: "schedule_not_uploaded",
    // Projet pédagogique (À relancer) X projets pédagogiques n’ont pas été déposés pour le séjour de [Février 2023 -C].
    PROJECT_NOT_UPLOADED: "project_not_uploaded",
    // Contact (À renseigner) Au moins 1 contact de convocation doit être renseigné pour le séjour de [Février 2023-C].
    // sejour_contact_à_renseigner
    CONTACT_TO_FILL: "contact_to_fill",
    // Cas particuliers (À contacter) X volontaires à contacter pour préparer leur accueil pour le séjour de [Février 2023 - C]
    // sejour_volontaires_à_contacter
    YOUNG_TO_CONTACT: "young_to_contact",
    // Chef de centre (A renseigner) X chefs de centre sont à renseigner pour le séjour de [Février 2023 - C]
    // sejour_chef_de_centre
    CENTER_MANAGER_TO_FILL: "center_manager_to_fill",
    // Pointage. X centres n’ont pas pointés tous leurs volontaires à l’arrivée au séjour de [Février 2023-C] (A renseigner)
    // sejour_pointage
    CHECKIN: "checkin",
    //Plan de transport (À traiter) X demandes de modification du plan de transport sont à traiter pour le séjour de [Février 2023-C].
    MODIFICATION_REQUEST: "modification_request",
  },
  ENGAGEMENT: {
    BASIC: "basic",
    // Contrat (À suivre) X contrats d’engagement sont à éditer par la structure d’accueil et à envoyer en signature
    // engagement_contrat_à_éditer
    CONTRACT_TO_EDIT: "contract_to_edit",
    // Contrat (À suivre) X contrats d’engagement sont en attente de signature.
    // engagement_contrat_en_attente_de_signature
    CONTRACT_TO_SIGN: "contract_to_sign",
    // Dossier d’éligibilité (À vérifier)  X dossiers d’éligibilité en préparation militaire sont en attente de vérification.
    // engagement_dossier_militaire_en_attente_de_validation
    MILITARY_FILE_TO_VALIDATE: "military_file_to_validate",
    // Mission (À instruire) X missions sont en attente de validation
    // engagement_mission_en_attente_de_validation
    MISSION_TO_VALIDATE: "mission_to_validate",
    // Phase 3 (À suivre) X demandes de validation de phase 3 à suivre
    // engagement_phase3_en_attente_de_validation
    PHASE3_TO_VALIDATE: "phase3_to_validate",
    // Volontaires (À suivre) X volontaires ayant commencé leur mission sans contrat signé
    // volontaires_à_suivre_sans_contrat
    YOUNG_TO_FOLLOW_WITHOUT_CONTRACT: "young_to_follow_without_contract",
    // Volontaires (À suivre) X volontaires ayant commencé leur mission sans statut à jour
    // volontaires_à_suivre_sans_statut
    YOUNG_TO_FOLLOW_WITHOUT_STATUS: "young_to_follow_without_status",
    // Volontaires (À suivre) X volontaires ayant achevé leur mission sans statut à jour
    // volontaires_à_suivre_achevé_sans_statut
    YOUNG_TO_FOLLOW_WITHOUT_STATUS_AFTER_END: "young_to_follow_without_status_after_end",
    // Volontaires (À suivre) X volontaires ayant commencé leur mission sans contrat signé
    YOUNG_TO_FOLLOW_WITHOUT_CONTRACT_AFTER_START: "young_to_follow_without_contract_after_start",
    // Volontaires (À actualiser) X volontaires ayant achevé leur mission à mettre à jour
    YOUNG_TO_UPDATE_AFTER_END: "young_to_update_after_end",
    // Volontaires (À actualiser) X volontaires ayant commencé leur mission à mettre à jour
    YOUNG_TO_UPDATE_AFTER_START: "young_to_update_after_start",
    // Équivalence (À vérifier) X demandes d’équivalence MIG sont en attente de vérification.
    EQUIVALENCE_WAITING_VERIFICATION: "equivalence_waiting_verification",
    //Contrat (À renseigner) 1 représentant de l’État est à renseigner.
    STRUCTURE_MANAGER: "structure_manager",
    //For resp and supervisor
    // Contrat (À suivre) X contrats d’engagement sont à éditer par la structure d’accueil et à envoyer en signature
    STRUCTURE_CONTRACT_TO_EDIT: "structure_contract_to_edit",
    //Missions (À corriger) X missions sont en attente de correction.
    STRUCTURE_MISSION_TO_CORRECT: "structure_mission_to_correct",
    //Candidatures (À traiter) X candidatures sont en attente de validation.
    STRUCTURE_APPLICATION_TO_VALIDATE: "structure_application_to_validate",
  },
};

export { DASHBOARD_TODOS_FUNCTIONS };
