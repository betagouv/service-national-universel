import React from "react";

import { ValiderBasculerJeunesValidesTaskDto } from "snu-lib";

interface BasculeJeuneValidesResultCellProps {
  simulation: unknown;
}

export default function BasculeJeuneValidesResultCell({ simulation }: BasculeJeuneValidesResultCellProps) {
  const simulationHts = simulation as ValiderBasculerJeunesValidesTaskDto;

  return (
    <div className="text-xs leading-4 font-normal">
      <div>Basculés : {simulationHts.metadata?.results?.jeunesBascules ?? "--"}</div>
      <div>Refusés : {simulationHts.metadata?.results?.jeunesRefuses ?? "--"}</div>
      <div>En erreur : {simulationHts.metadata?.results?.errors ?? "--"}</div>
    </div>
  );
}
