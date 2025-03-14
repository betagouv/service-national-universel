import CampagneSpecifique from "@/scenes/planMarketing/campagne/CampagneSpecifique";
import React from "react";
import { CohortType } from "snu-lib";

interface MarketingTabProps {
  session: CohortType;
}

export default function MarketingTab({ session }: MarketingTabProps) {
  return <CampagneSpecifique session={session} />;
}
