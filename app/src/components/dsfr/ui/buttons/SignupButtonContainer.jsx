import React from "react";
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
    <div className="fixed z-10 bottom-0 left-0 mx-auto w-full bg-white py-4 px-[1rem] shadow-ninaInverted md:relative md:px-0 md:shadow-none ">
      <div className={`flex ${!collapsePrevious && "flex-col-reverse md:flex-row"} justify-center gap-2 md:justify-end items-center`}>
        {onClickPrevious && (
          <Button priority="secondary" className={`text-center ${collapsePrevious ? "!w-auto" : "sm:!w-full md:!w-auto"} `} onClick={onClickPrevious}>
            {collapsePrevious ? (
              <i className={fr.cx("fr-icon-arrow-left-s-line", "text-[var(--background-action-high-blue-france)]", "md:hidden")}></i>
            ) : (
              <p className="block w-64 md:hidden">{labelPrevious}</p>
            )}
            <p className="sm:hidden md:block">{labelPrevious}</p>
          </Button>
        )}

        {onClickNext && (
          <Button onClick={onClickNext} className={`sm:!w-full items-center justify-center bg md:!w-auto `} disabled={disabled}>
            {labelNext}
          </Button>
        )}
      </div>
      {text && <p className="md:text-right text-sm mt-3">{text}</p>}
    </div>
  );
}
