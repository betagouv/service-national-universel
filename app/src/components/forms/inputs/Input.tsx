import React, { forwardRef } from "react";
import Label from "../layout/Label";
import ErrorMessage from "../ErrorMessage";

type Props = {
  label?: string;
  className?: string;
  error?: string;
  [key: string]: any;
};

const Input = forwardRef<HTMLInputElement, Props>(function Input(props, ref) {
  const { label, className, error, ...rest } = props;
  return (
    <div className={`mb-[1rem] ${className}`}>
      <Label title={label} hasError={!!error}>
        <input className="w-full bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:text-gray-400" ref={ref} {...rest} />
      </Label>
      <ErrorMessage error={error} />
    </div>
  );
});

export default Input;
