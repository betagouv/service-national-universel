import useClass from "@/services/useClass";
import { List } from "@snu/ds/dsfr";
import React from "react";

export default function MyClass({ classeId }) {
  const { isPending, isError, classe, error } = useClass(classeId);

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
      value: classe?.etablissement,
    },
    {
      label: "Date de séjour",
      value: classe?.dateStart,
    },
  ];

  if (isPending) return <p className="animate-pulse">Chargement de la classe...</p>;
  if (isError) return <p>Erreur: {error.message}</p>;
  return <List title={"Ma classe engagée"} fields={fields} className="w-full p-4" />;
}
