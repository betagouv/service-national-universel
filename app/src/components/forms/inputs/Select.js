import React, { useEffect } from "react";
import Label from '../layout/Label';
import ErrorMessage from '../ErrorMessage';

const DEFAULT_OPTION = <option>Set options as children</option>;

const Select = ({ label = "", className = "", validate = () => null, name = "", value = "", onChange = () => null, error = null, children = DEFAULT_OPTION, ...rest }) => {
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
        <select
          className="w-full text-sm bg-white text-gray-900 disabled:text-gray-400 placeholder:text-gray-500 focus:outline-none -mx-1"
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
