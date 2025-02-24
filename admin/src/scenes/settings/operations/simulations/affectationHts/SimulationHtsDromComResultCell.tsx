import React from "react";

import { SimulationAffectationHTSDromComTaskDto } from "snu-lib";

interface SimulationHtsDromComResultCellProps {
  simulation: unknown;
}

export default function SimulationHtsDromComResultCell({ simulation }: SimulationHtsDromComResultCellProps) {
  const simulationHts = simulation as SimulationAffectationHTSDromComTaskDto;

  return (
    <div className="text-xs leading-4 font-normal">
      <div className="whitespace-nowrap">Affectés : {simulationHts.metadata?.results?.jeunesNouvellementAffected ?? "--"}</div>
      <div className="whitespace-nowrap">En attente : {simulationHts.metadata?.results?.jeuneAttenteAffectation ?? "--"}</div>
    </div>
  );
}
