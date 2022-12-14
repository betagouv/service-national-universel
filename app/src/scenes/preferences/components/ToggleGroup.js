import React from "react";
import ToggleButton from "./ToggleButton";

export default function ToggleGroup({ onChange = () => {}, className = "", value, options = [] }) {
  return (
    <div className={`${className}`}>
      {options.map((option) => (
        <ToggleButton key={option.value} className="mr-4 mb-2 last:mr-0" onClick={() => onChange(option.value)} active={option.value === value} mode="toggle">
          <span className={option.icon ? "mr-2" : ""}>{option.label}</span>
          {option.icon}
        </ToggleButton>
      ))}
    </div>
  );
}
