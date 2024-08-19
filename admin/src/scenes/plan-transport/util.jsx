import React from "react";
import Avion from "../../assets/icons/Avion";
import Bus from "../../assets/icons/Bus";
import Fusee from "../../assets/icons/Fusee";
import Train from "./ligne-bus/components/Icons/Train";
import { ES_NO_LIMIT, ROLES, translate, formatDateFRTimezoneUTC, departmentToAcademy } from "snu-lib";
import FileSaver from "file-saver";
import { toastr } from "react-redux-toastr";
import dayjs from "@/utils/dayjs.utils";
import API from "../../services/api";
import * as XLSX from "xlsx";
import { formatPhoneE164 } from "../../utils/formatPhoneE164";
import { getPhoneZoneByDepartment } from "../../utils/getPhoneZoneByDepartment";

export function formatRate(value, total, fractionDigit = 0, allowMoreThan100 = false) {
  if (total === 0 || total === undefined || total === null || value === undefined || value === null) {
    return "-";
  } else {
    if (value > total && !allowMoreThan100) {
      return "100%";
    } else {
      return ((value / total) * 100).toFixed(fractionDigit).replace(/\./g, ",") + "%";
    }
  }
}

export const getTransportIcon = (transportType) => {
  switch (transportType) {
    case "bus":
      return <Bus className="-rotate-12 text-gray-500" />;
    case "train":
      return <Train className="text-gray-500" />;
    case "avion":
      return <Avion className="text-gray-500" />;
    default:
      return <Fusee className="text-gray-500" />;
  }
};

export function parseQuery(query) {
  let result = {};
  if (query) {
    if (query.startsWith("?")) {
      query = query.substring(1);
    }
    const params = query.split("&");
    for (const param of params) {
      const match = /([^=]+)=(.*)/.exec(param);
      result[match[1]] = decodeURIComponent(match[2]);
    }
  }
  return result;
}

export const GROUPSTEPS = {
  CANCEL: "CANCEL",
  CREATION: "CREATION",
  MODIFICATION: "MODIFICATION",
  YOUNG_COUNTS: "YOUNG_COUNTS",
  CENTER: "CENTER",
  CONFIRM_DELETE_CENTER: "CONFIRM_DELETE_CENTER",
  GATHERING_PLACES: "GATHERING_PLACES",
  AFFECTATION_SUMMARY: "AFFECTATION_SUMMARY",
  CONFIRM_DELETE_GROUP: "CONFIRM_DELETE_GROUP",
};

