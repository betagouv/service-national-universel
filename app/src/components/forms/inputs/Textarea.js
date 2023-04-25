import React from "react";
import Label from "../layout/Label";
import ErrorMessage from "../ErrorMessage";

const Textarea = ({ label = "", className = "", name = "", value = "", onChange = () => null, error = null, resize = false, ...rest }) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div className={`mb-[1rem] ${className}`}>
      <Label title={label} hasError={error}>
        <textarea
          className={`w-full bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:text-gray-400 ${resize ? "" : "resize-none"}`}
          name={name}
          value={value}
          onChange={handleChange}
          {...rest}
        />
      </Label>
      <ErrorMessage error={error} />
    </div>
  );
};

export default Textarea;
