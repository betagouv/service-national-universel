import React from "react";

import { ValiderAffectationHTSTaskDto } from "snu-lib";

interface AffectationResultCellProps {
  simulation: unknown;
}

export default function AffectationResultCell({ simulation }: AffectationResultCellProps) {
  const simulationHts = simulation as ValiderAffectationHTSTaskDto;

  return (
    <div className="text-xs leading-4 font-normal">
      <div>Affectés : {simulationHts.metadata?.results?.jeunesAffected ?? "--"}</div>
      <div>En erreur : {simulationHts.metadata?.results?.errors ?? "--"}</div>
    </div>
  );
}
