import React from "react";
import { Collapsable } from "@snu/ds/admin";

import { CohortDto } from "snu-lib";

import AffectationSimulationMetropole from "./AffectationSimulationMetropole/AffectationSimulationMetropole";

interface AffectationsSectionProps {
  session: CohortDto;
}

export default function AffectationsSection({ session }: AffectationsSectionProps) {
  return (
    <Collapsable title="Affectations">
      <AffectationSimulationMetropole session={session} />
    </Collapsable>
  );
}
