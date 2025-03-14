import CampagneSpecifique from "@/scenes/planMarketing/campagne/CampagneSpecifique";
import React from "react";
import { CohortDto } from "snu-lib";

interface MarketingTabProps {
  session: CohortDto;
}

export default function MarketingTab({ session }: MarketingTabProps) {
  return <CampagneSpecifique sessionId={session._id!} />;
}
