import React from "react";
import Label from "../layout/Label";
import ErrorMessage from "../ErrorMessage";

const DEFAULT_OPTION = <option>Set options as children</option>;

const Select = ({ label = "", className = "", name = "", value = "", onChange = () => null, error = null, children = DEFAULT_OPTION, ...rest }) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div className={`mb-[1rem] ${className}`}>
      <Label title={label} hasError={error}>
        <select
          className="-mx-1 w-full bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:text-gray-500"
          name={name}
          value={value}
          onChange={handleChange}
          {...rest}>
          {children}
        </select>
      </Label>
      <ErrorMessage error={error} />
    </div>
  );
};

export default Select;
