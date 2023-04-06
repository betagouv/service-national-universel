import {
  ES_NO_LIMIT,
  departmentLookUp,
  formatDateFR,
  formatDateFRTimezoneUTC,
  formatLongDateFR,
  getLabelWithdrawnReason,
  isInRuralArea,
  translate,
  translateFileStatusPhase1,
  translatePhase1,
  translatePhase2,
} from "snu-lib";
import API from "../services/api";
import { concatPhoneNumberWithZone } from "snu-lib/phone-number";

export const transformVolontaires = async (data, values) => {
  let all = data;
  if (values.includes("schoolSituation")) {
    const schoolsId = [...new Set(data.map((item) => item.schoolId).filter((e) => e))];
    if (schoolsId?.length) {
      const { responses } = await API.esQuery("schoolramses", {
        query: { bool: { must: { ids: { values: schoolsId } } } },
        size: ES_NO_LIMIT,
      });
      if (responses.length) {
        const schools = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
        all = data.map((item) => ({ ...item, esSchool: schools?.find((e) => e._id === item.schoolId) }));
      }
    }
  }

  const responseCenters = await API.get("/cohesion-center");
  const centers = responseCenters ? responseCenters.data : [];

  const responseSessions = await API.get("/session-phase1/");
  const sessionsPhase1 = responseSessions ? responseSessions.data : [];

  const responseLigne = await API.get("/ligne-de-bus/all");
  const meetingPoints = responseLigne ? responseLigne.data.meetingPoints : [];
  const ligneBus = responseLigne ? responseLigne.data.ligneBus : [];

  return all.map((data) => {
    let center = {};
    if (data.cohesionCenterId && centers && sessionsPhase1) {
      center = centers.find((c) => c._id === data.cohesionCenterId);
      if (!center) center = {};
    }
    let meetingPoint = {};
    let bus = {};
    if (data.meetingPointId && meetingPoints) {
      meetingPoint = meetingPoints.find((mp) => mp._id === data.meetingPointId);
      bus = ligneBus.find((lb) => lb._id === data.ligneId);
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
        Téléphone: concatPhoneNumberWithZone(data.phone, data.phoneZone),
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
        "Téléphone représentant légal 1": concatPhoneNumberWithZone(data.parent1Phone, data.parent1PhoneZone),
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
        "Téléphone représentant légal 2": concatPhoneNumberWithZone(data.parent2Phone, data.parent2PhoneZone),
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
        "Adresse point de rassemblement": meetingPoint?.address,
        "Date aller": formatDateFR(bus?.departuredDate),
        "Date retour": formatDateFR(bus?.returnDate),
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
};
