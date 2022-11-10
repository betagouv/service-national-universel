import React, { useEffect, useState } from "react";
import PencilAlt from "../../../assets/icons/PencilAlt";
import CorrectionRequest from "./CorrectionRequest";
import { SPECIFIC_SITUATIONS_KEY } from "../commons";
import Minus from "../../../assets/icons/Minus";
import ConfirmationModal from "./ConfirmationModal";
import CorrectedRequest from "./CorrectedRequest";

/**
 * mode: could be "correction|edition|readonly" (par défaut readonly)
 */
export default function FieldSituationsParticulieres({
  group = null,
  name,
  label,
  young,
  mode,
  className = "",
  onStartRequest,
  currentRequest,
  correctionRequest,
  onCorrectionRequestChange,
  onChange,
}) {
  const [mouseIn, setMouseIn] = useState(false);
  const [opened, setOpened] = useState(false);
  const [hasValidRequest, setHasValidRequest] = useState(false);
  const [requestButtonClass, setRequestButtonClass] = useState("");
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    setOpened(currentRequest === name);
  }, [currentRequest]);

  useEffect(() => {
    setHasValidRequest(correctionRequest ? correctionRequest.status !== "CANCELED" : false);
  }, [correctionRequest]);

  useEffect(() => {
    if (group) {
      setMouseIn(group.hover === true);
    }
  }, [group]);

  useEffect(() => {
    setRequestButtonClass(
      `absolute top-[11px] right-[11px] p-[9px] rounded-[100px] cursor-pointer group ${
        hasValidRequest ? "bg-[#F97316]" : "bg-[#FFEDD5] " + (mouseIn ? "block" : "hidden")
      } hover:bg-[#F97316]`,
    );
  }, [mouseIn, hasValidRequest]);

  function startRequest() {
    if (group === null || group === undefined) {
      setOpened(true);
    }
    onStartRequest && onStartRequest(name);
  }

  function mouseOver(mousein) {
    if (group === null || group === undefined) {
      setMouseIn(mousein);
    }
  }

  function removeSituation(key) {
    setConfirmModal({
      title: "Supprimer une situation particulière",
      message: `Vous êtes sur le point de supprimer "${translateSpecialSituation(key)}".`,
      confirmLabel: "Supprimer",
      confirmColor: "red",
      confirm: () => confirmRemoveSituation(key),
    });
  }

  function confirmRemoveSituation(key) {
    setConfirmModal(null);
    onChange && onChange(key, "false");
  }

  function addSituation(key) {
    onChange && onChange(key, "true");
  }

  // --- tags
  const tags = [];
  for (const key of SPECIFIC_SITUATIONS_KEY) {
    if (young[key] === "true") {
      tags.push(
        <div className="inline-flex mr-[8px] mb-[8px]" key={key}>
          <div className="text-[12px] text-[#FFFFFF] leading-[22px] px-[10px] py-[1px] bg-[#3B82F6] rounded-[100px]">{translateSpecialSituation(key)}</div>
          {mode === "edition" && (
            <div
              className="ml-[8px] border-[1px] border-[#CECECE] rounded-[100px] py-[8px] px-[6px] text-[#CECECE] flex items-center hover:text-[#3B82F6] hover:border-[#3B82F6] cursor-pointer"
              onClick={() => removeSituation(key)}>
              <Minus />
            </div>
          )}
        </div>,
      );
    }
  }
  if (mode === "edition") {
    for (const key of SPECIFIC_SITUATIONS_KEY) {
      if (young[key] !== "true" && !["qpv"].includes(key)) {
        tags.push(
          <div className="inline-flex mr-[8px] mb-[8px]" key={key}>
            <div
              className="text-[12px] text-[#374151] leading-[22px] px-[10px] py-[1px] bg-[#F3F4F6] rounded-[100px] cursor-pointer border-[transparent] border-[1px] hover:border-[#374151]"
              onClick={() => addSituation(key)}>
              {translateSpecialSituation(key)}
            </div>
          </div>,
        );
      }
    }
  }

  return (
    <div className={className}>
      <div className="relative py-[9px] px-[13px]" key={name} onMouseEnter={() => mouseOver(true)} onMouseLeave={() => mouseOver(false)}>
        <div className="pr-[36px]">{tags}</div>
        {mode === "correction" && (
          <div className={requestButtonClass} onClick={startRequest}>
            <PencilAlt className={`w-[14px] h-[14px]  ${hasValidRequest ? "text-white" : "text-[#F97316]"} group-hover:text-white`} />
          </div>
        )}
      </div>
      {correctionRequest && correctionRequest.status === "CORRECTED" && <CorrectedRequest correctionRequest={correctionRequest} young={young} />}
      {opened && <CorrectionRequest name={name} label={label} correctionRequest={correctionRequest} onChangeRequest={onCorrectionRequestChange} />}
      {confirmModal && (
        <ConfirmationModal
          isOpen={true}
          icon={confirmModal.icon}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmLabel || "Confirmer"}
          confirmMode={confirmModal.confirmColor || "blue"}
          onCancel={() => setConfirmModal(null)}
          onConfirm={confirmModal.confirm}
        />
      )}
    </div>
  );
}

function translateSpecialSituation(key) {
  switch (key) {
    case "qpv":
      return "Quartier Prioritaire de la ville";
    case "handicap":
      return "Handicap";
    case "ppsBeneficiary":
      return "PPS";
    case "paiBeneficiary":
      return "PAI";
    case "specificAmenagment":
      return "Aménagement spécifique";
    case "specificAmenagmentType":
      return "Nature de l'aménagement spécifique";
    case "reducedMobilityAccess":
      return "Aménagement pour mobilité réduite";
    case "handicapInSameDepartment":
      return "Besoin d'être affecté(e) dans le département de résidence";
    case "allergies":
      return "Allergies ou intolérances alimentaires";
    case "highSkilledActivity":
      return "Activité de haut-niveau";
    case "highSkilledActivityType":
      return "Nature de l'activité de haut-niveau";
    case "highSkilledActivityInSameDepartment":
      return "Activités de haut niveau nécessitant d'être affecté dans le département de résidence";
    case "highSkilledActivityProofFiles":
      return "Document activité de haut-niveau";
    default:
      return key;
  }
}
