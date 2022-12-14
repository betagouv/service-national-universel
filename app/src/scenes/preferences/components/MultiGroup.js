import React from "react";
import MultiButton from "./MultiButton";

export default function MultiGroup({ onChange = () => {}, className = "", value, options = [] }) {
  function onToggle(val) {
    if (value) {
      const idx = value.indexOf(val);
      let newVal = [...value];
      if (idx >= 0) {
        newVal.splice(idx, 1);
      } else {
        newVal.push(val);
      }
      onChange(newVal);
    } else {
      onChange([val]);
    }
  }

  function isSelected(val) {
    return value && value.includes(val);
  }

  return (
    <div className={`${className}`}>
      {options.map((option) => (
        <MultiButton key={option.value} className="mr-2 mb-2 last:mr-0" onClick={() => onToggle(option.value)} active={isSelected(option.value)}>
          <span className={option.icon ? "mr-2" : ""}>{option.label}</span>
          {option.icon}
        </MultiButton>
      ))}
    </div>
  );
}
