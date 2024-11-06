import React from "react";

interface Props {
  currentStep: number;
  stepCount: number;
  title: string;
  nextTitle?: string;
}

// see: https://www.systeme-de-design.gouv.fr/composants-et-modeles/composants/indicateur-d-etapes/
function Stepper({ currentStep, stepCount, title, nextTitle }: Props) {
  if (!currentStep) return null;

  return (
    <div className="fr-stepper">
      <h2 className="fr-stepper__title">
        {title}
        <span className="fr-stepper__state">
          Étape {currentStep} sur {stepCount}
        </span>
      </h2>
      <div className="fr-stepper__steps" data-fr-current-step={currentStep} data-fr-steps={stepCount}></div>
      {nextTitle && (
        <p className="fr-stepper__details">
          <span className="fr-text--bold">Étape suivante :</span> {nextTitle}
        </p>
      )}
    </div>
  );
}

export default Stepper;
