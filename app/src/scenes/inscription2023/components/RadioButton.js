import React from "react";
import ErrorMessage from "./ErrorMessage";

const RadioButton = ({ options, label, description = "", onChange, value: currentValue, error, correction = "" }) => {
  return (
    <div className="mt-2 mb-6">
      <label className={`mb-2 ${correction || error ? "text-[#CE0500]" : "text-[#666666]"}`}>
        {label} <span className="text-[#666666] text-[14px] leading-tight"> {description}</span>
      </label>
      <div className={`flex flex-wrap max-w-md md:max-w-full ${correction || (error && "pl-2 border-l-2 border-l-[#CE0500]")}`}>
        {options.map(({ label, value }) => (
          <Option key={value} label={label} value={value === currentValue} onChange={() => onChange(value)} />
        ))}
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      <ErrorMessage>{correction}</ErrorMessage>
    </div>
  );
};

const Option = ({ label, value, onChange }) => {
  return (
    <label
      className={`cursor-pointer mb-0 first-of-type:mr-8 md:first-of-type:mr-0 md:last-of-type:ml-8 md:first-of-type:after:border md:first-of-type:after:border-[#E5E5E5] md:first-of-type:after:ml-8`}>
      <input className="cursor-pointer mr-3 accent-[#000091] border-dashed hover:scale-105" type="radio" checked={value} onChange={onChange} />
      {label}
    </label>
  );
};

export default RadioButton;
