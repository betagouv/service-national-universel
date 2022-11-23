import React from "react";

const RadioButton = ({ options, label, onChange, value: currentValue, readonly = false }) => {
  function change(value) {
    if (!readonly && onChange) {
      onChange(value);
    }
  }
  return (
    <div className="mt-2 mb-6">
      {label && <label className="mb-2 font-bold text-[15px] text-[#161616]">{label}</label>}
      <div className="flex flex-wrap">
        {options.map(({ label, value }, idx) => (
          <React.Fragment key={value}>
            {idx > 0 && <div className="w-[1px] bg-[#E5E5E5] mx-4" />}
            <Option label={label} value={value === currentValue} onChange={() => change(value)} readonly={readonly} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const Option = ({ label, value, onChange, readonly }) => {
  return (
    <label className={`mb-0 ${readonly ? "" : "hover:underline cursor-pointer"}`}>
      <input className="mr-3 accent-[#000091] border-dashed" type="radio" checked={value} onChange={onChange} disabled={readonly} />
      {label}
    </label>
  );
};

export default RadioButton;
