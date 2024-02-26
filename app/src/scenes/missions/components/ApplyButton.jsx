import React from "react";
import WithTooltip from "../../../components/WithTooltip";
import { isYoungCanApplyToPhase2Missions } from "../../../utils";
import plausibleEvent from "../../../services/plausible";
import { useSelector } from "react-redux";

const Button = ({ onClick = () => {}, disabled = false, tooltip }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <WithTooltip tooltipText={tooltip}>
        <button
          disabled={disabled}
          className={`cursor-pointer rounded-lg bg-blue-600 px-12 py-2 text-sm text-white ${disabled ? "disabled:bg-blue-600/60" : ""}`}
          onClick={onClick}>
          Candidater
        </button>
      </WithTooltip>
    </div>
  );
};

const ApplyButton = ({ setModal, disabledAge, disabledIncomplete, disabledPmRefused, scrollToBottom, isMilitaryPreparation }) => {
  const young = useSelector((state) => state.Auth.young);

  const applicationsCount = young?.phase2ApplicationStatus.filter((obj) => {
    return obj.includes("WAITING_VALIDATION" || "WAITING_VERIFICATION");
  }).length;

  const handleClick = () => {
    if (isMilitaryPreparation === "true") {
      plausibleEvent("Phase 2/CTA - PM - Candidater");
    } else {
      plausibleEvent("Phase2/CTA missions - Candidater");
    }
    setModal("APPLY");
  };

  if (["2019", "2020"].includes(young?.cohort)) {
    return <Button disabled tooltip="Le délai pour candidater est dépassé." />;
  }
  if (applicationsCount >= 15) {
    return <Button disabled tooltip="Vous ne pouvez candidater qu'à 15 missions différentes." />;
  }
  if (!isYoungCanApplyToPhase2Missions(young)) {
    return <Button disabled tooltip="Pour candidater, vous devez avoir terminé votre séjour de cohésion" />;
  }
  if (disabledAge) {
    return <Button disabled tooltip="Pour candidater, vous devez avoir plus de 16 ans (révolus le 1er jour de la Préparation militaire choisie)" />;
  }
  if (disabledPmRefused) {
    return <Button disabled tooltip="Vous n’êtes pas éligible aux préparations militaires. Vous ne pouvez pas candidater" />;
  }
  if (disabledIncomplete) {
    return <Button tooltip="Pour candidater, veuillez téléverser le dossier d’éligibilité présent en bas de page" onClick={scrollToBottom} />;
  }
  return <Button onClick={handleClick} />;
};

export default ApplyButton;
