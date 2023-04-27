import React, { useEffect, useState } from "react";
import { MiniTitle } from "./commons";
import CorrectionRequest from "./CorrectionRequest";
import Field from "./Field";
import CorrectedRequest from "./CorrectedRequest";
import DatePickerList from "./DatePickerList";

export function FieldsGroup({
  name,
  title,
  correctionLabel,
  className = "",
  children,
  noflex,
  mode,
  currentRequest,
  onStartRequest,
  correctionRequest,
  onCorrectionRequestChange,
  value,
  onChange,
  type,
  young,
}) {
  const [mouseIn, setMouseIn] = useState(false);
  const [group, setGroup] = useState({});
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setGroup({ ...group, hover: mouseIn });
  }, [mouseIn]);

  useEffect(() => {
    setOpened(currentRequest === name);
  }, [currentRequest]);

  function onFieldStartRequest() {
    setOpened(true);
    onStartRequest && onStartRequest(name);
  }

  const childs = children
    ? children.map((child, index) => {
        if (child.type === Field) {
          return React.cloneElement(child, { key: child.props.name, group, mode, onStartRequest: onFieldStartRequest, correctionRequest });
        } else {
          return React.cloneElement(child, { key: "child-" + index });
        }
      })
    : null;

  return (
    <>
      {mode === "edition" && type === "date" ? (
        <div className={`relative rounded-[6px] border-[1px] border-[#D1D5DB] bg-white py-[9px] px-[13px] ${className}`}>
          {title && <label className="text-[12px] font-normal leading-[16px] text-[#6B7280]">{title}</label>}
          <DatePickerList value={value ? new Date(value) : null} onChange={(date) => onChange(new Date(date))} />
          {correctionRequest && correctionRequest.status === "CORRECTED" && <CorrectedRequest correctionRequest={correctionRequest} young={young} />}
        </div>
      ) : (
        <div className={className} onMouseEnter={() => setMouseIn(true)} onMouseLeave={() => setMouseIn(false)}>
          {title && <MiniTitle>{title}</MiniTitle>}
          <div className={`${noflex ? "" : "items center flex"}`}>{childs}</div>
          {correctionRequest && correctionRequest.status === "CORRECTED" && <CorrectedRequest correctionRequest={correctionRequest} young={young} />}
        </div>
      )}
      {opened && (
        <CorrectionRequest name={name} label={correctionLabel ? correctionLabel : title} correctionRequest={correctionRequest} onChangeRequest={onCorrectionRequestChange} />
      )}
    </>
  );
}
