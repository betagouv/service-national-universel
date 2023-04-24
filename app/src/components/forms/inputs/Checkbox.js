import React from "react";
import ErrorMessage from "../ErrorMessage";

const Checkbox = ({ label = "", className = "", name = "", value = "", useCheckedAsValue = false, onChange = () => null, error = null, ...rest }) => {
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
      <label className={`m-0 flex w-full gap-3 rounded-lg ${error && "border-red-500"}`}>
        <input
          className="rounded bg-white text-sm text-gray-900 accent-blue-600 placeholder:text-gray-500 focus:outline-none disabled:text-gray-400 disabled:accent-gray-200"
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
