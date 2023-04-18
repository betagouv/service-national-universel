import React, { forwardRef } from "react";
import Label from "../layout/Label";
import ErrorMessage from "../ErrorMessage";

const Textarea = ({ label = "", className = "", error = null, resize = false, ...rest }, forwardedRef) => {
  return (
    <div className={`mb-[1rem] ${className}`}>
      <Label title={label} hasError={error}>
        <textarea
          className={`w-full text-sm bg-white text-gray-900 disabled:text-gray-400 placeholder:text-gray-500 focus:outline-none ${resize ? "" : "resize-none"}`}
          ref={forwardedRef}
          {...rest}
        />
      </Label>
      <ErrorMessage error={error} />
    </div>
  );
};

export default forwardRef(Textarea);
