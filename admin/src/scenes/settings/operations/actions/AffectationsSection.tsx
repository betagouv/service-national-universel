import React from "react";
import { Collapsable } from "@snu/ds/admin";

import AffectationSimulationMetropole from "./AffectationSimulationMetropole";

interface AffectationsSectionProps {
  cohortId: string;
  cohortName: string;
}

export default function AffectationsSection({ cohortId, cohortName }: AffectationsSectionProps) {
  return (
    <Collapsable title="Affectations">
      <AffectationSimulationMetropole cohortId={cohortId} cohortName={cohortName} />
    </Collapsable>
  );
}
