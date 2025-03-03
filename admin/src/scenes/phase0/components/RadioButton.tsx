import React from "react";

const RadioButton = ({
  options,
  label,
  onChange,
  value: currentValue,
  readonly = false,
}: {
  options: { value: string; label: string }[];
  label?: string;
  onChange: (value: string) => void;
  value: string;
  readonly?: boolean;
}) => {
  function change(value) {
    if (!readonly && onChange) {
      onChange(value);
    }
  }
  return (
    <div className="mt-2 mb-6">
      {label && <label className="mb-2 text-[15px] font-bold text-[#161616]">{label}</label>}
      <div className="flex flex-wrap">
        {options.map(({ label, value }, idx) => (
          <React.Fragment key={value}>
            {idx > 0 && <div className="mx-4 w-[1px]" />}
            <Option label={label} value={value === currentValue} onChange={() => change(value)} readonly={readonly} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const Option = ({ label, value, onChange, readonly }) => {
  return (
    <label className={`mb-0 ${readonly ? "" : "cursor-pointer hover:underline"}`}>
      <input className="mr-3 border-dashed accent-[#000091]" type="radio" checked={value} onChange={onChange} disabled={readonly} />
      {label}
    </label>
  );
};

export default RadioButton;
