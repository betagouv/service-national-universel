import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import React from "react";
import EngagementPrograms from "../preinscription/components/EngagementPrograms";

export default function ReinscriptionClosed() {
  return (
    <DSFRContainer title="Vous n’avez pas validé votre séjour de cohésion 🥲">
      <p>🙌 Bonne nouvelle, vous pourrez bientôt vous positionner sur un nouveau séjour si vous êtes éligible.</p>
      <p>📮 Un email vous sera envoyé lors de l’ouverture des prochaines inscriptions.</p>
      <p>À très vite,</p>
      <p>Les équipes du Service National Universel.</p>
      <hr />
      <EngagementPrograms />
    </DSFRContainer>
  );
}