export async function exportLigneBus(cohort) {
  try {
    const { ok, data: ligneBus } = await API.post(`/elasticsearch/lignebus/export?needYoungInfo=true&needCohesionCenterInfo=true&needMeetingPointsInfo=true`, {
      filters: { cohort: [cohort] },
    });
    if (!ok || !ligneBus?.length) return toastr.error("Aucun volontaire affecté n'a été trouvé");

    let result = {};

    for (const ligne of ligneBus) {
      if (!ligne.youngs.length) continue;
      if (!result[ligne.busId]) {
        result[ligne.busId] = {};
        result[ligne.busId]["youngs"] = [];
      }
      for (const young of ligne.youngs) {
        young.bus = {
          departuredDate: ligne.departuredDate,
          returnDate: ligne.returnDate,
        };
        young.center = ligne.center;
        young.meetingPoint = ligne.meetingPoints.find((e) => e._id === young.meetingPointId);
        if (young.meetingPoint) {
          result[ligne.busId]["youngs"].push(young);
        }
      }
    }

    // Transform data into array of objects before excel converts
    const formatedRep = Object.keys(result).map((key) => {
      return {
        name: key,
        data: result[key].youngs.map((young) => {
          const meetingPoint = young.meetingPoint;
          const ligneBus = young.bus;
          const center = young.center;

          return {
            _id: young._id,
            Cohorte: young.cohort,
            Prénom: young.firstName,
            Nom: young.lastName,
            Email: young.email,
            Téléphone: formatPhoneE164(young.phone, young.phoneZone || getPhoneZoneByDepartment(young.department)),
            Département: young.department,
            Académie: departmentToAcademy[young.schoolDepartment],
            Région: young.region,

            "Statut représentant légal 1": translate(young.parent1Status),
            "Prénom représentant légal 1": young.parent1FirstName,
            "Nom représentant légal 1": young.parent1LastName,
            "Email représentant légal 1": young.parent1Email,
            "Téléphone représentant légal 1": formatPhoneE164(young.parent1Phone, young.parent1PhoneZone || getPhoneZoneByDepartment(young.department)),

            "Statut représentant légal 2": translate(young.parent2Status),
            "Prénom représentant légal 2": young.parent2FirstName,
            "Nom représentant légal 2": young.parent2LastName,
            "Email représentant légal 2": young.parent2Email,
            "Téléphone représentant légal 2": formatPhoneE164(young.parent2Phone, young.parent2PhoneZone || getPhoneZoneByDepartment(young.department)),

            "ID centre": center._id,
            "Code centre (2022)": center.code2022,
            "Nom du centre": center.name,
            "Adresse du centre": center.address,
            "Ville du centre": center.city,
            "Département du centre": center.department,
            "Région du centre": center.region,

            "Id du point de rassemblement": young.meetingPointId,
            "Nom du point de rassemblement": meetingPoint.name,
            "Adresse point de rassemblement": meetingPoint.address,
            "Ville du point de rassemblement": meetingPoint.city,
            "Département du point de rassemblement": meetingPoint.department,
            "Région du point de rassemblement": meetingPoint.region,

            "Date aller": formatDateFRTimezoneUTC(ligneBus.departuredDate),
            "Date retour": formatDateFRTimezoneUTC(ligneBus.returnDate),

            "Statut général": translate(young.status),
            "Statut phase 1": translate(young.statusPhase1),
            "Droit à l'image": translate(young.imageRight),
            "Confirmation de participation au séjour de cohésion": translate(young.youngPhase1Agreement),
          };
        }),
      };
    });

    generateExcelWorkbook(formatedRep, "Listes_volontaires_par_ligne");
  } catch (e) {
    console.log(e);
    toastr.error("Erreur !", translate(e.code));
  }
}

function generateExcelWorkbook(data, filename) {
  const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const wb = XLSX.utils.book_new();
  data.forEach((sheet) => {
    let ws = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 30));
  });
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const resultData = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(resultData, `${filename}_${dayjs().format("YYYY-MM-DD_HH[h]mm[m]ss[s]")}`);
}

