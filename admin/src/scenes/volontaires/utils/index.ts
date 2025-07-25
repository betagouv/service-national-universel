import {
  ROLES,
  departmentLookUp,
  formatDateFR,
  formatDateFRTimezoneUTC,
  formatLongDateFR,
  getDepartmentNumber,
  getLabelWithdrawnReason,
  isInRuralArea,
  translate,
  translateApplication,
  translateApplicationFileType,
  translateCniExpired,
  translateEngagement,
  translateEquivalenceStatus,
  translateFileStatusPhase1,
  translateInscriptionStatus,
  translatePhase1,
  translatePhase2,
  translateYoungSource,
  translateStatusMilitaryPreparationFiles,
  canAssignManually,
  UserDto,
  MeetingPointType,
  CohesionCenterType,
  LigneToPointType,
  ClasseType,
  EtablissementType,
  LigneBusType,
  YoungType,
  CohortDto,
} from "snu-lib";
import { orderCohort } from "../../../components/filters-system-v2/components/filters/utils";
import { formatPhoneE164 } from "../../../utils/formatPhoneE164";
import { youngCheckinField } from "@/utils";
import { Filter } from "@/components/filters-system-v2/components/Filters";

interface AllFields {
  [key: string]: { [key: string]: string | undefined };
}

export const getFilterArray = (
  user: UserDto,
  labels: {
    [key: string]: string;
  },
): Filter[] => {
  return [
    { title: "Cohorte", name: "cohort", parentGroup: "Général", missingLabel: "Non renseigné", sort: (e) => orderCohort(e) },
    { title: "Cohorte d'origine", name: "originalCohort", parentGroup: "Général", missingLabel: "Non renseigné", sort: orderCohort },
    { title: "Statut", name: "status", parentGroup: "Général", missingLabel: "Non renseigné", translate: translateInscriptionStatus, defaultValue: ["VALIDATED"] },
    { title: "Source", name: "source", parentGroup: "Général", missingLabel: "Non renseigné", translate: translateYoungSource },
    { title: "Pays de résidence", name: "country", parentGroup: "Général", missingLabel: "Non renseigné", translate: translate },
    { title: "Académie", name: "academy", parentGroup: "Général", missingLabel: "Non renseigné", translate: translate },
    {
      title: "Région",
      name: "region",
      parentGroup: "Général",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Département",
      name: "department",
      parentGroup: "Général",
      missingLabel: "Non renseigné",
      translate: (e: string) => getDepartmentNumber(e) + " - " + e,
    },
    {
      title: "Note interne",
      name: "hasNotes",
      parentGroup: "Général",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Classe",
      name: "grade",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Sexe",
      name: "gender",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Nationalité française",
      name: "frenchNationality",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    user.role === ROLES.REFERENT_DEPARTMENT
      ? {
          title: "Etablissement",
          name: "schoolName",
          parentGroup: "Dossier",
          missingLabel: "Non renseigné",
          translate: translate,
        }
      : null,
    {
      title: "Situation",
      name: "situation",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Bénéficiaire PPS",
      name: "ppsBeneficiary",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Bénéficiaire PAI",
      name: "paiBeneficiary",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Région rurale",
      name: "isRegionRural",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "QPV",
      name: "qpv",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Handicap",
      name: "handicap",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Allergies",
      name: "allergies",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Aménagement spécifique",
      name: "specificAmenagment",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Accès mobilité réduite",
      name: "reducedMobilityAccess",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Droit à l'image",
      name: "imageRight",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Pièce d'identité périmée",
      name: "CNIFileNotValidOnStart",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translateCniExpired,
    },
    {
      title: "PSC1",
      name: "psc1Info",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Statut phase 1",
      name: "statusPhase1",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: translatePhase1,
    },
    {
      title: "Classe Engagée ID",
      name: "classeId",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: (item: string) => {
        if (item === "N/A") return item;
        return labels[item] || "N/A - Supprimé";
      },
    },
    {
      title: "Etablissement CLE",
      name: "etablissementId",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: (item: string) => {
        if (item === "N/A") return item;
        return labels[item] || "N/A - Supprimé";
      },
    },
    {
      title: "Centre",
      name: "sessionPhase1Id",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: (item: string) => {
        if (item === "N/A") return item;
        return labels[item] || "N/A - Supprimé";
      },
    },
    {
      title: "Confirmation PDR",
      name: "hasMeetingInformation",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Affectation dans son département",
      name: "handicapInSameDepartment",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Confirmation de participation",
      name: "youngPhase1Agreement",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Présence à l'arrivée",
      name: "cohesionStayPresence",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Présence à la JDM",
      name: "presenceJDM",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Départ renseigné",
      name: "departInform",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Motif du départ",
      name: "departSejourMotif",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Fiches sanitaires",
      name: "cohesionStayMedicalFileReceived",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Ligne",
      name: "ligneId",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: (item: string) => {
        if (item === "N/A") return item;
        return labels[item] || item;
      },
    },
    {
      title: "Voyage en avion",
      name: "isTravelingByPlane",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Statut phase 2",
      name: "statusPhase2",
      parentGroup: "Phase 2",
      missingLabel: "Non renseigné",
      translate: translatePhase2,
    },
    {
      title: "Statut mission (candidature)",
      name: "phase2ApplicationStatus",
      parentGroup: "Phase 2",
      missingLabel: "Non renseigné",
      translate: translateApplication,
    },
    {
      title: "Statut contrats",
      name: "statusPhase2Contract",
      parentGroup: "Phase 2",
      missingLabel: "Non renseigné",
      translate: translateEngagement,
    },
    {
      title: "Dossier d'éligibilité aux PM",
      name: "statusMilitaryPreparationFiles",
      parentGroup: "Phase 2",
      missingLabel: "Non renseigné",
      translate: translateStatusMilitaryPreparationFiles,
    },
    {
      title: "Pièces jointes",
      name: "phase2ApplicationFilesType",
      parentGroup: "Phase 2",
      missingLabel: "Non renseigné",
      translate: translateApplicationFileType,
    },
    {
      title: "Equivalence de MIG",
      name: "status_equivalence",
      parentGroup: "Phase 2",
      missingLabel: "Non renseigné",
      translate: translateEquivalenceStatus,
    },
    {
      title: "Remboursement Code de la Route",
      name: "roadCodeRefund",
      parentGroup: "Phase 2",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Statut phase 3",
      name: "statusPhase3",
      parentGroup: "Phase 3",
      missingLabel: "Non renseigné",
      translate: translate,
    },
  ].filter(Boolean) as Filter[];
};

// legacy: déplacé dans l'api v2 (useCase ExportJeunes)
export async function transformVolontaires(data: any[], values: string[]): Promise<{ [key: string]: string | undefined }[]> {
  const all = data;

  return all.map((data) => {
    let center = {} as CohesionCenterType;
    if (data.cohesionCenterId && data.sessionPhase1Id) {
      center = data?.center || {};
    }
    let meetingPoint = {} as MeetingPointType;
    let bus = {} as LigneBusType;
    let ligneToPoint = {} as LigneToPointType;
    if (data.meetingPointId && data.ligneId) {
      bus = data?.bus || {};
      ligneToPoint = data?.ligneToPoint || {};
      meetingPoint = data?.meetingPoint || {};
    }
    let classe = {} as ClasseType;
    let etablissement = {} as EtablissementType;
    if (data.classeId) {
      classe = data?.classe || {};
    }
    if (data.etablissementId) {
      etablissement = data?.etablissement || {};
    }

    if (!data.domains) data.domains = [];
    if (!data.periodRanking) data.periodRanking = [];
    const allFields: AllFields = {
      emailDeConnexion: {
        "Email de connexion": data.emailDeConnexion,
      },
      psc1Info: {
        PSC1: translate(data?.psc1Info) || "Non renseigné",
      },
      identity: {
        Prénom: data.firstName,
        Nom: data.lastName,
        Sexe: translate(data.gender),
        Cohorte: data.cohort,
        "Cohorte d'origine": data.originalCohort,
      },
      contact: {
        Email: data.email,
        Téléphone: formatPhoneE164(data.phone, data.phoneZone),
      },
      birth: {
        "Date de naissance": formatDateFRTimezoneUTC(data.birthdateAt),
        "Pays de naissance": data.birthCountry || "France",
        "Ville de naissance": data.birthCity,
        "Code postal de naissance": data.birthCityZip,
        "Date de fin de validité de la pièce d'identité": formatDateFRTimezoneUTC(data?.latestCNIFileExpirationDate),
      },
      address: {
        "Adresse postale": data.address,
        "Code postal": data.zip,
        Ville: data.city,
        Pays: data.country,
        "Nom de l'hébergeur": data.hostLastName,
        "Prénom de l'hébergeur": data.hostFirstName,
        "Lien avec l'hébergeur": data.hostRelationship,
        "Adresse - étranger": data.foreignAddress,
        "Code postal - étranger": data.foreignZip,
        "Ville - étranger": data.foreignCity,
        "Pays - étranger": data.foreignCountry,
      },
      location: {
        Département: data.department,
        Académie: data.academy,
        Région: data.region,
      },
      schoolSituation: {
        Situation: translate(data.situation),
        Niveau: translate(data.grade),
        "Type d'établissement": translate(data.school?.type || data.schoolType),
        "Nom de l'établissement": data.school?.fullName || data.schoolName,
        "Code postal de l'établissement": data.school?.postcode || data.schoolZip,
        "Ville de l'établissement": data.school?.city || data.schoolCity,
        "Département de l'établissement": departmentLookUp[data.school?.department || ""] || data.schoolDepartment,
        "UAI de l'établissement": data.school?.uai,
      },
      situation: {
        "Quartier Prioritaire de la ville": translate(data.qpv),
        "Zone Rurale": translate(isInRuralArea(data)),
        Handicap: translate(data.handicap),
        "Bénéficiaire d'un PPS": translate(data.ppsBeneficiary),
        "Bénéficiaire d'un PAI": translate(data.paiBeneficiary),
        "Aménagement spécifique": translate(data.specificAmenagment),
        "Nature de l'aménagement spécifique": translate(data.specificAmenagmentType),
        "Aménagement pour mobilité réduite": translate(data.reducedMobilityAccess),
        "Besoin d'être affecté(e) dans le département de résidence": translate(data.handicapInSameDepartment),
        "Allergies ou intolérances alimentaires": translate(data.allergies),
        "Activité de haut-niveau": translate(data.highSkilledActivity),
        "Nature de l'activité de haut-niveau": data.highSkilledActivityType,
        "Activités de haut niveau nécessitant d'être affecté dans le département de résidence": translate(data.highSkilledActivityInSameDepartment),
        "Document activité de haut-niveau ": data.highSkilledActivityProofFiles,
        "Structure médico-sociale": translate(data.medicosocialStructure),
        "Nom de la structure médico-sociale": data.medicosocialStructureName,
        "Adresse de la structure médico-sociale": data.medicosocialStructureAddress,
        "Code postal de la structure médico-sociale": data.medicosocialStructureZip,
        "Ville de la structure médico-sociale": data.medicosocialStructureCity,
      },
      cle: {
        "Nationalité française": translate(data.frenchNationality),
        "Etablissement UAI": etablissement?.uai,
        "Classe Engagée ID": data.classeId,
        Coloration: translate(classe?.coloration),
      },
      representative1: {
        "Statut représentant légal 1": translate(data.parent1Status),
        "Prénom représentant légal 1": data.parent1FirstName,
        "Nom représentant légal 1": data.parent1LastName,
        "Email représentant légal 1": data.parent1Email,
        "Téléphone représentant légal 1": formatPhoneE164(data.parent1Phone, data.parent1PhoneZone),
        "Adresse représentant légal 1": data.parent1Address,
        "Code postal représentant légal 1": data.parent1Zip,
        "Ville représentant légal 1": data.parent1City,
        "Département représentant légal 1": data.parent1Department,
        "Région représentant légal 1": data.parent1Region,
      },
      representative2: {
        "Statut représentant légal 2": translate(data.parent2Status),
        "Prénom représentant légal 2": data.parent2FirstName,
        "Nom représentant légal 2": data.parent2LastName,
        "Email représentant légal 2": data.parent2Email,
        "Téléphone représentant légal 2": formatPhoneE164(data.parent2Phone, data.parent2PhoneZone),
        "Adresse représentant légal 2": data.parent2Address,
        "Code postal représentant légal 2": data.parent2Zip,
        "Ville représentant légal 2": data.parent2City,
        "Département représentant légal 2": data.parent2Department,
        "Région représentant légal 2": data.parent2Region,
      },
      consent: {
        "Consentement des représentants légaux": translate(data.parentConsentment),
      },
      status: {
        "Statut général": translate(data.status),
        Phase: translate(data.phase),
        "Statut Phase 1": translatePhase1(data.statusPhase1),
        "Statut Phase 2": translatePhase2(data.statusPhase2),
        "Statut Phase 3": translate(data.statusPhase3),
        "Dernier statut le": formatLongDateFR(data.lastStatusAt),
      },
      phase1Affectation: {
        "ID centre": center._id || "",
        "Matricule centre": center.matricule || "",
        "Code centre (2022)": center.code2022 || "",
        "Nom du centre": center.name || "",
        "Ville du centre": center.city || "",
        "Département du centre": center.department || "",
        "Région du centre": center.region || "",
      },
      phase1Transport: {
        "Se rend au centre par ses propres moyens": translate(data.deplacementPhase1Autonomous),
        "Informations de transports transmises par email": translate(data.transportInfoGivenByLocal),
        "Bus n˚": bus?.busId,
        // @ts-ignore
        "Nom du point de rassemblement": meetingPoint?.name,
        // @ts-ignore
        "Adresse point de rassemblement": meetingPoint?.address,
        // @ts-ignore
        "Ville du point de rassemblement": meetingPoint?.city,
        "Date aller": formatDateFR(bus?.departuredDate),
        "Heure de départ": ligneToPoint?.departureHour,
        "Heure de convocation": ligneToPoint?.meetingHour,
        "Date retour": formatDateFR(bus?.returnDate),
        "Heure de retour": ligneToPoint?.returnHour,
        "Voyage en avion": translate(data?.isTravelingByPlane),
      },
      phase1DocumentStatus: {
        "Droit à l'image - Statut": translateFileStatusPhase1(data.imageRightFilesStatus) || "Non Renseigné",
        "Autotest PCR - Statut": translateFileStatusPhase1(data.autoTestPCRFilesStatus) || "Non Renseigné",
        "Règlement intérieur": translate(data.rulesYoung),
        "Fiche sanitaire réceptionnée": translate(data.cohesionStayMedicalFileReceived) || "Non Renseigné",
      },
      phase1DocumentAgreement: {
        "Droit à l'image - Accord": translate(data.imageRight),
        "Autotest PCR - Accord": translate(data.autoTestPCR),
      },
      phase1Attendance: {
        "Présence à l'arrivée": !data.cohesionStayPresence ? "Non renseignée" : data.cohesionStayPresence === "true" ? "Présent" : "Absent",
        "Présence à la JDM": !data.presenceJDM ? "Non renseignée" : data.presenceJDM === "true" ? "Présent" : "Absent",
        "Date de départ": !data.departSejourAt ? "Non renseignée" : formatDateFRTimezoneUTC(data.departSejourAt),
        "Motif du départ": data?.departSejourMotif,
        "Commentaire du départ": data?.departSejourMotifComment,
      },
      phase2: {
        "Domaine de MIG 1": data.domains[0],
        "Domaine de MIG 2": data.domains[1],
        "Domaine de MIG 3": data.domains[2],
        "Projet professionnel": translate(data.professionnalProject),
        "Information supplémentaire sur le projet professionnel": data.professionnalProjectPrecision,
        "Période privilégiée pour réaliser des missions": data.period,
        "Choix 1 période": translate(data.periodRanking[0]),
        "Choix 2 période": translate(data.periodRanking[1]),
        "Choix 3 période": translate(data.periodRanking[2]),
        "Choix 4 période": translate(data.periodRanking[3]),
        "Choix 5 période": translate(data.periodRanking[4]),
        "Mobilité aux alentours de son établissement": translate(data.mobilityNearSchool),
        "Mobilité aux alentours de son domicile": translate(data.mobilityNearHome),
        "Mobilité aux alentours d'un de ses proches": translate(data.mobilityNearRelative),
        "Informations du proche":
          data.mobilityNearRelative &&
          [data.mobilityNearRelativeName, data.mobilityNearRelativeAddress, data.mobilityNearRelativeZip, data.mobilityNearRelativeCity].filter((e) => e)?.join(", "),
        "Mode de transport": data.mobilityTransport?.map((t) => translate(t)).join(", "),
        "Autre mode de transport": data.mobilityTransportOther,
        "Format de mission": translate(data.missionFormat),
        "Engagement dans une structure en dehors du SNU": translate(data.engaged),
        "Description engagement ": data.engagedDescription,
        "Souhait MIG": data.desiredLocation,
        "Remboursement Code de la Route": translate(data?.roadCodeRefund) || "Non renseigné",
      },
      accountDetails: {
        "Créé lé": formatLongDateFR(data.createdAt),
        "Mis à jour le": formatLongDateFR(data.updatedAt),
        "Dernière connexion le": formatLongDateFR(data.lastLoginAt),
      },
      desistement: {
        "Raison du désistement": getLabelWithdrawnReason(data.withdrawnReason),
        "Message de désistement": data.withdrawnMessage,
      },
    };

    const fields: { [key: string]: string | undefined } = { ID: data._id };
    for (const element of values) {
      let key: string;
      for (key in allFields[element]) fields[key] = allFields[element][key];
    }
    return fields;
  });
}

export function isCohortOpenForAffectation(user: UserDto, young: YoungType, cohort: CohortDto): boolean {
  if (!user || !young || !cohort) return false;
  if (young.status !== "VALIDATED" && young.status !== "WAITING_LIST") {
    return false;
  } else if (cohort) {
    return canAssignManually(user, young, cohort);
  } else {
    return false;
  }
}

export function isYoungCheckIsOpen(user: UserDto, cohort: CohortDto): boolean {
  if (!cohort || !user) return false;
  const field = youngCheckinField[user.role];
  return field ? !!cohort[field] : false;
}
