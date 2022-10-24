import React, { useEffect, useState } from "react";
import PencilAlt from "../../../assets/icons/PencilAlt";
import CorrectionRequest from "./CorrectionRequest";

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
export default function Field({ group = null, name, label, value, mode, className = "", onStartRequest, currentRequest, correctionRequest, onCorrectionRequestChange }) {
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

  return (
    <div className={className}>
      <div
        className="relative bg-white py-[9px] px-[13px] border-[#D1D5DB] border-[1px] rounded-[6px]"
        key={name}
        onMouseEnter={() => mouseOver(true)}
        onMouseLeave={() => mouseOver(false)}>
        <label className="font-normal text-[12px] leading-[16px] text-[#6B7280]">{label}</label>
        <div className="font-normal text-[14px] leading-[20px] text-[#1F2937]">{value}</div>
        {mode === "correction" && (
          <div className={requestButtonClass} onClick={startRequest}>
            {hasValidRequest}
            <PencilAlt className={`w-[14px] h-[14px]  ${hasValidRequest ? "text-white" : "text-[#F97316]"} group-hover:text-white`} />
          </div>
        )}
      </div>
      {opened && <CorrectionRequest name={name} label={label} correctionRequest={correctionRequest} onChangeRequest={onCorrectionRequestChange} />}
    </div>
  );
}
