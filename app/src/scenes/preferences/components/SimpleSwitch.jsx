import React from "react";
import MiniSwitch from "./MiniSwitch";

export default function SimpleSwitch({ value, children, onChange, className = "" }) {
  return (
    <div className={`flex cursor-pointer items-center ${className}`} onClick={() => onChange(!value)}>
      <div className="mr-5 grow text-sm font-bold text-[#242526] md:grow-0">{children}</div>
      <MiniSwitch value={value} />
      <div className="ml-2 md:mr-10">{value ? "Oui" : "Non"}</div>
    </div>
  );
}
