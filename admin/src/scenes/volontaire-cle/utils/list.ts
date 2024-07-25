import {
  formatDateFR,
  formatDateFRTimezoneUTC,
  formatLongDateFR,
  getDepartmentNumber,
  isInRuralArea,
  translate,
  translateCniExpired,
  translateFileStatusPhase1,
  translateInscriptionStatus,
  translatePhase1,
  translatePhase2,
} from "snu-lib";
import { orderCohort } from "../../../components/filters-system-v2/components/filters/utils";
import { formatPhoneE164 } from "../../../utils/formatPhoneE164";

export const getFilterArray = (bus, session, classes) => {
  return [
    {
      title: "Classe Engagée ID",
      name: "classeId",
      parentGroup: "Général",
      missingLabel: "Non renseigné",
      translate: (item) => {
        if (item === "N/A" || !classes.length) return item;
        const res = classes.find((option) => option._id.toString() === item);
        if (!res) return "N/A - Supprimé";
        return res?.uniqueKeyAndId;
      },
    },
    { title: "Cohorte", name: "cohort", parentGroup: "Général", missingLabel: "Non renseigné", sort: (e) => orderCohort(e) },
    {
      title: "Statut",
      name: "status",
      parentGroup: "Général",
      missingLabel: "Non renseigné",
      translate: translateInscriptionStatus,
    },
    { title: "Pays de résidence", name: "country", parentGroup: "Général", missingLabel: "Non renseigné", translate: translate },
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
      translate: (e) => getDepartmentNumber(e) + " - " + e,
    },
    {
      title: "Classe",
      name: "grade", //numero de la classe
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Étape de l'inscription",
      name: "reinscriptionStep2023",
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
      title: "Statut phase 1",
      name: "statusPhase1",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: translatePhase1,
    },
    {
      title: "Centre",
      name: "sessionPhase1Id",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: (item) => {
        if (item === "N/A" || !session.length) return item;
        const res = session.find((option) => option._id.toString() === item);
        if (!res) return "N/A - Supprimé";
        return (res?.codeCentre || "N/A") + " - " + res?.cohesionCenterId;
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
      translate: (item) => {
        if (item === "N/A" || !bus?.length) return item;
        return bus.find((option) => option._id.toString() === item)?.busId;
      },
    },
  ].filter(Boolean);
};

export async function transformVolontairesCLE(data, values) {
  const all = data;

  interface Center {
    _id?: string;
    code?: string;
    code2022?: string;
    name?: string;
    city?: string;
    department?: string;
    region?: string;
  }

  interface Bus {
    busId?: string;
    departuredDate?: string;
    returnDate?: string;
  }

  interface LigneToPoint {
    departureHour?: string;
    meetingHour?: string;
    returnHour?: string;
  }

  interface MeetingPoint {
    name?: string;
    address?: string;
    city?: string;
  }

  return all.map((data) => {
    let center: Center = {};
    if (data.cohesionCenterId && data.sessionPhase1Id) {
      center = data?.center;
      if (!center) center = {};
    }
    let meetingPoint: MeetingPoint = {};
    let bus: Bus = {};
    let ligneToPoint: LigneToPoint = {};
    if (data.meetingPointId && data.ligneId) {
      bus = data?.bus || {};
      ligneToPoint = data?.ligneToPoint || {};
      meetingPoint = data?.meetingPoint || {};
    }

    if (!data.domains) data.domains = [];
    if (!data.periodRanking) data.periodRanking = [];
    const allFields = {
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
      etablissement: {
        "Situation du jeune": translate(data.situation),
        "Niveau du jeune": translate(data.grade),
        "Type d'établissement": data?.etablissement?.type || "",
        "Filère de l'établissement": data?.etablissement?.sector || "",
        "Nom de l'établissement": data?.etablissement?.name || "",
        "Code postal de l'établissement": data?.etablissement?.zip || "",
        "Ville de l'établissement": data?.etablissement?.city || "",
        "Département de l'établissement": data?.etablissement?.department || "",
        "UAI de l'établissement": data?.etablissement?.uai || "",
      },
      classe: {
        "Identifiant de la classe": data?.classe?.uniqueKeyAndId || "",
        "Nom de la classe": data?.classe?.name || "",
        "Coloration de la classe": data?.classe?.coloration || "",
        "Type de la classe": data?.classe?.type || "",
        "Filière de la classe": data?.classe?.sector || "",
        "Niveau de la classe": data?.classe?.grade || "",
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
        "Nom de la structure médico-sociale": data.medicosocialStructureName, // différence avec au-dessus ?
        "Adresse de la structure médico-sociale": data.medicosocialStructureAddress,
        "Code postal de la structure médico-sociale": data.medicosocialStructureZip,
        "Ville de la structure médico-sociale": data.medicosocialStructureCity,
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
        // "Code centre (2021)": center.code || "",
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
        "Nom du point de rassemblement": meetingPoint?.name,
        "Adresse point de rassemblement": meetingPoint?.address,
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
      accountDetails: {
        "Créé lé": formatLongDateFR(data.createdAt),
        "Mis à jour le": formatLongDateFR(data.updatedAt),
        "Dernière connexion le": formatLongDateFR(data.lastLoginAt),
      },
    };

    const fields = { ID: data._id };
    for (const element of values) {
      let key;
      for (key in allFields[element]) fields[key] = allFields[element][key];
    }
    return fields;
  });
}
