import React from "react";

import { ValiderBasculeJeunesValidesTaskDto } from "snu-lib";

interface BasculeJeuneValidesResultCellProps {
  simulation: unknown;
}

export default function BasculeJeuneValidesResultCell({ simulation }: BasculeJeuneValidesResultCellProps) {
  const simulationHts = simulation as ValiderBasculeJeunesValidesTaskDto;

  return (
    <div className="text-xs leading-4 font-normal">
      <div>Basculés : {simulationHts.metadata?.results?.jeunesBascules ?? "--"}</div>
      <div>En erreur : {simulationHts.metadata?.results?.errors ?? "--"}</div>
    </div>
  );
}
