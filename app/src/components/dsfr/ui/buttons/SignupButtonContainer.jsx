import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

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
      <hr className="mb-8 hidden h-px border-0 bg-gray-200 md:block" />
      <div className={`flex ${!collapsePrevious && "flex-col-reverse md:flex-row"} justify-center gap-2 md:justify-end`}>
        {onClickPrevious && (
          <SecondaryButton className={`${collapsePrevious ? "w-auto" : "w-full md:w-auto"} `} onClick={onClickPrevious}>
            {onClickNext && collapsePrevious ? <FiChevronLeft className="block md:hidden" /> : <p className="block w-64 md:hidden">{labelPrevious}</p>}
            <p className="hidden md:block">{labelPrevious}</p>
          </SecondaryButton>
        )}
        {onClickNext && (
          <PrimaryButton onClick={onClickNext} disabled={disabled}>
            {labelNext}
          </PrimaryButton>
        )}
      </div>
      <p className="md:text-right text-sm mt-3">{text}</p>
    </div>
  );
}
