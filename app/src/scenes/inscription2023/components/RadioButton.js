import React from "react";
import ErrorMessage from "./ErrorMessage";

const RadioButton = ({ options, label, description = "", onChange, value: currentValue, error }) => {
  return (
    <div className="mt-2 mb-6">
      <label className="mb-2">
        {label} <span className="text-[#666666] text-[14px] leading-tight"> {description}</span>
      </label>
      <div className="flex flex-wrap justify-between max-w-md">
        {options.map(({ label, value }) => (
          <Option key={value} label={label} value={value === currentValue} onChange={() => onChange(value)} />
        ))}
      </div>
      <ErrorMessage>{error}</ErrorMessage>
    </div>
  );
};

const Option = ({ label, value, onChange }) => {
  return (
    <label className="mb-0">
      <input className="mr-3 accent-[#000091] border-dashed" type="radio" checked={value} onChange={onChange} />
      {label}
    </label>
  );
};

export default RadioButton;
