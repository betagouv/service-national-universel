import React from "react";
import { Collapsable } from "@snu/ds/admin";

import { CohortDto } from "snu-lib";

import AffectationHTSSimulationMetropole from "./AffectationSimulation/AffectationHTSSimulationMetropole";
import AffectationCLESimulationMetropole from "./AffectationSimulation/AffectationCLESimulationMetropole";
import AffectationCLESimulationDromCom from "./AffectationSimulation/AffectationCLESimulationDromCom";

interface AffectationsSectionProps {
  session: CohortDto;
}

export default function AffectationsSection({ session }: AffectationsSectionProps) {
  return (
    <Collapsable title="Affectations">
      <AffectationHTSSimulationMetropole session={session} />
      <AffectationCLESimulationMetropole session={session} />
      <AffectationCLESimulationDromCom session={session} />
    </Collapsable>
  );
}
