import React from "react";

import { SimulationBasculeJeunesValidesTaskDto } from "snu-lib";

interface BasculeJeuneCellProps {
  simulation: unknown;
}

export default function BasculeJeuneCell({ simulation }: BasculeJeuneCellProps) {
  const simulationHts = simulation as SimulationBasculeJeunesValidesTaskDto;

  return (
    <div className="text-xs leading-4 font-normal">
      <div className="whitespace-nowrap">Prochain séjour : {simulationHts.metadata?.results?.jeunesProchainSejour ?? "--"}</div>
      <div className="whitespace-nowrap">À venir : {simulationHts.metadata?.results?.jeunesAvenir ?? "--"}</div>
    </div>
  );
}
