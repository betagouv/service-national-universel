import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import React from "react";
import EngagementPrograms from "../preinscription/components/EngagementPrograms";

export default function ReinscriptionClosed() {
  return (
    <DSFRContainer title="Vous n’avez pas réalisé le séjour de cohésion 🥲">
      <EngagementPrograms />
    </DSFRContainer>
  );
}
