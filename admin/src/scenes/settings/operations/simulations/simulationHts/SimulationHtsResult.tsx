import { Tooltip } from "@snu/ds/admin";
import React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";

import { SimulationAffectationHTSTaskDto } from "snu-lib";

const formatPourcentage = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};

interface SimulationsHtsResultsProps {
  simulation: unknown;
}

export default function SimulationsHtsResults({ simulation }: SimulationsHtsResultsProps) {
  const simulationHts = simulation as SimulationAffectationHTSTaskDto;

  return (
    <div className="text-xs leading-4 font-normal">
      <div>Affectés : {simulationHts.metadata?.results?.jeunesNouvellementAffected ?? "--"}</div>
      <div>En attente : {simulationHts.metadata?.results?.jeuneAttenteAffectation ?? "--"}</div>
      <div className="flex gap-1 items-center">
        <div>Performance : {simulationHts.metadata?.results?.selectedCost ? formatPourcentage(1 - simulationHts.metadata.results.selectedCost) : "--"}</div>
        <Tooltip id={`selectedCost-${simulationHts.id}`} title="Indicateur de performance de la répartition des jeunes dans les centres." className="flex items-center">
          <HiOutlineInformationCircle className="text-gray-400" size={16} />
        </Tooltip>
      </div>
    </div>
  );
}