export async function exportLigneBusJeune(cohort, ligne, travel, team) {
  try {
    const youngs = await API.post(`/elasticsearch/young/in-bus/${String(ligne._id)}/export`, {
      filters: {},
      exportFields: "*",
    });
    if (!youngs?.data?.length) return toastr.error("Aucun volontaire affecté n'a été trouvé");

    const session = await API.get(`/session-phase1/${youngs.data[0].sessionPhase1Id}`);
    if (!session.ok) return toastr.error("Aucune session n'a été trouvée");

    const headcenter = await API.get(`/referent/${session.data.headCenterId}`);
    if (!headcenter.ok) return toastr.error("Aucun chef de centre n'a été trouvé");

    const refDepOrigine = await API.get(`/department-service/${youngs.data[0].department}`);
    if (!refDepOrigine.ok) return toastr.error("Aucun référent n'a été trouvé dans le département d'origine");

    const contactRefDepOrigine = refDepOrigine.data.contacts.filter((item) => item.cohort === cohort);

    const refDepAccueil = await API.get(`/department-service/${ligne.centerDetail.department}`);
    if (!refDepAccueil.ok) return toastr.error("Aucun référent n'a été trouvé dans le département d'accueil");

    const contactRefDepAccueil = refDepAccueil.data.contacts.filter((item) => item.cohort === cohort);

    const mappy = (value, field) => {
      return ligne.meetingsPointsDetail.filter((point) => point.meetingPointId === value.meetingPointId)[0][field];
    };

    const forthTeam = team.filter((item) => item.forth === true);
    const forthTeamLeader = forthTeam.filter((item) => item.role === "leader");
    const forthTeamSupervisor = forthTeam.filter((item) => item.role === "supervisor");

    const backTeam = team.filter((item) => item.back === true);
    const backTeamLeader = backTeam.filter((item) => item.role === "leader");
    const backTeamSupervisor = backTeam.filter((item) => item.role === "supervisor");

    let excel = [
      { name: "Aller", data: [] },
      { name: "Retour", data: [] },
    ];

    youngs.data.map((item) =>
      excel[0].data.push({
        "Bus n˚": ligne.busId,
        "Adresse point de rassemblement": mappy(item, "address") + ", " + mappy(item, "zip") + ", " + mappy(item, "city"),
        "Heure de convocation": mappy(item, "meetingHour"),
        "Heure de départ du bus": mappy(item, "departureHour"),
        "Heure d'arrivée au centre": ligne.centerArrivalTime,
        "Téléphone urgence SNU": "+33155551327",
        "Email SNU": "signal-snu@jeunesse-sports.gouv.fr ",
        "Téléphone urgence Travel Planet": "+33972566204",
        "Email Travel Planet": "snu@my-travelplanet.com",
        "Contact du département d'origine": contactRefDepOrigine[0]?.contactName,
        "Téléphone du département d'origine": formatPhoneE164(contactRefDepOrigine[0]?.contactPhone, getPhoneZoneByDepartment(refDepOrigine.data?.department)),
        "Email du département d'origine": contactRefDepOrigine[0]?.contactMail,
        "Contact du département d'accueil": contactRefDepAccueil[0]?.contactName,
        "Téléphone du département d'accueil": formatPhoneE164(contactRefDepAccueil[0]?.contactPhone, getPhoneZoneByDepartment(refDepAccueil.data?.department)),
        "Email du département d'accueil": contactRefDepAccueil[0]?.contactMail,
        "Nom du chef de centre": headcenter.data.firstName + " " + headcenter.data.lastName,
        "Téléphone du chef de centre": formatPhoneE164(headcenter.data.phone, getPhoneZoneByDepartment(ligne.centerDetail.department)),
        "Email du chef de centre": headcenter.data.email,
      }),
    );
    forthTeamLeader.length > 0
      ? excel[0].data.forEach((obj) => {
          obj["Nom Chef de File"] = forthTeamLeader[0].firstName + " " + forthTeamLeader[0].lastName;
          obj["Téléphone Chef de File"] = formatPhoneE164(forthTeamLeader[0].phone, getPhoneZoneByDepartment(refDepOrigine.data?.department));
        })
      : null;
    if (forthTeamSupervisor.length > 0) {
      forthTeamSupervisor.forEach((supervisor, index) => {
        excel[0].data.forEach((obj) => {
          obj["Nom Encadrant " + (index + 1)] = supervisor.firstName + " " + supervisor.lastName;
          obj["Téléphone Encadrant " + (index + 1)] = formatPhoneE164(supervisor.phone, getPhoneZoneByDepartment(refDepOrigine.data?.department));
        });
      });
    }
    youngs.data.forEach((young, index) => {
      const { data } = excel[0];

      data[index] = {
        ...data[index],
        Nom: young.lastName,
        Prénom: young.firstName,
        "Date de naissance": formatDateFRTimezoneUTC(young.birthdateAt),
        Téléphone: formatPhoneE164(young.phone, young.phoneZone || getPhoneZoneByDepartment(young.department)),
        "Téléphone représentant légal 1": formatPhoneE164(young.parent1Phone, young.parent1PhoneZone || getPhoneZoneByDepartment(young.department)),
        "Téléphone représentant légal 2": formatPhoneE164(young.parent2Phone, young.parent2PhoneZone || getPhoneZoneByDepartment(young.department)),
        Présent: "",
        Commentaire: "",
      };
    });

    youngs.data.map((item) =>
      excel[1].data.push({
        "Bus n˚": ligne.busId,
        "Adresse point de rassemblement": mappy(item, "address") + ", " + mappy(item, "zip") + ", " + mappy(item, "city"),
        "Heure de départ du bus": ligne.centerDepartureTime,
        "Heure de Retour": mappy(item, "returnHour"),
        "Téléphone urgence SNU": "+33155551327",
        "Email SNU": "signal-snu@jeunesse-sports.gouv.fr ",
        "Téléphone urgence Travel Planet": "+33972566204",
        "Email Travel Planet": "snu@my-travelplanet.com",
        "Contact du département d'origine": contactRefDepOrigine[0]?.contactName,
        "Téléphone du département d'origine": formatPhoneE164(contactRefDepOrigine[0]?.contactPhone, getPhoneZoneByDepartment(refDepOrigine.data?.department)),
        "Email du département d'origine": contactRefDepOrigine[0]?.contactMail,
        "Contact du département d'accueil": contactRefDepAccueil[0]?.contactName,
        "Téléphone du département d'accueil": formatPhoneE164(contactRefDepAccueil[0]?.contactPhone, getPhoneZoneByDepartment(refDepAccueil.data?.department)),
        "Email du département d'accueil": contactRefDepAccueil[0]?.contactMail,
        "Nom du chef de centre": headcenter.data.firstName + " " + headcenter.data.lastName,
        "Téléphone du chef de centre": formatPhoneE164(headcenter.data.phone, getPhoneZoneByDepartment(ligne.centerDetail.department)),
        "Email du chef de centre": headcenter.data.email,
      }),
    );
    backTeamLeader.length > 0
      ? excel[1].data.forEach((obj) => {
          obj["Nom Chef de File"] = backTeamLeader[0].firstName + " " + backTeamLeader[0].lastName;
          obj["Téléphone Chef de File"] = formatPhoneE164(backTeamLeader[0].phone, getPhoneZoneByDepartment(refDepOrigine.data?.department));
        })
      : null;
    if (backTeamSupervisor.length > 0) {
      backTeamSupervisor.forEach((supervisor, index) => {
        excel[1].data.forEach((obj) => {
          obj["Nom Encadrant " + (index + 1)] = supervisor.firstName + " " + supervisor.lastName;
          obj["Téléphone Encadrant " + (index + 1)] = formatPhoneE164(supervisor.phone, getPhoneZoneByDepartment(refDepOrigine.data?.department));
        });
      });
    }
    youngs.data.forEach((young, index) => {
      const { data } = excel[1];

      data[index] = {
        ...data[index],
        Nom: young.lastName,
        Prénom: young.firstName,
        "Date de naissance": formatDateFRTimezoneUTC(young.birthdateAt),
        Téléphone: formatPhoneE164(young.phone, young.phoneZone || getPhoneZoneByDepartment(young.department)),
        "Téléphone représentant légal 1": formatPhoneE164(young.parent1Phone, young.parent1PhoneZone || getPhoneZoneByDepartment(young.department)),
        "Téléphone représentant légal 2": formatPhoneE164(young.parent2Phone, young.parent2PhoneZone || getPhoneZoneByDepartment(young.department)),
        Présent: "",
        Commentaire: "",
      };
    });
    switch (travel) {
      case "Aller":
        generateExcelWorkbook([excel[0]], `Fiche_Convoyeur_ligne_${ligne.busId}`);
        break;
      case "Retour":
        generateExcelWorkbook([excel[1]], `Fiche_Convoyeur_ligne_${ligne.busId}`);
        break;
      default:
        generateExcelWorkbook(excel, `Fiche_Convoyeur_ligne_${ligne.busId}`);
    }
  } catch (e) {
    console.log(e);
    toastr.error("Erreur !", translate(e.code));
  }
}

