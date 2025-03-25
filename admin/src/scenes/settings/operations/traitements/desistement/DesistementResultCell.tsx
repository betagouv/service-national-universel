import React from "react";
import { DesistementValiderTaskDto } from "snu-lib";

export default function DesistementResultCell({ traitement }: { traitement: unknown }) {
  const desistementTask = traitement as DesistementValiderTaskDto;
  const nombreErreur =
    (desistementTask.metadata?.results?.jeunesConfirmes ?? 0) +
    (desistementTask.metadata?.results?.jeunesDesistes ?? 0) +
    (desistementTask.metadata?.results?.jeunesAutreSession ?? 0);

  return (
    <div className="text-xs leading-4">
      <p>Désistés: {desistementTask.metadata?.results?.jeunesModifies ?? "--"}</p>
      <p>Erreurs: {nombreErreur}</p>
    </div>
  );
}
