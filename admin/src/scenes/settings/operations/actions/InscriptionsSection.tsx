import React from "react";
import { Collapsable } from "@snu/ds/admin";
import { CohortDto } from "snu-lib";
import BasculeJeuneValides from "./BasculeJeune/BasculeJeuneValides";
import BasculeJeuneNonValides from "./BasculeJeune/BasculeJeuneNonValides";

interface InscriptionsSectionProps {
  session: CohortDto;
}

export default function InscriptionsSection({ session }: InscriptionsSectionProps) {
  return (
    <Collapsable title="Inscriptions">
      <BasculeJeuneNonValides session={session} />
      <BasculeJeuneValides session={session} />
    </Collapsable>
  );
}
