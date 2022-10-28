import React, { useEffect, useState } from "react";
import PencilAlt from "../../../assets/icons/PencilAlt";
import CorrectionRequest from "./CorrectionRequest";
import { SPECIFIC_SITUATIONS_KEY } from "../commons";
import Close from "../../../assets/Close";
import Plus from "../../../assets/icons/Plus";

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
  const [plusOpened, setPlusOpened] = useState(false);
  const [plusSituations, setPlusSituations] = useState([]);

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

  useEffect(() => {
    setPlusSituations(
      SPECIFIC_SITUATIONS_KEY.filter((key) => young[key] !== "true").map((key) => (
        <div
          key={key}
          onClick={(e) => addSituation(key, e)}
          className="px-[10px] py-[6px] text-[14px] text-[#1F2937] border-t-[1px] border-t[#E5E7EB] first:border-t-[0px] hover:bg-[#E5E7EB] cursor-pointer whitespace-nowrap">
          {translateSpecialSituation(key)}
        </div>
      )),
    );
  }, [young]);

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
    onChange && onChange(key, "false");
  }

  function addSituation(key, e) {
    e.stopPropagation();
    setPlusOpened(false);
    onChange && onChange(key, "true");
  }

  // --- tags
  const tags = [];
  for (const key of SPECIFIC_SITUATIONS_KEY) {
    if (young[key] === "true") {
      tags.push(
        <div className="inline-flex text-[12px] text-[#FFFFFF] leading-[22px] px-[10px] py-[1px] bg-[#3B82F6] rounded-[100px] mr-[8px] mb-[8px]" key={key}>
          {translateSpecialSituation(key)}
          {mode === "edition" && (
            <div
              className="ml-[8px] border-l-[1px] border-l-[rgba(255,255,255,0.3)] pl-[8px] text-[rgba(255,255,255,0.3)] flex items-center hover:text-[rgba(255,255,255,1)] cursor-pointer"
              onClick={() => removeSituation(key)}>
              <Close className="w-[10px] h-[10px]" />
            </div>
          )}
        </div>,
      );
    }
  }
  if (mode === "edition" && plusSituations.length > 0) {
    tags.push(
      <div
        key="__plus"
        className="relative text-[#374151] w-[24px] h-[24px] border-[1px] border-[#CECECE] rounded-[100px] flex items-center justify-center cursor-pointer hover:border-[#374151]"
        onClick={() => setPlusOpened(true)}>
        <Plus />
        {plusOpened && (
          <div className="absolute left-[50%] top-[50%] bg-[#FFFFFF] border-[#E5E7EB] border-[1px] rounded-[6px] z-10 shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)]">
            {plusSituations}
          </div>
        )}
      </div>,
    );
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
