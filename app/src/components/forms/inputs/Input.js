import React, { useEffect } from "react";
import Label from '../layout/Label';
import ErrorMessage from '../ErrorMessage';

const Input = ({ label = "", className = "", validate = () => null, name = "", value = "", onChange = () => null, error = null, type = "text", ...rest }) => {
  if (!["text", "email"].includes(type)) {
    throw new Error(`Input component wrong type '${type}'. Please set 'text' or 'email'.`);
  }

  useEffect(() => {
    if (validate) {
      const removeValidation = validate(name);
      return () => {
        if (removeValidation) {
          removeValidation();
        }
      };
    }
  }, [value]);

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div className={`mb-[1rem] ${className}`}>
      <Label title={ label } hasError={error}>
        <input
          className="w-full text-sm bg-white text-gray-900 disabled:text-gray-400 placeholder:text-gray-500 focus:outline-none"
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
