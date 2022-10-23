import React, { useEffect, useState } from "react";
import PencilAlt from "../../../assets/icons/PencilAlt";
import { MiniTitle } from "./commons";
import Bin from "../../../assets/Bin";

/**
 *
 * @param name
 * @param label
 * @param value
 * @param mode  could be "correction|edition|readonly" (par défaut readonly)
 * @param onChange
 * @param className
 * @returns {JSX.Element}
 * @constructor
 */
export default function Field({ name, label, value, mode, className = "", onStartRequest, currentRequest, correctionRequest, onCorrectionRequestChange }) {
  const [mouseIn, setMouseIn] = useState(false);
  const [opened, setOpened] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [hasValidRequest, setHasValidRequest] = useState(false);

  useEffect(() => {
    setOpened(currentRequest === name);
  }, [currentRequest]);

  useEffect(() => {
    setHasValidRequest(correctionRequest ? correctionRequest.status !== "CANCELED" : false);
    if (hasValidRequest) {
      setRequestText(correctionRequest.message);
    } else {
      setRequestText("");
    }
  }, [correctionRequest]);

  function startRequest() {
    setOpened(true);
    onStartRequest && onStartRequest(name);
  }

  function onChangeRequestText(event) {
    onCorrectionRequestChange && onCorrectionRequestChange(name, event.target.value);
  }

  function deleteRequest() {
    onCorrectionRequestChange && onCorrectionRequestChange(name, null);
  }

  return (
    <>
      <div
        className={`relative bg-white py-[9px] px-[13px] border-[#D1D5DB] border-[1px] rounded-[6px] ${className}`}
        key={name}
        onMouseEnter={() => setMouseIn(true)}
        onMouseLeave={() => setMouseIn(false)}>
        <label className="font-normal text-[12px] leading-[16px] text-[#6B7280]">{label}</label>
        <div className="font-normal text-[14px] leading-[20px] text-[#1F2937]">{value}</div>
        {mode === "correction" && (
          <div
            className={`absolute top-[11px] right-[11px] p-[9px] rounded-[100px] cursor-pointer group ${
              hasValidRequest ? "bg-[#F97316]" : "bg-[#FFEDD5] " + (mouseIn ? "block" : "hidden")
            } hover:bg-[#F97316]`}
            onClick={startRequest}>
            {hasValidRequest}
            <PencilAlt className={`w-[14px] h-[14px]  ${hasValidRequest ? "text-white" : "text-[#F97316]"} group-hover:text-white`} />
          </div>
        )}
      </div>
      {opened && (
        <div className="p-[24px] bg-[#F9FAFB] rounded-[7px] my-[16px]">
          <MiniTitle>Demander une correction - {label}</MiniTitle>
          <textarea value={requestText} onChange={onChangeRequestText} className="w-[100%] bg-white border-[#D1D5DB] border-[1px] rounded-[6px] p-[15px]" rows="5" />
          <div className="text-right mt-[16px]">
            <button className="text-[12px] text-[#F87171] ml-[6px] flex items-center" onClick={deleteRequest}>
              <Bin fill="#F87171" />
              Supprimer la demande
            </button>
          </div>
        </div>
      )}
    </>
  );
}
