import CheckBox from "../../../components/inscription/checkbox";
import React, { useState } from "react";
import ErrorMessage from "../../inscription2023/components/ErrorMessage";

export default function Check({ checked, onChange, className = "", children, error }) {
  const [over, setOver] = useState(false);

  return (
    <div className={"flex items-center cursor-pointer " + className} onMouseEnter={() => setOver(true)} onMouseLeave={() => setOver(false)}>
      <CheckBox className={`shrink-0 ${over ? "scale-105" : ""}`} checked={checked} onChange={onChange} />
      <div className="ml-3 text-[14px] leadind-[19px] text-[#3a3a3a] cursor-pointer hover:text-[#000091]" onClick={() => onChange(!checked)}>
        {children}
        {error && <ErrorMessage className="">{error}</ErrorMessage>}
      </div>
    </div>
  );
}
