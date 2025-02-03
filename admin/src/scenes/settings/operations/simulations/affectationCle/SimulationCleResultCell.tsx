import React from "react";

import { SimulationAffectationCLETaskDto } from "snu-lib";

interface SimulationCleResultCellProps {
  simulation: unknown;
}

export default function SimulationCleResultCell({ simulation }: SimulationCleResultCellProps) {
  const simulationCle = simulation as SimulationAffectationCLETaskDto;

  return (
    <div className="text-xs leading-4 font-normal">
      <div>Classes : {simulationCle.metadata?.results?.classes ?? "--"}</div>
      <div>Erreurs : {simulationCle.metadata?.results?.erreurs ?? "--"}</div>
      <div>Affectés : {simulationCle.metadata?.results?.jeunesAffected ?? "--"}</div>
    </div>
  );
}
