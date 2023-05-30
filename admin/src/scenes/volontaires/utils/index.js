import {
  ES_NO_LIMIT,
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
  translateStatusMilitaryPreparationFiles,
} from "snu-lib";
import { orderCohort } from "../../../components/filters-system-v2/components/filters/utils";
import api from "../../../services/api";
import { formatPhoneE164 } from "../../../utils/formatPhoneE164";

export const getFilterArray = (user, bus) => {
  console.log("🚀 ~ file: index.js:28 ~ bus:", bus);
  return [
    { title: "Cohorte", name: "cohort", parentGroup: "Général", missingLabel: "Non renseigné", translate: translate, sort: orderCohort },
    { title: "Cohorte d'origine", name: "originalCohort", parentGroup: "Général", missingLabel: "Non renseigné", translate: translate, sort: orderCohort },
    { title: "Statut", name: "status", parentGroup: "Général", missingLabel: "Non renseigné", translate: translateInscriptionStatus, defaultValue: ["VALIDATED"] },
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
      translate: (e) => getDepartmentNumber(e) + " - " + e,
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
      title: "Statut phase 1",
      name: "statusPhase1",
      parentGroup: "Phase 1",
      missingLabel: "Non renseigné",
      translate: translatePhase1,
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
      translate: (item) => {
        if (item === "N/A" || !bus?.ligneBus) return item;
        return bus.ligneBus.find((option) => option._id.toString() === item)?.busId;
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
      title: "Statut phase 3",
      name: "statusPhase3",
      parentGroup: "Phase 3",
      missingLabel: "Non renseigné",
      translate: translate,
    },
  ].filter(Boolean);
};

export async function transformVolontaires(data, values, centers, sessionsPhase1, busLines) {
  let all = data;
  if (values.includes("schoolSituation")) {
    const schoolsId = [...new Set(data.map((item) => item.schoolId).filter((e) => e))];
    if (schoolsId?.length) {
      const { responses } = await api.esQuery("schoolramses", {
        query: { bool: { must: { ids: { values: schoolsId } } } },
        size: ES_NO_LIMIT,
      });
      if (responses.length) {
        const schools = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
        all = data.map((item) => ({ ...item, esSchool: schools?.find((e) => e._id === item.schoolId) }));
      }
    }
  }

  const meetingPoints = busLines.data.meetingPoints || [];
  const ligneBus = busLines.data.ligneBus || [];
  const ligneToPoints = busLines.data.ligneToPoints || [];

  return all.map((data) => {
    let center = {};
    if (data.cohesionCenterId && centers && sessionsPhase1) {
      center = centers.find((c) => c._id === data.cohesionCenterId);
      if (!center) center = {};
    }
    let meetingPoint = {};
    let bus = {};
    let ligneToPoint = {};
    if (data.meetingPointId && meetingPoints) {
      meetingPoint = meetingPoints.find((mp) => mp._id === data.meetingPointId);
      bus = ligneBus.find((lb) => lb._id === data.ligneId);
      ligneToPoint = ligneToPoints.find((ltp) => ltp.lineId === data.ligneId && ltp.meetingPointId === data.meetingPointId);
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
      schoolSituation: {
        Situation: translate(data.situation),
        Niveau: translate(data.grade),
        "Type d'établissement": translate(data.esSchool?.type || data.schoolType),
        "Nom de l'établissement": data.esSchool?.fullName || data.schoolName,
        "Code postal de l'établissement": data.esSchool?.postcode || data.schoolZip,
        "Ville de l'établissement": data.esSchool?.city || data.schoolCity,
        "Département de l'établissement": departmentLookUp[data.esSchool?.department] || data.schoolDepartment,
        "UAI de l'établissement": data.esSchool?.uai,
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
        "Informations de transport sont transmises par les services locaux": translate(data.transportInfoGivenByLocal),
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
      },
      accountDetails: {
        "Créé lé": formatLongDateFR(data.createdAt),
        "Mis à jour le": formatLongDateFR(data.updatedAt),
        "Dernière connexion le": formatLongDateFR(data.lastLoginAt),
      },
      desistement: {
        "Raison du désistement": getLabelWithdrawnReason(data.withdrawnReason),
        "Message de désistement": data.withdrawnMessage,
        // Date du désistement: // not found in db
      },
    };

    let fields = { ID: data._id };
    for (const element of values) {
      let key;
      for (key in allFields[element]) fields[key] = allFields[element][key];
    }
    return fields;
  });
}

export async function transformVolontairesSchool(data) {
  let all = data;
  const schoolsId = [...new Set(data.map((item) => item.schoolId).filter((e) => e))];
  if (schoolsId?.length) {
    const { responses } = await api.esQuery("schoolramses", {
      query: { bool: { must: { ids: { values: schoolsId } } } },
      size: ES_NO_LIMIT,
    });
    if (responses.length) {
      const schools = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
      all = data.map((item) => ({ ...item, esSchool: schools?.find((e) => e._id === item.schoolId) }));
    }
  }
  return all.map((data) => {
    return {
      _id: data._id,
      Cohorte: data.cohort,
      Prénom: data.firstName,
      Nom: data.lastName,
      Département: data.department,
      Situation: translate(data.situation),
      Niveau: translate(data.grade),
      "Type d'établissement": translate(data.esSchool?.type || data.schoolType),
      "Nom de l'établissement": data.esSchool?.fullName || data.schoolName,
      "Code postal de l'établissement": data.esSchool?.postcode || data.schoolZip,
      "Ville de l'établissement": data.esSchool?.city || data.schoolCity,
      "Département de l'établissement": departmentLookUp[data.esSchool?.department] || data.schoolDepartment,
      "UAI de l'établissement": data.esSchool?.uai,
      "Statut général": translate(data.status),
      "Statut Phase 1": translate(data.statusPhase1),
    };
  });
}

