import React from "react";
import ButtonLinkPrimary from "../../../../../components/ui/buttons/ButtonLinkPrimary";
import plausibleEvent from "../../../../../services/plausible";

export default function NextStep() {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 items-center rounded-xl bg-gray-100 md:bg-white mx-4 mb-4 p-[1rem] md:p-[2rem] md:shadow-ninaBlock">
      <p className="w-full md:w-2/3 text-left text-xl leading-7 font-bold">
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
