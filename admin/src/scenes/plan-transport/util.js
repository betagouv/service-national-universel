import React from "react";
import Avion from "../../assets/icons/Avion";
import Bus from "../../assets/icons/Bus";
import Fusee from "../../assets/icons/Fusee";
import Train from "./ligne-bus/components/Icons/Train";

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