export async function transformInscription(data) {
  let all = data;
  const schoolsId = [...new Set(data.map((item) => item.schoolId).filter((e) => e))];
  if (schoolsId?.length) {
    const { responses } = await api.esQuery("schoolramses", {
      query: { bool: { must: { ids: { values: schoolsId } } } },
      size: ES_NO_LIMIT,
    });
    if (responses.length) {
      const schools = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
      all = data.map((item) => ({ ...item, esSchool: schools?.find((e) => e._id === item.schoolId) }));
    }
  }
  return all.map((data) => {
    return {
      _id: data._id,
      Cohorte: data.cohort,
      Prénom: data.firstName,

      Nom: data.lastName,
      "Date de naissance": formatDateFRTimezoneUTC(data.birthdateAt),
      "Pays de naissance": data.birthCountry || "France",
      "Ville de naissance": data.birthCity,
      "Code postal de naissance": data.birthCityZip,
      "Date de fin de validité de la pièce d'identité": formatDateFRTimezoneUTC(data?.latestCNIFileExpirationDate),
      Sexe: translate(data.gender),
      Email: data.email,
      Téléphone: formatPhoneE164(data.phone, data.phoneZone),
      "Adresse postale": data.address,
      "Code postal": data.zip,
      Ville: data.city,
      Département: data.department,
      Région: data.region,
      Académie: data.academy,
      Pays: data.country,
      "Nom de l'hébergeur": data.hostLastName,
      "Prénom de l'hébergeur": data.hostFirstName,
      "Lien avec l'hébergeur": data.hostRelationship,
      "Adresse - étranger": data.foreignAddress,
      "Code postal - étranger": data.foreignZip,
      "Ville - étranger": data.foreignCity,
      "Pays - étranger": data.foreignCountry,
      Situation: translate(data.situation),
      Niveau: data.grade,
      "Type d'établissement": translate(data.esSchool?.type || data.schoolType),
      "Nom de l'établissement": data.esSchool?.fullName || data.schoolName,
      "Code postal de l'établissement": data.esSchool?.postcode || data.schoolZip,
      "Ville de l'établissement": data.esSchool?.city || data.schoolCity,
      "Département de l'établissement": departmentLookUp[data.esSchool?.department] || data.schoolDepartment,
      "UAI de l'établissement": data.esSchool?.uai,
      "Quartier Prioritaire de la ville": translate(data.qpv),
      "Zone Rurale": translate(isInRuralArea(data)),
      Handicap: translate(data.handicap),
      "Bénéficiaire d'un PPS": translate(data.ppsBeneficiary),
      "Bénéficiaire d'un PAI": translate(data.paiBeneficiary),
      "Structure médico-sociale": translate(data.medicosocialStructure),
      "Nom de la structure médico-sociale": data.medicosocialStructureName,
      "Adresse de la structure médico-sociale": data.medicosocialStructureAddress,
      "Code postal de la structure médico-sociale": data.medicosocialStructureZip,
      "Ville de la structure médico-sociale": data.medicosocialStructureCity,
      "Aménagement spécifique": translate(data.specificAmenagment),
      "Nature de l'aménagement spécifique": data.specificAmenagmentType,
      "Aménagement pour mobilité réduite": translate(data.reducedMobilityAccess),
      "Besoin d'être affecté(e) dans le département de résidence": translate(data.handicapInSameDepartment),
      "Allergies ou intolérances alimentaires": translate(data.allergies),
      "Activité de haut-niveau": translate(data.highSkilledActivity),
      "Nature de l'activité de haut-niveau": data.highSkilledActivityType,
      "Activités de haut niveau nécessitant d'être affecté dans le département de résidence": translate(data.highSkilledActivityInSameDepartment),
      "Document activité de haut-niveau ": data.highSkilledActivityProofFiles,
      "Consentement des représentants légaux": translate(data.parentConsentment),
      "Droit à l'image": translate(data.imageRight),
      "Autotest PCR": translate(data.autoTestPCR),
      "Règlement intérieur": translate(data.rulesYoung),
      "Fiche sanitaire réceptionnée": translate(data.cohesionStayMedicalFileReceived) || "Non Renseigné",
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
      Motivation: data.motivations,
      Phase: translate(data.phase),
      "Créé lé": formatLongDateFR(data.createdAt),
      "Mis à jour le": formatLongDateFR(data.updatedAt),
      "Dernière connexion le": formatLongDateFR(data.lastLoginAt),
      "Statut général": translate(data.status),
      "Dernier statut le": formatLongDateFR(data.lastStatusAt),
    };
  });
}
