import React from "react";
import MiniSwitch from "./MiniSwitch";

export default function SimpleSwitch({ value, children, onChange }) {
  return (
    <div className={`flex items-center cursor-pointer`} onClick={() => onChange(!value)}>
      <div className="mr-5 text-sm font-bold text-[#242526]">{children}</div>
      <MiniSwitch value={value} />
      <div className="ml-2 mr-10">{value ? "Oui" : "Non"}</div>
    </div>
  );
}
