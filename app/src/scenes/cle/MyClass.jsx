import { List } from "@snu/ds/dsfr";
import { fr } from "date-fns/locale";
import { getCohortPeriod } from "snu-lib";
import React from "react";

export default function MyClass({ classe }) {
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
      value: getCohortPeriod(classe?.cohortDetails),
    });
  }

  return <List title={"Ma classe engagée"} fields={fields} className="w-full" />;
}
