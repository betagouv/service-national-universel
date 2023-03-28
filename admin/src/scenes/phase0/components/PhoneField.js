import React, { useEffect, useState, useContext } from "react";
import PencilAlt from "../../../assets/icons/PencilAlt";
import InputPhone from "../../../components/ui/forms/InputPhone";
import useMouseOver from "../../../hooks/useMouseOver";
import { PHONE_ZONES } from "../../../utils/phone-number.utils";
import SectionContext from "../context/SectionContext";
import CorrectedRequest from "./CorrectedRequest";
import CorrectionRequest from "./CorrectionRequest";

/**
 * mode  could be "correction|edition|readonly" (default readonly)
 */
const PhoneField = ({
  name = "",
  label = "Téléphone",
  mode = "readonly",
  value = "",
  onChange = () => {},
  zoneValue = "FRANCE",
  onChangeZone = () => {},
  placeholder = "",
  className = "",
  error: errorProps = "",
  onStartRequest,
  currentRequest,
  correctionRequest,
  onCorrectionRequestChange,
  young,
}) => {
  const [fieldRef, isFieldHovered] = useMouseOver();

  const [opened, setOpened] = useState(false);
  const [hasValidRequest, setHasValidRequest] = useState(false);
  const [requestButtonClass, setRequestButtonClass] = useState("");

  const { errors } = useContext(SectionContext);

  const error = errorProps || errors[name];

  const getReadOnlyValue = () => {
    const zoneKey = zoneValue || "AUTRE";
    const { shortcut, code } = PHONE_ZONES[zoneKey];
    const codeStr = code ? ` (${code}) ` : "";
    const shortcutStr = zoneKey === "AUTRE" ? "" : shortcut;
    return `${shortcutStr}${codeStr}${value}`;
  };

  useEffect(() => {
    setHasValidRequest(correctionRequest ? correctionRequest.status === "SENT" || correctionRequest.status === "REMINDED" : false);
  }, [correctionRequest]);

  useEffect(() => {
    setOpened(name && currentRequest === name);
  }, [currentRequest]);

  useEffect(() => {
    setRequestButtonClass(
      `absolute top-[11px] right-[11px] p-[9px] rounded-[100px] cursor-pointer group ${
        hasValidRequest ? "bg-[#F97316]" : "bg-[#FFEDD5] " + (isFieldHovered ? "block" : "hidden")
      } hover:bg-[#F97316]`,
    );
  }, [isFieldHovered, hasValidRequest]);

  const handleStartRequest = () => {
    setOpened(true);
    onStartRequest && onStartRequest(name);
  };

  return (
    <div className={`relative bg-white py-[9px] px-[13px] border-[#D1D5DB] border-[1px] rounded-md ${error ? "border-[#EF4444]" : "border-[#D1D5DB]"} ${className}`} ref={fieldRef}>
      {label && <label className="font-normal text-[12px] leading-[16px] text-[#6B7280]">{label}</label>}
      {mode === "edition" && (
        <>
          <InputPhone
            className="bg-gray-50"
            value={value}
            onChange={onChange}
            zoneValue={zoneValue || "AUTRE"}
            onChangeZone={onChangeZone}
            placeholder={placeholder}
            error={error}
          />
          {error && <div className="text-[#EF4444] mt-[8px]">{error}</div>}
        </>
      )}
      {mode !== "edition" && (
        <div className="flex items-center gap-2">
          <div className="font-normal text-[14px] leading-[20px] text-[#1F2937]">{getReadOnlyValue()}</div>
          {mode === "correction" && (
            <div className={requestButtonClass} onClick={handleStartRequest}>
              <PencilAlt className={`w-[14px] h-[14px]  ${hasValidRequest ? "text-white" : "text-[#F97316]"} group-hover:text-white`} />
            </div>
          )}
        </div>
      )}

      {correctionRequest && correctionRequest.status === "CORRECTED" && <CorrectedRequest correctionRequest={correctionRequest} young={young} />}
      {opened && <CorrectionRequest name={name} label={label} correctionRequest={correctionRequest} onChangeRequest={onCorrectionRequestChange} young={young} />}
    </div>
  );
};

export default PhoneField;
