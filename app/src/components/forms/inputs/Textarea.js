import React, { useEffect } from "react";

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
    <div className="mb-4">
      <label
        className={`flex flex-col justify-center border-[1px] min-h-[54px] w-full py-2 px-3 rounded-lg bg-white border-gray-300 disabled:border-gray-200 focus-within:border-blue-600 m-0 ${
          error && "border-red-500"
        } ${className}`}>
        {label ? <p className="text-xs leading-4 text-gray-500 disabled:text-gray-400">{label}</p> : null}
        <textarea
          className={`w-full text-sm bg-white text-gray-900 disabled:text-gray-400 placeholder:text-gray-500 focus:outline-none ${resize ? "" : "resize-none"}`}
          name={name}
          value={value}
          onChange={handleChange}
          {...rest}
        />
      </label>
      {error ? <p className="text-red-500 text-sm px-3 pt-1">{error}</p> : null}
    </div>
  );
};

export default Textarea;
