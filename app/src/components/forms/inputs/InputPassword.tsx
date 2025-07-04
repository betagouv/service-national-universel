import React, { forwardRef, InputHTMLAttributes, useState } from "react";
import Label from "../layout/Label";
import ErrorMessage from "../ErrorMessage";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

type InputPasswordProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  className?: string;
  error?: string;
};

const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(function InputPassword({ label, className, error, ...rest }, ref) {
  const [inputType, setInputType] = useState("password");

  if ("type" in rest) {
    throw new Error(`InputPassword component cannot handle a custom type.`);
  }

  const handleChangeInputType = () => {
    setInputType((prevType) => (prevType === "password" ? "text" : "password"));
  };

  return (
    <div className={`mb-[1rem] ${className}`}>
      <Label title={label} hasError={!!error}>
        <div className="flex">
          <input className="flex-grow bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:text-gray-400" type={inputType} ref={ref} {...rest} />
          <button className="appearance-none text-gray-400" onClick={handleChangeInputType}>
            {inputType === "password" ? <HiOutlineEye /> : <HiOutlineEyeOff />}
          </button>
        </div>
      </Label>
      <ErrorMessage error={error} />
    </div>
  );
});

export default InputPassword;
