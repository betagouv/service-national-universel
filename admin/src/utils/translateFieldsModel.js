const translateFieldStructure = (f) => {
  switch (f) {
    case "name":
      return "Nom";
    case "website":
      return "Site web";
    case "status":
      return "Statut";
    case "isNetwork":
      return "Est une tête de réseau";
    case "networkId":
      return "id tête de réseau";
    case "networkName":
      return "Nom tête de réseau";
    case "legalStatus":
      return "Statut juridique";
    case "associationTypes":
      return "Agréments";
    case "structurePubliqueType":
      return "Type de structure publique";
    case "structurePubliqueEtatType":
      return "Type de service de l'état";
    case "structurePriveeType":
      return "Type de structure privée";
    case "address":
      return "Adresse";
    case "zip":
      return "Code postal";
    case "city":
      return "Ville";
    case "department":
      return "Département";
    case "region":
      return "Région";
    case "country":
      return "Pays";
    case "location":
      return "Coordonnées";
    case "isMilitaryPreparation":
      return "Est une préparation militaire ";
    case "createdAt":
      return "créée le";
    case "updatedAt":
      return "mise à jour le";
    case "jvaStructureId":
      return "Id de la structure JVA";
    case "isJvaStructure":
      return "Structure JVA";
    case "structureManager":
      return "Représentant de la structure";
    case "structureManager/email":
      return "Email du représentant de la structure";
    case "structureManager/firstName":
      return "Prénom du représentant de la structure";
    case "structureManager/lastName":
      return "Nom du représentant de la structure";
    case "structureManager/mobile":
      return "Téléphone du représentant de la structure";
    case "structureManager/role":
      return "Rôle du représentant de la structure";
    default:
      return f;
  }
};
const translateFieldYoung = (f) => {
  switch (f) {
    case "firstName":
      return "Prénom";
    case "lastName":
      return "Nom";
    case "email":
      return "Email";
    case "frenchNationality":
      return "Nationalité française";
    case "phone":
      return "Téléphone";
    case "gender":
      return "Genre";
    case "birthdateAt":
      return "Date de naissance";
    case "cohort":
      return "Cohorte";
    case "originalCohort":
      return "Cohorte d'origine";
    case "cohortChangeReason":
      return "Motif de changement de cohorte";
    case "cohortDetailedChangeReason":
      return "Précision du motif de changement de cohorte";
    case "phase":
      return "Phase";
    case "status":
      return "Statut";
    case "statusPhase1":
      return "Statut phase 1";
    case "statusPhase2":
      return "Statut phase 2";
    case "statusPhase3":
      return "Statut phase 3";
    case "lastStatusAt":
      return "Dernier statut le";
    case "withdrawnMessage":
      return "Message de désistement";
    case "inscriptionStep":
    case "inscriptionStep2023":
      return "Étape d'inscription";
    case "cohesion2020Step":
      return "Étape d'inscription (2020)";
    case "historic":
      return "Historique";
    case "cohesionStayPresence":
      return "Présence au séjour de cohésion";
    case "cohesionStayMedicalFileReceived":
      return "Fiche sanitaire";
    case "cohesionStayMedicalFileDownload":
      return "Téléchargement de la fiche sanitaire";
    case "cohesionCenterId":
      return "Id centre de cohésion";
    case "cohesionCenterName":
      return "Nom centre de cohésion";
    case "cohesionCenterZip":
      return "Code postal centre de cohésion";
    case "cohesionCenterCity":
      return "Ville centre de cohésion";
    case "phase3StructureName":
      return "Nom de la structure phase 3";
    case "phase3MissionDomain":
      return "Domaine de la mission phase 3";
    case "phase3MissionDescription":
      return "Description de la mission phase 3";
    case "phase3MissionStartAt":
      return "Mission phase 3 début";
    case "phase3MissionEndAt":
      return "Mission phase 3 fin";
    case "phase3TutorFirstName":
      return "Prénom tuteur phase 3";
    case "phase3TutorLastName":
      return "Nom tuteur phase 3";
    case "phase3TutorEmail":
      return "Email tuteur phase 3";
    case "phase3TutorPhone":
      return "Téléphone tuteur phase 3";
    case "phase3TutorNote":
      return "Note tuteur phase 3";
    case "addressVerified":
      return "Adresse vérifiée";
    case "address":
      return "Adresse";
    case "complementAddress":
      return "Complément d'adresse";
    case "zip":
      return "Code postal";
    case "city":
      return "Ville";
    case "cityCode":
      return "Code ville";
    case "country":
      return "Pays";
    case "foreignCountry":
      return "Pays étranger";
    case "populationDensity":
      return "Densité de population";
    case "department":
      return "Département";
    case "region":
      return "Région";
    case "academy":
      return "Académie";
    case "location":
      return "Coordonnées";
    case "grade":
      return "Niveau scolaire";
    case "schooled":
      return "Scolarisé";
    case "schoolName":
      return "Nom de l'établissement";
    case "schoolType":
      return "Type d'établissement";
    case "schoolAddress":
      return "Adresse de l'établissement";
    case "schoolComplementAdresse":
      return "Complément d'adresse de l'établissement";
    case "schoolZip":
      return "Code postal de l'établissement";
    case "schoolCity":
      return "Ville de l'établissement";
    case "schoolDepartment":
      return "Département de l'établissement";
    case "schoolRegion":
      return "Région de l'établissement";
    case "schoolLocation":
      return "Coordonnées de l'établissement";
    case "schoolId":
      return "Identifiant de l'établissement";
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
    case "parent1OwnAddress":
      return "Représentant légal 1 a une adresse différente";
    case "parent1Address":
      return "Adresse du représentant légal 1";
    case "parent1ComplementAddress":
      return "Complément adresse du représentant légal 1";
    case "parent1Zip":
      return "Code postal du représentant légal 1";
    case "parent1City":
      return "Ville du représentant légal 1";
    case "parent1Department":
      return "Département du représentant légal 1";
    case "parent1Region":
      return "Région du représentant légal 1";
    case "parent1Location":
      return "Coordonnées du représentant légal 1";
    case "parent1FromFranceConnect":
      return "France connect du représentant légal 1";
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
    case "parent2OwnAddress":
      return "Représentant légal 2 a une adresse différente";
    case "parent2Address":
      return "Adresse du représentant légal 2";
    case "parent2ComplementAddress":
      return "Complément adresse du représentant légal 2";
    case "parent2Zip":
      return "Code postal du représentant légal 2";
    case "parent2City":
      return "Ville du représentant légal 2";
    case "parent2Department":
      return "Département du représentant légal 2";
    case "parent2Region":
      return "Région du représentant légal 2";
    case "parent2Location":
      return "Coordonnées du représentant légal 2";
    case "parent2FromFranceConnect":
      return "France connect du représentant légal 2";
    case "ppsBeneficiary":
      return "PPS";
    case "paiBeneficiary":
      return "PAI";
    case "medicosocialStructure":
      return "structure médicosociale";
    case "medicosocialStructureName":
      return "Nom structure médicosociale";
    case "medicosocialStructureAddress":
      return "Adresse structure médicosociale";
    case "medicosocialStructureComplementAddress":
      return "Complément adresse structure médicosociale";
    case "medicosocialStructureZip":
      return "Code postal structure médicosociale";
    case "medicosocialStructureCity":
      return "Ville structure médicosociale";
    case "medicosocialStructureDepartment":
      return "Département structure médicosociale";
    case "medicosocialStructureRegion":
      return "Région structure médicosociale";
    case "medicosocialStructureLocation":
      return "Coordonnées structure médicosociale";
    case "engagedStructure":
      return "Engagé";
    case "specificAmenagment":
      return "Aménagement spécifique";
    case "specificAmenagmentType":
      return "Type aménagement spécifique";
    case "highSkilledActivity":
      return "Activité de haut niveau";
    case "highSkilledActivityType":
      return "Type d'activité de haut niveau";
    case "highSkilledActivityProofFiles":
      return "Fichiers activité de haut niveau";
    case "parentConsentment":
      return "Consentement du représentant légal";
    case "parentConsentmentFiles":
      return "Fichiers consentement du représentant légal";
    case "consentment":
      return "Consentement";
    case "imageRight":
      return "Droit à l'image";
    case "imageRightFiles":
      return "Fichier Droit à l'image";
    case "autoTestPCRFiles":
      return "Fichier autoTestPCR";
    case "domains":
      return "Domaines";
    case "professionnalProject":
      return "Projet pro";
    case "professionnalProjectPrecision":
      return "Projet pro précision";
    case "period":
      return "Période";
    case "periodRanking":
      return "Période classement";
    case "mobilityNearSchool":
      return "A proximité de l'établissement";
    case "mobilityNearHome":
      return "A proximité du domicile";
    case "mobilityNearRelative":
      return "A proximité d'un proche";
    case "mobilityNearRelativeName":
      return "Nom du proche";
    case "mobilityNearRelativeAddress":
      return "Adresse du proche";
    case "mobilityNearRelativeCity":
      return "Ville du proche";
    case "mobilityNearRelativeZip":
      return "Code postal du proche";
    case "mobilityTransport":
      return "Transport";
    case "mobilityTransportOther":
      return "Transport autre";
    case "missionFormat":
      return "Format mission";
    case "engaged":
      return "Engagé";
    case "engagedDescription":
      return "Description engagement";
    case "desiredLocation":
      return "Souhait lieu MIG";
    case "createdAt":
      return "Créé(e) le";
    case "updatedAt":
      return "Mis(e) à jour le";
    case "statusPhase2UpdatedAt":
      return "Statut phase 2 mis(e) à jour le";
    case "phase2NumberHoursEstimated":
      return "Nombre d'heures estimées (phase 2)";
    case "phase2NumberHoursDone":
      return "Nombre d'heures effectuées (phase 2)";
    case "militaryPreparationFilesCertificate":
      return "Certificat d’absence de contre-indication à la pratique sportive";
    case "militaryPreparationFilesAuthorization":
      return "Consentement à la participation à une préparation militaire";
    case "militaryPreparationFilesCensus":
      return "Attestation de recensement";
    case "militaryPreparationFilesIdentity":
      return "Pièce d’identité en cours de validité (CNI recto/verso, passeport) ";
    case "rulesFiles":
      return "Fichiers règlement intérieur";
    case "dataProcessingConsentmentFiles":
      return "Fichier Formulaire de consentement au traitement des données personnelles";
    case "phase2ApplicationStatus":
      return "Statuts de candidatures (phase 2)";
    case "statusMilitaryPreparationFiles":
      return "Statut des fichiers de préparation militaire";
    case "statusPhase2Contract":
      return "Statuts des contrats (phase 2)";
    case "cniFiles":
      return "Fichiers CNI";
    case "birthCityZip":
      return "Code postal de naissance";
    case "birthCity":
      return "Ville de naissance";
    case "birthCountry":
      return "Pays de naissance";
    case "employed":
      return "Employé";
    case "schoolCountry":
      return "Pays établissement";
    case "foreignZip":
      return "Code postal étranger";
    case "foreignCity":
      return "Ville étranger";
    case "foreignAddress":
      return "Adresse étranger";
    case "hostRelationship":
      return "Lien de l'hébergeur avec le volontaire";
    case "hostLastName":
      return "Nom de l'hébergeur";
    case "hostFirstName":
      return "Prénom de l'hébergeur";
    case "hostAddress":
      return "Adresse de l'hébergeur";
    case "hostRegion":
      return "Région de l'hébergeur";
    case "hostDepartment":
      return "Département de l'hébergeur";
    case "hostZip":
      return "Code Postal de l'hébergeur";
    case "hostCity":
      return "Ville de l'hébergeur";
    case "aknowledgmentTerminaleSessionAvailability":
      return "Le volontaire a pris connaissance des règles de disponibilité liées au rattrapage du bac";
    case "informationAccuracy":
      return "Le volontaire certifie l'exactitude des renseignements fournis";
    case "rulesParent1":
      return "Le representant légal 1 a accepté le règlement intérieur";
    case "rulesParent2":
      return "Le representant légal 2 a accepté le règlement intérieur";
    case "rulesYoung":
      return "Le volontaire a accepté le règlement intérieur";
    case "acceptCGU":
      return "Le volontaire a accepté les CGU";
    case "meetingPointId":
      return "Identifiant du point de rassemblement (phase 1)";
    case "deplacementPhase1Autonomous":
      return "Le volontaire se rend par ses propres moyens (phase 1)";
    case "qpv":
      return "QPV";
    case "files/cniFiles/0":
    case "files/cniFiles/1":
    case "files/cniFiles/2":
      return "Pièce d'identité";
    case "latestCNIFileCategory":
      return "Catégorie de la pièce d'identité";
    case "latestCNIFileExpirationDate":
      return "Date d'expiration de la pièce d'identité";
    case "CNIFileNotValidOnStart":
      return "Pièce d'identité invalide au début du séjour";
    case "files":
      return "Documents";
    case "imageRightFilesStatus":
      return "Statut des documents de droit à l'image";
    case "autoTestPCRFilesStatus":
      return "Statut des documents de test PCR";
    case "youngPhase1Agreement":
      return "Confirmation de participation au séjour de cohésion";
    case "parentAllowSNU":
      return "Autorisation du représentant légal pour la phase 1";
    case "parent1AllowSNU":
      return "Autorisation du représentant légal 1 pour la phase 1";
    case "parent2AllowSNU":
      return "Autorisation du représentant légal 2 pour la phase 1";
    case "parent1ValidationDate":
      return "Date de validation du représentant légal 1";
    case "parent2ValidationDate":
      return "Date de validation du représentant légal 2";
    case "parentStatementOfHonorInvalidId":
      return "Déclaration sur l'honneur";
    case "parent1DataVerified":
      return "Vérification des données du représentant légal 1";
    case "parent2DataVerified":
      return "Vérification des données du représentant légal 2";
    case "parent1AllowImageRights":
      return "Autorisation du représentant légal 1 pour les droits à l'image";
    case "parent2AllowImageRights":
      return "Autorisation du représentant légal 2 pour les droits à l'image";
    case "inscriptionDate":
      return "Date de fin d'inscription";
    case "presenceJDM":
      return "Présence à la JDM";
    case "inscriptionDoneDate":
      return "Date de fin d'inscription";
    case "correctionRequests":
      return "Demande de correction";
    case "correctionRequests/status":
      return "Statut de la demande de correction";
    case "isRegionRural":
      return "Région rurale";
    case "reducedMobilityAccess":
      return "Accès pour personnes à mobilité réduite";
    case "handicapInSameDepartment":
      return "Même département (handicap)";
    case "notes":
      return "Notes";
    default:
      return f;
  }
};

