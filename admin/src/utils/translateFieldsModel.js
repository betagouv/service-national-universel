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
    case "frenchNationality":
      return "Nationalité française";
    case "phone":
      return "Téléphone";
    case "gender":
      return "genre";
    case "birthdateAt":
      return "Date de naissance";
    case "cohort":
      return "Cohorte";
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
      return "Étape d'inscription";
    case "cohesion2020Step":
      return "Étape d'inscription (2020)";
    case "historic":
      return "Historique";
    case "cohesionStayPresence":
      return "Présence séjour de cohésion";
    case "cohesionStayMedicalFileReceived":
      return "Fiche sanitaire";
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
    case "address":
      return "Adresse";
    case "zip":
      return "Code postal";
    case "city":
      return "Ville";
    case "cityCode":
      return "Code ville";
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
      return "créé(e) le";
    case "updatedAt":
      return "mis(e) à jour le";
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
    case "reacmote":
      return " à distance";
    case "isMilitaryPreparation":
      return "Préparation militaire";
    case "createdAt":
      return "créé(e) le";
    case "updatedAt":
      return "mis(e) à jour le";
    default:
      return f;
  }
};

export const translateModelFields = (model, field) => {
  if (model === "structure") return translateFieldStructure(field);
  if (model === "young") return translateFieldYoung(field);
  if (model === "referent") return translateFieldReferent(field);
  if (model === "mission") return translateFieldMission(field);
  return field;
};

export const translateOperationName = (op) => {
  if (op === "replace") return "Remplacer";
  if (op === "add") return "Ajouter";
  if (op === "remove") return "Supprimer";
  if (op === "update") return "Mettre à jour";
  return op;
};
