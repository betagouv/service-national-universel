import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";

type OwnProps = {
  onClickNext: React.MouseEventHandler<HTMLButtonElement>;
  onClickPrevious: React.MouseEventHandler<HTMLButtonElement>;
  labelNext: string;
  labelPrevious: string;
  disabled: boolean;
  collapsePrevious: boolean;
  text: string;
};

export default function SignupButtons({
  onClickNext,
  onClickPrevious,
  labelNext = "Continuer",
  labelPrevious = "Précédent",
  disabled = false,
  collapsePrevious = false,
  text = "",
}: OwnProps) {
  return (
    <div className="fixed sm:z-10 md:z-auto bottom-0 left-0 mx-auto w-full bg-white py-[1rem] px-[1rem] shadow-ninaInverted md:relative md:px-0 md:shadow-none ">
      <div
        className={`flex ${
          !collapsePrevious && "flex-col-reverse md:flex-row"
        } justify-center gap-2 md:justify-end items-center`}
      >
        {onClickPrevious && (
          <Button
            priority="secondary"
            className={`justify-center ${
              collapsePrevious ? "!w-auto" : "sm:!w-full md:!w-auto"
            } `}
            onClick={onClickPrevious}
          >
            {collapsePrevious ? (
              <i
                className={`${fr.cx(
                  "fr-icon-arrow-left-s-line",
                )} text-[var(--background-action-high-blue-france)] md:hidden`}
              ></i>
            ) : (
              <span className="block w-64 md:hidden">{labelPrevious}</span>
            )}
            <span className="sm:hidden md:block">{labelPrevious}</span>
          </Button>
        )}

        {onClickNext && (
          <Button
            onClick={onClickNext}
            className={`sm:!w-full items-center justify-center bg md:!w-auto `}
            disabled={disabled}
          >
            {labelNext}
          </Button>
        )}
      </div>
      {text && (
        <div className="flex text-center justify-center md:justify-end mt-2">
          <p className="reset text-sm">{text}</p>
        </div>
      )}
    </div>
  );
}
