import { List } from "@snu/ds/dsfr";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import React from "react";

export default function MyClass({ classe }) {
  const formatDate = (dateString, dateFormat) => {
    return format(new Date(dateString), dateFormat, { locale: fr });
  };

  const formatDateRange = (dateStart, dateEnd) => {
    const startMonth = formatDate(dateStart, "MMMM yyyy");
    const endMonth = formatDate(dateEnd, "MMMM yyyy");

    // Si le mois et l'année sont les mêmes
    if (startMonth === endMonth) {
      return `Du ${formatDate(dateStart, "dd")} au ${formatDate(dateEnd, "dd MMMM yyyy")}`;
    }
    // Si les mois sont différents
    return `Du ${formatDate(dateStart, "dd MMMM yyyy")} au ${formatDate(dateEnd, "dd MMMM yyyy")}`;
  };

  let fields = [
    {
      label: "Nom",
      value: classe?.name,
    },
    {
      label: "Coloration",
      value: classe?.coloration,
    },
    {
      label: "Établissement scolaire",
      value: classe?.etablissement?.name,
    },
  ];

  if (classe?.cohortDetails?.dateStart && classe?.cohortDetails?.dateEnd) {
    fields.push({
      label: "Date de séjour",
      value: formatDateRange(classe?.cohortDetails?.dateStart, classe?.cohortDetails?.dateEnd),
    });
  }

  return <List title={"Ma classe engagée"} fields={fields} className="w-full" />;
}
