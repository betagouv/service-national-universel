import React from "react";
import { Collapsable } from "@snu/ds/admin";
import { CohortDto } from "snu-lib";
import ContactSimulation from "./ContactSimulation/contactSimulation";
import BasculeJeuneValides from "./BasculeJeune/BasculeJeuneValides";
import BasculeJeuneNonValides from "./BasculeJeune/BasculeJeuneNonValides";

interface InscriptionSectionProps {
  session: CohortDto;
}

export default function InscriptionsSection({ session }: InscriptionSectionProps) {
  return (
    <Collapsable title="Inscriptions">
      <BasculeJeuneNonValides session={session} />
      <BasculeJeuneValides session={session} />
      <ContactSimulation session={session} />
    </Collapsable>
  );
}
