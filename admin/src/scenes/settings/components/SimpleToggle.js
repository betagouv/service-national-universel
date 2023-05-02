import React from "react";
import Toggle from "../../../components/Toggle";

export default function SimpleToggle({ value, onChange, disabled = false, label }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2">
      <p className="text-left text-sm  text-gray-800">{label}</p>
      <Toggle disabled={disabled} value={value} onChange={onChange} />
    </div>
  );
}
