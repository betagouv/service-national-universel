import React from "react";
import { Collapsable } from "@snu/ds/admin";
import { CohortDto } from "snu-lib";
import ExportContactConvocation from "./Inscription/ExportContactSimulation/ExportContactConvocation";
import BasculeJeuneValides from "./Inscription/BasculeJeune/BasculeJeuneValides";
import BasculeJeuneNonValides from "./Inscription/BasculeJeune/BasculeJeuneNonValides";

interface InscriptionSectionProps {
  session: CohortDto;
}

export default function InscriptionsSection({ session }: InscriptionSectionProps) {
  return (
    <Collapsable title="Inscriptions">
      <BasculeJeuneNonValides session={session} />
      <BasculeJeuneValides session={session} />
      <ExportContactConvocation session={session} />
    </Collapsable>
  );
}
