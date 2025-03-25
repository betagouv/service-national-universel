import { Collapsable } from "@snu/ds/admin";
import React from "react";
import { CohortDto } from "snu-lib";
import Desistement from "./Desistement/SimulationDesistement";

export default function DesistementSection({ session }: { session: CohortDto }) {
  return (
    <Collapsable open={true} title="Désistements">
      <Desistement session={session} />
    </Collapsable>
  );
}
