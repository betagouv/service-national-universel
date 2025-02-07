import React from "react";
import { Collapsable } from "@snu/ds/admin";
import { CohortDto } from "snu-lib";
import BasculeJeuneValides from "./BasculeJeuneValides/BasculeJeuneValides";

interface InscriptionsSectionProps {
  session: CohortDto;
}

export default function InscriptionsSection({ session }: InscriptionsSectionProps) {
  return (
    <Collapsable title="Inscriptions">
      <BasculeJeuneValides session={session} />
    </Collapsable>
  );
}
