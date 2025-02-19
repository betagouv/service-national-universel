import { Collapsable } from "@snu/ds/admin";
import React from "react";
import { CohortDto } from "snu-lib";
import DesistementMetropole from "./Desistement/DesistementMetropole";

export default function DesistementSection({ session }: { session: CohortDto }) {
  return (
    <Collapsable open={true} title="Désistements">
      <DesistementMetropole session={session} />
    </Collapsable>
  );
}
