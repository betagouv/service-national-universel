import React from "react";

const RadioButton = ({ options, label, onChange, value: currentValue }) => {
  return (
    <div className="mt-2 mb-6">
      {label && <label className="mb-2 font-bold text-[15px] text-[#161616]">{label}</label>}
      <div className="flex flex-wrap">
        {options.map(({ label, value }, idx) => (
          <React.Fragment key={value}>
            {idx > 0 && <div className="w-[1px] bg-[#E5E5E5] mx-4" />}
            <Option label={label} value={value === currentValue} onChange={() => onChange(value)} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const Option = ({ label, value, onChange }) => {
  return (
    <label className="mb-0 hover:underline cursor-pointer">
      <input className="mr-3 accent-[#000091] border-dashed" type="radio" checked={value} onChange={onChange} />
      {label}
    </label>
  );
};

export default RadioButton;
