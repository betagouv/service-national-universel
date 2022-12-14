import React from "react";
import MiniSwitch from "./MiniSwitch";

export default function SimpleSwitch({ value, children, onChange, className = "" }) {
  return (
    <div className={`flex items-center cursor-pointer ${className}`} onClick={() => onChange(!value)}>
      <div className="grow md:grow-0 mr-5 text-sm font-bold text-[#242526]">{children}</div>
      <MiniSwitch value={value} />
      <div className="ml-2 md:mr-10">{value ? "Oui" : "Non"}</div>
    </div>
  );
}
