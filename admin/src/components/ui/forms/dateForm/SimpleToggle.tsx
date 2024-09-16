import React from "react";
import Toggle from "../../../Toggle";

interface SimpleToggleProps {
  value: boolean;
  disabled?: boolean;
  label: string;
  onChange: (value: boolean) => void;
}

export default function SimpleToggle({ value, onChange, disabled = false, label }: SimpleToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2">
      <p className="text-left text-sm  text-gray-800">{label}</p>
      <Toggle disabled={disabled} value={value} onChange={onChange} />
    </div>
  );
}