export async function exportConvoyeur(cohort) {
  try {
    const resultat = await API.get(`/ligne-de-bus/cohort/${cohort}`);
    if (!resultat.ok) return toastr.error("Aucune ligne de bus n'a été trouvée");

    const ligneBus = resultat.data.ligneBus;
    const centers = resultat.data.centers;

    for (let i = 0; i < ligneBus.length; i++) {
      const currentLigneBus = ligneBus[i];

      const matchingCenter = centers.find((c) => c._id === currentLigneBus.centerId);

      if (matchingCenter) {
        currentLigneBus.centerCode = matchingCenter.code2022;
        currentLigneBus.centerDepartment = matchingCenter.department;
      }
    }

    const findTeam = (item, teamHeaders) => {
      const leader = item.team.filter((member) => member.role === "leader");
      const supervisor = item.team.filter((member) => member.role === "supervisor");
      // deep copy to avoid modifying the original object
      const team = { ...teamHeaders };

      if (leader.length > 0) {
        team["Nom Chef de File"] = leader[0].lastName;
        team["Prénom Chef de File"] = leader[0].firstName;
        team["Date naissance Chef de File"] = formatDateFRTimezoneUTC(leader[0].birthdate);
        team["Email Chef de File"] = leader[0].mail;
        team["Téléphone Chef de File"] = formatPhoneE164(leader[0].phone);
        team["Aller"] = leader[0].forth === true ? "Oui" : "Non";
        team["Retour"] = leader[0].back === true ? "Oui" : "Non";
      }
      if (supervisor.length > 0) {
        supervisor.forEach((supervisor, index) => {
          team["Nom Encadrant " + (index + 1)] = supervisor.lastName;
          team["Prénom Encadrant " + (index + 1)] = supervisor.firstName;
          team["Date naissance Encadrant " + (index + 1)] = formatDateFRTimezoneUTC(supervisor.birthdate);
          team["Email Encadrant " + (index + 1)] = supervisor.mail;
          team["Téléphone Encadrant " + (index + 1)] = formatPhoneE164(supervisor.phone);
          team["Aller"] = supervisor.forth === true ? "Oui" : "Non";
          team["Retour"] = supervisor.back === true ? "Oui" : "Non";
        });
      }

      return team;
    };

    let excel = [{ name: "Convoyeur", data: [] }];

    const maxSupervisor = ligneBus.reduce((acc, item) => {
      const supervisor = item.team.filter((member) => member.role === "supervisor");
      return Math.max(acc, supervisor.length);
    }, 0);

    const teamHeaders = {
      "Nom Chef de File": "",
      "Prénom Chef de File": "",
      "Date naissance Chef de File": "",
      "Email Chef de File": "",
      "Téléphone Chef de File": "",
      Aller: "",
      Retour: "",
    };

    for (let i = 1; i <= maxSupervisor; i++) {
      teamHeaders["Nom Encadrant " + i] = "";
      teamHeaders["Prénom Encadrant " + i] = "";
      teamHeaders["Date naissance Encadrant " + i] = "";
      teamHeaders["Email Encadrant " + i] = "";
      teamHeaders["Téléphone Encadrant " + i] = "";
      teamHeaders.Aller = "";
      teamHeaders.Retour = "";
    }

    ligneBus.forEach((item) => {
      const team = findTeam(item, teamHeaders);

      const dataItem = {
        "Bus n˚": item.busId,
        "Code centre (2022)": item.centerCode,
        Département: item.centerDepartment,
        ...team,
      };

      excel[0].data.push(dataItem);
    });
    generateExcelWorkbook(excel, `Fiche_Convoyeur_cohort_${cohort}`);
  } catch (e) {
    console.log(e);
    toastr.error("Erreur !", translate(e.code));
  }
}
