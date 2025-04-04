import React from "react";

import { CohortDto } from "snu-lib";

import InscriptionsSection from "./InscriptionsSection";
import AffectationsSection from "./AffectationsSection";
import ApreSejourSection from "./ApreSejourSection";
import DesistementSection from "./DesistementSection";

interface ActionsSubTabProps {
  session: CohortDto;
}

export default function ActionsSubTab({ session }: ActionsSubTabProps) {
  return (
    <div className="flex flex-col gap-8">
      <InscriptionsSection session={session} />
      <AffectationsSection session={session} />
      <DesistementSection session={session} />
      <ApreSejourSection sessionId={session._id!} />
    </div>
  );
}
