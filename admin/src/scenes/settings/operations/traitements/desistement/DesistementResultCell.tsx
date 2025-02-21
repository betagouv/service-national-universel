import React from "react";
import { DesistementTaskDto } from "snu-lib";

export default function DesistementResultCell({ traitement }: { traitement: DesistementTaskDto }) {
  return (
    <div className="text-xs leading-4 font-normal">
      <div>Désistements préalables : {traitement.metadata?.results?.jeunesDesistes ?? "--"}</div>
      <div>Changements de séjour : {traitement.metadata?.results?.jeunesAutreSession ?? "--"}</div>
      <div>Confirmations de la participation : {traitement.metadata?.results?.jeunesConfirmes ?? "--"}</div>
      <div>Absences de confirmation : {traitement.metadata?.results?.jeunesNonConfirmes ?? "--"}</div>
      <div>Désistés par ce traitement : {traitement.metadata?.results?.jeunesModifies ?? "--"}</div>
    </div>
  );
}
