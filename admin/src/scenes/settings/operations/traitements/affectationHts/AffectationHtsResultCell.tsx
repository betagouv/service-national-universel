import React from "react";

import { ValiderAffectationHTSTaskDto } from "snu-lib";

interface AffectationHtsResultCellProps {
  simulation: unknown;
}

export default function AffectationHtsResultCell({ simulation }: AffectationHtsResultCellProps) {
  const simulationHts = simulation as ValiderAffectationHTSTaskDto;

  return (
    <div className="text-xs leading-4 font-normal">
      <div>Affectés : {simulationHts.metadata?.results?.jeunesAffected ?? "--"}</div>
      <div>En erreur : {simulationHts.metadata?.results?.errors ?? "--"}</div>
    </div>
  );
}
