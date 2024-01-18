import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import { Button } from "@snu/ds/dsfr";
import { fr } from "@codegouvfr/react-dsfr";

export default function SignupButtonContainer({
  onClickNext,
  onClickPrevious,
  labelNext = "Continuer",
  labelPrevious = "Précédent",
  disabled = false,
  collapsePrevious = false,
  text = "",
}) {
  return (
    <div className="fixed bottom-0 left-0 mx-auto w-full bg-white py-4 px-[1rem] shadow-ninaInverted md:relative md:px-0 md:shadow-none ">
      <hr className="mb-8 md:block" />
      <div className={`flex ${!collapsePrevious && "flex-col-reverse md:flex-row"} justify-center gap-2 md:justify-end items-center`}>
        {onClickPrevious && (
          <Button
            priority="secondary"
            iconId={onClickNext && collapsePrevious && fr.cx("fr-icon-arrow-left-s-line")}
            className={`${collapsePrevious ? "w-auto" : "w-full md:w-auto"} `}
            onClick={onClickPrevious}>
            <p className="block w-64 md:hidden">{labelPrevious}</p>
            <p className="hidden md:block">{labelPrevious}</p>
          </Button>
        )}
        {onClickNext && (
          <Button onClick={onClickNext} disabled={disabled}>
            {labelNext}
          </Button>
        )}
      </div>
      {text && <p className="md:text-right text-sm mt-3">{text}</p>}
    </div>
  );
}
