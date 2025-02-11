import React from "react";

import { SimulationBasculeJeunesValidesTaskDto } from "snu-lib";

interface BasculeJeuneValidesCellProps {
  simulation: unknown;
}

export default function BasculeJeuneValidesCell({ simulation }: BasculeJeuneValidesCellProps) {
  const simulationHts = simulation as SimulationBasculeJeunesValidesTaskDto;

  return (
    <div className="text-xs leading-4 font-normal">
      <div className="whitespace-nowrap">Prochain séjour : {simulationHts.metadata?.results?.jeunesProchainSejour ?? "--"}</div>
      <div className="whitespace-nowrap">À venir : {simulationHts.metadata?.results?.jeunesAvenir ?? "--"}</div>
    </div>
  );
}
