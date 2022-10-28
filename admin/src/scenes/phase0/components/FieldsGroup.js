import React, { useEffect, useState } from "react";
import { MiniTitle } from "./commons";
import CorrectionRequest from "./CorrectionRequest";
import Field from "./Field";
import CorrectedRequest from "./CorrectedRequest";
import dayjs from "dayjs";

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
        <div className={`relative bg-white py-[9px] px-[13px] border-[#D1D5DB] border-[1px] rounded-[6px] ${className}`}>
          {title && <label className="font-normal text-[12px] leading-[16px] text-[#6B7280]">{title}</label>}
          <input type="date" value={dayjs(value).locale("fr").format("YYYY-MM-DD")} onChange={(e) => onChange(e.target.value)} className="block p-[5px] bg-gray-50 w-[100%]" />
          {correctionRequest && correctionRequest.status === "CORRECTED" && <CorrectedRequest correctionRequest={correctionRequest} />}
        </div>
      ) : (
        <div className={className} onMouseEnter={() => setMouseIn(true)} onMouseLeave={() => setMouseIn(false)}>
          {title && <MiniTitle>{title}</MiniTitle>}
          <div className={`${noflex ? "" : "flex items center"}`}>{childs}</div>
          {correctionRequest && correctionRequest.status === "CORRECTED" && <CorrectedRequest correctionRequest={correctionRequest} />}
        </div>
      )}
      {opened && (
        <CorrectionRequest name={name} label={correctionLabel ? correctionLabel : title} correctionRequest={correctionRequest} onChangeRequest={onCorrectionRequestChange} />
      )}
    </>
  );
}
