import React from "react";
import Label from "../layout/Label";
import ErrorMessage from "../ErrorMessage";

const Input = ({ label = "", className = "", name = "", value = "", onChange = () => null, error = null, type = "text", ...rest }) => {
  if (!["text", "email"].includes(type)) {
    throw new Error(`Input component wrong type '${type}'. Please set 'text' or 'email'.`);
  }

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div className={`mb-[1rem] ${className}`}>
      <Label title={label} hasError={error}>
        <input
          className="w-full bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:text-gray-400"
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          {...rest}
        />
      </Label>
      <ErrorMessage error={error} />
    </div>
  );
};

export default Input;
