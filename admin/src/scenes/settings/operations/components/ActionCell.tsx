import React from "react";
import { Link } from "react-router-dom";
import { CohortDto, formatLongDateFR, getZonedDate, Phase1HTSTaskDto, TaskName, translate, translateSimulationName } from "snu-lib";

interface ActionCellProps {
  session: CohortDto;
  simulation: Phase1HTSTaskDto;
}

const DotSeparator = () => (
  <svg width="4" height="4" viewBox="0 0 4 4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2 0.196122C2.812 0.196122 3.484 0.868122 3.484 1.68012C3.484 2.50612 2.812 3.17812 2 3.17812C1.174 3.17812 0.502 2.50612 0.502 1.68012C0.502 0.868122 1.174 0.196122 2 0.196122Z"
      fill="#6B7280"
    />
  </svg>
);

export default function ActionCell({ session, simulation }: ActionCellProps) {
  let simulationLink: string | null = null;
  if (simulation.metadata?.parameters?.simulationTaskId) {
    let actionName = "";
    switch (simulation.name) {
      case TaskName.AFFECTATION_HTS_SIMULATION_VALIDER:
        actionName = TaskName.AFFECTATION_HTS_SIMULATION;
        break;
      case TaskName.AFFECTATION_HTS_DROMCOM_SIMULATION_VALIDER:
        actionName = TaskName.AFFECTATION_HTS_SIMULATION;
        break;
      case TaskName.AFFECTATION_CLE_SIMULATION_VALIDER:
        actionName = TaskName.AFFECTATION_CLE_SIMULATION;
        break;
      case TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION_VALIDER:
        actionName = TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION;
        break;
      case TaskName.BACULE_JEUNES_VALIDES_SIMULATION_VALIDER:
        actionName = TaskName.BACULE_JEUNES_VALIDES_SIMULATION;
        break;
      case TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION:
        actionName = TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION;
        break;
      case TaskName.DESISTEMENT_POST_AFFECTATION_VALIDER:
        actionName = TaskName.DESISTEMENT_POST_AFFECTATION_SIMULATION;
        break;
    }
    if (actionName) {
      simulationLink = `?tab=simulations&cohort=${session.name}&action=${actionName}&id=${simulation.metadata.parameters.simulationTaskId}`;
    }
  }
  return (
    <div>
      <div className="text-[16px] font-bold">{translateSimulationName(simulation.name)}</div>
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-500 leading-5 font-normal">{formatLongDateFR(getZonedDate(simulation.createdAt))}</div>
        <DotSeparator />
        <div className="text-sm leading-5 font-bold text-gray-500">
          {simulation.metadata?.parameters?.auteur?.prenom} {simulation.metadata?.parameters?.auteur?.nom?.toUpperCase()} (
          {translate(simulation.metadata?.parameters?.auteur?.role)})
        </div>
        {simulationLink && (
          <>
            <DotSeparator />
            <Link to={simulationLink}>voir la simulation</Link>
          </>
        )}
      </div>
    </div>
  );
}
