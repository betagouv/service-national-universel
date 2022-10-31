import React, { useEffect, useRef, useState } from "react";
import PencilAlt from "../../../assets/icons/PencilAlt";
import CorrectionRequest from "./CorrectionRequest";
import CorrectedRequest from "./CorrectedRequest";
import ChevronDown from "../../../assets/icons/ChevronDown";

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
  onChange = () => {},
  transformer,
}) {
  const [mouseIn, setMouseIn] = useState(false);
  const [opened, setOpened] = useState(false);
  const [hasValidRequest, setHasValidRequest] = useState(false);
  const [requestButtonClass, setRequestButtonClass] = useState("");
  const [selectOptionsOpened, setSelectOptionsOpened] = useState(false);
  const selectOptionsRef = useRef();

  // const [editable, setEditable] = useState(false);

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
    function handleClickOutside(e) {
      if (selectOptionsRef.current) {
        let target = e.target;
        while (target) {
          if (target === selectOptionsRef.current) {
            return;
          }
          target = target.parentNode;
        }
        setSelectOptionsOpened(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // --- compute if we can edit field.
  let editable = true;
  if (mode === "edition") {
    if (type === "select") {
      if (options.length === 0) {
        editable = false;
      }
    }
  } else {
    editable = false;
  }

  function toggleSelectOptions() {
    setSelectOptionsOpened(!selectOptionsOpened);
  }

  function selectOption(opt) {
    onChange && onChange(opt);
  }

  return (
    <div className={className}>
      <div
        className="relative bg-white py-[9px] px-[13px] border-[#D1D5DB] border-[1px] rounded-[6px]"
        key={name}
        onMouseEnter={() => mouseOver(true)}
        onMouseLeave={() => mouseOver(false)}>
        {label && <label className="font-normal text-[12px] leading-[16px] text-[#6B7280]">{label}</label>}
        {mode === "edition" && editable ? (
          <>
            {type === "select" && (
              <div ref={selectOptionsRef}>
                <div className="flex items-center justify-between cursor-pointer" onClick={toggleSelectOptions}>
                  <div className="font-normal text-[14px] leading-[20px] text-[#1F2937]">{transformer ? transformer(value) : value}</div>
                  <ChevronDown className="text-[#1F2937] ml-[8px]" />
                </div>
                {selectOptionsOpened && (
                  <div className="absolute z-10 mt-[-1] left-[0px] right-[0px] border-[#E5E7EB] border-[1px] rounded-[6px] bg-white text-[#1F2937] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)]">
                    {options.map((opt) => (
                      <div className="px-[10px] py-[5px] hover:bg-[#E5E7EB] cursor-pointer" key={opt.value} onClick={() => selectOption(opt.value)}>
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {type === "text" && <input type="text" value={value} onChange={onChange} className="" />}
          </>
        ) : (
          <>
            <div className="font-normal text-[14px] leading-[20px] text-[#1F2937]">{transformer ? transformer(value) : value}</div>
            {mode === "correction" && (
              <div className={requestButtonClass} onClick={startRequest}>
                <PencilAlt className={`w-[14px] h-[14px]  ${hasValidRequest ? "text-white" : "text-[#F97316]"} group-hover:text-white`} />
              </div>
            )}
          </>
        )}
      </div>
      {!group && correctionRequest && correctionRequest.status === "CORRECTED" && <CorrectedRequest correctionRequest={correctionRequest} />}
      {opened && <CorrectionRequest name={name} label={label} correctionRequest={correctionRequest} onChangeRequest={onCorrectionRequestChange} />}
    </div>
  );
}
