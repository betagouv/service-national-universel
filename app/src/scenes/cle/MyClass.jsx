import { List } from "@snu/ds/dsfr";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import React from "react";

export default function MyClass({ classe }) {
  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
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

  if (classe?.cohortDetails?.dateStart) {
    fields.push({
      label: "Date de séjour",
      value: `du ${formatDate(classe?.cohortDetails?.dateStart)} au ${formatDate(classe?.cohortDetails?.dateEnd)}`,
    });
  }

  return <List title={"Ma classe engagée"} fields={fields} className="w-full" />;
}
