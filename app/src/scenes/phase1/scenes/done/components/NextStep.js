import React from "react";
import ButtonLinkPrimary from "../../../../../components/ui/buttons/ButtonLinkPrimary";
import plausibleEvent from "../../../../../services/plausible";

export default function NextStep() {
  return (
    <div className="mx-4 mb-4 flex flex-col items-center justify-between gap-4 rounded-xl bg-gray-100 p-[1rem] md:flex-row md:bg-white md:p-[2rem] md:shadow-ninaBlock">
      <p className="text-center text-xl font-bold leading-7 md:hidden">
        Et maintenant, votre parcours d’engagement se poursuit désormais avec la phase 2, la mission d’intérêt général
      </p>
      <p className="hidden text-left text-xl font-bold leading-7 md:block md:w-2/3">
        Et maintenant, votre parcours d’engagement se poursuit désormais avec la phase 2, la mission d’intérêt général
      </p>
      <ButtonLinkPrimary
        to="/phase2"
        className="shadow-ninaBlue"
        onClick={() => {
          plausibleEvent("Phase 2/CTA - Realiser ma mission");
        }}>
        Je trouve une mission d’intérêt général
      </ButtonLinkPrimary>
    </div>
  );
}
