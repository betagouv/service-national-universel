import React from "react";
import ErrorMessage from "../ErrorMessage";

const Checkbox = ({ label = "", className = "", value = "", useCheckedAsValue = false, onChange = () => null, error = null, ...rest }) => {
  if ("type" in rest) {
    throw new Error(`Checkbox component cannot handle a custom type.`);
  }

  const handleChange = (event) => {
    if (useCheckedAsValue) {
      onChange(event.target.checked);
    } else {
      onChange(event.target.value);
    }
  };

  const customValue = useCheckedAsValue ? { checked: value } : { value };

  return (
    <div className={`mb-[1rem] ${className}`}>
      <label className={`flex gap-3 w-full rounded-lg m-0 ${error && "border-red-500"}`}>
        <input
          className="text-sm bg-white text-gray-900 disabled:text-gray-400 placeholder:text-gray-500 focus:outline-none accent-blue-600 disabled:accent-gray-200 rounded"
          name={name}
          type="checkbox"
          onChange={handleChange}
          {...customValue}
          {...rest}
        />
        {label ? <p className="text-sm leading-4 text-gray-700">{label}</p> : null}
      </label>
      <ErrorMessage error={error} />
    </div>
  );
};

export default Checkbox;
