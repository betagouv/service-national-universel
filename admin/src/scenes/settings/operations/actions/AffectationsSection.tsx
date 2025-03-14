import React from "react";
import { Collapsable } from "@snu/ds/admin";

import { CohortDto } from "snu-lib";

import AffectationHTSSimulationMetropole from "./Affectation/AffectationHTSSimulationMetropole";
import AffectationCLESimulationMetropole from "./Affectation/AffectationCLESimulationMetropole";
import AffectationCLESimulationDromCom from "./Affectation/AffectationCLESimulationDromCom";
import AffectationHTSSimulationDromCom from "./Affectation/AffectationHTSSimulationDromCom";

interface AffectationsSectionProps {
  session: CohortDto;
}

export default function AffectationsSection({ session }: AffectationsSectionProps) {
  return (
    <Collapsable title="Affectations">
      <AffectationHTSSimulationMetropole session={session} />
      <AffectationHTSSimulationDromCom session={session} />
      <AffectationCLESimulationMetropole session={session} />
      <AffectationCLESimulationDromCom session={session} />
    </Collapsable>
  );
}
