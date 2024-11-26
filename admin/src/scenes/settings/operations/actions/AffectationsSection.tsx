import React from "react";
import { Collapsable } from "@snu/ds/admin";

import AffectationSimulationMetropole from "./AffectationSimulationMetropole/AffectationSimulationMetropole";

interface AffectationsSectionProps {
  sessionId: string;
  sessionNom: string;
}

export default function AffectationsSection({ sessionId, sessionNom }: AffectationsSectionProps) {
  return (
    <Collapsable title="Affectations">
      <AffectationSimulationMetropole sessionId={sessionId} sessionNom={sessionNom} />
    </Collapsable>
  );
}
