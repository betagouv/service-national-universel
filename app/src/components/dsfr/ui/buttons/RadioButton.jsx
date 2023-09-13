import React from "react";
import ErrorMessage from "../../forms/ErrorMessage";

const RadioButton = ({ options, label, description = "", onChange, value: currentValue, error, correction = "" }) => {
  return (
    <div className="mt-2 mb-6">
      <label className={`mb-2 ${correction || error ? "text-[#CE0500]" : "text-[#666666]"}`}>
        {label} <span className="text-[14px] leading-tight text-[#666666]"> {description}</span>
      </label>
      <div className={`flex flex-col lg:flex-row ${(correction || error) && "border-l-2 border-l-[#CE0500] pl-2"}`}>
        {options.map(({ label, value }) => (
          <Option key={value} label={label} value={value === currentValue} onChange={() => onChange(value)} />
        ))}
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      <ErrorMessage>{correction}</ErrorMessage>
    </div>
  );
};

const styleDesktop = "lg:ml-8 lg:first-of-type:ml-0";
const separatorDesktop = "lg:after:border lg:last-of-type:after:border-none lg:after:border-[#E5E5E5] lg:after:ml-8 lg:last-of-type:after:ml-0";

const Option = ({ label, value, onChange }) => {
  return (
    <label className={`mb-0 cursor-pointer ${styleDesktop} ${separatorDesktop}`}>
      <input className="mr-3 cursor-pointer border-dashed accent-[#000091] hover:scale-105" type="radio" checked={value} onChange={onChange} />
      {label}
    </label>
  );
};

export default RadioButton;
