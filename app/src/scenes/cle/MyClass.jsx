import { List } from "@snu/ds/dsfr";
import { format } from "date-fns";
import React from "react";

export default function MyClass({ classe }) {
  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd MMMM yyyy");
  };

  const fields = [
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
    {
      label: "Date de séjour",
      value: formatDate(classe?.cohortData?.dateStart),
    },
  ];

  return <List title={"Ma classe engagée"} fields={fields} className="w-full" />;
}
