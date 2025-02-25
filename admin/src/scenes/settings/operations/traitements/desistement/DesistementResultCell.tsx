import React from "react";
import { DesistementTaskDto } from "snu-lib";

export default function DesistementResultCell({ traitement }: { traitement: DesistementTaskDto }) {
  return (
    <div className="text-xs leading-4">
      <p>Désistements préalables : {traitement.metadata?.results?.jeunesDesistes ?? "--"}</p>
      <p>Changements de séjour : {traitement.metadata?.results?.jeunesAutreSession ?? "--"}</p>
      <p>Confirmations de la participation : {traitement.metadata?.results?.jeunesConfirmes ?? "--"}</p>
      <p>Désistés par ce traitement : {traitement.metadata?.results?.jeunesModifies ?? "--"}</p>
    </div>
  );
}
