import React, { useEffect, useState } from "react";
import PencilAlt from "../../../assets/icons/PencilAlt";
import CorrectionRequest from "./CorrectionRequest";

const SITUATIONS_KEY = [
  "qpv",
  "handicap",
  "ppsBeneficiary",
  "paiBeneficiary",
  "specificAmenagment",
  "reducedMobilityAccess",
  "handicapInSameDepartment",
  "allergies",
  "highSkilledActivity",
  "highSkilledActivityType",
  "highSkilledActivityInSameDepartment",
  "highSkilledActivityProofFiles",
];

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
}) {
  const [mouseIn, setMouseIn] = useState(false);
  const [opened, setOpened] = useState(false);
  const [hasValidRequest, setHasValidRequest] = useState(false);
  const [requestButtonClass, setRequestButtonClass] = useState("");

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

  const tags = [];
  for (const key of SITUATIONS_KEY) {
    if (young[key] === "true") {
      tags.push(
        <div className="inline-block text-[12px] text-[#FFFFFF] leading-[22px] px-[10px] py-[1px] bg-[#3B82F6] rounded-[100px] mr-[8px] mb-[8px]" key={key}>
          {translateSpecialSituation(key)}
        </div>,
      );
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
      {opened && <CorrectionRequest name={name} label={label} correctionRequest={correctionRequest} onChangeRequest={onCorrectionRequestChange} />}
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
