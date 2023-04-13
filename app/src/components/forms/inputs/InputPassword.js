import React, { useEffect, useState } from "react";
import Eye from "../../../assets/icons/Eye";
import EyeOff from "../../../assets/icons/EyeOff";

const InputPassword = ({ label = "", className = "", validate = () => null, name = "", value = "", onChange = () => null, error = null, ...rest }) => {
  const [inputType, setInputType] = useState("password");

  if ("type" in rest) {
    rest.type = inputType;
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

  const handleChangeInputType = () => {
    setInputType((prevType) => (prevType === "password" ? "text" : "password"));
  };

  return (
    <div className={`mb-[1rem] ${className}`}>
      <label
        className={`flex flex-col justify-center border-[1px] min-h-[54px] w-full py-2 px-3 rounded-lg bg-white border-gray-300 disabled:border-gray-200 focus-within:border-blue-600 m-0 ${
          error && "border-red-500"
        }`}>
        {label ? <p className="text-xs leading-4 text-gray-500 disabled:text-gray-400">{label}</p> : null}
        <div className="flex">
          <input
            className="text-sm flex-grow bg-white text-gray-900 disabled:text-gray-400 placeholder:text-gray-500 focus:outline-none"
            name={name}
            type={inputType}
            value={value}
            onChange={handleChange}
            {...rest}
          />
          {inputType === "password" && (
            <button className="appearance-none" onClick={handleChangeInputType}>
              <Eye className="text-gray-400" />
            </button>
          )}
          {inputType === "text" && (
            <button className="appearance-none" onClick={handleChangeInputType}>
              <EyeOff className="text-gray-400" />
            </button>
          )}
        </div>
      </label>
      {error ? <p className="text-red-500 text-sm px-3 pt-1">{error}</p> : null}
    </div>
  );
};

export default InputPassword;
