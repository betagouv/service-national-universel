import { ROLES, applicationExportFields, formatDateFRTimezoneUTC, formatLongDateUTC, translate } from "snu-lib";
import { User } from "@/types";

export async function transform(data: any[], selectedFields: any) {
  const optionsType = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];

  const all = data;

  return all.map((data) => {
    if (!data.young) data.young = {};
    if (!data.young.domains) data.young.domains = [];
    if (!data.young.periodRanking) data.young.periodRanking = [];
    if (!data.mission) data.mission = {};
    if (!data.tutor) data.tutor = {};
    if (!data.structure) data.structure = {};
    if (!data.structure.types) data.structure.types = [];

    const allFields = {
      application: {
        "Statut de la candidature": translate(data.status),
        "Choix - Ordre de la candidature": data.priority,
        "Candidature créée le": formatLongDateUTC(data.createdAt),
        "Candidature mise à jour le": formatLongDateUTC(data.updatedAt),
        "Statut du contrat d'engagement": translate(data.contractStatus),
        "Pièces jointes à l’engagement": translate(`${optionsType.reduce((sum, option) => sum + data[option]?.length, 0) !== 0}`),
        "Statut du dossier d'éligibilité PM": translate(data.young.statusMilitaryPreparationFiles),
      },
      missionInfo: {
        "ID de la mission": data.missionId,
        "Titre de la mission": data.mission.name,
        "Date du début": formatDateFRTimezoneUTC(data.mission.startAt),
        "Date de fin": formatDateFRTimezoneUTC(data.mission.endAt),
        "Domaine principal de la mission": translate(data.mission.mainDomain) || "Non renseigné",
        "Préparation militaire": translate(data.mission.isMilitaryPreparation),
      },
      missionTutor: {
        "Nom du tuteur": data.tutor?.lastName,
        "Prénom du tuteur": data.tutor?.firstName,
        "Email du tuteur": data.tutor?.email,
        "Portable du tuteur": data.tutor?.mobile,
        "Téléphone du tuteur": data.tutor?.phone,
      },
      missionLocation: {
        Adresse: data.mission.address,
        "Code postal": data.mission.zip,
        Ville: data.mission.city,
        Département: data.mission.department,
        Région: data.mission.region,
      },
      structureInfo: {
        "Id de la structure": data.structureId,
        "Nom de la structure": data.structure.name,
        "Statut juridique de la structure": data.structure.legalStatus,
        "Type(s) de structure": data.structure.types.toString(),
        "Sous-type de structure": data.structure.sousType,
        "Présentation de la structure": data.structure.description,
      },
      structureLocation: {
        "Adresse de la structure": data.structure.address,
        "Code postal de la structure": data.structure.zip,
        "Ville de la structure": data.structure.city,
        "Département de la structure": data.structure.department,
        "Région de la structure": data.structure.region,
      },
      status: {
        "Statut général": translate(data.young.status),
        "Statut phase 2": translate(data.young.statusPhase2),
        "Statut de la candidature": translate(data.status),
        "Motif du refus": data.statusComment,
      },
      // pas pour structures :
      choices: {
        "Domaine de MIG 1": data.young.domains[0],
        "Domaine de MIG 2": data.young.domains[1],
        "Domaine de MIG 3": data.young.domains[2],
        "Projet professionnel": translate(data.young.professionnalProject),
        "Information supplémentaire sur le projet professionnel": data.professionnalProjectPrecision,
        "Période privilégiée pour réaliser des missions": data.period,
        "Choix 1 période": translate(data.young.periodRanking[0]),
        "Choix 2 période": translate(data.young.periodRanking[1]),
        "Choix 3 période": translate(data.young.periodRanking[2]),
        "Choix 4 période": translate(data.young.periodRanking[3]),
        "Choix 5 période": translate(data.young.periodRanking[4]),
        "Mobilité aux alentours de son établissement": translate(data.young.mobilityNearSchool),
        "Mobilité aux alentours de son domicile": translate(data.young.mobilityNearHome),
        "Mobilité aux alentours d'un de ses proches": translate(data.young.mobilityNearRelative),
        "Adresse du proche": data.young.mobilityNearRelativeAddress,
        "Mode de transport": data.young.mobilityTransport?.map((t) => translate(t)).join(", "),
        "Format de mission": translate(data.young.missionFormat),
        "Engagement dans une structure en dehors du SNU": translate(data.young.engaged),
        "Description engagement ": data.young.youngengagedDescription,
        "Souhait MIG": data.young.youngdesiredLocation,
      },
      representative1: {
        "Statut représentant légal 1": translate(data.young.parent1Status),
        "Prénom représentant légal 1": data.young.parent1FirstName,
        "Nom représentant légal 1": data.young.parent1LastName,
        "Email représentant légal 1": data.young.parent1Email,
        "Téléphone représentant légal 1": data.young.parent1Phone,
        "Adresse représentant légal 1": data.young.parent1Address,
        "Code postal représentant légal 1": data.young.parent1Zip,
        "Ville représentant légal 1": data.young.parent1City,
        "Département représentant légal 1": data.young.parent1Department,
        "Région représentant légal 1": data.young.parent1Region,
      },
      representative2: {
        "Statut représentant légal 2": translate(data.young.parent2Status),
        "Prénom représentant légal 2": data.young.parent2FirstName,
        "Nom représentant légal 2": data.young.parent2LastName,
        "Email représentant légal 2": data.young.parent2Email,
        "Téléphone représentant légal 2": data.young.parent2Phone,
        "Adresse représentant légal 2": data.young.parent2Address,
        "Code postal représentant légal 2": data.young.parent2Zip,
        "Ville représentant légal 2": data.young.parent2City,
        "Département représentant légal 2": data.young.parent2Department,
        "Région représentant légal 2": data.young.parent2Region,
      },
    };
    const fields = { ID: data._id };
    for (const element of selectedFields) {
      let key;
      for (key in allFields[element]) fields[key] = allFields[element][key];
    }
    return fields;
  });
}

export function getExportFields(user: User) {
  if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) {
    return applicationExportFields.filter((e) => !["choices", "identity", "contact", "address", "location"].includes(e.id));
  } else return applicationExportFields.filter((e) => !["identity", "contact", "address", "location"].includes(e.id));
}
