import React from "react";
import { DesistementTaskDto } from "snu-lib";

export default function DesistementResultCell({ traitement }: { traitement: unknown }) {
  const desistementTask = traitement as DesistementTaskDto;
  return (
    <div className="text-xs leading-4">
      <p>Désistements préalables : {desistementTask.metadata?.results?.jeunesDesistes ?? "--"}</p>
      <p>Changements de séjour : {desistementTask.metadata?.results?.jeunesAutreSession ?? "--"}</p>
      <p>Confirmations de la participation : {desistementTask.metadata?.results?.jeunesConfirmes ?? "--"}</p>
      <p>Désistés par ce traitement : {desistementTask.metadata?.results?.jeunesModifies ?? "--"}</p>
    </div>
  );
}