const translateFieldReferent = (f) => {
  switch (f) {
    case "firstName":
      return "Prénom";
    case "lastName":
      return "Nom";
    case "phone":
      return "Téléphone";
    case "mobile":
      return "Portable";
    case "structureId":
      return "Id de la structure";
    case "cohesionCenterId":
      return "Id centre de cohésion";
    case "cohesionCenterName":
      return "Nom centre de cohésion";
    case "role":
      return "Rôle";
    case "subRole":
      return "Fonction";
    case "department":
      return "Département";
    case "region":
      return "Région";
    case "createdAt":
      return "créé(e) le";
    case "updatedAt":
      return "mis(e) à jour le";
    case "email":
      return "Email";
    case "cohorts":
      return "Cohortes";
    default:
      return f;
  }
};

const translateFieldMission = (f) => {
  switch (f) {
    case "name":
      return "Nom";
    case "domains":
      return "Domaines";
    case "startAt":
      return "Date début";
    case "endAt":
      return "Date fin";
    case "frequence":
      return "Fréquence";
    case "format":
      return "Format";
    case "period":
      return "Période(s)";
    case "subPeriod":
      return "Période(s) - détails";
    case "placesTotal":
      return "Nombre total de places ";
    case "placesLeft":
      return "Nombre de places disponibles";
    case "structureId":
      return "Id de la structure";
    case "structureName":
      return "Nom de la structure";
    case "tutorId":
      return "Id du tuteur";
    case "tutorName":
      return "Nom du tuteur";
    case "address":
      return "Adresse";
    case "zip":
      return "Code postal";
    case "city":
      return "Ville";
    case "department":
      return "Département";
    case "region":
      return "Région";
    case "country":
      return "Pays";
    case "location":
      return "Coordonnées";
    case "remote":
      return " à distance";
    case "isMilitaryPreparation":
      return "Préparation militaire";
    case "createdAt":
      return "créé(e) le";
    case "updatedAt":
      return "mis(e) à jour le";
    case "jvaMissionId":
      return "Id de la mission JVA";
    case "lastSyncAt":
      return "Dernière synchronisation avec JVA";
    case "isJvaMission":
      return "Mission JVA";
    case "contractAvenantFiles":
      return "Avenant au contrat d’engagement";
    case "justificatifsFiles":
      return "Documents justificatifs";
    case "feedBackExperienceFiles":
      return "Retour d’expérience (rapport de MIG)";
    case "othersFiles":
      return "Autre";
    default:
      return f;
  }
};

