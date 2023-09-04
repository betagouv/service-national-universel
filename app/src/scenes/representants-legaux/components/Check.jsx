import CheckBox from "../../../components/dsfr/forms/checkbox";
import React, { useState } from "react";
import ErrorMessage from "../../../components/dsfr/forms/ErrorMessage";

export default function Check({ checked, onChange, className = "", children, error }) {
  const [over, setOver] = useState(false);

  return (
    <div className={"flex cursor-pointer items-center " + className} onMouseEnter={() => setOver(true)} onMouseLeave={() => setOver(false)}>
      <CheckBox className={`shrink-0 ${over ? "scale-105" : ""}`} checked={checked} onChange={onChange} />
      <div className="leadind-[19px] ml-3 cursor-pointer text-[14px] text-[#3a3a3a] hover:text-[#000091]" onClick={() => onChange(!checked)}>
        {children}
        {error && <ErrorMessage className="">{error}</ErrorMessage>}
      </div>
    </div>
  );
}
