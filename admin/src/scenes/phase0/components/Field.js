import React, { useContext, useEffect, useState } from "react";
import PencilAlt from "../../../assets/icons/PencilAlt";
import CorrectionRequest from "./CorrectionRequest";
import CorrectedRequest from "./CorrectedRequest";
import SimpleSelect from "./SimpleSelect";
import SectionContext from "../context/SectionContext";
import { copyToClipboard } from "../../../utils";
import { HiCheckCircle } from "react-icons/hi";
import { BiCopy } from "react-icons/bi";

/**
 * mode  could be "correction|edition|readonly" (default readonly)
 */
export default function Field({
  group = null,
  name,
  label,
  value,
  mode,
  className = "",
  onStartRequest,
  currentRequest,
  correctionRequest,
  onCorrectionRequestChange,
  type = "text",
  options = [],
  filterOnType = false,
  onChange = () => {},
  showBackgroundColor = true,
  transformer,
  young,
  rows,
  maxLength,
  copy = false,
  error: errorProps,
  allowCustomValue = false,
}) {
  const [mouseIn, setMouseIn] = useState(false);
  const [opened, setOpened] = useState(false);
  const [hasValidRequest, setHasValidRequest] = useState(false);
  const [requestButtonClass, setRequestButtonClass] = useState("");
  const [editable, setEditable] = useState(false);
  const [copied, setCopied] = useState(false);

  const { errors } = useContext(SectionContext);

  const error = errorProps || errors[name];

  useEffect(() => {
    setOpened(name && currentRequest === name);
  }, [currentRequest]);

  useEffect(() => {
    setHasValidRequest(correctionRequest ? correctionRequest.status === "SENT" || correctionRequest.status === "REMINDED" : false);
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
    let edit = true;
    if (mode === "edition") {
      if (type === "select") {
        if (options.length === 0) {
          edit = false;
        }
      }
    } else {
      edit = false;
    }
    setEditable(edit);
  }, [options, mode, type]);

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 3000);
    }
  }, [copied]);

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
        className={`relative rounded-[6px] border-[1px] border-[#D1D5DB] bg-white py-[9px] px-[13px] ${error ? "border-[#EF4444]" : "border-[#D1D5DB]"}`}
        key={name}
        onMouseEnter={() => mouseOver(true)}
        onMouseLeave={() => mouseOver(false)}>
        {label && <label className="text-[12px] font-normal leading-[16px] text-[#6B7280]">{label}</label>}
        {mode === "edition" && editable ? (
          <>
            {type === "select" && (
              <SimpleSelect
                value={value}
                transformer={transformer}
                showBackgroundColor={showBackgroundColor}
                options={options}
                onChange={onChange}
                filterOnType={filterOnType}
                allowCustomValue={allowCustomValue}
              />
            )}
            {type === "text" && (
              <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={`block p-[5px] ${showBackgroundColor && "bg-gray-50"}  w-[100%]`} />
            )}
            {type === "textarea" && (
              <textarea maxLength={maxLength} rows={rows || 4} value={value} onChange={(e) => onChange(e.target.value)} className="block w-[100%] bg-gray-50 p-[5px]" />
            )}
            {error && <div className="mt-[8px] text-[#EF4444]">{error}</div>}
          </>
        ) : (
          <div className="flex items-center gap-2">
            {copy && value && (
              <div
                className="flex cursor-pointer items-center justify-center hover:scale-105"
                onClick={() => {
                  copyToClipboard(value);
                  setCopied(true);
                }}>
                {copied ? <HiCheckCircle className="h-4 w-4 text-green-500" /> : <BiCopy className="h-4 w-4 text-gray-400" />}
              </div>
            )}
            <div className="text-[14px] font-normal leading-[20px] text-[#1F2937]">{transformer ? transformer(value) : value}</div>
            {mode === "correction" && (
              <div className={requestButtonClass} onClick={startRequest}>
                <PencilAlt className={`h-[14px] w-[14px]  ${hasValidRequest ? "text-white" : "text-[#F97316]"} group-hover:text-white`} />
              </div>
            )}
          </div>
        )}
      </div>
      {!group && correctionRequest && correctionRequest.status === "CORRECTED" && <CorrectedRequest correctionRequest={correctionRequest} young={young} />}
      {opened && <CorrectionRequest name={name} label={label} correctionRequest={correctionRequest} onChangeRequest={onCorrectionRequestChange} young={young} />}
    </div>
  );
}
