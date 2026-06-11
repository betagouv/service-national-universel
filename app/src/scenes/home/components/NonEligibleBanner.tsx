import React from "react";
import { FeatureFlagName, shouldDisplayNonEligibleBanner } from "snu-lib";
import Notice from "@/components/ui/alerts/Notice";
import useAuth from "@/services/useAuth";
import useCohort from "@/services/useCohort";

export default function NonEligibleBanner() {
  const { young } = useAuth();
  const { cohort } = useCohort();

  if (!young?.featureFlags?.[FeatureFlagName.BANDEAU_CONSENTEMENT_NON_ELIGIBLES]) return null;
  if (!shouldDisplayNonEligibleBanner(young, cohort)) return null;

  return (
    <div className="mx-auto max-w-7xl px-[1rem] pt-[1rem] md:px-[4rem] md:pt-[2rem]">
      <Notice>
        <span className="font-bold">Information&nbsp;:</span> en raison de la fermeture fin 2026 de la plateforme SNU, vous allez être destinataire ce mois-ci d’un mail destiné à
        recueillir votre accord pour recevoir d’autres communications ministérielles relatives à l’engagement civique. Conformément au règlement général de protection des données,
        vous êtes libre de refuser ou d’accepter de recevoir d’autres campagnes hors SNU.
      </Notice>
    </div>
  );
}
