import React, { forwardRef, useState } from "react";
import Eye from "../../../assets/icons/Eye";
import EyeOff from "../../../assets/icons/EyeOff";
import Label from "../layout/Label";
import ErrorMessage from "../ErrorMessage";

const InputPassword = ({ label = "", className = "", error = null, ...rest }, forwardedRef) => {
  const [inputType, setInputType] = useState("password");

  if ("type" in rest) {
    rest.type = inputType;
  }

  const handleChangeInputType = () => {
    setInputType((prevType) => (prevType === "password" ? "text" : "password"));
  };

  return (
    <div className={`mb-[1rem] ${className}`}>
      <Label title={label} hasError={error}>
        <div className="flex">
          <input
            className="text-sm flex-grow bg-white text-gray-900 disabled:text-gray-400 placeholder:text-gray-500 focus:outline-none"
            ref={forwardedRef}
            type={inputType}
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
      </Label>
      <ErrorMessage error={error} />
    </div>
  );
};

export default forwardRef(InputPassword);
