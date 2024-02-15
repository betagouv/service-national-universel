import React from "react";
import WithTooltip from "../../../components/WithTooltip";
import { isYoungCanApplyToPhase2Missions } from "../../../utils";
import plausibleEvent from "../../../services/plausible";

const ApplyButton = ({ placesLeft, setModal, disabledAge, disabledIncomplete, disabledPmRefused, scrollToBottom, young, isMilitaryPreparation }) => {
  const applicationsCount = young?.phase2ApplicationStatus.filter((obj) => {
    return obj.includes("WAITING_VALIDATION" || "WAITING_VERIFICATION");
  }).length;

  if (["2019", "2020"].includes(young?.cohort)) {
    return (
      <div className="flex flex-col items-center gap-2">
        <WithTooltip tooltipText="Le délai pour candidater est dépassé.">
          <button disabled className="cursor-pointer rounded-lg bg-blue-600 px-12 py-2 text-sm text-white disabled:bg-blue-600/60">
            Candidater
          </button>
        </WithTooltip>
      </div>
    );
  }
  if (applicationsCount >= 15)
    return (
      <div className="flex flex-col items-center gap-2">
        <WithTooltip tooltipText="Vous ne pouvez candidater qu'à 15 missions différentes.">
          <button disabled className="cursor-pointer rounded-lg bg-blue-600 px-12 py-2 text-sm text-white disabled:bg-blue-600/60">
            Candidater
          </button>
        </WithTooltip>
        <div className="text-xs font-normal leading-none text-gray-500">{placesLeft} places restantes</div>
      </div>
    );

  if (!isYoungCanApplyToPhase2Missions(young))
    return (
      <div className="flex flex-col items-center gap-2">
        <WithTooltip tooltipText="Pour candidater, vous devez avoir terminé votre séjour de cohésion">
          <button disabled className="cursor-pointer rounded-lg bg-blue-600 px-12 py-2 text-sm text-white disabled:bg-blue-600/60">
            Candidater
          </button>
        </WithTooltip>
        <div className="text-xs font-normal leading-none text-gray-500">{placesLeft} places restantes</div>
      </div>
    );

  if (disabledAge)
    return (
      <div className="flex flex-col items-center gap-2">
        <WithTooltip tooltipText="Pour candidater, vous devez avoir plus de 16 ans (révolus le 1er jour de la Préparation militaire choisie)">
          <button disabled className="cursor-pointer rounded-lg bg-blue-600 px-12 py-2 text-sm text-white disabled:bg-blue-600/60">
            Candidater
          </button>
        </WithTooltip>
        <div className="text-xs font-normal leading-none text-gray-500">{placesLeft} places restantes</div>
      </div>
    );

  if (disabledPmRefused)
    return (
      <div className="flex flex-col items-center gap-2">
        <WithTooltip tooltipText="Vous n’êtes pas éligible aux préparations militaires. Vous ne pouvez pas candidater">
          <button className="cursor-pointer rounded-lg bg-blue-600/60 px-12 py-2  text-sm text-white">Candidater</button>
        </WithTooltip>
        <div className="text-xs font-normal leading-none text-gray-500">{placesLeft} places restantes</div>
      </div>
    );
  if (disabledIncomplete)
    return (
      <div className="flex flex-col items-center gap-2">
        <WithTooltip tooltipText="Pour candidater, veuillez téléverser le dossier d’éligibilité présent en bas de page">
          <button className="cursor-pointer rounded-lg bg-blue-600 px-12 py-2  text-sm text-white" onClick={() => scrollToBottom()}>
            Candidater
          </button>
        </WithTooltip>
        <div className="text-xs font-normal leading-none text-gray-500">{placesLeft} places restantes</div>
      </div>
    );

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        className="cursor-pointer rounded-lg bg-blue-600 px-12 py-2 text-sm text-white "
        onClick={() => {
          if (isMilitaryPreparation === "true") {
            plausibleEvent("Phase 2/CTA - PM - Candidater");
          } else {
            plausibleEvent("Phase2/CTA missions - Candidater");
          }
          setModal("APPLY");
        }}>
        Candidater
      </button>
      <div className="text-xs font-normal leading-none text-gray-500">{placesLeft} places restantes</div>
    </div>
  );
};

export default ApplyButton;
