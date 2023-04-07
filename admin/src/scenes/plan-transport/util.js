import React from "react";
import Avion from "../../assets/icons/Avion";
import Bus from "../../assets/icons/Bus";
import Fusee from "../../assets/icons/Fusee";
import Train from "./ligne-bus/components/Icons/Train";
import { ES_NO_LIMIT, ROLES, formatDateFR, formatDateFRTimezoneUTC, translate } from "snu-lib";
import FileSaver from "file-saver";
import { toastr } from "react-redux-toastr";
import dayjs from "dayjs";
import API from "../../services/api";
import * as XLSX from "xlsx";

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

export const cohortList = [
  { label: "Séjour du <b>19 Février au 3 Mars 2023</b>", value: "Février 2023 - C" },
  { label: "Séjour du <b>9 au 21 Avril 2023</b>", value: "Avril 2023 - A" },
  { label: "Séjour du <b>16 au 28 Avril 2023</b>", value: "Avril 2023 - B" },
  { label: "Séjour du <b>11 au 23 Juin 2023</b>", value: "Juin 2023" },
  { label: "Séjour du <b>4 au 16 Juillet 2023</b>", value: "Juillet 2023" },
];

export const getTransportIcon = (transportType) => {
  switch (transportType) {
    case "bus":
      return <Bus className="text-gray-500 -rotate-12" />;
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

function getRegionsFromBusLine(line) {
  let regions = [];
  regions.push(line.centerRegion);
  for (const pdr of line.pointDeRassemblements) {
    regions.push(pdr.region);
  }
  return regions;
}

function getDepartmentsFromBusLine(line) {
  let departments = [];
  departments.push(line.centerDepartment);
  for (const pdr of line.pointDeRassemblements) {
    departments.push(pdr.department);
  }
  return departments;
}

function filterBusLinesByRole(lines, user) {
  const linesWithGeography = lines.map((e) => {
    return { ...e, regions: getRegionsFromBusLine(e), departments: getDepartmentsFromBusLine(e) };
  });

  switch (user.role) {
    case ROLES.ADMIN:
    case ROLES.TRANSPORTER:
      return linesWithGeography;
    case ROLES.REFERENT_DEPARTMENT:
      return linesWithGeography.filter((line) => user.department.some((dep) => line.departments.includes(dep)));
    case ROLES.REFERENT_REGION:
      return linesWithGeography.filter((line) => line.regions.includes(user.region));
    default:
      return [];
  }
}

export const exportLigneBus = async (user, cohort) => {
  try {
    const body = {
      query: {
        bool: {
          must: [{ match_all: {} }, { term: { "cohort.keyword": cohort } }],
        },
      },
    };

    const data = await getAllResults("plandetransport", body);
    if (!data || !data.length) return toastr.error("Aucune ligne de bus n'a été trouvée");
    const ligneBus = filterBusLinesByRole(data, user);
    const ligneIds = ligneBus.map((e) => e._id);

    let meetingPoints = [];
    for (const line of ligneBus) {
      for (const mp of line.pointDeRassemblements) {
        meetingPoints.push(mp);
      }
    }

    const esYoungByLine = async () => {
      let body = {
        query: {
          bool: {
            must: [{ match_all: {} }, { term: { "cohort.keyword": cohort } }, { term: { "status.keyword": "VALIDATED" } }, { terms: { "ligneId.keyword": ligneIds } }],
            must_not: [{ term: { "cohesionStayPresence.keyword": "false" } }, { term: { "departInform.keyword": "true" } }],
          },
        },
        aggs: {
          group_by_bus: {
            terms: {
              field: "ligneId.keyword",
              size: ES_NO_LIMIT,
            },
          },
        },
        track_total_hits: true,
      };

      return await getAllResults("young-having-meeting-point-in-geography", body);
    };

    const youngs = await esYoungByLine();

    let result = {};

    const bodyCenter = {
      query: {
        bool: {
          must: [{ match_all: {} }],
        },
      },
    };

    const cohesionCenters = await getAllResults("cohesioncenter", bodyCenter);
    console.log("🚀 ~ file: util.js:157 ~ exportLigneBus ~ cohesionCenters:", cohesionCenters);

    for (const young of youngs) {
      const tempYoung = {
        _id: young._id,
        cohort: young.cohort,
        firstName: young.firstName,
        lastName: young.lastName,
        email: young.email,
        phone: young.phone,
        address: young.address,
        department: young.department,
        region: young.region,
        zip: young.zip,
        city: young.city,
        birthdateAt: young.birthdateAt,
        gender: young.gender,
        parent1FirstName: young.parent1FirstName,
        parent1LastName: young.parent1LastName,
        parent1Email: young.parent1Email,
        parent1Phone: young.parent1Phone,
        parent1Status: young.parent1Status,
        parent2FirstName: young.parent2FirstName,
        parent2LastName: young.parent2LastName,
        parent2Email: young.parent2Email,
        parent2Phone: young.parent2Phone,
        parent2Status: young.parent2Status,
        statusPhase1: young.statusPhase1,
        meetingPointId: young.meetingPointId,
        ligneId: young.ligneId,
        status: young.status,
        imageRight: young.imageRight,
        youngPhase1Agreement: young.youngPhase1Agreement,
      };

      const youngMeetingPoint = meetingPoints.find((meetingPoint) => meetingPoint.meetingPointId === young.meetingPointId);
      // const youngCenter = cohesionCenters.find((center) => center._id.toString() === young.cohesionCenterId);
      const youngLigneBus = ligneBus.find((ligne) => ligne._id.toString() === young.ligneId);

      if (youngMeetingPoint) {
        if (!result[youngLigneBus.busId]) {
          result[youngLigneBus.busId] = {};
          result[youngLigneBus.busId]["youngs"] = [];
          result[youngLigneBus.busId]["ligneBus"] = [];
          result[youngLigneBus.busId]["meetingPoint"] = [];
          result[youngLigneBus.busId]["centers"] = [];
        }
        if (!result[youngLigneBus.busId]["meetingPoint"].find((meetingPoint) => meetingPoint.meetingPointId === youngMeetingPoint.meetingPointId)) {
          result[youngLigneBus.busId]["meetingPoint"].push(youngMeetingPoint);
        }
        if (!result[youngLigneBus.busId]["ligneBus"].find((ligne) => ligne._id.toString() === young.ligneId)) {
          result[youngLigneBus.busId]["ligneBus"].push(youngLigneBus);
        }
        // if (!result[youngLigneBus.busId]["centers"].find((center) => center._id.toString() === young.cohesionCenterId)) {
        //   result[youngLigneBus.busId]["centers"].push(youngCenter);
        // }
        result[youngLigneBus.busId]["youngs"].push(tempYoung);
      }
    }
    console.log("result", result);
    // Transform data into array of objects before excel converts
    const formatedRep = Object.keys(result).map((key) => {
      return {
        name: key,
        data: result[key].youngs.map((young) => {
          const meetingPoint = young.meetingPointId && result[key].meetingPoint.find((mp) => mp._id === young.meetingPointId);
          console.log("🚀 ~ file: util.js:228 ~ data:result[key].youngs.map ~ meetingPoint:", meetingPoint);
          const ligneBus = young.ligneId && result[key].ligneBus.find((lb) => lb._id === young.ligneId);
          // const center = young.meetingPointId && result[key].center.find((c) => c._id === young.cohesionCenterId);

          return {
            _id: young._id,
            Cohorte: young.cohort,
            Prénom: young.firstName,
            Nom: young.lastName,
            // "Date de naissance": formatDateFRTimezoneUTC(young.birthdateAt),
            // Sexe: translate(young.gender),
            Email: young.email,
            Téléphone: young.phone,
            // "Adresse postale": young.address,
            // "Code postal": young.zip,
            // Ville: young.city,
            Département: young.department,
            Académie: translate(young.academie),
            Région: young.region,
            // Statut: translate(young.statusPhase1),

            "Statut représentant légal 1": translate(young.parent1Status),
            "Prénom représentant légal 1": young.parent1FirstName,
            "Nom représentant légal 1": young.parent1LastName,
            "Email représentant légal 1": young.parent1Email,
            "Téléphone représentant légal 1": young.parent1Phone,

            "Statut représentant légal 2": translate(young.parent2Status),
            "Prénom représentant légal 2": young.parent2FirstName,
            "Nom représentant légal 2": young.parent2LastName,
            "Email représentant légal 2": young.parent2Email,
            "Téléphone représentant légal 2": young.parent2Phone,

            "ID centre": ligneBus.centerId,
            "Code centre": ligneBus.centerCode,
            "Nom du centre": ligneBus.centerName,
            "Adresse du centre": ligneBus.centerAddress,
            "Ville du centre": ligneBus.centerCity,
            "Département du centre": ligneBus.centerDepartment,
            "Région du centre": ligneBus.centerRegion,

            "Id du point de rassemblement": meetingPoint?.meetingPointId,
            "Nom point de rassemblement": meetingPoint?.name,
            "Adresse point de rassemblement": meetingPoint?.address,
            "Ville point de rassemblement": meetingPoint?.city,
            "Département point de rassemblement": meetingPoint?.department,
            "Région point de rassemblement": meetingPoint?.region,

            "Date aller": ligneBus.departureString,
            "Date retour": ligneBus.returnString,

            "Statut général": translate(young.status),
            "Statut phase 1": translate(young.statusPhase1),
            "Droit à l'image": translate(young.imageRight),
            "Confirmation de participation au séjour de cohésion": translate(young.youngPhase1Agreement),
          };
        }),
      };
    });

    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const wb = XLSX.utils.book_new();
    formatedRep.forEach((sheet) => {
      let ws = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 30));
    });
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const resultData = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(resultData, `Listes_volontaires_par_ligne_${dayjs().format("YYYY-MM-DD_HH[h]mm[m]ss[s]")}`);
  } catch (e) {
    console.log(e);
    toastr.error("Erreur !", translate(e.code));
  }
};

async function getAllResults(index, query) {
  const result = await API.post(`/es/${index}/export`, query);
  if (!result.data.length) return [];
  return result.data;
}
