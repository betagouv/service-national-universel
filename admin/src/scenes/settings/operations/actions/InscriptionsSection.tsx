import React from "react";
import { Collapsable } from "@snu/ds/admin";

import { CohortDto } from "snu-lib";

import ContactSimulation from "./ContactSimulation/contactSimulation";

interface InscriptionSectionProps {
  session: CohortDto;
}

export default function InscriptionsSection({ session }: InscriptionSectionProps) {
  console.log(session);
  return (
    <Collapsable open={true} title="Inscriptions">
      <ContactSimulation session={session} />
    </Collapsable>
  );
}
