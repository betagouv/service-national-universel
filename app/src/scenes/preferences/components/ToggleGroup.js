import React from "react";
import ToggleButton from "./ToggleButton";
import MultiButton from "./MultiButton";

export default function ToggleGroup({ onChange = () => {}, className = "", value, options = [] }) {
  return (
    <div className={`${className}`}>
      {options.map((option) => (
        <>
          <ToggleButton key={option.value} className="hidden md:inline-flex mr-4 mb-2 last:mr-0" onClick={() => onChange(option.value)} active={option.value === value}>
            <span className={option.icon ? "mr-2" : ""}>{option.label}</span>
            {option.icon}
          </ToggleButton>
          <MultiButton key={option.value} className="inline-flex md:hidden mr-4 mb-2 last:mr-0" onClick={() => onChange(option.value)} active={option.value === value}>
            <span className={option.icon ? "mr-2" : ""}>{option.label}</span>
            {option.icon}
          </MultiButton>
        </>
      ))}
    </div>
  );
}
