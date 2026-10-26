import React from "react";
import ButtonLinkPrimary from "../../../../../components/ui/buttons/ButtonLinkPrimary";

export default function NextStep() {
  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-gray-100 p-[1rem] md:flex-row md:bg-white md:p-[2rem] md:shadow-ninaBlock">
      <p className="text-center text-xl font-bold leading-7 md:hidden">Votre parcours au sein du SNU se poursuit avec la phase engagement</p>
      <p className="hidden text-left text-xl font-bold leading-7 md:block md:w-2/3">Votre parcours au sein du SNU se poursuit avec la phase engagement</p>
      <ButtonLinkPrimary to="/phase2" className="shadow-ninaBlue">
        Poursuivre mon engagement
      </ButtonLinkPrimary>
    </div>
  );
}
