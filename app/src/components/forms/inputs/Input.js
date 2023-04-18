import React, { forwardRef } from "react";
import Label from "../layout/Label";
import ErrorMessage from "../ErrorMessage";

const Input = ({ label = "", className = "", error = null, type = "text", ...rest }, forwardedRef) => {
  if (!["text", "email"].includes(type)) {
    throw new Error(`Input component wrong type '${type}'. Please set 'text' or 'email'.`);
  }
  return (
    <div className={`mb-[1rem] ${className}`}>
      <Label hasError={error} title={label}>
        <input className="w-full text-sm bg-white text-gray-900 disabled:text-gray-400 placeholder:text-gray-500 focus:outline-none" ref={forwardedRef} {...rest} />
      </Label>
      <ErrorMessage error={error} />
    </div>
  );
};

export default forwardRef(Input);
