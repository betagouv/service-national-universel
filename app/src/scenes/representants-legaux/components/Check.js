import CheckBox from "../../../components/inscription/checkbox";
import React from "react";

export default function Check({ checked, onChange, className = "", children }) {
  return (
    <div className={"flex items-center " + className}>
      <CheckBox className="shrink-0" checked={checked} onChange={onChange} />
      <div className="ml-3 text-[14px] leadind-[19px] text-[#3a3a3a]" onClick={() => onChange(!checked)}>
        {children}
      </div>
    </div>
  );
}
