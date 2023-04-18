import React, { useEffect } from "react";
import Label from '../layout/Label';
import ErrorMessage from '../ErrorMessage';

const Textarea = ({ label = "", className = "", validate = () => null, name = "", value = "", onChange = () => null, error = null, resize = false, ...rest }) => {
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
      <Label title={label} hasError={error}>
        <textarea
          className={`w-full text-sm bg-white text-gray-900 disabled:text-gray-400 placeholder:text-gray-500 focus:outline-none ${resize ? "" : "resize-none"}`}
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
