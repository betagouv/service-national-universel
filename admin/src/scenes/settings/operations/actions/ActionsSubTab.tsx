import React from "react";
import InscriptionsSection from "./InscriptionsSection";
import AffectationsSection from "./AffectationsSection";
import ApreSejourSection from "./ApreSejourSection";

interface ActionsSubTabProps {
  sessionId: string;
  sessionNom: string;
}

export default function ActionsSubTab({ sessionId, sessionNom }: ActionsSubTabProps) {
  return (
    <div className="flex flex-col gap-8">
      <InscriptionsSection sessionId={sessionId} />
      <AffectationsSection sessionId={sessionId} sessionNom={sessionNom} />
      <ApreSejourSection sessionId={sessionId} />
    </div>
  );
}
