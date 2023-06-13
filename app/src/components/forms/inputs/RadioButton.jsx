import React from "react";

const RadioButton = ({ label = "", className = "", options = [], onChange = () => null, value: currentValue }) => {
  return (
    <fieldset className={className} aria-labelledby="radio-hint-legend radio-hint-messages">
      {label && <legend className="text-gray-500 text-sm mb-2">{label}</legend>}
      {options.map(({ label, value }) => (
        <label
          className={`block relative text-sm cursor-pointer select-none p-4 !pl-12 border-b border-l border-r border-gray-200 text-gray-900 first-of-type:border-t first-of-type:rounded-t-md last-of-type:rounded-b-md mb-0 ${
            value === currentValue ? "bg-indigo-50 text-indigo-900" : ""
          }`}
          htmlFor={value}
          key={value}>
          <input
            className="absolute opacity-0 cursor-pointer w-0 h-0 peer"
            type="radio"
            id={value}
            value={value}
            name="radio-hint"
            onChange={(e) => onChange(e.target.value)}
            checked={currentValue === value}
          />
          {label}
          <span className="box-border absolute top-[1.8rem] left-4 h-4 w-4 border border-grey-300 rounded-full peer-checked:!border-blue-600 peer-checked:!border-[5px]" />
        </label>
      ))}

      <div className="fr-messages-group" id="radio-hint-messages" aria-live="assertive"></div>
    </fieldset>
  );
};

export default RadioButton;
