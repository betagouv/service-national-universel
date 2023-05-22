import React from "react";
import ToggleButton from "./ToggleButton";
import MultiButton from "./MultiButton";

export default function ToggleGroup({ onChange = () => {}, className = "", value, options = [] }) {
  return (
    <div className={`${className}`}>
      {options.map((option) => (
        <React.Fragment key={option.value}>
          <ToggleButton className="mr-4 mb-2 hidden last:mr-0 md:inline-flex" onClick={() => onChange(option.value)} active={option.value === value}>
            <span className={option.icon ? "mr-2" : ""}>{option.label}</span>
            {option.icon}
          </ToggleButton>
          <MultiButton className="mr-4 mb-2 inline-flex last:mr-0 md:hidden" onClick={() => onChange(option.value)} active={option.value === value}>
            <span className={option.icon ? "mr-2" : ""}>{option.label}</span>
            {option.icon}
          </MultiButton>
        </React.Fragment>
      ))}
    </div>
  );
}
