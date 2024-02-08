import { List } from "@snu/ds/dsfr";
import React from "react";

export default function MyClass({ classe }) {
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
      value: classe?.dateStart,
    },
  ];

  return <List title={"Ma classe engagée"} fields={fields} className="w-full" />;
}