const translateFieldContract = (f) => {
  switch (f) {
    case "youngId":
      return "Id du volontaire";
    case "structureId":
      return "Id de la structure";
    case "applicationId":
      return "Id de la candidature";
    case "missionId":
      return "Id de la mission";
    case "tutorId":
      return "Id du responsable";
    case "isYoungAdult":
      return "Volontaire majeur";
    case "parent1Status":
      return "Statut signature représentant légal 1";
    case "parent2Status":
      return "Statut signature représentant légal 2";
    case "projectManagerStatus":
      return "Statut signature représentant de l'Etat";
    case "structureManagerStatus":
      return "Statut signature représentant de la structure";
    case "youngContractStatus":
      return "Statut signature volontaire";
    case "invitationSent":
      return "Contrat envoyé";
    case "youngFirstName":
      return "Prénom du volontaire";
    case "youngLastName":
      return "Nom du volontaire";
    case "youngBirthdate":
      return "Date de naissance du volontaire";
    case "youngAddress":
      return "Adresse du volontaire";
    case "youngCity":
      return "Ville du volontaire";
    case "youngDepartment":
      return "Département du volontaire";
    case "youngEmail":
      return "Email du volontaire";
    case "youngPhone":
      return "Téléphone du volontaire";
    case "parent1FirstName":
      return "Prénom du représentant légal 1";
    case "parent1LastName":
      return "Nom du représentant légal 1";
    case "parent1Address":
      return "Adresse du représentant légal 1";
    case "parent1City":
      return "Ville du représentant légal 1";
    case "parent1Department":
      return "Département du représentant légal 1";
    case "parent1Phone":
      return "Téléphone du représentant légal 1";
    case "parent1Email":
      return "Email du représentant légal 1";
    case "parent2FirstName":
      return "Prénom du représentant légal 2";
    case "parent2LastName":
      return "Nom du représentant légal 2";
    case "parent2Address":
      return "Adresse du représentant légal 2";
    case "parent2City":
      return "Ville du représentant légal 2";
    case "parent2Department":
      return "Département du représentant légal 2";
    case "parent2Phone":
      return "Téléphone du représentant légal 2";
    case "parent2Email":
      return "Email du représentant légal 2";
    case "missionName":
      return "Nom de la mission";
    case "missionObjective":
      return "Objectif de la mission";
    case "missionAction":
      return "Action de la mission";
    case "missionStartAt":
      return "Date de début de la mission";
    case "missionEndAt":
      return "Date de fin de la mission";
    case "missionAddress":
      return "Adresse de la mission";
    case "missionCity":
      return "Ville de la mission";
    case "missionZip":
      return "Code postal de la mission";
    case "missionDuration":
      return "Durée de la mission";
    case "missionFrequence":
      return "Fréquence de la mission";
    case "date":
      return "Date";
    case "projectManagerFirstName":
      return "Prénom du représentant de l'Etat";
    case "projectManagerLastName":
      return "Nom du représentant de l'Etat";
    case "projectManagerRole":
      return "Rôle du représentant de l'Etat";
    case "projectManagerEmail":
      return "Email du représentant de l'Etat";
    case "structureManagerFirstName":
      return "Prénom du représentant de la structure";
    case "structureManagerLastName":
      return "Nom du représentant de la structure";
    case "structureManagerRole":
      return "Rôle du représentant de la structure";
    case "structureManagerEmail":
      return "Email du représentant de la structure";
    case "structureSiret":
      return "Numéro SIRET de la structure";
    case "structureName":
      return "Nom de la structure";
    case "createdAt":
      return "créé(e) le";
    case "updatedAt":
      return "mis(e) à jour le";
    case "parent1ValidationDate":
      return "Date de validation du représentant légal 1";
    case "projectManagerValidationDate":
      return "Date de validation du représentant de l'Etat";
    case "structureManagerValidationDate":
      return "Date de validation du représentant de la structure";
    case "parent2ValidationDate":
      return "Date de validation du représentant légal 2";
    case "youngContractValidationDate":
      return "Date de validation du volontaire";

    default:
      return f;
  }
};

export const translateModelFields = (model, field) => {
  if (model === "structure") return translateFieldStructure(field);
  if (model === "young") return translateFieldYoung(field);
  if (model === "referent") return translateFieldReferent(field);
  if (model === "mission") return translateFieldMission(field);
  if (model === "contract") return translateFieldContract(field);
  return field;
};

export const translateOperationName = (op) => {
  if (op === "replace") return "Remplacer";
  if (op === "add") return "Ajouter";
  if (op === "remove") return "Supprimer";
  if (op === "update") return "Mettre à jour";
  return op;
};
