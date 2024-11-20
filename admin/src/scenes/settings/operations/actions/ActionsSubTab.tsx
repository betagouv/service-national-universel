import React from "react";
import InscriptionsSection from "./InscriptionsSection";
import AffectationsSection from "./AffectationsSection";
import ApreSejourSection from "./ApreSejourSection";

interface ActionsSubTabProps {
  cohortId: string;
  cohortName: string;
}

export default function ActionsSubTab({ cohortId, cohortName }: ActionsSubTabProps) {
  return (
    <div className="flex flex-col gap-8">
      <InscriptionsSection cohortId={cohortId} />
      <AffectationsSection cohortId={cohortId} cohortName={cohortName} />
      <ApreSejourSection cohortId={cohortId} />
    </div>
  );
}
