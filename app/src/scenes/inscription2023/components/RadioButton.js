import React from "react";

const RadioButton = ({ options, label, onChange, value: currentValue }) => {
  return (
    <div className="mt-2 mb-6">
      <label className="mb-2">{label}</label>
      <div className="flex justify-between max-w-md">
        {options.map(({ label, value }) => (
          <Option key={value} label={label} value={value === currentValue} onChange={() => onChange(value)} />
        ))}
      </div>
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
